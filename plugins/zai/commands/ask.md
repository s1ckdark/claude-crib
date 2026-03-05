---
name: ask
description: Ask Z.AI a question directly - delegates to GLM model with optional role and context
user_invocable: true
allowed_tools:
  - Bash
  - Read
  - Write
  - Glob
---

# /zai:ask - Ask Z.AI

Ask Z.AI's GLM model a question with optional role context.

## Usage

```
/zai:ask <question>
/zai:ask --role architect "How should I structure this service?"
/zai:ask --files src/auth.ts,src/middleware.ts "Review this auth flow"
```

## Behavior

1. Parse the user's question and any flags
2. If `--files` specified, include those as context_files
3. If `--role` specified, use that agent_role (default: "default")
4. Call `ask_zai` MCP tool with the parameters
5. Display the response to the user

## Arguments

The arguments string follows the format: `[--role <role>] [--files <file1,file2,...>] [--model <model>] <question>`

Parse the arguments:
- `--role`: One of architect, code-reviewer, analyst, planner, critic, writer, designer, security-reviewer, tdd-guide
- `--files`: Comma-separated list of file paths to include as context
- `--model`: Model to use (default: glm-4.7)
- Everything else is the question/prompt

## Example Flow

User: `/zai:ask --role code-reviewer --files src/api.ts "Review this API for issues"`

1. Set agent_role = "code-reviewer"
2. Set context_files = ["src/api.ts"]
3. Call ask_zai with prompt "Review this API for issues"
4. Display Z.AI's review response
