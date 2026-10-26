import contextlib
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import importlib.util
import io
import json
import os
from pathlib import Path
import subprocess
import tempfile
import threading
import unittest
from unittest.mock import patch
from urllib.error import HTTPError, URLError


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "zai-review.py"
spec = importlib.util.spec_from_file_location("zai_review", SCRIPT)
cli = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cli)


class ReviewCLITests(unittest.TestCase):
    def invoke(self, args, env=None):
        stdout, stderr = io.StringIO(), io.StringIO()
        with patch.dict(os.environ, env or {}, clear=True), contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
            code = cli.main(args)
        return code, stdout.getvalue(), stderr.getvalue()

    def test_git_selects_only_requested_changes_without_modifying_repo(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            def git(*args):
                return subprocess.run(["git", "-C", directory, *args], check=True,
                                      capture_output=True, text=True).stdout
            git("init", "-q")
            source = root / "example.py"
            source.write_text("original = 1\n")
            git("add", "example.py")
            git("-c", "user.name=Test", "-c", "user.email=test@example.invalid",
                "-c", "commit.gpgsign=false", "-c", "core.hooksPath=/dev/null", "commit", "-qm", "initial")
            source.write_text("staged_change = 2\n")
            git("add", "example.py")
            source.write_text("working_change = 3\n")
            before = (git("diff"), git("diff", "--staged"), source.read_bytes())
            original = Path.cwd()
            try:
                os.chdir(root)
                staged = cli.gather_code(None, True)
                unstaged = cli.gather_code(None, False)
            finally:
                os.chdir(original)
            self.assertIn("+staged_change = 2", staged)
            self.assertNotIn("working_change", staged)
            self.assertIn("+working_change = 3", unstaged)
            self.assertEqual(before, (git("diff"), git("diff", "--staged"), source.read_bytes()))

    def test_file_content_survives_shell_metacharacters_and_json_encoding(self):
        source = "# 한글 'quotes' \"double\" `touch injected` $(touch injected)\nprint('hello')\n"
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "file with 'quotes' $(touch injected).py"
            path.write_text(source)
            opener = unittest.mock.MagicMock()
            opener.open.return_value.__enter__.return_value = io.BytesIO(json.dumps({
                "content": [{"type": "thinking", "thinking": "hidden"},
                            {"type": "text", "text": "Review feedback"}],
                "stop_reason": "end_turn",
            }).encode())
            with patch.object(cli.request, "build_opener", return_value=opener):
                result = self.invoke([str(path)], {"Z_AI_API_KEY": "synthetic-key"})
            self.assertEqual(result, (0, "Review feedback\n", ""))
            api_request = opener.open.call_args.args[0]
            body = json.loads(api_request.data)
            self.assertEqual(body["messages"][0]["content"], cli.REVIEW_PROMPT + source)
            self.assertEqual(body["model"], "glm-5-turbo")
            self.assertEqual(body["thinking"]["type"], "enabled")
            self.assertEqual(path.read_text(), source)
            self.assertEqual(list(Path(directory).iterdir()), [path])

    def test_empty_diff_needs_no_key_or_network(self):
        with patch.object(cli, "gather_code", return_value="\n"), patch.object(cli, "review") as call:
            result = self.invoke([])
            self.assertEqual(result[0], 0)
            self.assertIn("No changes to review", result[1])
            call.assert_not_called()

    def test_missing_key_fails_before_network(self):
        with patch.object(cli, "gather_code", return_value="code"), patch.object(cli, "review") as call:
            result = self.invoke([])
            self.assertEqual(result[0], 1)
            self.assertIn("Set Z_AI_API_KEY", result[2])
            call.assert_not_called()

    def test_key_alias_model_timeout_and_thinking_options(self):
        with patch.object(cli, "gather_code", return_value="code"), patch.object(cli, "review", return_value="ok") as call:
            self.assertEqual(self.invoke(["--model", "custom", "--timeout", "15", "--no-thinking"],
                                        {"ZAI_API_KEY": "synthetic-alias"})[0], 0)
            call.assert_called_once_with("code", "synthetic-alias", "custom", 15, False)

    def test_source_errors_do_not_call_api(self):
        with tempfile.TemporaryDirectory() as directory, patch.object(cli, "review") as call:
            result = self.invoke([str(Path(directory) / "missing.py")])
            self.assertEqual(result[0], 1)
            self.assertIn("Cannot read", result[2])
            call.assert_not_called()
        with patch.object(cli.subprocess, "run", return_value=subprocess.CompletedProcess([], 128, "", "fatal")):
            result = self.invoke([])
            self.assertEqual(result[0], 1)
            self.assertIn("Cannot read Git changes", result[2])

    def test_invalid_arguments_do_not_call_api(self):
        for args in (["--staged", "file.py"], ["--timeout", "0"]):
            with self.subTest(args=args), patch.object(cli, "review") as call:
                with self.assertRaises(SystemExit) as raised:
                    self.invoke(args)
                self.assertEqual(raised.exception.code, 2)
                call.assert_not_called()

    def test_api_failures_are_nonzero_and_do_not_expose_response_or_key(self):
        secret = "synthetic-secret-for-error-test"
        errors = [HTTPError(cli.API_URL, 401, secret, {}, io.BytesIO(secret.encode())),
                  URLError(secret), TimeoutError(secret), json.JSONDecodeError(secret, secret, 0),
                  ValueError(secret), cli.http.client.HTTPException(secret)]
        for exc in errors:
            with self.subTest(error=type(exc).__name__), patch.object(cli, "gather_code", return_value="code"), patch.object(cli, "review", side_effect=exc):
                result = self.invoke([], {"Z_AI_API_KEY": secret})
                self.assertEqual(result[0], 1)
                self.assertEqual(result[1], "")
                self.assertTrue(result[2])
                self.assertNotIn(secret, result[2])

    def test_key_with_control_characters_is_rejected_without_disclosure(self):
        secret = "synthetic-key-with-newline\n"
        with patch.object(cli, "gather_code", return_value="code"), patch.object(cli, "review") as call:
            result = self.invoke([], {"Z_AI_API_KEY": secret})
            self.assertEqual(result[0], 1)
            self.assertIn("control characters", result[2])
            self.assertNotIn(secret.strip(), result[2])
            call.assert_not_called()

    def test_empty_invalid_and_truncated_responses_fail(self):
        responses = [[], {}, {"content": []}, {"content": ["invalid"]},
                     {"content": [{"type": "text", "text": "partial"}], "stop_reason": "max_tokens"}]
        for response in responses:
            with self.subTest(response=response), patch.object(cli.request, "build_opener") as opener:
                opener.return_value.open.return_value.__enter__.return_value = io.BytesIO(json.dumps(response).encode())
                with self.assertRaises(cli.ReviewError):
                    cli.review("code", "synthetic-key", "glm-5-turbo", 5, True)

    def test_redirect_is_not_followed(self):
        paths = []
        class Handler(BaseHTTPRequestHandler):
            def do_POST(self):
                paths.append(self.path)
                self.send_response(302)
                self.send_header("Location", "/unexpected-target")
                self.end_headers()

            def do_GET(self):
                paths.append(self.path)
                self.send_response(200)
                self.end_headers()

            def log_message(self, *args):
                pass

        server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            with patch.object(cli, "API_URL", f"http://127.0.0.1:{server.server_port}/review"):
                with self.assertRaises(HTTPError) as raised:
                    cli.review("code", "synthetic-key", "glm-5-turbo", 5, True)
            self.assertEqual(raised.exception.code, 302)
            self.assertEqual(paths, ["/review"])
        finally:
            server.shutdown()
            server.server_close()
            thread.join()


if __name__ == "__main__":
    unittest.main()
