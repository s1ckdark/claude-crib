# Codex Plugin

OpenAI Codex CLI integration for Claude Code. Ask questions, generate code, review, and run parallel workers.

## Setup

```bash
# Install Codex CLI
npm install -g @openai/codex

# Set API key
export OPENAI_API_KEY="sk-..."

# Run setup wizard
/codex:setup
```

## Commands

| Command | Description | Mode |
|---------|-------------|------|
| `/codex:ask "question"` | Ask Codex a question | suggest only |
| `/codex:code "instruction"` | Generate or modify code | full-auto |
| `/codex:review [file]` | Code review | suggest only |
| `/codex:worker "task"` | Long-running tmux worker | interactive |
| `/codex:setup` | Installation check & config | setup |

## Configuration

Config file: `~/.claude/codex.local.md`

| Setting | Default | Description |
|---------|---------|-------------|
| `codex_path` | `codex` | CLI executable path |
| `default_model` | `o4-mini` | Default model |
| `confirm_full_auto` | `true` | Confirm before full-auto execution |
| `worker_session_prefix` | `codex-worker` | tmux session name prefix |
| `timeout` | `120000` | Request timeout in ms |

## Requirements

- [Codex CLI](https://github.com/openai/codex) (`npm install -g @openai/codex`)
- `OPENAI_API_KEY` environment variable
- tmux (optional, for `/codex:worker`)
