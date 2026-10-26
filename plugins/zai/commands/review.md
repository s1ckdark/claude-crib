---
name: review
description: Review code with the Z.AI CLI (no MCP or npm required)
argument-hint: "[file-path] [--staged]"
user_invocable: true
allowed_tools:
  - Bash
  - Read
  - Grep
---

<!--
Usage:
  /zai:review                  # Review unstaged changes (git diff)
  /zai:review --staged         # Review staged changes
  /zai:review src/auth.ts      # Review specific file
-->

# Z.AI Review

Target: $ARGUMENTS

## Instructions

1. **Parse Arguments**
   - No arguments: review unstaged changes
   - `--staged`: review staged changes
   - File path: review specific file

2. **Pre-flight Check**
   Use `python3` (Python 3.10+) and the bundled CLI at
   `${CLAUDE_PLUGIN_ROOT}/scripts/zai-review.py`.
   The CLI uses only the Python standard library; no npm/npx, MCP server, or
   Python virtualenv is needed for review. Authentication comes from
   `Z_AI_API_KEY` (or `ZAI_API_KEY`) in the environment. Never print the key.

3. **Execute the CLI**
   Run from the user's working directory. Choose exactly one invocation:

   ```bash
   # Unstaged changes
   python3 "${CLAUDE_PLUGIN_ROOT}/scripts/zai-review.py"

   # Staged changes
   python3 "${CLAUDE_PLUGIN_ROOT}/scripts/zai-review.py" --staged

   # A specific file; pass its actual path as one shell-quoted argument
   python3 "${CLAUDE_PLUGIN_ROOT}/scripts/zai-review.py" -- 'src/auth.ts'
   ```

   Parse `$ARGUMENTS` as a file path or `--staged`; do not execute it as shell
   text. Quote paths safely, including embedded single quotes. Do not insert
   code content into a shell command. The CLI reads the selected source,
   serializes the API request safely, and prints review feedback to stdout.
   It defaults to `glm-5-turbo` with thinking enabled and a 300-second timeout;
   allow at least that long for the Bash invocation.

4. **Display Feedback**
   Present Z.AI's review feedback. Do not modify any files.
   Do not route review through `ask_zai` or fall back to an MCP/npm launcher.

## Error Handling

- Empty diff: The CLI prints "No changes to review" and skips the API call
- File not found or Git unavailable: Show the CLI error and suggest checking the source
- Missing API key: Ask the user to set the environment variable without sharing its value
- API, timeout, or truncated-response error: Show the CLI error; do not report a successful review
