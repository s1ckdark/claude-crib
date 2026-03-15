---
name: gemini:setup
description: Check Gemini CLI installation, verify authentication, and create configuration
argument-hint: [--check]
allowed-tools: Bash, Read, Write, AskUserQuestion
---

<!--
Usage:
  /gemini:setup          # Run full setup wizard
  /gemini:setup --check  # Only check installation status
-->

# Gemini Setup Wizard

## Instructions

### 1. Check Gemini CLI

```bash
which gemini && gemini --version 2>/dev/null || echo "NOT_FOUND: gemini"
```

- **Installed**: Show version, continue
- **Not installed**: Show installation command and stop

```
Gemini CLI is not installed. Install it with:
  npm install -g @anthropic-ai/gemini-cli

Then authenticate:
  gemini auth login
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
gemini -p "Say hello" 2>&1
```

- **Success**: "Gemini CLI connection verified"
- **Failure**: Show stderr content

If `--check` flag was provided, stop here and display status report.

### 5. Create Config File

Check if `~/.claude/gemini.local.md` exists:
- **Exists**: Read and display current config
- **Not exists**: Create with defaults:

```markdown
---
gemini_path: gemini
confirm_full_auto: true
worker_session_prefix: gemini-worker
timeout: 120000
---

# Gemini Plugin Configuration

## Authentication
- OAuth (recommended): `gemini auth login`
- API Key: `export GOOGLE_API_KEY="AIza..."`

## Notes
- Gemini CLI: npm install -g @anthropic-ai/gemini-cli
- tmux required for /gemini:worker
```

### 6. Display Summary

```
=== Gemini Setup Complete ===

Status:
  ✓ Gemini CLI   - vX.X.X
  ✓ Auth         - OAuth / API Key
  ✓ tmux         - available (worker mode enabled)
  ✓ Connection   - verified

Config: ~/.claude/gemini.local.md

Available commands:
  /gemini:ask "question"     - Ask Gemini a question
  /gemini:code "instruction" - Generate/modify code (full-auto)
  /gemini:review [file]      - Code review
  /gemini:worker "task"      - Launch tmux worker
```

## Error Handling

- Missing CLI: Provide npm install command
- Missing auth: Provide `gemini auth login` and API key options
- Connection failure: Show error, suggest checking authentication
- tmux missing: Warn but don't block (only affects /gemini:worker)
