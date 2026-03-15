# Gemini Plugin

Google Gemini CLI integration for Claude Code. Ask questions, generate code, review, and run parallel workers.

## Setup

```bash
# Install Gemini CLI
npm install -g @anthropic-ai/gemini-cli

# Authenticate (choose one)
gemini auth login                    # OAuth (recommended)
export GOOGLE_API_KEY="AIza..."      # API Key

# Run setup wizard
/gemini:setup
```

## Commands

| Command | Description | Mode |
|---------|-------------|------|
| `/gemini:ask "question"` | Ask Gemini a question | suggest only |
| `/gemini:code "instruction"` | Generate or modify code | code generation |
| `/gemini:review [file]` | Code review | suggest only |
| `/gemini:worker "task"` | Long-running tmux worker | interactive |
| `/gemini:setup` | Installation check & config | setup |

## Configuration

Config file: `~/.claude/gemini.local.md`

| Setting | Default | Description |
|---------|---------|-------------|
| `gemini_path` | `gemini` | CLI executable path |
| `confirm_full_auto` | `true` | Confirm before code execution |
| `worker_session_prefix` | `gemini-worker` | tmux session name prefix |
| `timeout` | `120000` | Request timeout in ms |

## Requirements

- [Gemini CLI](https://github.com/anthropics/gemini-cli) (`npm install -g @anthropic-ai/gemini-cli`)
- Google authentication (OAuth or API Key)
- tmux (optional, for `/gemini:worker`)
