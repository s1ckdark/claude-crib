# code-crib

> Your knowledge stash for Claude Code - Save work sessions, search past solutions, analyze your codebase
>
> Claude Code를 위한 지식 창고 - 작업 세션 저장, 과거 솔루션 검색, 코드베이스 분석

[![Plugin](https://img.shields.io/badge/Claude_Code-Plugin-blue.svg)](https://github.com/s1ckdark/claude-crib)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

[English](#installation) | [한국어](#설치)

---

## Installation

```bash
# Add marketplace
/plugin marketplace add s1ckdark/claude-crib

# Install plugin
/plugin install code-crib@claude-crib --scope project

# Run setup
/code-crib:setup
```

## Setup

### Chroma Connection Modes

`/code-crib:setup` asks how to reach Chroma and writes `CHROMA_*` vars into `~/.claude/settings.json` → `env`. Restart Claude Code afterwards — MCP servers read env only at startup.

| Mode | Use when | Key vars |
|------|----------|----------|
| **Local server** (default) | Chroma in Docker / `chroma run` on this machine | `CHROMA_HOST=localhost`, `CHROMA_PORT` |
| **Remote server** | Self-hosted Chroma on a home server, VPS, or Tailscale host | `CHROMA_HOST`, `CHROMA_PORT`, `CHROMA_SSL`, optional `CHROMA_CUSTOM_AUTH_CREDENTIALS` (`user:password`) |
| **Local persistent** | No server at all; vectors stored in a directory | `CHROMA_DATA_DIR` |
| **Chroma Cloud** | Hosted at api.trychroma.com | `CHROMA_TENANT`, `CHROMA_DATABASE`, `CHROMA_API_KEY` |

```bash
# Local: start Chroma with Docker, then run the wizard
docker run -d -p 8000:8000 -v chroma-data:/data chromadb/chroma
/code-crib:setup
```

**Remote example (Tailscale):** bind the server port only to `127.0.0.1` and the Tailscale IP, then pick *Remote server* with host `my-server`, port `8000`, SSL off, auth none. If the server is reachable from the public internet, put it behind HTTPS and enable Chroma basic auth.

Check reachability anytime: `curl http://<host>:<port>/api/v2/heartbeat`

### Using One DB from Several Machines

Every saved document carries `project` and `host` metadata, resolved by `hooks/scripts/crib-identity.sh`:

- **project**: one RAG collection per repo, named after the origin remote's repo (e.g. `code-crib-claude-crib`). Clones in different directories or on different machines share it. The owner is ignored, so if two repos share a name, pin one with `project_name:` in the repo's `.claude/code-crib.local.md`.
- **host**: `hostname -s`, or `CODE_CRIB_HOST` if set (useful on macOS, where hostnames drift).

Filter by machine with `/code-crib:grab "query" --host <name>`.

## Commands

| Command | Description |
|---------|-------------|
| `/code-crib:stash` | Save your work session to knowledge stash |
| `/code-crib:grab` | Search docs from your stash |
| `/code-crib:rack` | Bulk index local markdown files |
| `/code-crib:list` | List documents in your stash |
| `/code-crib:remove` | Delete documents from stash |
| `/code-crib:analyze` | Analyze and document codebase structure |
| `/code-crib:scope` | Same as analyze |
| `/code-crib:rag` | RAG mode control (on/off/query) |
| `/code-crib:inject` | Manual file injection into context |
| `/code-crib:toggle-rag` | Toggle Auto-RAG on/off |
| `/code-crib:setup` | Configuration wizard |
| `/code-crib:update` | Update plugin to latest version |

### `/code-crib:stash` - Save Your Work

```bash
/code-crib:stash
/code-crib:stash --type bugfix --tags "auth,session" --title "Session timeout fix"
```

**Args:**
- `--type`: Work type (bugfix, feature, refactor, analysis)
- `--title`: Document title (auto-generated if omitted)
- `--tags`: Tags (comma-separated)
- `--namespace`: Project namespace

### `/code-crib:grab` - Search Past Solutions

```bash
/code-crib:grab "session timeout error"
/code-crib:grab "authentication" --type bugfix --limit 3
```

### `/code-crib:rack` - Bulk Index Docs

```bash
/code-crib:rack
/code-crib:rack --path ./docs/knowledge
```

### `/code-crib:analyze` - Analyze Codebase

```bash
/code-crib:analyze
/code-crib:analyze --depth 5 --top 30
```

### `/code-crib:rag` - RAG Mode Control

```bash
/code-crib:rag              # Show current status
/code-crib:rag on           # Enable RAG mode
/code-crib:rag off          # Disable RAG mode
/code-crib:rag "question"   # One-shot RAG query
```

### `/code-crib:inject` - Manual Context Injection

```bash
/code-crib:inject src/auth/login.ts      # Single file
/code-crib:inject src/components/*.tsx   # Glob pattern
/code-crib:inject src/api/ --depth 2     # Directory
```

---

## 설치

```bash
# 마켓플레이스 추가
/plugin marketplace add s1ckdark/claude-crib

# 플러그인 설치
/plugin install code-crib@claude-crib --scope project

# 설정 실행
/code-crib:setup
```

## 설정

### Chroma 연결 방식

`/code-crib:setup`이 연결 방식을 묻고 `~/.claude/settings.json`의 `env`에 `CHROMA_*` 변수를 기록합니다. MCP 서버는 시작 시에만 env를 읽으므로 설정 후 Claude Code를 재시작하세요.

| 방식 | 사용 시점 | 주요 변수 |
|------|----------|----------|
| **로컬 서버** (기본) | 이 머신의 Docker / `chroma run` | `CHROMA_HOST=localhost`, `CHROMA_PORT` |
| **원격 서버** | 홈서버, VPS, Tailscale 호스트에 직접 띄운 Chroma | `CHROMA_HOST`, `CHROMA_PORT`, `CHROMA_SSL`, 선택 `CHROMA_CUSTOM_AUTH_CREDENTIALS` (`user:password`) |
| **로컬 persistent** | 서버 없이 디렉터리에 저장 | `CHROMA_DATA_DIR` |
| **Chroma Cloud** | api.trychroma.com 호스팅 | `CHROMA_TENANT`, `CHROMA_DATABASE`, `CHROMA_API_KEY` |

```bash
# 로컬: Docker로 Chroma 시작 후 마법사 실행
docker run -d -p 8000:8000 -v chroma-data:/data chromadb/chroma
/code-crib:setup
```

**원격 예시 (Tailscale):** 서버 포트를 `127.0.0.1`과 Tailscale IP에만 바인딩한 뒤, *원격 서버* → host `my-server`, port `8000`, SSL 끔, 인증 없음. 공인 인터넷에 노출된다면 HTTPS 뒤에 두고 Chroma basic auth를 켜세요.

연결 확인: `curl http://<host>:<port>/api/v2/heartbeat`

### 여러 기기에서 하나의 DB 쓰기

저장되는 모든 문서에는 `hooks/scripts/crib-identity.sh`가 정한 `project`와 `host` 메타데이터가 붙습니다.

- **project**: repo마다 RAG 컬렉션 하나. origin remote의 repo 이름을 씁니다 (예: `code-crib-claude-crib`). 클론 경로나 기기가 달라도 같은 컬렉션을 씁니다. owner는 무시하므로 이름이 같은 repo가 둘이면 한쪽을 repo의 `.claude/code-crib.local.md`에 `project_name:`으로 고정하세요.
- **host**: `hostname -s`, 또는 `CODE_CRIB_HOST`가 설정되어 있으면 그 값 (호스트명이 자주 바뀌는 macOS에서 유용).

특정 기기의 기록만 보려면 `/code-crib:grab "검색어" --host <이름>`.

## 명령어

| 명령어 | 설명 |
|--------|------|
| `/code-crib:stash` | 작업 세션을 지식 창고에 저장 |
| `/code-crib:grab` | 저장된 문서 검색 |
| `/code-crib:rack` | 로컬 마크다운 파일 일괄 인덱싱 |
| `/code-crib:list` | 저장된 문서 목록 |
| `/code-crib:remove` | 저장된 문서 삭제 |
| `/code-crib:analyze` | 코드베이스 구조 분석 및 문서화 |
| `/code-crib:scope` | analyze와 동일 |
| `/code-crib:rag` | RAG 모드 제어 (on/off/query) |
| `/code-crib:inject` | 수동 파일 컨텍스트 주입 |
| `/code-crib:toggle-rag` | Auto-RAG 토글 |
| `/code-crib:setup` | 설정 마법사 |
| `/code-crib:update` | 플러그인 최신 버전으로 업데이트 |

### `/code-crib:stash` - 작업 저장

```bash
/code-crib:stash
/code-crib:stash --type bugfix --tags "auth,session" --title "세션 타임아웃 수정"
```

**인자:**
- `--type`: 작업 유형 (bugfix, feature, refactor, analysis)
- `--title`: 문서 제목 (생략시 자동 생성)
- `--tags`: 태그 (쉼표 구분)
- `--namespace`: 프로젝트 네임스페이스

### `/code-crib:grab` - 솔루션 검색

```bash
/code-crib:grab "세션 타임아웃 에러"
/code-crib:grab "인증" --type bugfix --limit 3
```

### `/code-crib:rack` - 문서 일괄 인덱싱

```bash
/code-crib:rack
/code-crib:rack --path ./docs/knowledge
```

### `/code-crib:analyze` - 코드베이스 분석

```bash
/code-crib:analyze
/code-crib:analyze --depth 5 --top 30
```

### `/code-crib:rag` - RAG 모드 제어

```bash
/code-crib:rag              # 현재 상태 표시
/code-crib:rag on           # RAG 모드 활성화
/code-crib:rag off          # RAG 모드 비활성화
/code-crib:rag "질문"       # 일회성 RAG 쿼리
```

### `/code-crib:inject` - 수동 컨텍스트 주입

```bash
/code-crib:inject src/auth/login.ts      # 단일 파일
/code-crib:inject src/components/*.tsx   # Glob 패턴
/code-crib:inject src/api/ --depth 2     # 디렉토리
```

---

## Project Structure

```
plugins/code-crib/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── code-crib:stash.md
│   ├── code-crib:grab.md
│   ├── code-crib:rack.md
│   ├── code-crib:list.md
│   ├── code-crib:remove.md
│   ├── code-crib:analyze.md
│   ├── code-crib:scope.md
│   ├── code-crib:rag.md
│   ├── code-crib:inject.md
│   ├── code-crib:toggle-rag.md
│   ├── code-crib:setup.md
│   └── code-crib:update.md
├── skills/
│   └── save/, search/, index/, analyze/, ...
├── agents/
│   ├── documenter.md
│   └── codebase-analyzer.md
├── hooks/
│   └── hooks.json
├── templates/
│   └── bugfix.md, feature.md, ...
└── code-crib.local.md
```

## License

MIT
