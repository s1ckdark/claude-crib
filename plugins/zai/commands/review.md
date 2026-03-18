---
name: review
description: Send code to Z.AI for review (bugs, performance, security, readability)
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

2. **Gather Code**
   Parse arguments to determine source:
   - No arguments: `git diff`
   - `--staged`: `git diff --staged`
   - File path: Read file content with Read tool

3. **Validate Content**
   If the gathered code is empty:
   > "No changes to review. Make some changes, stage them, or specify a file path."

4. **Execute via MCP**
   Call `ask_zai` MCP tool with:
   - `prompt`: Review prompt including the code content:
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
   - `agent_role`: "code-reviewer"
   - `model`: glm-5-turbo
   - `thinking`: true

5. **Display Feedback**
   Present Z.AI's review feedback. Do not modify any files.

## Error Handling

- Empty diff: Suggest staging changes or specifying a file
- File not found: Show error, suggest checking the path
- Large content (>10000 chars): Warn about token limits
