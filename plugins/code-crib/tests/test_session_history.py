import importlib.util
import json
import os
from pathlib import Path
import shutil
import sqlite3
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch


PLUGIN = Path(__file__).resolve().parents[1]
SCRIPT = PLUGIN / "hooks/scripts/session-history.py"
spec = importlib.util.spec_from_file_location("session_history", SCRIPT)
assert spec is not None and spec.loader is not None
history = importlib.util.module_from_spec(spec)
spec.loader.exec_module(history)


def claude(role, content, **fields):
    return {"type": role, "sessionId": "s1", "timestamp": "2026-10-07T01:00:00Z",
            "message": {"content": content}, **fields}


def codex(kind, payload):
    return {"type": kind, "timestamp": "2026-10-07T01:00:00Z", "payload": payload}


def call(key, name, args):
    return {"type": "tool_use", "id": key, "name": name, "input": args}


def result(key, text="", **fields):
    return {"type": "tool_result", "tool_use_id": key, "content": text, **fields}


class SessionHistoryTest(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name)
        self.project = self.root / "한글 프로젝트"
        self.project.mkdir()
        (self.project / ".git").mkdir()
        self.path = self.root / "transcript.jsonl"
        env = patch.dict(os.environ, {"XDG_DATA_HOME": str(self.root / "data"),
                                     "CODEX_HOME": str(self.root / "codex"), "CODE_CRIB_SESSION_HISTORY": "1"})
        env.start()
        self.addCleanup(env.stop)
        self.store = history.History()
        self.addCleanup(self.store.close)
        self.store.configure(True)

    def write(self, events, append=False):
        with self.path.open("a" if append else "w", encoding="utf-8") as f:
            for event in events:
                f.write(json.dumps(event, ensure_ascii=False) + "\n")

    def event(self, kind="SessionEnd", **fields):
        return {"session_id": "s1", "transcript_path": str(self.path), "cwd": str(self.project),
                "hook_event_name": kind, "reason": "prompt_input_exit", **fields}

    def record(self, provider="claude", kind="SessionEnd", **fields):
        self.store.record(provider, self.event(kind, **fields))

    def view(self, **filters):
        return self.store.listing(**filters)[0]

    def cli(self, *args, input_text=None, env=None, script=SCRIPT):
        return subprocess.run([sys.executable, str(script), *args], input=input_text,
                              text=True, capture_output=True, cwd=self.project, timeout=10,
                              env={**os.environ, **(env or {})})

    def test_opt_in_and_disable_do_not_delete(self):
        self.store.configure(False)
        self.record()
        self.assertEqual(self.store.rows(), [])
        self.store.configure(True)
        self.record()
        self.store.configure(False)
        self.record(session_id="s2")
        self.assertEqual(len(self.store.rows()), 1)

    def test_disabled_fresh_hook_creates_no_storage(self):
        unused = self.root / "unused"
        proc = self.cli("hook", "--provider", "claude", input_text="{}", env={"XDG_DATA_HOME": str(unused)})
        self.assertEqual(proc.returncode, 0)
        self.assertFalse(unused.exists())
        self.assertEqual(proc.stdout, "")

    def test_environment_opt_out_overrides_enabled(self):
        with patch.dict(os.environ, {"CODE_CRIB_SESSION_HISTORY": "0"}):
            self.record()
        self.assertEqual(self.store.rows(), [])

    def test_default_store_is_disabled(self):
        self.store.db.execute("DELETE FROM settings")
        self.store.db.commit()
        self.assertFalse(self.store.enabled())

    def test_private_permissions_and_cache_separation(self):
        path = history.data_path()
        self.assertEqual(path.stat().st_mode & 0o777, 0o600)
        self.assertEqual(path.parent.stat().st_mode & 0o777, 0o700)
        self.assertNotIn("cache", str(path))
        self.assertFalse(path.is_relative_to(self.project))

    def test_lifecycle_and_duplicate_end(self):
        self.record(kind="Stop")
        self.assertEqual(self.view()["lifecycle"], "end_unknown")
        self.assertIsNone(self.view()["ended_at"])
        self.record()
        first_end = self.view()["ended_at"]
        self.record()
        self.assertEqual(len(self.store.rows()), 1)
        self.assertEqual(self.view()["ended_at"], first_end)
        self.assertEqual(self.view()["end_reason"], "prompt_input_exit")
        self.record(kind="SessionStart")
        self.assertIsNone(self.view()["ended_at"])

    def test_end_does_not_parse_transcript(self):
        self.write([claude("user", "새 제목")])
        self.record()
        self.assertEqual(self.store.rows()[0]["offset"], 0)
        self.assertEqual(self.view()["title"], "제목 미확인")

    def test_checkpoint_survives_missing_original(self):
        self.record(kind="Stop", last_assistant_message="인증 수정 요약")
        self.assertEqual(self.view()["summary"], "인증 수정 요약")
        self.assertEqual(len(self.store.listing(query="인증")), 1)

    def test_claude_messages_files_commands_and_explicit_exit(self):
        self.write([claude("user", "로그인 timeout 수정"),
                    claude("assistant", [call("a", "Edit", {"file_path": "src/auth.py", "new_string": "DO_NOT_COPY"}),
                                         call("b", "Bash", {"command": "python -m pytest"})], gitBranch="fix-auth"),
                    claude("user", [result("a", is_error=False), result("b", "Exit code: 0\nRAW_OUTPUT")]),
                    claude("assistant", [{"type": "text", "text": "인증 경로를 수정했습니다"}])])
        self.record()
        self.assertFalse(self.store.refresh()["errors"])
        item = self.view()
        self.assertEqual(item["branch"], "fix-auth")
        self.assertEqual(item["summary"], "인증 경로를 수정했습니다")
        self.assertEqual(item["files"][0]["outcome"], "tool_reported_success")
        self.assertEqual(item["tests"][0]["outcome"], "exit_ok")
        stored = self.store.rows()[0]["state"]
        self.assertNotIn("DO_NOT_COPY", stored)
        self.assertNotIn("RAW_OUTPUT", stored)

    def test_failed_and_unknown_outcomes_are_not_success(self):
        self.write([claude("assistant", [call("a", "Bash", {"command": "npm test"}),
                                         call("b", "Write", {"file_path": "no.txt"})]),
                    claude("user", [result("a", "Looks good", is_error=False), result("b", "denied", is_error=True)])])
        self.record()
        self.store.refresh()
        self.assertEqual(self.view()["tests"][0]["outcome"], "unverified")
        self.assertEqual(self.view()["files"][0]["outcome"], "failed")
        self.write([claude("user", [result("a", "Exit code: 1")])], append=True)
        self.store.refresh()
        self.assertEqual(self.view()["tests"][0]["outcome"], "failed")

    def test_sidechains_and_foreign_sessions_are_ignored(self):
        self.write([claude("user", "main"), claude("assistant", "subagent", isSidechain=True),
                    claude("assistant", [call("a", "Write", {"file_path": "other.txt"})], sessionId="s2")])
        self.record()
        self.store.refresh()
        self.assertEqual(self.view()["files"], [])
        self.assertEqual(self.view()["summary"], "요약 미확인")

    def test_incremental_append_and_idempotent_tools(self):
        self.write([claude("assistant", [call("a", "Bash", {"command": "pytest"})])])
        self.record()
        self.store.refresh()
        offset = self.store.rows()[0]["offset"]
        self.store.refresh()
        self.assertEqual(self.store.rows()[0]["offset"], offset)
        self.write([claude("assistant", [call("a", "Bash", {"command": "pytest"})]),
                    claude("user", [result("a", "Process exited with code 0")])], append=True)
        self.store.refresh()
        self.assertEqual(len(self.view()["commands"]), 1)
        self.assertEqual(self.view()["commands"][0]["exit_code"], 0)

    def test_partial_tail_is_retried(self):
        self.write([claude("user", "first")])
        self.record()
        self.store.refresh()
        before = self.store.rows()[0]["offset"]
        encoded = json.dumps(claude("assistant", "second"))
        with self.path.open("a") as f:
            f.write(encoded[:20])
        self.assertTrue(self.store.refresh()["pending"])
        self.assertEqual(self.store.rows()[0]["offset"], before)
        with self.path.open("a") as f:
            f.write(encoded[20:] + "\n")
        self.store.refresh()
        self.assertEqual(self.view()["summary"], "second")

    def test_byte_budget_resumes_cursor(self):
        self.write([claude("user", "first"), claude("assistant", "last")])
        self.record()
        self.assertTrue(self.store.refresh(max_bytes=1)["pending"])
        self.store.refresh()
        self.assertEqual(self.view()["summary"], "last")

    def test_replaced_and_truncated_log_rebuilds(self):
        self.write([claude("user", "old title"), claude("assistant", [call("a", "Write", {"file_path": "old"})])])
        self.record()
        self.store.refresh()
        self.write([claude("user", "new")])
        self.store.refresh()
        self.assertEqual(self.view()["title"], "new")
        self.assertEqual(self.view()["files"], [])

    def test_deleted_original_keeps_summary_without_resume(self):
        self.write([claude("assistant", "saved summary")])
        self.record()
        self.store.refresh()
        self.path.unlink()
        self.store.refresh()
        self.assertEqual(self.view()["summary"], "saved summary")
        self.assertEqual(self.view()["resume"]["status"], "unavailable")
        self.assertIsNone(self.view()["resume"]["command"])

    def test_ephemeral_reference_is_not_resumable(self):
        self.record(provider="codex", transcript_path="")
        self.assertEqual(self.view()["resume"]["status"], "unavailable")

    def test_resume_shell_quoting(self):
        self.write([claude("user", "hello")])
        strange = self.project / "sub ' dir;echo no"
        strange.mkdir()
        self.record(cwd=str(strange))
        self.assertIn("'\"'\"'", self.view()["resume"]["command"])
        self.assertEqual(self.view()["resume"]["argv"], ["claude", "--resume", "s1"])

    def test_codex_legacy_and_thread_id_not_worker_id(self):
        self.write([codex("session_meta", {"id": "thread-1", "source": "exec", "git": {"branch": "branch"}}),
                    codex("event_msg", {"type": "user_message", "message": "세션 인증 개선"}),
                    codex("response_item", {"type": "function_call", "name": "exec_command", "call_id": "c1",
                                            "arguments": json.dumps({"cmd": "npm test"})}),
                    codex("response_item", {"type": "function_call_output", "call_id": "c1", "output": "Process exited with code 0\nSECRET_OUTPUT"}),
                    codex("response_item", {"type": "custom_tool_call", "name": "apply_patch", "call_id": "p1",
                                            "input": "*** Update File: src/auth.py\n+PRIVATE_CODE\n"}),
                    codex("response_item", {"type": "custom_tool_call_output", "call_id": "p1", "output": "Success. Updated the following files:\nM src/auth.py"}),
                    codex("response_item", {"type": "function_call", "name": "update_plan", "call_id": "p2",
                                            "arguments": json.dumps({"plan": [{"step": "추가 확인", "status": "pending"}, {"step": "수정", "status": "completed"}]})}),
                    codex("event_msg", {"type": "agent_message", "message": "수정 완료"})])
        self.record(provider="codex")
        self.store.refresh()
        item = self.view()
        self.assertEqual(item["resume"]["argv"], ["codex", "exec", "resume", "thread-1"])
        self.assertEqual(item["files"][0]["outcome"], "tool_reported_success")
        self.assertEqual(item["tests"][0]["exit_code"], 0)
        self.assertEqual(item["unfinished"], ["추가 확인"])
        self.assertNotIn("SECRET_OUTPUT", self.store.rows()[0]["state"])
        self.assertNotIn("PRIVATE_CODE", self.store.rows()[0]["state"])

    def test_codex_paginated_items(self):
        items = [{"type": "UserMessage", "content": [{"type": "text", "text": "paginated"}]},
                 {"type": "AgentMessage", "content": [{"type": "Text", "text": "summary"}]},
                 {"type": "CommandExecution", "id": "a", "command": ["npm", "test"], "exit_code": 2, "status": "failed"},
                 {"type": "FileChange", "id": "b", "changes": {"new.py": {"diff": "DO_NOT_COPY"}}, "status": "completed"}]
        self.write([codex("event_msg", {"type": "item_completed", "item": item}) for item in items])
        self.record(provider="codex")
        self.store.refresh()
        self.assertEqual(self.view()["title"], "paginated")
        self.assertEqual(self.view()["summary"], "summary")
        self.assertEqual(self.view()["tests"][0]["outcome"], "failed")
        self.assertEqual(self.view()["files"][0]["path"], "new.py")

    def test_first_codex_metadata_wins_over_inherited_history(self):
        self.write([codex("session_meta", {"id": "fork", "source": "cli"}),
                    codex("session_meta", {"id": "parent", "source": "exec"})])
        self.record(provider="codex")
        self.store.refresh()
        self.assertEqual(self.view()["resume"]["argv"], ["codex", "resume", "fork"])

    def test_compressed_original_keeps_summary_and_warns(self):
        self.write([codex("event_msg", {"type": "agent_message", "message": "cached"})])
        self.record(provider="codex")
        self.store.refresh()
        self.path.rename(Path(str(self.path) + ".zst"))
        self.assertTrue(self.store.refresh()["errors"])
        self.assertEqual(self.view()["summary"], "cached")
        self.assertEqual(self.view()["resume"]["status"], "available_unverified")

    def test_codex_default_archive_move(self):
        self.write([codex("session_meta", {"id": "archived", "source": "cli"})])
        self.record(provider="codex")
        archive = Path(os.environ["CODEX_HOME"]) / "archived_sessions"
        archive.mkdir(parents=True)
        self.path.rename(archive / self.path.name)
        self.assertFalse(self.store.refresh()["errors"])
        self.assertEqual(self.view()["resume"]["argv"][-1], "archived")

    def test_search_provider_project_and_literal_special_characters(self):
        self.write([claude("user", '인증 timeout " OR 1=1 %'), claude("assistant", "한국어 검색")])
        self.record()
        self.store.refresh()
        self.record(provider="codex", session_id="other", cwd=str(self.root))
        self.assertEqual(len(self.store.listing(query="인증 timeout", provider="claude")), 1)
        self.assertEqual(self.store.listing(query="missing"), [])
        self.assertEqual(len(self.store.listing(query='" OR 1=1 %')), 1)
        self.assertEqual(len(self.store.listing(project=str(self.project))), 1)
        self.assertEqual(len(self.store.listing()), 2)

    def test_sensitive_patterns_and_code_blocks_are_masked_before_storage(self):
        key = "sk-" + "a" * 30
        text = 'API_KEY="example-value" password=test-password Bearer private-value ' + key + "\n```py\nPRIVATE_CODE\n```"
        self.write([claude("user", text), claude("assistant", text)])
        self.record()
        self.store.refresh()
        raw = history.data_path().read_bytes()
        for secret in (key, "example-value", "test-password", "private-value", "PRIVATE_CODE"):
            self.assertNotIn(secret.encode(), raw)
        self.assertIn("REDACTED", self.view()["summary"])

    def test_malformed_and_future_records_do_not_crash(self):
        self.write([claude("user", "known"), [], {"type": "future"},
                    claude("assistant", [{"type": "tool_use", "input": []}])])
        with self.path.open("a") as f:
            f.write("{broken}\n")
        self.record()
        self.assertFalse(self.store.refresh()["errors"])
        self.assertEqual(self.view()["title"], "known")
        self.assertTrue(self.view()["warnings"])

    def test_oversized_record_preserves_previous_summary(self):
        self.record(last_assistant_message="keep")
        self.path.write_text("x" * (history.MAX_LINE + 1) + "\n")
        self.assertTrue(self.store.refresh()["errors"])
        self.assertEqual(self.view()["summary"], "keep")

    def test_symlink_and_fifo_are_not_read(self):
        target = self.root / "target"
        target.write_text("{}\n")
        self.path.symlink_to(target)
        self.record()
        self.assertTrue(self.store.refresh()["errors"])
        self.assertEqual(self.view()["resume"]["status"], "unavailable")
        self.path.unlink()
        os.mkfifo(self.path)
        self.assertTrue(self.store.refresh()["errors"])

    def test_read_failure_preserves_summary(self):
        self.write([claude("assistant", "keep")])
        self.record()
        self.store.refresh()
        with patch.object(history.os, "open", side_effect=PermissionError("denied")):
            self.assertTrue(self.store.refresh()["errors"])
        self.assertEqual(self.view()["summary"], "keep")

    def test_bad_inputs_fail_open_on_hook_only(self):
        for value in ("not json", "[]", json.dumps(self.event(session_id="; bad")), json.dumps(self.event(cwd="relative"))):
            proc = self.cli("hook", "--provider", "claude", input_text=value)
            self.assertEqual(proc.returncode, 0)
            self.assertEqual(proc.stdout, "")
        self.assertEqual(self.cli("show", "missing").returncode, 1)

    def test_session_start_reconciles_registered_sessions_without_faking_end(self):
        self.write([claude("user", "recovered")])
        self.record(kind="Stop")
        proc = self.cli("hook", "--provider", "claude", input_text=json.dumps(self.event("SessionStart", session_id="s2", transcript_path="")))
        self.assertEqual(proc.returncode, 0)
        item = self.store.listing(sid="s1")[0]
        self.assertEqual(item["title"], "recovered")
        self.assertEqual(item["lifecycle"], "end_unknown")

    def test_list_auto_refresh_and_disabled_snapshot(self):
        self.write([claude("user", "old")])
        self.record()
        proc = self.cli("list", "--query", "old")
        self.assertEqual(len(json.loads(proc.stdout)["results"]), 1)
        self.store.configure(False)
        self.write([claude("assistant", "new")], append=True)
        self.assertEqual(json.loads(self.cli("list", "--query", "new").stdout)["results"], [])
        self.assertEqual(self.cli("refresh").returncode, 0)
        self.assertEqual(len(json.loads(self.cli("list", "--query", "new").stdout)["results"]), 1)

    def test_same_id_across_providers_requires_filter(self):
        self.record()
        self.record(provider="codex")
        self.assertEqual(self.cli("show", "s1").returncode, 1)
        self.assertEqual(self.cli("show", "s1", "--provider", "codex").returncode, 0)

    def test_forget_keeps_original(self):
        self.write([claude("user", "hello")])
        self.record()
        self.assertEqual(self.cli("forget", "s1").returncode, 0)
        self.assertEqual(self.store.rows(), [])
        self.assertTrue(self.path.exists())

    def test_hook_lock_contention_is_fail_open(self):
        self.store.db.execute("BEGIN EXCLUSIVE")
        proc = self.cli("hook", "--provider", "claude", input_text=json.dumps(self.event()))
        self.store.db.rollback()
        self.assertEqual(proc.returncode, 0)
        self.assertIn("locked", proc.stderr)

    def test_concurrent_checkpoint_is_not_overwritten_by_refresh(self):
        self.write([claude("assistant", "older")])
        self.record(kind="Stop")
        original = history.parse_event

        def parse(*args):
            self.record(kind="Stop", last_assistant_message="newer")
            return original(*args)

        with patch.object(history, "parse_event", side_effect=parse):
            self.store.refresh()
        self.assertEqual(self.view()["summary"], "newer")

    def test_codex_config_command_and_claude_wrapper_with_spaces(self):
        copied = self.root / "plugin with ' spaces"
        shutil.copytree(PLUGIN / "hooks/scripts", copied)
        configured = json.loads(self.cli("codex-config", script=copied / SCRIPT.name).stdout)
        cmd = configured["hooks"]["SessionEnd"][0]["hooks"][0]
        self.assertEqual(cmd["timeout"], 1)
        proc = subprocess.run(cmd["command"], shell=True, input=json.dumps(self.event()), text=True,
                              capture_output=True, timeout=3)
        self.assertEqual(proc.returncode, 0)
        self.assertEqual(self.store.rows()[0]["provider"], "codex")
        proc = subprocess.run(["bash", str(copied / "record-session.sh")], input=json.dumps(self.event()),
                              text=True, capture_output=True, timeout=3)
        self.assertEqual(proc.returncode, 0)
        self.assertEqual(len(self.store.rows()), 2)

    def test_hooks_config_contains_all_lifecycle_events(self):
        config = json.loads((PLUGIN / "hooks/hooks.json").read_text())
        for event in ("SessionStart", "Stop", "SessionEnd"):
            hooks = config["hooks"][event][0]["hooks"]
            self.assertTrue(any("record-session.sh" in hook["command"] for hook in hooks))

    def test_transaction_failure_keeps_old_record(self):
        self.record(last_assistant_message="old")
        self.write([claude("assistant", "new")])
        self.store.db.execute("""CREATE TRIGGER reject_update BEFORE UPDATE ON sessions
                             BEGIN SELECT RAISE(FAIL, 'rejected'); END""")
        with self.assertRaises(sqlite3.IntegrityError):
            self.store.refresh()
        self.assertEqual(self.view()["summary"], "old")


if __name__ == "__main__":
    unittest.main()
