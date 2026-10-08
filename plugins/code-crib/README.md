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

### Claude·Codex 세션 작업일지 (2.3+)

```text
/code-crib:sessions --enable
/code-crib:sessions
/code-crib:sessions --provider codex --query "인증 timeout"
/code-crib:sessions --show SESSION_ID --provider claude
/code-crib:sessions --resume SESSION_ID
/code-crib:sessions --refresh
/code-crib:grab "인증 timeout" --sessions
```

**기본 수집은 꺼짐**입니다. 켜면 이 기기의 연결된 모든 프로젝트에서 이후 훅으로 관측한 세션을 수집합니다. 과거의 전체 홈 디렉터리나 Codex state DB를 훑어 자동 가져오지는 않습니다. 목록은 현재 Git 체크아웃 기준이며 다른 체크아웃/프로젝트까지 보려면 `--all`을 지정합니다. 원격 DB나 FTS5 없이 Python 3.9+ 표준 라이브러리로 동작합니다.

- **빠른 훅**: `SessionStart`에 참조를 등록하고 이전 참조의 남은 로그를 최대 0.5초/1 MiB 처리합니다. `Stop`은 응답 완료 체크포인트(가능하면 마지막 AI 응답 발췌도 저장), `SessionEnd`는 종료 메타데이터 기록만 합니다. 종료 시 원본 파싱/LLM 호출/네트워크 전송은 없습니다. 잠금 대기는 최대 150ms이며 실패가 CLI 종료를 막지 않습니다.
- **증분 후처리**: 목록·상세·검색 전에 등록된 JSONL의 커서 이후를 읽습니다. 한 번에 최대 2초/8 MiB를 처리하고 미완성 마지막 줄은 다음 번으로 남깁니다. 처리 예산이 남지 않으면 `sync.pending`, 읽기 실패/지원하지 않는 형식은 `sync.errors`로 표시하며 이전 요약을 유지합니다. 다음 세션 시작 또는 `--refresh`로 누락 로그를 보완하지만 종료 시각을 추정하지는 않습니다. 첫 레코드 지문·inode·크기로 로그 교체/축소를 감지합니다(동일 크기의 중간 줄 덮어쓰기까지 감지하는 문서 인덱스와는 다릅니다).
- **요약 근거**: 첫 사용자 요청을 제목으로, 마지막 AI 응답을 1,000자 이내 발췌로 저장합니다. 별도 LLM 요약이나 검증된 완료 판정이 아닙니다. 도구 호출/결과에서 파일과 명령을 추출하고, 테스트 후보는 명령명으로 분류합니다. 명시적 종료 코드 0은 `exit_ok`, 결과가 없으면 `unverified`입니다. `unfinished`는 Codex `update_plan`에서 관측한 항목만 표시하며 없으면 미확인입니다. 각 목록은 최대 200항목, 로그 한 줄/훅 입력은 최대 1 MiB입니다. 명령 본문·전체 출력·추론은 복사하지 않습니다.
- **재개**: 명령만 제시하며 자동 실행하지 않습니다. Claude는 `claude --resume ID`, Codex는 `codex resume ID`(`source=exec`이면 `codex exec resume ID`)입니다. Codex는 rollout의 thread ID를 우선 사용합니다. 원본이 있으면 `available_unverified`, 사라지거나 `--ephemeral` 등으로 없으면 `unavailable`입니다. 실제 재개 성공이나 Claude 비대화형 세션의 picker 노출은 보장하지 않습니다. 파일/프로세스 복원 기능이 아닙니다.
- **별도 영속 저장소**: `${XDG_DATA_HOME:-~/.local/share}/code-crib/sessions.sqlite3`에 저장합니다. 문서 검색의 재생성 가능한 캐시와 다르며, 원본이 만료돼도 이미 추출한 요약은 남습니다. 기본 자동 만료는 없습니다. 디렉터리 0700/DB 0600 권한의 평문 저장소이므로 디스크 암호화·백업 정책은 사용자가 관리해야 합니다. API 키/Bearer/비밀번호/코드 블록 등의 패턴을 가리지만 민감정보 제거를 보장하지 않습니다. 민감한 세션 전에는 수집을 끄세요. 저장소 안으로 `XDG_DATA_HOME`을 지정하거나 Git에 추가하지 마세요.
- **끄기/삭제**: `--disable` 또는 실행 환경의 `CODE_CRIB_SESSION_HISTORY=0`으로 자동 수집·갱신을 끕니다. 기존 요약은 그대로이며 명시적 `--refresh`는 여전히 읽습니다. `--forget ID --provider claude`는 해당 추출 레코드만 삭제하고 원본은 건드리지 않습니다. SQLite의 보안 삭제를 보장하지 않습니다. 재개 중인 세션은 이후 훅으로 다시 등록될 수 있습니다.
- **원격 전송 없음**: `/stash`의 선택적 지식 문서와 자동 작업일지는 별개입니다. 원본 transcript/작업일지를 `.rag-docs`에 자동 복사하거나 Chroma/Pinecone에 보내지 않습니다. 사용자가 검토하고 요청한 요약만 기존 `/stash`로 따로 저장하세요. `/grab --sessions`는 작업일지만, 기존 `/grab`은 문서를 검색합니다.

#### Codex 훅 연결

Claude 플러그인의 훅이 Codex에 자동 적용되지는 않습니다. 공식 lifecycle hook을 지원하는 Codex에서 다음으로 JSON을 생성합니다.

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/session-history.py" codex-config
```

출력의 `SessionStart`/`Stop`/`SessionEnd` 설정을 `${CODEX_HOME:-~/.codex}/hooks.json`의 기존 목록에 **중복 없이 병합**하고 Codex의 신뢰 검토를 완료하세요. 기존 파일을 출력으로 덮어쓰지 마세요. 일반 셸에는 `CLAUDE_PLUGIN_ROOT`가 자동 설정되지 않으므로 설치된 code-crib 경로를 지정해야 합니다. Codex도 동일한 OS 사용자와 `XDG_DATA_HOME`을 사용해야 같은 작업일지를 봅니다. 생성 명령에는 현재 절대 경로가 들어가므로 플러그인 업데이트 후 다시 생성해야 합니다. 이 기능은 기존 codex 플러그인의 tmux 작업자와 독립적입니다.

어댑터는 Claude 메시지/도구 JSONL과 Codex legacy `response_item`/`event_msg`, paginated `item_completed`의 주요 항목을 지원합니다. 로그 포맷은 안정 API가 아니며 알려지지 않은 이벤트는 건너뜁니다. **`.jsonl.zst`는 원본 존재/재개 참조만 지원**하고 직접 해제·색인하지 않습니다(기존 발췌는 유지, 갱신 경고 표시). Codex의 기본 `archived_sessions/<동일 파일명>` 이동은 찾지만 임의 이동·state DB·원격/클라우드 전용 thread는 탐색하지 않습니다. `history.jsonl`은 resume 원본이 아닙니다. 전체 상태 접근에는 공식 app-server `thread/list`/`thread/read`가 더 적합하지만, 이 버전은 별도 서버/인증 없이 짧은 로컬 훅과 참조된 로그만 사용합니다.

근거: [Claude 훅](https://code.claude.com/docs/en/hooks#sessionend), [Codex 훅](https://learn.chatgpt.com/docs/hooks#sessionend), [Codex app-server](https://learn.chatgpt.com/docs/app-server). 실제 설치 버전에서 훅 지원·신뢰 검토·resume를 확인하세요.

| Command | Description |
|---------|-------------|
| `/code-crib:stash` | Save your work session to knowledge stash |
| `/code-crib:grab` | Search docs from your stash |
| `/code-crib:rack` | Bulk index local markdown files |
| `/code-crib:status` | 로컬 인덱스의 갱신 시각·미반영 변경·실패 확인 |
| `/code-crib:sessions` | Claude·Codex 작업일지 목록·검색·상세·재개 명령 |
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
| `/code-crib:sessions` | Claude·Codex 작업일지 목록·검색·상세·재개 명령 |
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
