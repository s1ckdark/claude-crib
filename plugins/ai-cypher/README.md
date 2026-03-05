# AI Cypher

> Multi-model freestyle debates where AI crews spit knowledge and build consensus

AI Cypher는 여러 AI 모델들이 모여 주제에 대해 토론하고 합의를 도출하는 Claude Code 플러그인입니다. 힙합 사이퍼에서 래퍼들이 둥글게 모여 프리스타일을 하듯, AI 모델들이 함께 의견을 교환합니다.

## Features

- **Multi-Model Orchestration**: Claude, GPT, Ollama, Gemini, Codex, Z.ai 등 다양한 AI 모델 간 토론 조율
- **Format Flexibility**: 주제에 따라 라운드 기반 또는 프리스타일 형식 자동 선택
- **Fair Moderation**: MC(호스트)가 공정한 참여를 보장
- **Ralph Loop Validation**: 합의 품질 자동 검증
- **Complete Audit Trail**: 모든 토론 기록을 JSON + Markdown으로 저장

## Quick Start

```bash
# 1. 먼저 설정 (최초 1회)
/ai-cypher:setup

# 2. 기본 사이퍼 시작
/ai-cypher:start "REST vs GraphQL for mobile apps"

# 3. 특정 크루로 사이퍼
/ai-cypher:start "Best database for real-time app" --crew claude,codex,zai

# 4. MC 지정
/ai-cypher:start "Microservices vs Monolith" --mc claude --crew gpt,gemini,ollama
```

## Commands

| Command | Description |
|---------|-------------|
| `/ai-cypher:setup` | **최초 설정** - 모델 설치 및 설정 마법사 |
| `/ai-cypher:start <topic>` | AI 사이퍼 시작 |
| `/ai-cypher:list` | 모든 사이퍼 기록 보기 |
| `/ai-cypher:list --export latest` | 최근 사이퍼를 마크다운으로 내보내기 |
| `/ai-cypher:config` | 설정 확인 및 관리 |
| `/ai-cypher:config add-model` | 새 모델 추가 |
| `/ai-cypher:config set-default crew <models>` | 기본 크루 설정 |

## Cypher Flow

```
+===================================================================+
|  AI CYPHER: Should we use microservices?                          |
+===================================================================+
|  Format: Round-based  |  Rounds: 3  |  MC: Claude                 |
|  Crew: GPT-4, Ollama-Llama3, Gemini                               |
+===================================================================+

=== Round 1: Opening Bars ===
[GPT-4]: For a startup, I recommend starting with a monolith...
[Ollama]: Microservices offer better scalability from day one...
[Gemini]: It depends on team size and complexity...

=== Round 2: Call and Response ===
[GPT-4]: While Ollama makes a good point about scalability...
[Ollama]: GPT raises valid concerns about initial complexity...
[Gemini]: Both approaches have merit, but the team factor...

=== Round 3: Final Verse ===
...

=== MC Summary ===
Consensus reached: Start with modular monolith, plan for microservices.
```

## Configuration

설정 파일: `.claude/ai-cypher.local.md`

```markdown
## Models (The Crew)

| Name | CLI Command | Description |
|------|-------------|-------------|
| claude | `claude --print -p "$PROMPT"` | Anthropic Claude |
| gpt | `openai api chat.completions.create -m gpt-4o -g user "$PROMPT"` | OpenAI GPT-4 |
| ollama | `ollama run llama3.2 "$PROMPT"` | Local Ollama |
| gemini | `gemini -p "$PROMPT"` | Google Gemini |
| codex | `codex exec "$PROMPT"` | OpenAI Codex CLI |
| zai | `curl -s "https://api.z.ai/api/coding/paas/v4/chat/completions" -H "Authorization: Bearer $Z_AI_API_KEY" ... \| jq -r '.choices[0].message.content'` | Z.ai GLM-4.7 (Coding Plan) |
| zai-free | `curl -s "https://api.z.ai/api/paas/v4/chat/completions" -H "Authorization: Bearer $Z_AI_API_KEY" ... \| jq -r '.choices[0].message.content'` | Z.ai GLM-4.7-flash (무료) |

## Defaults

- **Default Crew**: claude, codex, gemini, ollama
- **Default MC**: auto
- **Default Format**: auto
- **Default Rounds**: auto
```

## Transcript Files

모든 사이퍼는 `.cyphers/` 디렉토리에 저장됩니다:

```
.cyphers/
├── 2026-02-06-12-30-monolith-vs-microservices.json  # 데이터 (기계용)
├── 2026-02-06-12-30-monolith-vs-microservices.md    # 문서 (사람용)
├── 2026-02-05-15-45-rest-vs-graphql.json
└── 2026-02-05-15-45-rest-vs-graphql.md
```

**JSON 파일**: 구조화된 데이터, 검색/분석용
**Markdown 파일**: 읽기 쉬운 포맷, frontmatter 포함

```bash
# 사이퍼 기록 보기
/ai-cypher:list

# 최근 사이퍼 마크다운으로 내보내기
/ai-cypher:list --export latest

# 직접 파일 열기
cat .cyphers/2026-02-06-12-30-monolith-vs-microservices.md
```

## Terminology

| Term | Original | Description |
|------|----------|-------------|
| Cypher | Discussion | AI 모델들의 토론 세션 |
| Crew | Participants | 토론에 참여하는 AI 모델들 |
| MC | Host | 토론을 진행하고 합의를 도출하는 모델 |
| Opening Bars | Round 1 | 초기 입장 표명 |
| Call and Response | Round 2 | 상대 의견에 대한 응답 |
| Final Verse | Round 3+ | 최종 입장 정리 |

## Architecture

```
ai-cypher/
├── agents/
│   ├── cypher-host.md      # MC - 토론 진행자
│   └── flow-coordinator.md # 모델 호출 담당
├── commands/
│   ├── cypher:setup.md     # 최초 설정 마법사
│   ├── cypher:start.md     # 사이퍼 시작
│   ├── cypher:list.md      # 기록 조회 및 내보내기
│   └── cypher:config.md    # 설정 관리
├── skills/
│   └── cypher-strategy/    # 토론 전략 가이드
├── hooks/
│   └── hooks.json          # Ralph Loop 검증
├── scripts/
│   ├── check-models.sh     # 모델 가용성 확인
│   └── invoke-model.sh     # 모델 호출
└── templates/
    └── ai-cypher.local.md  # 설정 템플릿
```

## Requirements

- Claude Code CLI
- 최소 1개 이상의 AI 모델 접근 가능:
  - Claude CLI (`claude`) - 이미 설치됨
  - OpenAI CLI (`openai`) + `OPENAI_API_KEY`
  - Ollama (`ollama serve`) 로컬 서버
  - Gemini CLI (`gemini`) + `GOOGLE_API_KEY`
  - Codex CLI (`npm i -g @openai/codex`) + `OPENAI_API_KEY`
  - Z.ai (`Z_AI_API_KEY`) - Coding Plan: `api.z.ai/api/coding/paas/v4`, 무료: `api.z.ai/api/paas/v4`

## License

MIT
