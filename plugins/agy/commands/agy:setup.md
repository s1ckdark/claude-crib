---
name: agy:setup
description: Check Antigravity `agy` CLI installation, verify authentication, and create configuration
argument-hint: [--check]
allowed-tools: Bash, Read, Write, AskUserQuestion
---

<!--
Usage:
  /agy:setup          # Run full setup wizard
  /agy:setup --check  # Only check installation status
-->

# Antigravity Setup Wizard

## Instructions

### 1. Check Antigravity `agy` CLI

```bash
which agy && agy --version 2>/dev/null || echo "NOT_FOUND: agy"
```

- **Installed**: Show version, continue
- **Not installed**: Show installation command and stop

```
Antigravity `agy` CLI is not installed.
  Install Google Antigravity from https://antigravity.google - the `agy` CLI ships with it.

Then authenticate:
  agy auth login
  # Or set API key: export GOOGLE_API_KEY="AIza..."
```

### 2. Check Authentication

```bash
[ -n "$GOOGLE_API_KEY" ] && echo "✓ GOOGLE_API_KEY set (${GOOGLE_API_KEY:0:8}...)" || echo "✗ GOOGLE_API_KEY not set (OAuth may be configured)"
```

### 3. Check tmux (optional, for worker mode)

```bash
which tmux && tmux -V 2>/dev/null || echo "NOT_FOUND: tmux"
```

- **Installed**: Worker mode available
- **Not installed**: Worker mode disabled, show: `brew install tmux`

### 4. Connectivity Test

```bash
agy -p "Say hello" 2>&1
```

- **Success**: "Antigravity `agy` CLI connection verified"
- **Failure**: Show stderr content

If `--check` flag was provided, stop here and display status report.

### 5. Create Config File

Check if `~/.claude/agy.local.md` exists:
- **Exists**: Read and display current config
- **Not exists but `~/.claude/gemini.local.md` exists**: migrate its values to `agy.local.md` (`gemini_path` becomes `agy_path`) and tell the user
- **Not exists**: Create with defaults:

```markdown
---
agy_path: agy
confirm_full_auto: true
worker_session_prefix: agy-worker
timeout: 120000
---

# Antigravity Plugin Configuration

## Authentication
- OAuth (recommended): `agy auth login`
- API Key: `export GOOGLE_API_KEY="AIza..."`

## Notes
- `agy` CLI: ships with Google Antigravity (https://antigravity.google), the renamed Gemini CLI
- tmux required for /agy:worker
```

### 6. Display Summary

```
=== Antigravity Setup Complete ===

Status:
  ✓ Antigravity `agy` CLI   - vX.X.X
  ✓ Auth         - OAuth / API Key
  ✓ tmux         - available (worker mode enabled)
  ✓ Connection   - verified

Config: ~/.claude/agy.local.md

Available commands:
  /agy:ask "question"     - Ask Antigravity a question
  /agy:code "instruction" - Generate/modify code (full-auto)
  /agy:review [file]      - Code review
  /agy:worker "task"      - Launch tmux worker
```

## Error Handling

- Missing CLI: Provide Antigravity install link (https://antigravity.google)
- Missing auth: Provide `agy auth login` and API key options
- Connection failure: Show error, suggest checking authentication
- tmux missing: Warn but don't block (only affects /agy:worker)
