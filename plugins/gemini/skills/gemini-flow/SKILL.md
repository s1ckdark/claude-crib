---
name: Gemini Flow
description: This skill should be used when the user asks to "use gemini", "run gemini", "ask gemini", "gemini review", "gemini worker", "delegate to gemini", or needs guidance on which gemini command to use for their task. Provides workflow guidance for the gemini plugin.
version: 0.1.0
---

# Gemini Flow - Command Selection & Workflow Guide

## Overview

Gemini Flow helps you choose the right Gemini command for your task and provides common workflow patterns.

## Command Selection

| Need | Command | Mode |
|------|---------|------|
| Ask a question, get an explanation | `/gemini:ask "question"` | suggest only |
| Generate or modify code | `/gemini:code "instruction"` | code generation |
| Review code for issues | `/gemini:review [file]` | suggest only |
| Long-running complex task | `/gemini:worker "task"` | tmux interactive |
| First-time setup | `/gemini:setup` | config |

## Common Workflows

### Bug Fix Workflow
1. `/gemini:ask "What could cause {error message}?"` — understand the issue
2. `/gemini:code "Fix the bug in {file}: {description}"` — apply the fix
3. `/gemini:review` — verify the fix looks correct

### Code Review Workflow
1. `/gemini:review` — review unstaged changes
2. `/gemini:review --staged` — review staged changes before commit
3. `/gemini:review src/critical-module.ts` — review specific files

### Refactoring Workflow
1. `/gemini:review src/module.ts` — identify improvement areas
2. `/gemini:code "Refactor {module} to {improvement}"` — apply refactoring
3. `/gemini:review` — verify refactoring quality

### Heavy Lifting Workflow
1. `/gemini:worker "Run all tests and fix failures"` — long-running autonomous task
2. `/gemini:worker --status` — check progress
3. `/gemini:worker --stop` — stop if needed

## Tips

### Effective Prompts
- Be specific: "Add input validation to the signup form in `src/auth/signup.ts`" > "Add validation"
- Provide context: "The function uses Express middleware" helps Gemini understand the codebase
- One task at a time: Break complex work into steps for `/gemini:code`, use `/gemini:worker` for multi-step tasks

### Authentication
- OAuth (recommended): `gemini auth login` — higher rate limits
- API Key: `export GOOGLE_API_KEY="AIza..."` — simpler but lower limits

### Safety
- `/gemini:ask` and `/gemini:review` never modify files
- `/gemini:code` may generate code that modifies files — review changes with `git diff` after
- Set `confirm_full_auto: true` in config to require confirmation before code execution
