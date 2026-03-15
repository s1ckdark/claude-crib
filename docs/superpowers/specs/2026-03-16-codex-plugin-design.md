# Codex Plugin Design Spec

**Date**: 2026-03-16
**Status**: Approved
**Plugin Name**: `codex`

## Overview

Claude Code에서 OpenAI Codex CLI를 호출하는 전용 플러그인. 코드 생성, 리뷰, 질의응답, 병렬 워커 기능을 제공한다.

## Requirements

- Codex CLI (`npm install -g @openai/codex`)가 시스템에 설치되어 있어야 함
- `OPENAI_API_KEY` 환경변수 필요
- 설정은 `~/.claude/codex.local.md`에 저장

## Plugin Structure

```
plugins/codex/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── codex:ask.md        # /codex:ask — 질문/제안 (suggest only)
│   ├── codex:code.md       # /codex:code — 코드 생성/수정 (full-auto)
│   ├── codex:review.md     # /codex:review — 코드 리뷰 (suggest only)
│   ├── codex:worker.md     # /codex:worker — tmux 세션 워커
│   └── codex:setup.md      # /codex:setup — 설치 확인 & 설정
├── agents/
│   ├── codex-responder.md   # ask 전담
│   ├── codex-coder.md       # code 전담 (full-auto)
│   ├── codex-reviewer.md    # review 전담
│   └── codex-worker.md      # tmux 워커 관리
├── skills/
│   └── codex-flow/
│       └── SKILL.md         # Codex 커맨드 사용 가이드
├── hooks/
│   └── hooks.json           # 이벤트 훅 (초기에는 빈 구조)
└── README.md
```

## plugin.json

```json
{
  "name": "codex",
  "version": "0.1.0",
  "description": "Codex CLI integration for Claude Code - ask questions, generate code, review, and run parallel workers via OpenAI Codex.",
  "author": {
    "name": "Dave"
  },
  "keywords": ["codex", "openai", "code-generation", "code-review", "worker", "tmux"],
  "commands": "./commands",
  "skills": "./skills",
  "agents": "./agents",
  "hooks": "./hooks/hooks.json"
}
```

## Commands

### `/codex:ask "질문"`

```yaml
---
name: codex:ask
description: Ask Codex a question and get a text response (no file modifications)
argument-hint: "<question>"
allowed-tools: Bash, Read
---
```

- **용도**: Codex에게 질문하고 답변만 받기
- **실행**: `codex exec "질문"` (단발성)
- **권한**: suggest only — 파일 수정 없음
- **예시**: `/codex:ask "이 에러 메시지가 뭘 의미해?"`, `/codex:ask "Redis pub/sub vs Kafka 비교"`

### `/codex:code "지시"`

```yaml
---
name: codex:code
description: Delegate code generation or modification to Codex with full-auto mode
argument-hint: "<instruction>" [--model o4-mini|o3]
allowed-tools: Bash, Read, Glob
---
```

- **용도**: Codex에게 코드 작성/수정 위임
- **실행**: `codex exec --full-auto "지시"`
- **권한**: full-auto — 파일 직접 수정 가능
- **안전장치**: 실행 전 사용자에게 full-auto 모드 확인, 실행 후 변경된 파일 목록 표시
- **예시**: `/codex:code "utils.ts에 debounce 함수 추가"`

### `/codex:review`

```yaml
---
name: codex:review
description: Send code to Codex for review (bugs, performance, security, readability)
argument-hint: [file-path] [--staged]
allowed-tools: Bash, Read, Grep
---
```

- **용도**: 현재 변경사항 또는 지정 파일을 Codex로 리뷰
- **실행**: git diff 또는 파일 내용을 Codex에게 전달
- **권한**: suggest only
- **인자 동작**:
  - 인자 없음: `git diff` (unstaged changes) 전달
  - `--staged`: `git diff --staged` 전달
  - 파일 경로: 해당 파일 내용 전달
- **예시**: `/codex:review`, `/codex:review src/auth.ts`, `/codex:review --staged`

### `/codex:worker "작업"`

```yaml
---
name: codex:worker
description: Launch Codex as a long-running tmux worker for complex autonomous tasks
argument-hint: "<task-description>" [--stop]
allowed-tools: Bash, Read
---
```

- **용도**: tmux 세션에서 Codex를 장시간 워커로 띄움
- **tmux 프로토콜**:
  1. **세션 생성**: `tmux new-session -d -s codex-worker-{timestamp}`
  2. **Codex 실행**: `tmux send-keys -t {session} 'codex' Enter`
  3. **작업 전송**: `tmux send-keys -t {session} '작업 내용' Enter`
  4. **상태 확인**: `tmux capture-pane -t {session} -p` 로 출력 캡처
  5. **완료 감지**: 캡처된 출력에서 프롬프트 복귀 여부 확인
  6. **종료**: `tmux kill-session -t {session}`
- **`--stop` 플래그**: 실행 중인 워커 세션 종료
- **예시**: `/codex:worker "전체 테스트 수정"`, `/codex:worker --stop`

### `/codex:setup`

```yaml
---
name: codex:setup
description: Check Codex CLI installation, verify API key, and create configuration
allowed-tools: Bash, Read, Write, AskUserQuestion
---
```

- **용도**: Codex CLI 설치 확인, API 키 검증, 설정 파일 생성
- **흐름**:
  1. `which codex` — 미설치 시 `npm install -g @openai/codex` 안내
  2. `echo $OPENAI_API_KEY` — 미설정 시 안내
  3. `codex exec "Say hello"` — 실제 동작 확인
  4. `~/.claude/codex.local.md` 생성/업데이트

## Agents

### `codex-responder` (ask 전담)

```yaml
---
name: codex-responder
description: |
  Execute Codex CLI in suggest-only mode to answer questions.
  Returns text responses without modifying any files.

  <example>
  Context: User asks a coding question via /codex:ask
  user: "/codex:ask 'What does this error mean?'"
  assistant: "I'll use the codex-responder agent to get Codex's answer."
  </example>
model: inherit
color: green
tools: ["Bash", "Read"]
---
```

- **동작**: 사용자 질문을 받아 `codex exec "prompt"` 실행, 응답 파싱 후 반환
- **프롬프트 핵심**: "답변만 전달하라. 파일을 수정하지 마라."

### `codex-coder` (code 전담)

```yaml
---
name: codex-coder
description: |
  Execute Codex CLI in full-auto mode to generate or modify code.
  Reports all file changes after execution.

  <example>
  Context: User delegates code work via /codex:code
  user: "/codex:code 'Add a debounce function to utils.ts'"
  assistant: "I'll use the codex-coder agent to run Codex in full-auto mode."
  </example>
model: inherit
color: orange
tools: ["Bash", "Read", "Glob"]
---
```

- **동작**: 지시를 받아 `codex exec --full-auto "prompt"` 실행
- **프롬프트 핵심**: "full-auto 모드로 실행. 실행 전 대상 파일/디렉토리 확인. 완료 후 변경 파일 목록과 git diff --stat 출력."
- **안전장치**: 실행 전 작업 디렉토리 확인, 실행 후 변경사항 리포트

### `codex-reviewer` (review 전담)

```yaml
---
name: codex-reviewer
description: |
  Send code diffs or file contents to Codex for review.
  Provides feedback on bugs, performance, security, and readability.

  <example>
  Context: User requests code review via /codex:review
  user: "/codex:review src/auth.ts"
  assistant: "I'll use the codex-reviewer agent to get Codex's review."
  </example>
model: inherit
color: cyan
tools: ["Bash", "Read", "Grep"]
---
```

- **동작**: `git diff` 또는 지정 파일 내용을 Codex에게 전달하여 리뷰 요청
- **프롬프트 핵심**: "코드 리뷰 피드백만 제공. 버그, 성능, 보안, 가독성 관점으로 분석."

### `codex-worker` (tmux 워커)

```yaml
---
name: codex-worker
description: |
  Manage Codex as a long-running tmux worker session.
  Handles session creation, task dispatch, output monitoring, and cleanup.

  <example>
  Context: User needs a persistent Codex worker via /codex:worker
  user: "/codex:worker 'Fix all failing tests'"
  assistant: "I'll use the codex-worker agent to launch a tmux Codex session."
  </example>
model: inherit
color: purple
tools: ["Bash", "Read"]
---
```

- **동작**: tmux 세션 생성 → Codex 인터랙티브 모드 실행 → 작업 지시 전송
- **tmux 관리**: `tmux new-session`, `send-keys`, `capture-pane`, `kill-session`
- **세션 명명**: `codex-worker-{timestamp}`

### Common Agent Behavior

- 모든 agent는 `~/.claude/codex.local.md`에서 설정 로드
- Codex CLI 없으면 `/codex:setup` 실행 안내 후 중단
- 타임아웃: exec 모드 120초 (설정 가능), worker 모드 제한 없음

## Error Handling

| 상황 | 처리 |
|------|------|
| Codex CLI 미설치 (`which codex` 실패) | `/codex:setup` 실행 안내, 중단 |
| `OPENAI_API_KEY` 미설정 | 환경변수 설정 방법 안내, 중단 |
| `codex exec` 비정상 종료 (exit code != 0) | stderr 내용 사용자에게 표시 |
| 타임아웃 초과 | 프로세스 종료, 타임아웃 안내 |
| Rate limit (429) | 대기 후 재시도 안내 |
| tmux 미설치 (`which tmux` 실패) | worker 커맨드만 비활성, 안내 |
| tmux 세션 충돌 (동일 이름 존재) | 기존 세션 상태 표시, 재사용/종료 선택 |

## Configuration

### `~/.claude/codex.local.md`

```yaml
---
codex_path: codex
default_model: o4-mini
confirm_full_auto: true
worker_session_prefix: codex-worker
timeout: 120000
---
```

#### Fields

| Field | Default | Description |
|-------|---------|-------------|
| `codex_path` | `codex` | Codex CLI 실행 경로 |
| `default_model` | `o4-mini` | 기본 모델 |
| `confirm_full_auto` | `true` | `true`: full-auto 실행 전 사용자 확인 요청, `false`: 확인 없이 즉시 실행 |
| `worker_session_prefix` | `codex-worker` | tmux 세션 이름 접두사 |
| `timeout` | `120000` | exec 모드 타임아웃 (ms) |

#### Available Models

| Model | Description |
|-------|-------------|
| `o4-mini` | Fast, cost-effective (default) |
| `o3` | More capable, slower |

## hooks.json (초기)

```json
{
  "hooks": []
}
```

향후 추가 가능: Stop 훅으로 실행 중인 worker 세션 감지 및 정리.

## Design Decisions

### Why Multi-Agent (not Monolithic)?
- 커맨드별 권한 분리(suggest vs full-auto)와 자연스럽게 맞물림
- drip-ui 플러그인의 `v0-generator`, `gemini-generator`, `zai-generator` 분리 패턴과 일관성
- 각 agent의 프롬프트를 역할에 맞게 최적화 가능

### Why Both exec and tmux?
- 단순 질의/코드 생성은 `codex exec`로 빠르게 처리
- 복잡한 장시간 작업은 tmux 인터랙티브 세션으로 위임
- 사용자가 상황에 맞게 선택 가능

### Command Naming Convention
- CLAUDE.md 규칙에 따라 `codex:` 접두사 사용 (`codex:ask.md`, `codex:code.md` 등)
- drip-ui의 `drip:generate.md` 패턴과 일관성

### Security Considerations
- `codex:ask`와 `codex:review`는 파일 수정 불가 (suggest only)
- `codex:code`만 full-auto 허용, `confirm_full_auto: true`가 기본값
- API 키는 환경변수에서만 읽음 (설정 파일에 저장하지 않음)
