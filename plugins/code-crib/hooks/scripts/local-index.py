#!/usr/bin/env python3
"""code-crib 문서용 로컬 증분 인덱스. 외부 서비스나 패키지가 필요하지 않다."""

import argparse
from contextlib import closing
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import re
import sqlite3
import subprocess
import sys


MAX_BYTES = 2 * 1024 * 1024
SKIP_DIRS = {"node_modules", "__pycache__", "vendor"}
SCHEMA = """
CREATE TABLE IF NOT EXISTS sources (
    path TEXT PRIMARY KEY, last_sync TEXT, errors TEXT NOT NULL DEFAULT '[]'
);
CREATE TABLE IF NOT EXISTS documents (
    path TEXT PRIMARY KEY, source TEXT NOT NULL, digest TEXT NOT NULL,
    title TEXT NOT NULL, type TEXT NOT NULL, tags TEXT NOT NULL,
    host TEXT NOT NULL, content TEXT NOT NULL, indexed_at TEXT NOT NULL
);
CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
    title, content, content='documents', content_rowid='rowid',
    tokenize='unicode61'
);
CREATE TRIGGER IF NOT EXISTS documents_ai AFTER INSERT ON documents BEGIN
    INSERT INTO documents_fts(rowid, title, content) VALUES (new.rowid, new.title, new.content);
END;
CREATE TRIGGER IF NOT EXISTS documents_ad AFTER DELETE ON documents BEGIN
    INSERT INTO documents_fts(documents_fts, rowid, title, content)
        VALUES ('delete', old.rowid, old.title, old.content);
END;
CREATE TRIGGER IF NOT EXISTS documents_au AFTER UPDATE ON documents BEGIN
    INSERT INTO documents_fts(documents_fts, rowid, title, content)
        VALUES ('delete', old.rowid, old.title, old.content);
    INSERT INTO documents_fts(rowid, title, content) VALUES (new.rowid, new.title, new.content);
END;
"""


def now():
    return datetime.now(timezone.utc).isoformat()


def project_root(cwd):
    cwd = Path(cwd).resolve(strict=True)
    try:
        result = subprocess.run(
            ["git", "-C", str(cwd), "rev-parse", "--show-toplevel"],
            capture_output=True, text=True, timeout=3, check=False,
        )
    except FileNotFoundError:
        return cwd
    return Path(result.stdout.strip()).resolve() if result.returncode == 0 else cwd


def cache_path(project):
    cache = Path(os.environ.get("XDG_CACHE_HOME", str(Path.home() / ".cache")))
    key = hashlib.sha256(str(project).encode()).hexdigest()
    return cache / "code-crib" / key / "index.sqlite3"


def source_path(project, value):
    candidate = Path(value)
    if not candidate.is_absolute():
        candidate = project / candidate
    relative = candidate.absolute().relative_to(project)
    if ".." in relative.parts:
        raise ValueError("인덱싱 경로에 '..'을 사용할 수 없습니다")
    current = project
    for part in relative.parts:
        current /= part
        if current.is_symlink():
            raise ValueError("심볼릭 링크는 인덱싱하지 않습니다")
    return candidate, relative.as_posix()


def markdown_files(root):
    if not root.is_dir():
        raise OSError("문서 디렉터리가 없거나 접근할 수 없습니다")

    def fail(error):
        raise error

    for directory, dirs, files in os.walk(root, followlinks=False, onerror=fail):
        dirs[:] = sorted(d for d in dirs if not d.startswith(".")
                         and d not in SKIP_DIRS and not (Path(directory) / d).is_symlink())
        for name in sorted(files):
            path = Path(directory) / name
            if not name.startswith(".") and path.suffix.lower() == ".md":
                if path.is_file() and not path.is_symlink():
                    yield path


def read_document(path):
    with path.open("rb") as handle:
        data = handle.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise ValueError("문서가 2 MiB 제한을 초과했습니다")
    return data.decode("utf-8-sig"), hashlib.sha256(data).hexdigest()


def metadata(content, path):
    # 생성 문서의 단순 스칼라/태그 목록만 읽고 YAML 객체는 실행하지 않는다.
    fields = {}
    lines = content.splitlines()
    if lines and lines[0] == "---":
        tag_list = False
        for line in lines[1:]:
            if line == "---":
                break
            match = re.match(r"^(title|type|host|tags):\s*(.*?)\s*$", line)
            if match:
                key, value = match.groups()
                if not value.startswith(("\"", "'", "[")):
                    value = re.sub(r"\s+#.*$", "", value).strip()
                fields[key] = value.strip("\"'")
                tag_list = key == "tags" and not value
            elif tag_list and re.match(r"^\s+-\s+", line):
                fields["tags"] += "," + re.sub(r"^\s+-\s+", "", line).strip("\"'")
            elif line and not line.startswith(" "):
                tag_list = False
    heading = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
    title = fields.get("title") or (heading.group(1) if heading else path.stem)
    tags = [tag.strip().strip("\"'") for tag in fields.get("tags", "").strip("[]").split(",")]
    return title, fields.get("type", ""), json.dumps([t for t in tags if t]), fields.get("host", "")


def query_terms(query):
    return list(dict.fromkeys(re.findall(r"\w+", query.lower(), re.UNICODE)))[:20]


def excerpt(content, query, width=240):
    terms = query_terms(query)
    pattern = re.compile("|".join(re.escape(t) for t in sorted(terms, key=len, reverse=True)), re.I) if terms else None
    best = None
    if pattern:
        for match in pattern.finditer(content):
            start = max(0, match.start() - 70)
            window = content[start:start + width]
            score = len({m.group().lower() for m in pattern.finditer(window)})
            if best is None or score > best[0]:
                best = (score, start)
    start = best[1] if best else 0
    end = min(len(content), start + width)
    raw = content[start:end]
    highlighted = pattern.sub(lambda m: "[[" + m.group() + "]]", raw) if pattern else raw
    return {
        "text": ("…" if start else "") + highlighted + ("…" if end < len(content) else ""),
        "line_start": content.count("\n", 0, start) + 1,
        "line_end": content.count("\n", 0, end) + 1,
        "matched": best is not None,
    }


class LocalIndex:
    def __init__(self, project):
        self.project = project
        path = cache_path(project)
        path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
        self.db = sqlite3.connect(path, timeout=3)
        self.db.row_factory = sqlite3.Row
        self.db.execute("PRAGMA journal_mode=WAL")
        self.db.executescript(SCHEMA)

    def close(self):
        self.db.close()

    def sources(self):
        return [row[0] for row in self.db.execute("SELECT path FROM sources ORDER BY path")]

    def register(self, value):
        root, relative = source_path(self.project, value)
        if not root.is_dir():
            raise ValueError("등록할 문서 디렉터리가 없습니다")
        for source in self.sources():
            other = self.project / source
            if root != other and (root in other.parents or other in root.parents):
                raise ValueError("이미 등록된 문서 디렉터리와 경로가 겹칩니다")
        with self.db:
            self.db.execute("INSERT OR IGNORE INTO sources(path) VALUES (?)", (relative,))

    def ensure_default(self):
        root = self.project / ".rag-docs"
        registered = [self.project / source for source in self.sources()]
        overlaps = any(other == root or other in root.parents or root in other.parents for other in registered)
        if root.is_dir() and not overlaps:
            self.register(".rag-docs")

    def sync(self, force=False):
        totals = dict(added=0, updated=0, deleted=0, unchanged=0)
        errors = []
        with self.db:
            self.db.execute("BEGIN IMMEDIATE")
            for source in self.sources():
                failures = []
                try:
                    root, _ = source_path(self.project, source)
                    paths = list(markdown_files(root))
                except (OSError, ValueError) as error:
                    failures.append({"path": source, "error": str(error)})
                    self.db.execute("UPDATE sources SET errors=? WHERE path=?", (json.dumps(failures), source))
                    errors.extend(failures)
                    continue
                old = {row["path"]: row["digest"] for row in self.db.execute(
                    "SELECT path, digest FROM documents WHERE source=?", (source,))}
                seen = set()
                for path in paths:
                    relative = path.relative_to(self.project).as_posix()
                    seen.add(relative)
                    try:
                        content, digest = read_document(path)
                    except (OSError, UnicodeError, ValueError) as error:
                        failures.append({"path": relative, "error": str(error)})
                        continue
                    if not force and old.get(relative) == digest:
                        totals["unchanged"] += 1
                        continue
                    title, kind, tags, host = metadata(content, path)
                    self.db.execute("""
                        INSERT INTO documents VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(path) DO UPDATE SET digest=excluded.digest,
                            title=excluded.title, type=excluded.type, tags=excluded.tags,
                            host=excluded.host, content=excluded.content, indexed_at=excluded.indexed_at
                    """, (relative, source, digest, title, kind, tags, host, content, now()))
                    totals["updated" if relative in old else "added"] += 1
                deleted = old.keys() - seen
                self.db.executemany("DELETE FROM documents WHERE path=?", [(p,) for p in deleted])
                totals["deleted"] += len(deleted)
                self.db.execute("UPDATE sources SET last_sync=?, errors=? WHERE path=?",
                                (now(), json.dumps(failures), source))
                errors.extend(failures)
        return {**totals, "errors": errors}

    def status(self):
        sources = []
        for row in self.db.execute("SELECT * FROM sources ORDER BY path"):
            old = {doc["path"]: doc["digest"] for doc in self.db.execute(
                "SELECT path, digest FROM documents WHERE source=?", (row["path"],))}
            pending = dict(added=0, updated=0, deleted=0)
            errors = []
            seen = set()
            try:
                root, _ = source_path(self.project, row["path"])
                for path in markdown_files(root):
                    relative = path.relative_to(self.project).as_posix()
                    seen.add(relative)
                    try:
                        _, digest = read_document(path)
                        if relative not in old:
                            pending["added"] += 1
                        elif digest != old[relative]:
                            pending["updated"] += 1
                    except (OSError, UnicodeError, ValueError) as error:
                        errors.append({"path": relative, "error": str(error)})
                pending["deleted"] = len(old.keys() - seen)
            except (OSError, ValueError) as error:
                errors.append({"path": row["path"], "error": str(error)})
            sources.append({"path": row["path"], "indexed": len(old), "last_sync": row["last_sync"],
                            "pending": pending, "errors": errors, "last_sync_errors": json.loads(row["errors"])})
        return {"project_root": str(self.project), "indexed": sum(s["indexed"] for s in sources),
                "sources": sources, "remote_sync": "not_tracked"}

    def search(self, query, limit=5, kind=None, host=None, tags=None):
        terms = query_terms(query)
        if not terms:
            return []
        filters, values = [], []
        for field, value in (("type", kind), ("host", host)):
            if value:
                filters.append("d." + field + "=?")
                values.append(value)
        for tag in (tags or []):
            filters.append("EXISTS (SELECT 1 FROM json_each(d.tags) WHERE value=?)")
            values.append(tag)
        where = " AND " + " AND ".join(filters) if filters else ""
        match = " OR ".join('"' + term + '"' for term in terms)
        rows = list(self.db.execute("""
            SELECT d.* FROM documents_fts JOIN documents d ON d.rowid=documents_fts.rowid
            WHERE documents_fts MATCH ?
        """ + where + " ORDER BY bm25(documents_fts, 4.0, 1.0), d.path LIMIT ?", [match, *values, limit]))
        if len(rows) < limit:
            # 한국어 조사·복합어 및 부분 식별자는 형태소 분석 없이 부분 일치로 보완한다.
            contains = " OR ".join("instr(lower(d.title || char(10) || d.content), ?) > 0" for _ in terms)
            excluded = [row["path"] for row in rows]
            exclusion = " AND d.path NOT IN (" + ",".join("?" for _ in excluded) + ")" if excluded else ""
            rows.extend(self.db.execute("SELECT d.* FROM documents d WHERE (" + contains + ")" + where
                                        + exclusion + " ORDER BY d.path LIMIT ?",
                                        [*terms, *values, *excluded, limit - len(rows)]))
        return [{"path": row["path"], "title": row["title"], "type": row["type"],
                 "tags": json.loads(row["tags"]), "host": row["host"],
                 "snippet": excerpt(row["content"], query)} for row in rows]


def emit(value):
    print(json.dumps(value, ensure_ascii=False))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["sync", "status", "search", "snippet", "hook"])
    parser.add_argument("query", nargs="?", default="")
    parser.add_argument("--project-root", default=os.getcwd())
    parser.add_argument("--path")
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--limit", type=int, default=5)
    parser.add_argument("--type", dest="kind")
    parser.add_argument("--host")
    parser.add_argument("--tags")
    args = parser.parse_args()
    os.umask(0o077)
    try:
        if args.command == "snippet":
            emit(excerpt(sys.stdin.read(MAX_BYTES), args.query))
            return 0
        if args.command == "hook":
            if os.environ.get("CODE_CRIB_AUTO_INDEX", "1") == "0":
                return 0
            event = json.load(sys.stdin)
            if not isinstance(event, dict) or not isinstance(event.get("cwd"), str):
                return 0
            args.project_root = event["cwd"]
        project = project_root(args.project_root)
        if args.command == "hook" and not cache_path(project).exists() and not (project / ".rag-docs").is_dir():
            return 0
        if not 1 <= args.limit <= 100:
            raise ValueError("limit은 1~100이어야 합니다")
        with closing(LocalIndex(project)) as index:
            if args.path:
                if args.command != "sync":
                    raise ValueError("--path는 sync에서만 사용할 수 있습니다")
                index.register(args.path)
            index.ensure_default()
            if args.command == "status":
                emit(index.status())
                return 0
            changes = index.sync(force=args.force)
            if args.command == "hook":
                if any(changes[key] for key in ("added", "updated", "deleted")) or changes["errors"]:
                    summary = {key: len(value) if key == "errors" else value for key, value in changes.items()}
                    emit({"hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext":
                          "code-crib 로컬 인덱스 갱신: " + json.dumps(summary)
                          + ". 원격 벡터 DB 동기화 상태는 별도입니다. 오류는 /code-crib:status로 확인하세요."}})
                return 0
            if args.command == "search":
                indexed = index.db.execute("SELECT count(*) FROM documents").fetchone()[0]
                emit({"query": args.query, "indexed": indexed, "sources": index.sources(),
                      "sync": changes, "results": index.search(
                    args.query, args.limit, args.kind, args.host,
                    [t.strip() for t in args.tags.split(",") if t.strip()] if args.tags else None)})
            else:
                emit({"sync": changes, "status": index.status()})
            return 1 if changes["errors"] else 0
    except (OSError, ValueError, sqlite3.Error, subprocess.SubprocessError) as error:
        if args.command == "hook":
            emit({"systemMessage": "code-crib 로컬 인덱스를 갱신하지 못했습니다. /code-crib:status로 확인하세요."})
            return 0
        emit({"error": str(error)})
        return 1


if __name__ == "__main__":
    sys.exit(main())
