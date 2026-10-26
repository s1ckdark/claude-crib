# Z.AI Plugin

Use `/zai:review` to review code through a standalone CLI. Review requires
Python 3.10+ and `Z_AI_API_KEY` (or `ZAI_API_KEY`) in your environment.
It does not require npm/npx, MCP, or a Python virtualenv.

```bash
# From the repository to review, with this plugin's root in CLAUDE_PLUGIN_ROOT:
python3 "${CLAUDE_PLUGIN_ROOT}/scripts/zai-review.py"                 # unstaged changes
python3 "${CLAUDE_PLUGIN_ROOT}/scripts/zai-review.py" --staged        # staged changes
python3 "${CLAUDE_PLUGIN_ROOT}/scripts/zai-review.py" -- 'src/auth.ts' # one file
```

The CLI sends the selected code to Z.AI and prints feedback without modifying
project files. Empty diffs skip the API call. API failures, invalid responses,
and truncated reviews return a nonzero exit code.

Defaults: `glm-5-turbo`, thinking enabled, and a 300-second request timeout.
Use `--model`, `--no-thinking`, and `--timeout` to override these settings;
`--help` lists all options. API keys are read from the environment only.

Other commands such as `/zai:ask` still use the plugin's MCP server and its
virtualenv. Run `/zai:setup` to configure those commands.

Run the review CLI checks with:

```bash
python3 -m unittest discover -s plugins/zai/tests -v
```
