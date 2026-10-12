---
name: Antigravity Flow
description: This skill should be used when the user asks to "use agy", "run agy", "ask agy", "agy review", "agy worker", "delegate to agy", or needs guidance on which agy command to use for their task. Provides workflow guidance for the agy plugin.
version: 0.1.0
---

# Antigravity Flow - Command Selection & Workflow Guide

## Overview

Antigravity Flow helps you choose the right Antigravity command for your task and provides common workflow patterns.

## Command Selection

| Need | Command | Mode |
|------|---------|------|
| Ask a question, get an explanation | `/agy:ask "question"` | suggest only |
| Generate or modify code | `/agy:code "instruction"` | code generation |
| Review code for issues | `/agy:review [file]` | suggest only |
| Long-running complex task | `/agy:worker "task"` | tmux interactive |
| First-time setup | `/agy:setup` | config |

## Common Workflows

### Bug Fix Workflow
1. `/agy:ask "What could cause {error message}?"` — understand the issue
2. `/agy:code "Fix the bug in {file}: {description}"` — apply the fix
3. `/agy:review` — verify the fix looks correct

### Code Review Workflow
1. `/agy:review` — review unstaged changes
2. `/agy:review --staged` — review staged changes before commit
3. `/agy:review src/critical-module.ts` — review specific files

### Refactoring Workflow
1. `/agy:review src/module.ts` — identify improvement areas
2. `/agy:code "Refactor {module} to {improvement}"` — apply refactoring
3. `/agy:review` — verify refactoring quality

### Heavy Lifting Workflow
1. `/agy:worker "Run all tests and fix failures"` — long-running autonomous task
2. `/agy:worker --status` — check progress
3. `/agy:worker --stop` — stop if needed

## Tips

### Effective Prompts
- Be specific: "Add input validation to the signup form in `src/auth/signup.ts`" > "Add validation"
- Provide context: "The function uses Express middleware" helps Antigravity understand the codebase
- One task at a time: Break complex work into steps for `/agy:code`, use `/agy:worker` for multi-step tasks

### Authentication
- Google OAuth: run `agy` once and sign in in the browser — `agy -p` prompts for sign-in when needed
- Headless/CI: Application Default Credentials (`AGY_ADC_AUTH`)

### Safety
- `/agy:ask` and `/agy:review` never modify files
- `/agy:code` may generate code that modifies files — review changes with `git diff` after
- Set `confirm_full_auto: true` in config to require confirmation before code execution
