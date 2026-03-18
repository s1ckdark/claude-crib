---
name: Z.AI Flow
description: This skill should be used when the user asks to "use zai", "run zai", "ask zai", "zai review", "zai worker", "delegate to zai", or needs guidance on which zai command to use for their task. Provides workflow guidance for the zai plugin.
user_invocable: false
---

# Z.AI Flow - Command Selection & Workflow Guide

## Overview

Z.AI Flow helps you choose the right Z.AI command for your task and provides common workflow patterns.

## Command Selection

Use this decision tree to pick the right command:

| Need | Command | Mode |
|------|---------|------|
| Ask a question, get an explanation | `/zai:ask "question"` | read-only |
| Generate or modify code | `/zai:code "instruction"` | writes files |
| Review code for issues | `/zai:review [file]` | read-only |
| Long-running complex task | `/zai:worker "task"` | tmux session |
| First-time setup | `/zai:setup` | config |
| View current config | `/zai:config` | status |

## Common Workflows

### Bug Fix Workflow
1. `/zai:ask "What could cause {error message}?"` — understand the issue
2. `/zai:code "Fix the bug in {file}: {description}"` — apply the fix
3. `/zai:review` — verify the fix looks correct

### Code Review Workflow
1. `/zai:review` — review unstaged changes
2. `/zai:review --staged` — review staged changes before commit
3. `/zai:review src/critical-module.ts` — review specific files

### Refactoring Workflow
1. `/zai:review src/module.ts` — identify improvement areas
2. `/zai:code "Refactor {module} to {improvement}"` — apply refactoring
3. `/zai:review` — verify refactoring quality

### Heavy Lifting Workflow
1. `/zai:worker "Analyze all API endpoints for security issues"` — long-running task
2. `/zai:worker --status` — check progress
3. `/zai:worker --stop` — stop if needed

## MCP-Direct Pattern

For agent-level integration, call `ask_zai` MCP tool directly:

| Task | agent_role | model |
|------|-----------|-------|
| Architecture analysis | `architect` | `glm-5-turbo` |
| Code review | `code-reviewer` | `glm-5-turbo` |
| Quick code check | `code-reviewer` | `glm-4.7-flash` |
| Requirements analysis | `analyst` | `glm-5-turbo` |
| Implementation planning | `planner` | `glm-5-turbo` |
| Plan critique | `critic` | `glm-5` |
| Documentation | `writer` | `glm-5-turbo` |
| Security review | `security-reviewer` | `glm-5` |
| Simple questions | `default` | `glm-4.7-flash` |

## Tips

### Model Selection
- `glm-5-turbo` (default): Fast flagship with reasoning — best for most tasks
- `glm-5`: Most capable — use for complex architecture and deep analysis
- `glm-5-code`: Code-specialized — best for pure code generation
- `glm-4.7-flash`: Fastest — for quick questions and simple tasks
- Override per-command: `/zai:code "task" --model glm-5`

### Safety
- `/zai:ask` and `/zai:review` never modify files
- `/zai:code` writes files directly — review changes with `git diff` after
- `/zai:worker` runs in an isolated tmux session
