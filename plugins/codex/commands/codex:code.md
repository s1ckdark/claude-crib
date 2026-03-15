---
name: codex:code
description: Delegate code generation or modification to Codex with full-auto mode
argument-hint: "<instruction>" [--model o4-mini|o3]
allowed-tools: Bash, Read, Glob
---

<!--
Usage:
  /codex:code "Add a debounce function to utils.ts"
  /codex:code "Fix the failing test in auth.spec.ts"
  /codex:code "Refactor this module to use async/await" --model o3
-->

# Codex Code

Instruction: $ARGUMENTS

## Instructions

1. **Load Config**
   Read `~/.claude/codex.local.md` for settings. Defaults:
   - codex_path: `codex`
   - default_model: `o4-mini`
   - confirm_full_auto: `true`
   - timeout: `120000`

2. **Parse Arguments**
   - Extract instruction text (everything before flags)
   - Extract `--model` flag if present (overrides default_model)

3. **Pre-flight Check**
   ```bash
   which codex || echo "NOT_FOUND"
   ```

4. **Confirm Full-Auto Mode**
   If `confirm_full_auto: true` in config:
   > "Codex will run in **full-auto** mode and may directly create, modify, or delete files. Continue?"

5. **Record Pre-State**
   ```bash
   git status --short
   ```

6. **Execute**
   ```bash
   codex exec --full-auto -m {model} "{instruction}" 2>&1
   ```

7. **Report Changes**
   ```bash
   git diff --stat
   ```
   Show list of modified files and summary of changes.

8. **Handle Errors**
   - Exit 0: Show success + changes
   - Exit != 0: Show error message
   - Timeout: "Codex timed out. Try breaking the task into smaller pieces."

## Error Handling

- CLI missing: Direct to `/codex:setup`
- API key missing: Show export command
- No changes made: "Codex completed but made no file changes."
