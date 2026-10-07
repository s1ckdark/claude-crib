import importlib.util
import json
import os
from pathlib import Path
import sqlite3
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch


PLUGIN = Path(__file__).resolve().parents[1]
SCRIPT = PLUGIN / "hooks/scripts/local-index.py"
spec = importlib.util.spec_from_file_location("local_index", SCRIPT)
local_index = importlib.util.module_from_spec(spec)
spec.loader.exec_module(local_index)


class LocalIndexTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / "프로젝트 with spaces"
        self.root.mkdir()
        self.docs = self.root / ".rag-docs"
        self.docs.mkdir()
        self.environment = patch.dict(os.environ, {"XDG_CACHE_HOME": str(Path(self.temp.name) / "cache")})
        self.environment.start()
        self.addCleanup(self.environment.stop)
        self.index = local_index.LocalIndex(self.root)
        self.addCleanup(self.index.close)
        self.index.ensure_default()

    def write(self, name="auth.md", content="# Auth\n세션 타임아웃을 해결했다.\n"):
        path = self.docs / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        return path

    def cli(self, *args, input_text=None, cwd=None, env=None):
        return subprocess.run([sys.executable, str(SCRIPT), *args], cwd=cwd or self.root,
                              input=input_text, capture_output=True, text=True, check=False,
                              env={**os.environ, **(env or {})}, timeout=20)

    def test_incremental_add_update_delete_and_fts_cleanup(self):
        path = self.write(content="# Login\noldtoken\n")
        self.assertEqual(self.index.sync()["added"], 1)
        indexed_at = self.index.db.execute("SELECT indexed_at FROM documents").fetchone()[0]
        self.assertEqual(self.index.sync()["unchanged"], 1)
        self.assertEqual(self.index.db.execute("SELECT indexed_at FROM documents").fetchone()[0], indexed_at)
        path.write_text("# Login\nnewtoken\n", encoding="utf-8")
        self.assertEqual(self.index.status()["sources"][0]["pending"]["updated"], 1)
        self.assertEqual(self.index.sync()["updated"], 1)
        self.assertEqual(self.index.search("oldtoken"), [])
        self.assertEqual(len(self.index.search("newtoken")), 1)
        self.assertEqual(self.index.db.execute("SELECT count(*) FROM documents").fetchone()[0], 1)
        path.unlink()
        self.assertEqual(self.index.status()["sources"][0]["pending"]["deleted"], 1)
        self.assertEqual(self.index.sync()["deleted"], 1)
        self.assertEqual(self.index.search("newtoken"), [])

    def test_hash_detects_same_size_and_mtime_changes(self):
        path = self.write(content="aaa")
        self.index.sync()
        previous = path.stat()
        path.write_text("bbb", encoding="utf-8")
        os.utime(path, ns=(previous.st_atime_ns, previous.st_mtime_ns))
        self.assertEqual(self.index.sync()["updated"], 1)

    def test_force_reindexes_unchanged_document(self):
        self.write()
        self.index.sync()
        self.assertEqual(self.index.sync(force=True)["updated"], 1)
        self.assertEqual(len(self.index.search("Auth")), 1)

    def test_status_does_not_apply_changes(self):
        self.write()
        status = self.index.status()
        self.assertEqual(status["indexed"], 0)
        self.assertEqual(status["sources"][0]["pending"]["added"], 1)
        self.assertIsNone(status["sources"][0]["last_sync"])
        self.assertEqual(status["remote_sync"], "not_tracked")
        self.index.sync()
        self.assertIsNotNone(self.index.status()["sources"][0]["last_sync"])

    def test_missing_source_preserves_index(self):
        self.write()
        self.index.sync()
        self.docs.rename(self.root / "temporarily-unavailable")
        result = self.index.sync()
        self.assertEqual(result["deleted"], 0)
        self.assertEqual(len(result["errors"]), 1)
        status = self.index.status()["sources"][0]
        self.assertEqual(status["indexed"], 1)
        self.assertTrue(status["errors"])
        self.assertTrue(status["last_sync_errors"])

    def test_failed_read_keeps_old_document_and_can_retry(self):
        path = self.write()
        self.index.sync()
        path.write_bytes(b"\xff\xfe")
        result = self.index.sync()
        self.assertEqual(result["deleted"], 0)
        self.assertEqual(len(result["errors"]), 1)
        self.assertTrue(self.index.search("Auth"))
        self.write(content="# Repaired\nfixed\n")
        self.assertEqual(self.index.sync()["errors"], [])
        self.assertEqual(self.index.status()["sources"][0]["last_sync_errors"], [])

    def test_failed_directory_scan_does_not_delete(self):
        self.write()
        self.index.sync()
        with patch.object(local_index.os, "walk", side_effect=PermissionError("접근 불가")):
            result = self.index.sync()
        self.assertTrue(result["errors"])
        self.assertEqual(result["deleted"], 0)
        self.assertEqual(self.index.status()["indexed"], 1)

    def test_large_non_markdown_hidden_and_symlink_files(self):
        self.write("large.md", "a" * (local_index.MAX_BYTES + 1))
        self.write("small.MD")
        self.write("ignore.txt")
        self.write(".hidden.md")
        self.write(".hidden/secret.md")
        self.write("node_modules/dependency.md")
        self.write("vendor/library.md")
        outside = self.root / "outside.md"
        outside.write_text("private", encoding="utf-8")
        (self.docs / "link.md").symlink_to(outside)
        (self.docs / "linked-directory").symlink_to(self.root, target_is_directory=True)
        result = self.index.sync()
        self.assertEqual(result["added"], 1)
        self.assertEqual(len(result["errors"]), 1)

    def test_rejects_outside_symlink_and_overlapping_sources(self):
        for source in (self.root.parent, "../escape", ".rag-docs/../escape", "."):
            with self.subTest(source=source), self.assertRaises(ValueError):
                self.index.register(source)
        link = self.root / "link"
        link.symlink_to(self.docs, target_is_directory=True)
        with self.assertRaises(ValueError):
            self.index.register(link)
        (self.docs / "nested").mkdir()
        with self.assertRaises(ValueError):
            self.index.register(".rag-docs/nested")

    def test_registered_source_replaced_with_symlink_preserves_index(self):
        self.write()
        self.index.sync()
        moved = self.root / "moved"
        self.docs.rename(moved)
        self.docs.symlink_to(moved, target_is_directory=True)
        result = self.index.sync()
        self.assertTrue(result["errors"])
        self.assertEqual(result["deleted"], 0)

    def test_multiple_sources_persist_across_processes(self):
        custom = self.root / "docs" / "knowledge"
        custom.mkdir(parents=True)
        (custom / "redis.md").write_text("# Redis\ncache timeout", encoding="utf-8")
        result = self.cli("sync", "--path", "docs/knowledge")
        self.assertEqual(result.returncode, 0, result.stderr + result.stdout)
        self.assertIn("docs/knowledge", self.index.sources())
        (custom / "redis.md").write_text("# Redis\nconnection refused", encoding="utf-8")
        result = self.cli("search", "connection")
        data = json.loads(result.stdout)
        self.assertEqual(data["sync"]["updated"], 1)
        self.assertEqual(data["results"][0]["path"], "docs/knowledge/redis.md")

    def test_default_source_added_after_custom_source(self):
        self.index.db.execute("DELETE FROM sources")
        self.index.db.commit()
        custom = self.root / "docs"
        custom.mkdir()
        self.index.register("docs")
        self.index.ensure_default()
        self.assertEqual(self.index.sources(), [".rag-docs", "docs"])

    def test_search_filters_tags_type_and_host(self):
        self.write("a.md", '---\ntitle: "Redis #timeout"\ntype: bugfix\nhost: macbook\ntags: [redis, auth]\n---\nconnection failed')
        self.write("b.md", "---\ntype: feature\nhost: desktop\ntags:\n  - redis\n  - cache\n---\n# Redis\nconnection failed")
        self.index.sync()
        rows = self.index.search("connection", kind="bugfix", host="macbook", tags=["redis", "auth"])
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["title"], "Redis #timeout")
        self.assertEqual(self.index.search("connection", tags=["red"]), [])
        self.assertEqual(len(self.index.search("connection", tags=["redis", "cache"])), 1)
        self.assertEqual(self.index.search("connection", host="missing"), [])

    def test_title_weight_and_result_limit(self):
        self.write("body.md", "# unrelated\ntimeout")
        self.write("title.md", "# timeout\nunrelated")
        self.index.sync()
        rows = self.index.search("timeout", limit=1)
        self.assertEqual(rows[0]["path"], ".rag-docs/title.md")

    def test_korean_substring_and_partial_identifier_search(self):
        self.write(content="# 로그인\n타임아웃을 고쳤다. acquireRefreshLock으로 해결했다.")
        self.index.sync()
        self.assertIn("[[타임아웃]]", self.index.search("타임아웃")[0]["snippet"]["text"])
        self.assertIn("[[Refresh]]", self.index.search("Refresh")[0]["snippet"]["text"])
        self.assertEqual(self.index.search("전혀없는단어"), [])

    def test_query_syntax_is_literal_and_empty_query_is_safe(self):
        self.write(content="# Test\ntimeout")
        self.index.sync()
        self.assertEqual(self.index.search('"*) OR (NOT - :'), [])
        self.assertEqual(self.index.search(" "), [])
        self.assertTrue(self.index.search('timeout"; DROP TABLE documents; --'))
        self.assertEqual(self.index.status()["indexed"], 1)

    def test_excerpt_uses_relevant_passage_and_original_lines(self):
        content = "# Title\n" + "unrelated introduction\n" * 30 + "The timeout happened here.\n"
        result = local_index.excerpt(content, "timeout")
        self.assertIn("[[timeout]]", result["text"])
        self.assertGreater(result["line_start"], 20)
        self.assertLessEqual(result["line_start"], 32)
        self.assertGreaterEqual(result["line_end"], 32)
        self.assertTrue(result["matched"])
        self.assertFalse(local_index.excerpt(content, "absent")["matched"])

    def test_excerpt_prefers_window_with_multiple_terms(self):
        content = "auth " + "intro " * 100 + "auth timeout retry"
        result = local_index.excerpt(content, "auth timeout retry")
        self.assertIn("[[timeout]]", result["text"])
        self.assertIn("[[retry]]", result["text"])

    def test_search_cli_refreshes_and_emits_warning_on_partial_failure(self):
        path = self.write(content="# CLI\nneedle")
        result = self.cli("search", "needle")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(len(json.loads(result.stdout)["results"]), 1)
        path.write_bytes(b"\xff")
        result = self.cli("search", "needle")
        self.assertEqual(result.returncode, 1)
        self.assertTrue(json.loads(result.stdout)["sync"]["errors"])
        self.assertEqual(len(json.loads(result.stdout)["results"]), 1)

    def test_snippet_cli_uses_stdin_without_creating_cache(self):
        result = self.cli("snippet", "needle", input_text="head " * 80 + "needle")
        self.assertEqual(result.returncode, 0)
        self.assertIn("[[needle]]", json.loads(result.stdout)["text"])

    def test_cli_invalid_options_and_cache_isolation(self):
        for args in (("search", "test", "--limit", "0"), ("status", "--path", "docs"),
                     ("sync", "--path", "../other")):
            with self.subTest(args=args):
                result = self.cli(*args)
                self.assertEqual(result.returncode, 1)
                self.assertIn("error", json.loads(result.stdout))
        self.assertNotEqual(local_index.cache_path(self.root), local_index.cache_path(self.root / "other"))

    def test_hook_contract_opt_out_and_malformed_input(self):
        self.write()
        payload = json.dumps({"cwd": str(self.root), "hook_event_name": "SessionStart"})
        result = self.cli("hook", input_text=payload)
        output = json.loads(result.stdout)["hookSpecificOutput"]
        self.assertEqual(result.returncode, 0)
        self.assertEqual(output["hookEventName"], "SessionStart")
        self.assertIn('"added": 1', output["additionalContext"])
        self.assertNotIn("타임아웃", output["additionalContext"])
        self.assertEqual(self.cli("hook", input_text=payload).stdout, "")
        self.write("new.md")
        result = self.cli("hook", input_text=payload, env={"CODE_CRIB_AUTO_INDEX": "0"})
        self.assertEqual(result.stdout, "")
        self.assertEqual(self.index.status()["indexed"], 1)
        for invalid in ("broken", "[]", "{}", '{"cwd": 123}'):
            self.assertEqual(self.cli("hook", input_text=invalid).returncode, 0)

    def test_hook_without_documents_does_not_create_cache(self):
        empty = Path(self.temp.name) / "empty"
        empty.mkdir()
        result = self.cli("hook", input_text=json.dumps({"cwd": str(empty)}), cwd=empty)
        self.assertEqual(result.returncode, 0)
        self.assertEqual(result.stdout, "")
        self.assertFalse(local_index.cache_path(empty).exists())

    def test_hook_shell_works_with_plugin_path_containing_spaces(self):
        self.write()
        alias = Path(self.temp.name) / "plugin with spaces"
        alias.symlink_to(PLUGIN, target_is_directory=True)
        config = json.loads((PLUGIN / "hooks/hooks.json").read_text())
        command = config["hooks"]["SessionStart"][0]["hooks"][0]["command"]
        result = subprocess.run(["bash", "-c", command], cwd=self.root, text=True,
                                input=json.dumps({"cwd": str(self.root)}), capture_output=True,
                                env={**os.environ, "CLAUDE_PLUGIN_ROOT": str(alias)}, check=False, timeout=20)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("hookSpecificOutput", json.loads(result.stdout))
        self.assertIn("Stop", config["hooks"])

    def test_git_subdirectory_resolves_repository_root(self):
        subprocess.run(["git", "init", "-q", str(self.root)], check=True)
        nested = self.root / "src"
        nested.mkdir()
        self.write()
        result = self.cli("search", "Auth", cwd=nested)
        self.assertEqual(result.returncode, 0, result.stderr + result.stdout)
        self.assertEqual(len(json.loads(result.stdout)["results"]), 1)

    def test_transaction_rolls_back_partial_updates(self):
        self.write("a.md", "original")
        self.index.sync()
        self.write("a.md", "changed")
        self.write("b.md", "second")
        parse = local_index.metadata

        def fail_second(content, path):
            if path.name == "b.md":
                raise sqlite3.OperationalError("중단")
            return parse(content, path)

        with patch.object(local_index, "metadata", side_effect=fail_second):
            with self.assertRaises(sqlite3.OperationalError):
                self.index.sync()
        self.assertEqual(self.index.db.execute("SELECT content FROM documents").fetchone()[0], "original")


if __name__ == "__main__":
    unittest.main()
