---
name: codex:setup
description: Check Codex CLI installation, verify API key, and create configuration
argument-hint: [--check]
allowed-tools: Bash, Read, Write, AskUserQuestion
---

<!--
Usage:
  /codex:setup          # Run full setup wizard
  /codex:setup --check  # Only check installation status
-->

# Codex Setup Wizard

## Instructions

### 1. Check Codex CLI

```bash
which codex && codex --version 2>/dev/null || echo "NOT_FOUND: codex"
```

- **Installed**: Show version, continue
- **Not installed**: Show installation command and stop

```
Codex CLI is not installed. Install it with:
  npm install -g @openai/codex

Then set your API key:
  export OPENAI_API_KEY="sk-..."
```

### 2. Check API Key

```bash
[ -n "$OPENAI_API_KEY" ] && echo "✓ OPENAI_API_KEY set (${OPENAI_API_KEY:0:8}...)" || echo "✗ OPENAI_API_KEY not set"
```

- **Set**: Show first 8 chars, continue
- **Not set**: Show setup instructions and stop

### 3. Check tmux (optional, for worker mode)

```bash
which tmux && tmux -V 2>/dev/null || echo "NOT_FOUND: tmux"
```

- **Installed**: Worker mode available
- **Not installed**: Worker mode disabled, show: `brew install tmux`

### 4. Connectivity Test

```bash
codex exec "Say hello" 2>&1
```

- **Success**: "Codex CLI connection verified"
- **Failure**: Show stderr content

If `--check` flag was provided, stop here and display status report.

### 5. Create Config File

Check if `~/.claude/codex.local.md` exists:
- **Exists**: Read and display current config
- **Not exists**: Create with defaults:

```markdown
---
codex_path: codex
default_model: o4-mini
confirm_full_auto: true
worker_session_prefix: codex-worker
timeout: 120000
---

# Codex Plugin Configuration

## Models
| Model | Description |
|-------|-------------|
| o4-mini | Fast, cost-effective (default) |
| o3 | More capable, slower |

## Notes
- OPENAI_API_KEY must be set in environment
- Codex CLI: npm install -g @openai/codex
- tmux required for /codex:worker
```

### 6. Display Summary

```
=== Codex Setup Complete ===

Status:
  ✓ Codex CLI    - vX.X.X
  ✓ API Key      - sk-xxxxx...
  ✓ tmux         - available (worker mode enabled)
  ✓ Connection   - verified

Config: ~/.claude/codex.local.md

Available commands:
  /codex:ask "question"     - Ask Codex a question
  /codex:code "instruction" - Generate/modify code (full-auto)
  /codex:review [file]      - Code review
  /codex:worker "task"      - Launch tmux worker
```

## Error Handling

- Missing CLI: Provide npm install command
- Missing API key: Provide export command
- Connection failure: Show error, suggest checking API key
- tmux missing: Warn but don't block (only affects /codex:worker)
