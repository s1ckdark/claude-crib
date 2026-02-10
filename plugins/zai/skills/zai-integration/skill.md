---
name: zai-integration
description: This skill should be used when delegating tasks to Z.AI's GLM models, routing analysis/review/generation through the Z.AI MCP server
user_invocable: false
---

# Z.AI Integration Skill

## When to Activate

This skill activates when:
- User mentions "ask zai", "use zai", "delegate to zai"
- A task needs an external AI perspective and Z.AI is available
- Code review, architecture analysis, or planning needs a second opinion

## MCP-Direct Pattern

Call the Z.AI MCP tool directly instead of spawning separate agents:

| Task | agent_role | model |
|------|-----------|-------|
| Architecture analysis | `architect` | `glm-4.7` |
| Code review | `code-reviewer` | `glm-4.7` |
| Quick code check | `code-reviewer` | `glm-4-flash` |
| Requirements analysis | `analyst` | `glm-4.7` |
| Implementation planning | `planner` | `glm-4.7` |
| Plan critique | `critic` | `glm-4.7` |
| Documentation | `writer` | `glm-4-plus` |
| UI/UX guidance | `designer` | `glm-4-plus` |
| Security review | `security-reviewer` | `glm-4.7` |
| TDD guidance | `tdd-guide` | `glm-4-plus` |
| Simple questions | `default` | `glm-4-flash` |

## Usage Protocol

### 1. Prepare Context
Identify relevant files for the task. Always include source files being analyzed.

### 2. Write Prompt File
Write a structured prompt to `.omc/prompts/zai-{purpose}-{timestamp}.md`:

```markdown
# Task: {description}

## Context
{what the code does, project background}

## Request
{specific deliverable expected}

## Constraints
{any limitations, preferences, standards to follow}
```

### 3. Call ask_zai

```
ask_zai(
  prompt_file=".omc/prompts/zai-review-1234.md",
  output_file=".omc/outputs/zai-review-1234.md",
  agent_role="code-reviewer",
  context_files=["src/auth.ts", "src/middleware.ts"],
  model="glm-4.7",
  thinking=true
)
```

### 4. Process Results
Read the output file and integrate findings into your workflow.

## Background Pattern

For long-running analysis:
```
ask_zai(prompt_file="...", background=true)
→ returns job_id
check_zai_status(job_id="zai-1-...")
→ returns status
```

## Integration with oh-my-claudecode

Z.AI slots into the existing MCP delegation table:

| Keyword | Maps To |
|---------|---------|
| `ask zai`, `use zai`, `delegate to zai` | `ask_zai` MCP tool |

This follows the same pattern as `ask codex` → Codex and `ask gemini` → Gemini.
