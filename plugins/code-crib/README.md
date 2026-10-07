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

### 로컬 자동 인덱싱 (2.2+)

Python 3.9+와 FTS5/JSON1이 포함된 SQLite만 있으면 벡터 DB 없이도 문서를 검색할 수 있습니다. 추가 Python 패키지는 필요 없습니다.

```bash
/code-crib:rack --path ./docs/knowledge --local
/code-crib:grab "세션 타임아웃" --local
/code-crib:status
```

- **자동 갱신**: 세션 시작과 `/grab` 실행 직전에 `.rag-docs/` 및 `--path`로 등록한 경로를 확인합니다. 내용 해시가 바뀐 문서만 저장하고 삭제된 파일은 로컬 인덱스에서 제거합니다. 실시간 파일 감시 데몬은 실행하지 않습니다.
- **검색 미리보기**: 문서 앞부분 대신 검색어가 일치하는 구절과 원본 줄 번호를 보여줍니다. 제목에 가중치를 둔 FTS5 검색 후, 부족한 결과는 부분 일치로 보완합니다. 한국어 형태소 분석은 하지 않습니다.
- **상태 확인**: 등록 경로별 문서 수·마지막 갱신·미반영 추가/변경/삭제·오류를 표시합니다. 읽기 실패는 이전 레코드를 유지하고 경고합니다. 디렉터리 전체가 사라진 경우에도 일괄 삭제하지 않습니다.
- **저장**: 새 `/stash` 문서는 원격 업로드 전에 로컬 사본도 저장하도록 안내합니다. 기존 원격 전용 문서는 자동 다운로드하지 않으며, 원격 DB 삭제와 로컬 원본 삭제는 별개입니다.
- **범위**: 기본 대상은 `.rag-docs/`의 UTF-8 Markdown입니다. 사용자 지정 경로는 저장소 루트 기준이며 저장소 밖 경로·심볼릭 링크·숨김 하위 경로·`node_modules`/`vendor`는 제외합니다. 문서당 최대 2 MiB입니다.
- **메타데이터**: frontmatter의 단순 문자열 `title`/`type`/`host`와 쉼표·인라인 목록·블록 목록 형태의 `tags`를 읽습니다. 중첩 YAML/여러 줄 스칼라는 지원하지 않습니다. 등록 경로끼리는 포함 관계로 겹칠 수 없습니다.
- **캐시**: `${XDG_CACHE_HOME:-~/.cache}/code-crib/<프로젝트 절대경로 해시>/index.sqlite3`에 원문 사본을 저장합니다. 기기·체크아웃별 로컬 캐시이며 원격 전송하지 않습니다. 삭제하면 재생성되지만 사용자 지정 경로는 다시 등록해야 합니다. 민감한 문서는 대상 경로에 넣지 마세요.
- **자동 갱신 끄기**: Claude Code 실행 환경에 `CODE_CRIB_AUTO_INDEX=0`을 설정하면 세션 시작 훅만 끕니다. 명시적인 `/rack`, `/grab`은 계속 최신화합니다. 훅은 최대 10초이며 실패해도 세션을 막지 않습니다. Python이 없으면 훅을 건너뛰고 기존 벡터 검색을 사용할 수 있습니다.

`--local` 없이 `/grab`을 사용하면 기존 Chroma/Pinecone 의미 검색을 함께 활용합니다. **로컬 인덱싱 성공은 원격 동기화 성공을 뜻하지 않습니다.** 원격 업로드는 기존 `/rack` 절차로 수행하고, 로컬 삭제를 원격에 자동 전파하지 않습니다.

CLI를 직접 실행하려면 프로젝트 디렉터리에서 다음을 사용하세요. 하위 디렉터리에서도 Git 저장소 루트를 찾습니다.

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/local-index.py" sync
python3 "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/local-index.py" status
python3 "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/local-index.py" search "timeout" --type bugfix --limit 3
```

## Commands

| Command | Description |
|---------|-------------|
| `/code-crib:stash` | Save your work session to knowledge stash |
| `/code-crib:grab` | Search docs from your stash |
| `/code-crib:rack` | Bulk index local markdown files |
| `/code-crib:status` | 로컬 인덱스의 갱신 시각·미반영 변경·실패 확인 |
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
| `/code-crib:status` | 로컬 인덱스의 갱신 시각·미반영 변경·실패 확인 |
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
/code-crib:rack --local
/code-crib:status
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

## 개발 검증

저장소 루트에서 실행합니다. 테스트는 임시 프로젝트와 임시 캐시만 사용하며 외부 DB에 연결하지 않습니다.

```bash
python3 -m unittest discover -s plugins/code-crib/tests -v
python3 -m py_compile plugins/code-crib/hooks/scripts/local-index.py
bash -n plugins/code-crib/hooks/scripts/sync-local-index.sh
```

## License

MIT
