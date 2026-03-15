---
name: gemini:code
description: Delegate code generation or modification to Gemini CLI
argument-hint: "<instruction>"
allowed-tools: Bash, Read, Glob
---

<!--
Usage:
  /gemini:code "Add a debounce function to utils.ts"
  /gemini:code "Fix the failing test in auth.spec.ts"
  /gemini:code "Refactor this module to use async/await"
-->

# Gemini Code

Instruction: $ARGUMENTS

## Instructions

1. **Load Config**
   Read `~/.claude/gemini.local.md` for settings. Defaults:
   - gemini_path: `gemini`
   - confirm_full_auto: `true`
   - timeout: `120000`

2. **Pre-flight Check**
   ```bash
   which gemini || echo "NOT_FOUND"
   ```

3. **Confirm Execution**
   If `confirm_full_auto: true` in config:
   > "Gemini will generate code that may directly create or modify files. Continue?"

4. **Record Pre-State**
   ```bash
   git status --short
   ```

5. **Execute**
   ```bash
   gemini -p "{instruction}" 2>&1
   ```

6. **Report Changes**
   ```bash
   git diff --stat
   ```
   Show list of modified files and summary of changes.

7. **Handle Errors**
   - Exit 0: Show success + changes
   - Exit != 0: Show error message
   - Timeout: "Gemini timed out. Try breaking the task into smaller pieces."

## Error Handling

- CLI missing: Direct to `/gemini:setup`
- Auth missing: Show authentication options
- No changes made: "Gemini completed but made no file changes."
