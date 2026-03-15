---
name: Codex Flow
description: This skill should be used when the user asks to "use codex", "run codex", "ask codex", "codex review", "codex worker", "delegate to codex", or needs guidance on which codex command to use for their task. Provides workflow guidance for the codex plugin.
version: 0.1.0
---

# Codex Flow - Command Selection & Workflow Guide

## Overview

Codex Flow helps you choose the right Codex command for your task and provides common workflow patterns.

## Command Selection

Use this decision tree to pick the right command:

| Need | Command | Mode |
|------|---------|------|
| Ask a question, get an explanation | `/codex:ask "question"` | suggest only |
| Generate or modify code | `/codex:code "instruction"` | full-auto |
| Review code for issues | `/codex:review [file]` | suggest only |
| Long-running complex task | `/codex:worker "task"` | tmux interactive |
| First-time setup | `/codex:setup` | config |

## Common Workflows

### Bug Fix Workflow
1. `/codex:ask "What could cause {error message}?"` — understand the issue
2. `/codex:code "Fix the bug in {file}: {description}"` — apply the fix
3. `/codex:review` — verify the fix looks correct

### Code Review Workflow
1. `/codex:review` — review unstaged changes
2. `/codex:review --staged` — review staged changes before commit
3. `/codex:review src/critical-module.ts` — review specific files

### Refactoring Workflow
1. `/codex:review src/module.ts` — identify improvement areas
2. `/codex:code "Refactor {module} to {improvement}"` — apply refactoring
3. `/codex:review` — verify refactoring quality

### Heavy Lifting Workflow
1. `/codex:worker "Run all tests and fix failures"` — long-running autonomous task
2. `/codex:worker --status` — check progress
3. `/codex:worker --stop` — stop if needed

## Tips

### Effective Prompts
- Be specific: "Add input validation to the signup form in `src/auth/signup.ts`" > "Add validation"
- Provide context: "The function uses Express middleware" helps Codex understand the codebase
- One task at a time: Break complex work into steps for `/codex:code`, use `/codex:worker` for multi-step tasks

### Model Selection
- `o4-mini` (default): Fast, good for most tasks
- `o3`: Better reasoning, use for complex logic or architecture decisions
- Override per-command: `/codex:code "task" --model o3`

### Safety
- `/codex:ask` and `/codex:review` never modify files
- `/codex:code` runs in full-auto mode — review changes with `git diff` after
- Set `confirm_full_auto: true` in config to require confirmation before full-auto execution
