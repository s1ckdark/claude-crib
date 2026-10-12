---
name: agy:code
description: Delegate code generation or modification to Antigravity `agy` CLI
argument-hint: "<instruction>"
allowed-tools: Bash, Read, Glob
---

<!--
Usage:
  /agy:code "Add a debounce function to utils.ts"
  /agy:code "Fix the failing test in auth.spec.ts"
  /agy:code "Refactor this module to use async/await"
-->

# Antigravity Code

Instruction: $ARGUMENTS

## Instructions

1. **Load Config**
   Read `~/.claude/agy.local.md` (없으면 기존 `~/.claude/gemini.local.md` 값 사용) for settings. Defaults:
   - agy_path: `agy`
   - confirm_full_auto: `true`
   - timeout: `120000`

2. **Pre-flight Check**
   ```bash
   which agy || echo "NOT_FOUND"
   ```

3. **Confirm Execution**
   If `confirm_full_auto: true` in config:
   > "Antigravity will generate code that may directly create or modify files. Continue?"

4. **Record Pre-State**
   ```bash
   git status --short
   ```

5. **Execute**
   ```bash
   agy -p "{instruction}" 2>&1
   ```

6. **Report Changes**
   ```bash
   git diff --stat
   ```
   Show list of modified files and summary of changes.

7. **Handle Errors**
   - Exit 0: Show success + changes
   - Exit != 0: Show error message
   - Timeout: "Antigravity timed out. Try breaking the task into smaller pieces."

## Error Handling

- CLI missing: Direct to `/agy:setup`
- Auth missing: Show authentication options
- No changes made: "Antigravity completed but made no file changes."
