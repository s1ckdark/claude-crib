#!/usr/bin/env python3
"""명시적으로 켠 로컬 작업일지. 원본·도구 출력·추론 내용은 복사하지 않는다."""

import argparse
from contextlib import closing
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import re
import shlex
import sqlite3
import stat
import sys
import time


LIMIT = 200
MAX_LINE = 1024 * 1024
EVENTS = {"SessionStart", "Stop", "SessionEnd"}
SCHEMA = """
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (
    provider TEXT NOT NULL, session_id TEXT NOT NULL, cwd TEXT NOT NULL,
    project TEXT NOT NULL, transcript TEXT NOT NULL, updated_at TEXT NOT NULL,
    last_event TEXT NOT NULL, ended_at TEXT, end_reason TEXT,
    offset INTEGER NOT NULL DEFAULT 0, signature TEXT NOT NULL DEFAULT '',
    state TEXT NOT NULL DEFAULT '{}', search_text TEXT NOT NULL DEFAULT '',
    PRIMARY KEY (provider, session_id)
);
CREATE INDEX IF NOT EXISTS sessions_project ON sessions(project, updated_at);
"""


def now():
    return datetime.now(timezone.utc).isoformat()


def clean(value, limit=1000):
    if not isinstance(value, str):
        return ""
    value = re.sub(r"```[\s\S]*?(?:```|$)", "[코드 블록 생략]", value)
    value = re.sub(r"-----BEGIN [^-]*PRIVATE KEY-----[\s\S]*?(?:-----END [^-]*PRIVATE KEY-----|$)",
                   "[REDACTED]", value)
    value = re.sub(r"(?i)\b(?:sk-[\w-]{12,}|gh[pousr]_[\w]{12,}|AKIA[A-Z0-9]{16})\b",
                   "[REDACTED]", value)
    value = re.sub(r"(?i)(bearer\s+)\S+", r"\1[REDACTED]", value)
    value = re.sub(r'''(?ix)([\w-]*(?:api[_-]?key|password|passwd|secret|token)[\w-]*["']?\s*(?:[:=]|\s)\s*)
                      (?:"[^"\n]*"|'[^'\n]*'|[^\s,;}]+)''', r"\1[REDACTED]", value)
    value = re.sub(r"(https?://)[^/@\s]+:[^/@\s]+@", r"\1[REDACTED]@", value)
    value = re.sub(r"[\x00-\x08\x0b-\x1f\x7f]", "", value)
    return value.strip()[:limit]


def text_content(value):
    if isinstance(value, str):
        return value
    if isinstance(value, list):
        return "\n".join(item.get("text", "") for item in value
                         if isinstance(item, dict) and isinstance(item.get("text"), str)
                         and item.get("type") in {"text", "Text", "input_text", "output_text"})
    return ""


def project_root(cwd):
    path = Path(cwd).resolve()
    for candidate in (path, *path.parents):
        if (candidate / ".git").exists():
            return str(candidate)
    return str(path)


def valid_id(value):
    return isinstance(value, str) and re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_-]{0,127}", value)


def data_path():
    root = Path(os.environ.get("XDG_DATA_HOME", str(Path.home() / ".local/share")))
    if not root.is_absolute():
        raise ValueError("XDG_DATA_HOME은 절대 경로여야 합니다")
    return root / "code-crib" / "sessions.sqlite3"


def note(state, value):
    notes = state.setdefault("warnings", [])
    if value not in notes and len(notes) < 20:
        notes.append(value)


def put(state, group, key, value):
    items = state.setdefault(group, {})
    if key in items or len(items) < LIMIT:
        items[key] = value
    else:
        note(state, "항목 상한(200)에 도달했습니다. 원본을 별도로 확인하세요")


def message(state, role, value):
    value = clean(value)
    if not value:
        return
    if role == "user" and not state.get("title"):
        state["title"] = value[:160]
    elif role == "assistant":
        state["summary"] = value


def command(state, key, value, code=None, failed=False):
    if isinstance(value, list) and all(isinstance(part, str) for part in value):
        value = shlex.join(value)
    if not isinstance(value, str) or not value.strip() or not valid_id(key):
        return
    old = state.get("commands", {}).get(key, {})
    # 셸 본문·출력은 보존하지 않고 첫 줄만 표시한다.
    value = clean(value, 600).splitlines()[0]
    code = code if type(code) is int else old.get("exit_code")
    outcome = "exit_ok" if code == 0 else "failed" if code is not None or failed else "unverified"
    put(state, "commands", key, {"command": value, "exit_code": code, "outcome": outcome,
                               "test_candidate": bool(re.search(
                                   r"\b(pytest|unittest|jest|vitest|test|tests|ctest)\b", value))})


def tool_call(state, key, name, args):
    if not valid_id(key):
        return
    if isinstance(args, str):
        if name == "apply_patch":
            args = {"patch": args}
        else:
            try:
                args = json.loads(args)
            except ValueError:
                return
    if not isinstance(args, dict):
        return
    if name in {"Bash", "shell", "shell_command", "exec_command"}:
        command(state, key, args.get("command", args.get("cmd")))
    paths = []
    if name in {"Edit", "Write", "MultiEdit", "NotebookEdit"}:
        paths = [args.get("file_path", args.get("notebook_path"))]
    elif name == "apply_patch":
        patch = args.get("patch", args.get("input", ""))
        if isinstance(patch, str):
            paths = re.findall(r"^\*\*\* (?:Add File|Update File|Delete File|Move to): (.+)$", patch, re.M)
    for path in paths:
        if isinstance(path, str):
            put(state, "files", key + ":" + clean(path, 500),
                {"path": clean(path, 500), "outcome": "unverified", "tool_id": key})
    if name == "update_plan" and isinstance(args.get("plan"), list):
        state["unfinished"] = [clean(item.get("step")) for item in args["plan"][:LIMIT]
                               if isinstance(item, dict) and item.get("status") != "completed"]


def tool_result(state, key, value, failed=None, code=None):
    if not valid_id(key):
        return
    output = text_content(value)
    if type(code) is not int:
        matched = re.search(r"(?:Process exited with code|Exit code:)\s*(-?\d+)", output)
        code = int(matched.group(1)) if matched else None
    previous = state.get("commands", {}).get(key)
    if previous:
        command(state, key, previous["command"], code, failed)
    for item in state.get("files", {}).values():
        if item["tool_id"] == key:
            item["outcome"] = ("failed" if failed or (code is not None and code != 0)
                               else "tool_reported_success" if code == 0 or failed is False
                               or output.startswith("Success. Updated the following files:") else "unverified")


def parse_claude(state, event, session_id):
    if event.get("isSidechain") or event.get("sessionId", session_id) != session_id:
        return
    if isinstance(event.get("gitBranch"), str):
        state["branch"] = clean(event["gitBranch"], 160)
    msg = event.get("message")
    if not isinstance(msg, dict) or event.get("type") not in {"user", "assistant"}:
        return
    content = msg.get("content", [])
    if not event.get("isMeta"):
        message(state, event["type"], text_content(content))
    if not isinstance(content, list):
        return
    for item in content:
        if not isinstance(item, dict):
            continue
        if item.get("type") == "tool_use":
            tool_call(state, item.get("id"), item.get("name"), item.get("input"))
        elif item.get("type") == "tool_result":
            tool_result(state, item.get("tool_use_id"), item.get("content"), item.get("is_error"))


def parse_codex(state, event):
    payload = event.get("payload")
    if not isinstance(payload, dict):
        return
    if event.get("type") == "session_meta" and not state.get("resume_id"):
        if valid_id(payload.get("id")):
            state["resume_id"] = payload["id"]
        git = payload.get("git", {})
        state["branch"] = clean(git.get("branch"), 160) if isinstance(git, dict) else ""
        source = payload.get("source")
        state["interactive"] = True if source == "cli" else False if source == "exec" else None
        return
    kind = payload.get("type")
    if event.get("type") == "response_item":
        if kind == "message" and payload.get("role") in {"user", "assistant"}:
            message(state, payload["role"], text_content(payload.get("content")))
        elif kind in {"function_call", "custom_tool_call"}:
            tool_call(state, payload.get("call_id"), payload.get("name"),
                      payload.get("arguments", payload.get("input")))
        elif kind in {"function_call_output", "custom_tool_call_output"}:
            tool_result(state, payload.get("call_id"), payload.get("output"))
    elif event.get("type") == "event_msg":
        if kind in {"user_message", "agent_message"}:
            message(state, "user" if kind == "user_message" else "assistant", payload.get("message"))
        elif kind == "item_completed" and isinstance(payload.get("item"), dict):
            item = payload["item"]
            kind = item.get("type")
            if kind in {"UserMessage", "AgentMessage"}:
                message(state, "user" if kind == "UserMessage" else "assistant", text_content(item.get("content")))
            elif kind == "CommandExecution":
                command(state, item.get("id"), item.get("command"), item.get("exit_code"),
                        item.get("status") in {"failed", "declined"})
            elif kind == "FileChange" and isinstance(item.get("changes"), dict) and valid_id(item.get("id")):
                key = str(item.get("id", ""))
                for path in item["changes"]:
                    put(state, "files", key + ":" + clean(path, 500),
                        {"path": clean(path, 500), "tool_id": key,
                         "outcome": "tool_reported_success" if item.get("status") == "completed"
                         else "failed" if item.get("status") in {"failed", "declined"} else "unverified"})


def parse_event(state, event, provider, session_id):
    if not isinstance(event, dict):
        note(state, "사전 형태가 아닌 로그 항목을 건너뛰었습니다")
        return
    if provider == "claude" and (event.get("isSidechain") or event.get("sessionId", session_id) != session_id):
        return
    timestamp = event.get("timestamp")
    if isinstance(timestamp, str):
        state.setdefault("started_at", clean(timestamp, 60))
        state["last_activity_at"] = clean(timestamp, 60)
    if provider == "claude":
        parse_claude(state, event, session_id)
    else:
        parse_codex(state, event)


class History:
    def __init__(self):
        path = data_path()
        if path.parent.is_symlink() or path.is_symlink():
            raise ValueError("작업일지 저장소의 심볼릭 링크는 허용하지 않습니다")
        path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
        path.parent.chmod(0o700)
        self.db = sqlite3.connect(path, timeout=0.15)
        path.chmod(0o600)
        self.db.row_factory = sqlite3.Row
        self.db.executescript(SCHEMA)

    def close(self):
        self.db.close()

    def enabled(self):
        if os.environ.get("CODE_CRIB_SESSION_HISTORY") == "0":
            return False
        row = self.db.execute("SELECT value FROM settings WHERE key='enabled'").fetchone()
        return bool(row and row[0] == "1")

    def configure(self, enabled):
        with self.db:
            self.db.execute("INSERT OR REPLACE INTO settings VALUES ('enabled', ?)", ("1" if enabled else "0",))

    def record(self, provider, event):
        if not self.enabled():
            return
        sid, kind, cwd = event.get("session_id"), event.get("hook_event_name"), event.get("cwd")
        if provider not in {"claude", "codex"} or not valid_id(sid) or kind not in EVENTS or not isinstance(cwd, str) or not Path(cwd).is_absolute():
            raise ValueError("session_id, hook_event_name, 절대 경로 cwd가 필요합니다")
        transcript = event.get("transcript_path") or ""
        if not isinstance(transcript, str) or (transcript and not Path(transcript).is_absolute()):
            raise ValueError("transcript_path는 절대 경로여야 합니다")
        stamp = now()
        with self.db:
            self.db.execute("""
                INSERT INTO sessions(provider,session_id,cwd,project,transcript,updated_at,last_event,ended_at,end_reason)
                VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(provider,session_id) DO UPDATE SET
                cwd=excluded.cwd, project=excluded.project,
                transcript=CASE WHEN excluded.transcript='' THEN sessions.transcript ELSE excluded.transcript END,
                updated_at=CASE WHEN sessions.last_event='SessionEnd' AND excluded.last_event='SessionEnd'
                    THEN sessions.updated_at ELSE excluded.updated_at END,
                last_event=excluded.last_event,
                ended_at=CASE WHEN sessions.last_event='SessionEnd' AND excluded.last_event='SessionEnd'
                    THEN sessions.ended_at ELSE excluded.ended_at END, end_reason=excluded.end_reason
                """, (provider, sid, cwd, project_root(cwd), transcript, stamp, kind,
                      stamp if kind == "SessionEnd" else None, clean(event.get("reason"), 80) or None))
            if isinstance(event.get("last_assistant_message"), str):
                row = self.db.execute("SELECT state FROM sessions WHERE provider=? AND session_id=?", (provider, sid)).fetchone()
                state = json.loads(row[0])
                message(state, "assistant", event["last_assistant_message"])
                self.db.execute("UPDATE sessions SET state=?,search_text=? WHERE provider=? AND session_id=?",
                                (json.dumps(state, ensure_ascii=False), searchable_text(state), provider, sid))

    def rows(self, project=None, provider=None):
        return self.db.execute("""SELECT * FROM sessions WHERE (? IS NULL OR project=?)
            AND (? IS NULL OR provider=?) ORDER BY updated_at DESC, provider, session_id""",
                               (project, project, provider, provider)).fetchall()

    def refresh(self, project=None, provider=None, budget=2.0, max_bytes=8 * MAX_LINE):
        deadline = time.monotonic() + budget
        result: dict = {"refreshed": 0, "errors": [], "pending": False}
        for row in self.rows(project, provider):
            if time.monotonic() >= deadline or max_bytes <= 0:
                result["pending"] = True
                break
            if not row["transcript"]:
                continue
            try:
                state = json.loads(row["state"])
                path = transcript_path(row["provider"], row["transcript"])
                if not path.exists():
                    # 원본 삭제 후에도 추출한 요약과 마지막 커서를 보존한다.
                    continue
                if path.is_symlink() or path.suffix != ".jsonl":
                    raise ValueError("압축/알 수 없는 형식은 갱신하지 않습니다. 기존 요약은 보존됩니다")
                fd = os.open(path, os.O_RDONLY | os.O_NONBLOCK | getattr(os, "O_NOFOLLOW", 0))
                with os.fdopen(fd, "rb") as stream:
                    info = os.fstat(stream.fileno())
                    if not stat.S_ISREG(info.st_mode):
                        raise ValueError("일반 JSONL 파일만 읽을 수 있습니다")
                    # 첫 레코드 지문으로 교체/축소를 감지하며 로그 내용을 저장하지 않는다.
                    prefix = stream.readline(MAX_LINE + 1)
                    if not prefix.endswith(b"\n"):
                        raise ValueError("첫 로그 레코드가 미완성이거나 1 MiB를 초과합니다")
                    signature = str(info.st_ino) + ":" + hashlib.sha256(prefix).hexdigest()
                    offset = row["offset"]
                    if row["signature"] != signature or info.st_size < offset:
                        offset = 0
                        state = {"summary": state["summary"]} if state.get("summary") else {}
                    stream.seek(offset)
                    while time.monotonic() < deadline and max_bytes > 0:
                        raw = stream.readline(MAX_LINE + 1)
                        max_bytes -= len(raw)
                        if not raw:
                            break
                        if len(raw) > MAX_LINE:
                            raise ValueError("로그 한 줄이 1 MiB를 초과합니다. 해당 세션의 갱신을 중단합니다")
                        if not raw.endswith(b"\n"):
                            result["pending"] = True
                            break
                        try:
                            parse_event(state, json.loads(raw), row["provider"], row["session_id"])
                        except (ValueError, TypeError):
                            note(state, "해석할 수 없는 로그 항목을 건너뛰었습니다")
                        offset = stream.tell()
                    result["pending"] |= offset < info.st_size
                with self.db:
                    self.db.execute("""UPDATE sessions SET state=?,offset=?,signature=?,search_text=?
                        WHERE provider=? AND session_id=? AND offset=? AND signature=? AND updated_at=?""",
                        (json.dumps(state, ensure_ascii=False), offset, signature, searchable_text(state),
                         row["provider"], row["session_id"], row["offset"], row["signature"], row["updated_at"]))
                result["refreshed"] += 1
            except (OSError, ValueError) as exc:
                result["errors"].append({"provider": row["provider"], "session_id": row["session_id"],
                                         "error": clean(str(exc), 200)})
        return result

    def view(self, row):
        state = json.loads(row["state"])
        path = transcript_path(row["provider"], row["transcript"]) if row["transcript"] else None
        available = bool(path and path.is_file() and not path.is_symlink())
        resume_id = state.get("resume_id", row["session_id"])
        argv = ["claude", "--resume", resume_id] if row["provider"] == "claude" else ["codex", "resume", resume_id]
        if row["provider"] == "codex" and state.get("interactive") is False:
            argv.insert(1, "exec")
        files = list(state.get("files", {}).values())
        commands = list(state.get("commands", {}).values())
        return {"kind": "session", "provider": row["provider"], "session_id": row["session_id"],
                "project": row["project"], "cwd": row["cwd"], "branch": state.get("branch"),
                "title": state.get("title", "제목 미확인"), "summary": state.get("summary", "요약 미확인"),
                "summary_confidence": "extracted_unverified", "started_at": state.get("started_at"),
                "last_activity_at": state.get("last_activity_at", row["updated_at"]),
                "ended_at": row["ended_at"], "end_reason": row["end_reason"],
                "lifecycle": "end_observed" if row["ended_at"] else "end_unknown",
                "source_event": row["last_event"], "files": files, "commands": commands,
                "tests": [item for item in commands if item["test_candidate"]],
                "unfinished": state.get("unfinished"), "warnings": state.get("warnings", []),
                "transcript_reference": str(path) if path else "",
                "resume": {"status": "available_unverified" if available else "unavailable",
                           "interactive": state.get("interactive"),
                           "argv": argv if available else None,
                           "command": "cd -- " + shlex.quote(row["cwd"]) + " && " + shlex.join(argv) if available else None}}

    def listing(self, project=None, provider=None, query="", limit=20, sid=None):
        terms = query.casefold().split()
        return [self.view(row) for row in self.rows(project, provider)
                if (sid is None or row["session_id"] == sid)
                and all(term in row["search_text"] for term in terms)][:limit]


def codex_config(script):
    command_line = shlex.join(["python3", str(script), "hook", "--provider", "codex"])
    return {"hooks": {event: [{"hooks": [{"type": "command", "command": command_line,
                                        "timeout": 1 if event == "SessionEnd" else 3}]}] for event in sorted(EVENTS)}}


def transcript_path(provider, value):
    path = Path(value)
    candidates = [path, Path(str(path) + ".zst")]
    if provider == "codex":
        home = Path(os.environ.get("CODEX_HOME", str(Path.home() / ".codex")))
        archived = home / "archived_sessions" / path.name
        candidates.extend([archived, Path(str(archived) + ".zst")])
    return next((candidate for candidate in candidates if candidate.exists()), path)


def searchable_text(state):
    return " ".join([state.get("title", ""), state.get("summary", ""),
                     json.dumps(state.get("files", {}), ensure_ascii=False),
                     json.dumps(state.get("commands", {}), ensure_ascii=False),
                     json.dumps(state.get("unfinished", []), ensure_ascii=False)]).casefold()


def emit(value):
    print(json.dumps(value, ensure_ascii=False, indent=2))


def main():
    os.umask(0o077)
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="action", required=True)
    for action in ("enable", "disable", "status", "codex-config"):
        sub.add_parser(action)
    hook = sub.add_parser("hook")
    hook.add_argument("--provider", choices=["claude", "codex"], required=True)
    for action in ("list", "show", "resume", "refresh", "forget"):
        cmd = sub.add_parser(action)
        cmd.add_argument("--provider", choices=["claude", "codex"])
        cmd.add_argument("--cwd", default=os.getcwd())
        cmd.add_argument("--all", action="store_true")
        if action in {"show", "resume", "forget"}:
            cmd.add_argument("session_id")
        if action == "list":
            cmd.add_argument("--query", default="")
            cmd.add_argument("--limit", type=int, choices=range(1, 101), default=20, metavar="1..100")
    args = parser.parse_args()
    try:
        if args.action == "codex-config":
            emit(codex_config(Path(__file__).resolve()))
            return 0
        if args.action == "hook" and (os.environ.get("CODE_CRIB_SESSION_HISTORY") == "0" or not data_path().exists()):
            return 0
        with closing(History()) as history:
            if args.action in {"enable", "disable"}:
                history.configure(args.action == "enable")
            if args.action in {"enable", "disable", "status"}:
                emit({"enabled": history.enabled(), "storage": str(data_path()), "records": len(history.rows()),
                      "remote_upload": False, "retention": "manual"})
            elif args.action == "hook":
                event = json.loads(sys.stdin.read(MAX_LINE))
                if not isinstance(event, dict):
                    raise ValueError("훅 입력은 JSON 객체여야 합니다")
                history.record(args.provider, event)
                if history.enabled() and event.get("hook_event_name") == "SessionStart":
                    history.refresh(project_root(event["cwd"]), budget=0.5, max_bytes=MAX_LINE)
            else:
                project = None if args.all else project_root(args.cwd)
                sync = history.refresh(project, args.provider) if args.action != "forget" and (history.enabled() or args.action == "refresh") else None
                if args.action == "refresh":
                    emit(sync)
                    return 1 if sync and sync["errors"] else 0
                results = history.listing(project, args.provider, getattr(args, "query", ""),
                                          getattr(args, "limit", 20), getattr(args, "session_id", None))
                if args.action in {"show", "resume", "forget"} and len(results) != 1:
                    raise ValueError("세션이 없거나 ID가 여러 도구에서 일치합니다. --provider와 --all을 확인하세요")
                if args.action == "forget":
                    with history.db:
                        history.db.execute("DELETE FROM sessions WHERE provider=? AND session_id=?",
                                           (results[0]["provider"], args.session_id))
                    emit({"forgotten": args.session_id, "provider": results[0]["provider"], "transcript_deleted": False})
                    return 0
                emit({"kind": "session", "enabled": history.enabled(), "sync": sync, "results": results})
                return 1 if sync and sync["errors"] else 0
        return 0
    except (OSError, ValueError, sqlite3.Error) as exc:
        print(json.dumps({"error": clean(str(exc), 250)}, ensure_ascii=False), file=sys.stderr)
        return 0 if args.action == "hook" else 1


if __name__ == "__main__":
    sys.exit(main())
