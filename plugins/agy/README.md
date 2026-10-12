# Antigravity (agy) Plugin

Google Antigravity `agy` CLI integration for Claude Code (the renamed Gemini CLI). Ask questions, generate code, review, and run parallel workers.

## Setup

```bash
# Install Antigravity (ships the `agy` CLI)
# https://antigravity.google
# After install, verify: agy --version

# Sign in with your Google account (run once, browser OAuth)
agy

# Run setup wizard
/agy:setup
```

## Commands

| Command | Description | Mode |
|---------|-------------|------|
| `/agy:ask "question"` | Ask Antigravity a question | suggest only |
| `/agy:code "instruction"` | Generate or modify code | code generation |
| `/agy:review [file]` | Code review | suggest only |
| `/agy:worker "task"` | Long-running tmux worker | interactive |
| `/agy:setup` | Installation check & config | setup |

## Configuration

Config file: `~/.claude/agy.local.md` (기존 `~/.claude/gemini.local.md`는 /agy:setup 시 이관)

| Setting | Default | Description |
|---------|---------|-------------|
| `agy_path` | `agy` | CLI executable path |
| `confirm_full_auto` | `true` | Confirm before code execution |
| `worker_session_prefix` | `agy-worker` | tmux session name prefix |
| `timeout` | `120000` | Request timeout in ms |

## Requirements

- [Google Antigravity](https://antigravity.google) - the `agy` CLI ships with it (the renamed Gemini CLI)
- Google authentication (OAuth or API Key)
- tmux (optional, for `/agy:worker`)
