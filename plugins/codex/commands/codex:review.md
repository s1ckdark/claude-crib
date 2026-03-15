---
name: codex:review
description: Send code to Codex for review (bugs, performance, security, readability)
argument-hint: [file-path] [--staged]
allowed-tools: Bash, Read, Grep
---

<!--
Usage:
  /codex:review                  # Review unstaged changes (git diff)
  /codex:review --staged         # Review staged changes
  /codex:review src/auth.ts      # Review specific file
-->

# Codex Review

Target: $ARGUMENTS

## Instructions

1. **Load Config**
   Read `~/.claude/codex.local.md`. Defaults:
   - codex_path: `codex`
   - default_model: `o4-mini`
   - timeout: `120000`

2. **Pre-flight Check**
   ```bash
   which codex || echo "NOT_FOUND"
   ```

3. **Gather Code**
   Parse arguments to determine source:
   - No arguments: `git diff`
   - `--staged`: `git diff --staged`
   - File path: Read file content with Read tool

4. **Validate Content**
   If the gathered code is empty:
   > "No changes to review. Make some changes, stage them, or specify a file path."

5. **Build Review Prompt**
   ```
   Review the following code for:
   1. Bugs and logic errors
   2. Performance issues
   3. Security vulnerabilities
   4. Readability and maintainability

   Provide specific, actionable feedback with line references where possible.

   Code:
   {code_content}
   ```

6. **Execute**
   ```bash
   codex exec -m {default_model} "{review_prompt}" 2>&1
   ```

7. **Display Feedback**
   Present Codex's review feedback. Do not modify any files.

## Error Handling

- CLI missing: Direct to `/codex:setup`
- Empty diff: Suggest staging changes or specifying a file
- File not found: Show error, suggest checking the path
- Large content (>10000 chars): Warn about token limits
