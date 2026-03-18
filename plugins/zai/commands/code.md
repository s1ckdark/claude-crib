---
name: code
description: Delegate code generation or modification to Z.AI's GLM model
argument-hint: "<instruction>" [--model glm-5-turbo|glm-5]
user_invocable: true
allowed_tools:
  - Bash
  - Read
  - Write
  - Glob
---

<!--
Usage:
  /zai:code "Add a debounce function to utils.ts"
  /zai:code "Fix the failing test in auth.spec.ts"
  /zai:code "Refactor this module to use async/await" --model glm-5
-->

# Z.AI Code

Instruction: $ARGUMENTS

## Instructions

1. **Parse Arguments**
   - Extract instruction text (everything before flags)
   - Extract `--model` flag if present (default: glm-5-turbo)

2. **Record Pre-State**
   ```bash
   git status --short
   ```

3. **Gather Context**
   - Identify files mentioned in the instruction
   - Read relevant files to include as context

4. **Execute via MCP**
   Call `ask_zai` MCP tool with:
   - `prompt`: The instruction with full context
   - `agent_role`: "default"
   - `model`: from args or default
   - `thinking`: true
   - `context_files`: relevant source files

5. **Apply Changes**
   Parse Z.AI's response and apply the code changes to the files using Write/Edit tools.

6. **Report Changes**
   ```bash
   git diff --stat
   ```
   Show list of modified files and summary of changes.

## Error Handling

- API key missing: "Z_AI_API_KEY not set. Run `/zai:setup` to configure."
- No changes made: "Z.AI completed but made no file changes."
- Balance error: "Z.AI account balance insufficient. Recharge at https://open.bigmodel.cn"
