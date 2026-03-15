---
name: gemini:review
description: Send code to Gemini for review (bugs, performance, security, readability)
argument-hint: [file-path] [--staged]
allowed-tools: Bash, Read, Grep
---

<!--
Usage:
  /gemini:review                  # Review unstaged changes (git diff)
  /gemini:review --staged         # Review staged changes
  /gemini:review src/auth.ts      # Review specific file
-->

# Gemini Review

Target: $ARGUMENTS

## Instructions

1. **Load Config**
   Read `~/.claude/gemini.local.md`. Defaults:
   - gemini_path: `gemini`
   - timeout: `120000`

2. **Pre-flight Check**
   ```bash
   which gemini || echo "NOT_FOUND"
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
   gemini -p "{review_prompt}" 2>&1
   ```

7. **Display Feedback**
   Present Gemini's review feedback. Do not modify any files.

## Error Handling

- CLI missing: Direct to `/gemini:setup`
- Empty diff: Suggest staging changes or specifying a file
- File not found: Show error, suggest checking the path
- Large content (>10000 chars): Warn about token limits
