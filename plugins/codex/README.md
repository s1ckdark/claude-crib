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

### 세션 작업일지 (선택)

code-crib의 [공통 로컬 작업일지](../code-crib/README.md#claudecodex-세션-작업일지-23)는 Codex의 실제 세션 ID·요약·파일·명령과 resume 참조를 저장합니다. `/code-crib:sessions --enable` 후 Codex 전용 훅 JSON을 생성하여 기존 `${CODEX_HOME:-~/.codex}/hooks.json`에 병합하고 신뢰 검토를 완료해야 합니다. tmux 작업자 이름은 resume ID가 아니며 worker 모니터링만으로 작업일지가 저장되지는 않습니다. 원본 대화의 원격 업로드는 하지 않습니다.

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
