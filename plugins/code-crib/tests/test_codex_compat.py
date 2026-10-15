import json
import os
import re
from pathlib import Path
import subprocess
import tempfile
import unittest


PLUGIN = Path(__file__).resolve().parents[1]
LAUNCHER = PLUGIN / "hooks/scripts/chroma-mcp.sh"
CHROMA_VARS = ("CHROMA_CLIENT_TYPE", "CHROMA_SSL", "CHROMA_HOST", "CHROMA_PORT", "CHROMA_CUSTOM_AUTH_CREDENTIALS",
               "CHROMA_DATA_DIR", "CHROMA_TENANT", "CHROMA_DATABASE", "CHROMA_API_KEY")


class ChromaMcpLauncherTest(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name)
        # uvx 대신 실행되어 전달받은 인자와 CHROMA_* 환경을 JSON으로 출력한다.
        bin_dir = self.root / "bin"
        bin_dir.mkdir()
        fake = bin_dir / "uvx"
        fake.write_text("#!/usr/bin/env python3\nimport json, os, sys\n"
                        "print(json.dumps({'argv': sys.argv[1:], 'cwd': os.getcwd(), 'env': {k: v for k, v in "
                        "os.environ.items() if k.startswith('CHROMA_')}}))\n")
        fake.chmod(0o755)
        base = {k: v for k, v in os.environ.items() if not k.startswith("CHROMA_")}
        self.env = {**base, "PATH": str(bin_dir) + os.pathsep + base.get("PATH", "")}
        self.server = json.loads((PLUGIN / ".mcp.json").read_text())["mcpServers"]["chroma"]

    def launch(self, root_arg, cwd, **env):
        """Claude Code는 ${CLAUDE_PLUGIN_ROOT}를 치환하고, Codex는 문자열 그대로 두고 cwd를 플러그인 루트로 둔다."""
        args = [root_arg if arg == "${CLAUDE_PLUGIN_ROOT}" else arg for arg in self.server["args"]]
        proc = subprocess.run([self.server["command"], *args], cwd=cwd, env={**self.env, **env},
                              text=True, capture_output=True, timeout=10)
        self.assertEqual(proc.returncode, 0, proc.stderr)
        return json.loads(proc.stdout)

    def test_claude_code_expanded_root_from_project_cwd(self):
        result = self.launch(str(PLUGIN), self.root, CHROMA_HOST="racknerd", CHROMA_SSL="")
        self.assertEqual(result["argv"], ["--with", "pydantic<2.12", "chroma-mcp"])
        self.assertEqual(Path(result["cwd"]).resolve(), self.root.resolve())
        self.assertEqual(result["env"]["CHROMA_HOST"], "racknerd")
        self.assertEqual(result["env"]["CHROMA_SSL"], "false")

    def test_codex_literal_root_uses_plugin_cwd_and_defaults(self):
        result = self.launch("${CLAUDE_PLUGIN_ROOT}", PLUGIN)
        self.assertEqual(result["env"], {"CHROMA_CLIENT_TYPE": "http", "CHROMA_SSL": "false",
                                         "CHROMA_HOST": "localhost", "CHROMA_PORT": "8000",
                                         "CHROMA_CUSTOM_AUTH_CREDENTIALS": "", "CHROMA_DATA_DIR": "",
                                         "CHROMA_TENANT": "", "CHROMA_DATABASE": "", "CHROMA_API_KEY": ""})

    def test_codex_contract_has_no_unexpanded_values(self):
        # Codex는 플러그인 MCP의 ${VAR:-default}를 해석하지 않고 env_vars에 나열한 변수만 전달한다.
        self.assertNotIn("env", self.server)
        self.assertEqual(self.server["cwd"], ".")
        # 런처가 내보내는 변수(test_codex_literal_root_uses_plugin_cwd_and_defaults)와 같아야 한다.
        self.assertEqual(set(self.server["env_vars"]), set(CHROMA_VARS))

    def test_dry_run_masks_credentials(self):
        proc = subprocess.run(["bash", str(LAUNCHER), "--dry-run"], env={**self.env, "CHROMA_HOST": "racknerd",
                              "CHROMA_CUSTOM_AUTH_CREDENTIALS": "user:secret-value"},
                              text=True, capture_output=True, timeout=10)
        self.assertEqual(proc.returncode, 0, proc.stderr)
        self.assertIn("CHROMA_HOST=racknerd\n", proc.stdout)
        self.assertIn("CHROMA_CUSTOM_AUTH_CREDENTIALS=<set>\n", proc.stdout)
        self.assertIn("CHROMA_API_KEY=<unset>\n", proc.stdout)
        self.assertNotIn("secret-value", proc.stdout)


class PluginRootInstructionTest(unittest.TestCase):
    NOTE = "> **Plugin root:** `${CLAUDE_PLUGIN_ROOT}`. If it is empty or shown unexpanded (Codex)"

    @staticmethod
    def resolve(skill_file):
        """노트가 지시하는 규칙: 이 파일 디렉터리에서 가장 가까운, hooks/scripts/를 가진 상위 디렉터리."""
        return next(path for path in skill_file.parents if (path / "hooks/scripts").is_dir())

    def test_every_root_reference_carries_the_note(self):
        files = sorted([*PLUGIN.glob("skills/*/SKILL.md"), *PLUGIN.glob("commands/*.md"), *PLUGIN.glob("agents/*.md")])
        using = [path for path in files if "${CLAUDE_PLUGIN_ROOT}" in path.read_text()]
        self.assertTrue(using)
        for path in using:
            with self.subTest(path=path.relative_to(PLUGIN)):
                self.assertIn(self.NOTE, path.read_text())

    def test_rule_resolves_root_for_skills_and_codex_migrated_commands(self):
        # Codex는 commands/<name>.md 본문을 .codex-plugin/migrated-command-skills/source-command-<name>/SKILL.md로 옮긴다.
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp) / "code-crib" / "2.3.3"
            for rel in ("hooks/scripts", "skills/search", ".codex-plugin/migrated-command-skills/source-command-status"):
                (root / rel).mkdir(parents=True)
            for rel in ("skills/search/SKILL.md", ".codex-plugin/migrated-command-skills/source-command-status/SKILL.md"):
                with self.subTest(rel=rel):
                    self.assertEqual(self.resolve(root / rel), root)
        for path in [*PLUGIN.glob("skills/*/SKILL.md"), *PLUGIN.glob("commands/*.md")]:
            self.assertEqual(self.resolve(path), PLUGIN)
            for script in set(re.findall(r"\$\{CLAUDE_PLUGIN_ROOT\}/([\w./-]+)", path.read_text())):
                if "*" not in script and "<" not in script:
                    self.assertTrue((PLUGIN / script).exists() or script.endswith("code-crib.local.md"), (path, script))


class StopHookTest(unittest.TestCase):
    def test_reminder_stays_silent_for_codex_and_unchanged_for_claude(self):
        with tempfile.TemporaryDirectory() as temp:
            edit = json.dumps({"type": "assistant", "message": {"content": [{"type": "tool_use", "name": "Edit"}]}})
            outputs = {}
            for name in ("rollout-2026-10-15T14-30-37-01a13e0a.jsonl", "61101d7c-d13c.jsonl"):
                transcript = Path(temp) / name
                transcript.write_text((edit + "\n") * 3)
                proc = subprocess.run(["bash", str(PLUGIN / "hooks/scripts/check-significance.sh")],
                                      input=json.dumps({"transcript_path": str(transcript)}),
                                      text=True, capture_output=True, timeout=10)
                self.assertEqual(proc.returncode, 0, proc.stderr)
                outputs[name.startswith("rollout-")] = proc.stdout
        # Codex는 JSON이 아닌 Stop 출력을 훅 실패로 표시한다.
        self.assertEqual(outputs[True], "")
        self.assertIn("this session made 3 file edits", outputs[False])


if __name__ == "__main__":
    unittest.main()
