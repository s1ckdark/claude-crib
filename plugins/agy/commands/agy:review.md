---
name: agy:review
description: Send code to Antigravity for review (bugs, performance, security, readability)
argument-hint: [file-path] [--staged]
allowed-tools: Bash, Read, Grep
---

<!--
Usage:
  /agy:review                  # Review unstaged changes (git diff)
  /agy:review --staged         # Review staged changes
  /agy:review src/auth.ts      # Review specific file
-->

# Antigravity Review

Target: $ARGUMENTS

## Instructions

1. **Load Config**
   Read `~/.claude/agy.local.md` (없으면 기존 `~/.claude/gemini.local.md` 값 사용). Defaults:
   - agy_path: `agy`
   - timeout: `120000`

2. **Pre-flight Check**
   ```bash
   which agy || echo "NOT_FOUND"
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
   agy -p "{review_prompt}" 2>&1
   ```

7. **Display Feedback**
   Present Antigravity's review feedback. Do not modify any files.

## Error Handling

- CLI missing: Direct to `/agy:setup`
- Empty diff: Suggest staging changes or specifying a file
- File not found: Show error, suggest checking the path
- Large content (>10000 chars): Warn about token limits
