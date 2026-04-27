# Crib Hood × GraphRAG Design Spec

## Overview

`crib-hood`에 GraphRAG 기반 코드 지식 그래프를 시각화하는 새 뷰("Crib Hood Map")를 추가한다.
모듈 단위 노드를 force layout으로 배치하고, 그 위에 OMC 에이전트 캐릭터(동물)가 작업 중인 모듈에 *앉아서* 살아 움직인다.
GraphRAG 데이터는 가능하면 자매 플러그인 `code-crib`의 chroma 임베딩에서 추출하고, 없을 때는 AST 기반 구조 그래프로 fallback한다.

이 작업의 정체성은 두 가지를 합치는 것이다.

1. **정적**: 코드베이스의 모듈 토폴로지 (구조 + 의미)
2. **동적**: 지금 누가 어디서 무엇을 하고 있는가 (라이브 에이전트 오버레이)

## Goals (V1)

- `/crib-hood:build-map` 한 번 실행으로 현재 리포의 모듈 그래프(graph.json)를 산출한다.
- 대시보드의 메인 화면이 그래프 뷰가 된다. 기존 동물 그리드 렌더링 코드는 제거되고 `app.js`는 map view 부트스트랩 책임만 가진다. `characters.js`의 role→이모지 매핑은 그대로 재사용한다.
- code-crib 스태시가 있으면 의미 엣지(LLM 추출)를 함께 그리고, 없으면 AST 구조 엣지만 그린다.
- 라이브 에이전트는 작업 경로의 소유 모듈 위에 동물 캐릭터로 표시되며, 모듈 이동 시 부드럽게 자리를 옮긴다.
- 사용자는 상단 칩으로 *구조 / 의미 / 활동* 엣지 레이어를 ON/OFF할 수 있다.
- Walk Trail 토글 시 최근 N(=5) 모듈 방문 자취를 따라 동물이 걸어다닌다.

## Non-Goals (V1)

- 파일 단위 드릴다운 (Q4-C 옵션) — V2 후보.
- 실시간 자동 graph rebuild (코드 변경 watcher) — V2 후보, V1은 수동 트리거.
- code-crib 외부 GraphRAG 라이브러리(Microsoft graphrag 등) 통합 — Approach 3은 보류.
- 그래프 편집 UI (노드 추가/삭제) — 그래프는 빌더 출력만이 진실.
- 멀티 리포 동시 시각화.

## Decisions Log

브레인스토밍에서 합의된 핵심 결정.

| # | 결정 | 결과 |
|---|---|---|
| Q1 | 무엇을 시각화? | 하이브리드: 코드 그래프 + 라이브 에이전트 오버레이 |
| Q2 | 코드 그래프 데이터 소스 | 하이브리드: code-crib 우선, 없으면 AST fallback |
| Q3 | 대시보드 내 위치 | 그래프가 곧 홈 — 동물이 그래프 위에 살아 움직임 |
| Q4 | 노드 단위 | 모듈/플러그인 레벨 (~10–30 노드) |
| Q5 | 동물 오버레이 UX | Sit-on 기본 + Walk Trail 옵션 토글 |
| Q6 | 엣지 표현 | 레이어 토글 (구조/의미/활동 칩 ON/OFF) |
| Impl | 구현 접근법 | Approach 1 — Pre-built JSON + SSE 오버레이 |
| Lib | 그래프 라이브러리 | Cytoscape.js |

## Plugin Structure (Changed)

```
plugins/crib-hood/
├── .claude-plugin/
│   └── plugin.json                   # 기존
├── agents/
│   └── coordinator.md                # 기존
├── commands/
│   ├── crib-hood.md                  # ✏️ Map view 진입으로 변경
│   ├── run.md                        # 기존
│   ├── status.md                     # 기존
│   ├── stop.md                       # 기존
│   └── build-map.md                  # 🆕 그래프 빌드 트리거
├── server/
│   ├── index.js                      # ✏️ /api/graph 엔드포인트 + SSE 이벤트 추가
│   ├── graph/                        # 🆕
│   │   ├── builder.js                #   파이프라인 오케스트레이션
│   │   ├── code-crib-source.js       #   chroma docs → LLM 엔티티/관계
│   │   ├── ast-source.js             #   tree-sitter / 정규식 import 파싱
│   │   ├── merge.js                  #   소스 dedupe + 엣지 kind 태깅
│   │   └── activity-mapper.js        #   task path → 소유 모듈 매핑
│   └── public/
│       ├── index.html                # ✏️ Map view 진입 + 헤더 toggle bar
│       ├── style.css                 # 기존 + map.css import
│       ├── app.js                    # ✏️ map 모듈 초기화 호출
│       ├── characters.js             # 기존 (동물 ↔ role 매핑 그대로 재사용)
│       └── map/                      # 🆕
│           ├── map.js                #   Cytoscape 초기화 + SSE 핸들러
│           ├── map.css               #   레이어 토글, 동물 스타일
│           ├── animal-renderer.js    #   노드 좌표 추적 + DOM 동물 위치
│           └── trail.js              #   Walk Trail 옵션
└── README.md                         # ✏️ 새 명령/뷰 반영
```

## Data Shapes

### `graph.json`

위치: `~/.claude/crib-hood/<repoHash>/graph.json` (repoHash = repoRoot 절대경로의 SHA1 8자).

```jsonc
{
  "version": 1,
  "builtAt": "2026-04-27T05:12:00.000Z",
  "source": "hybrid",                  // "code-crib" | "ast" | "hybrid"
  "repoRoot": "/Users/dave/iWorks/claude-crib",
  "nodes": [
    {
      "id": "crib-hood",
      "label": "crib-hood",
      "kind": "module",
      "path": "plugins/crib-hood",     // repo-relative
      "summary": "Agent dashboard with animated animal characters",
      "tags": ["dashboard", "visualization"]
    }
  ],
  "edges": [
    {
      "from": "crib-hood",
      "to": "code-crib",
      "kind": "structural",             // "structural" | "semantic" | "activity"
      "weight": 0.8,                     // 0..1
      "evidence": "imports chroma client via plugin runtime"
    },
    {
      "from": "crib-hood",
      "to": "code-crib",
      "kind": "semantic",
      "weight": 0.6,
      "evidence": "visualizes RAG knowledge stash from code-crib"
    }
  ]
}
```

규칙:

- 노드 `id`는 모듈명(고유). 충돌 시 `path`로 disambiguate.
- 엣지는 directional이지만 렌더링 단계에서 양방향으로 그릴 수 있음.
- 동일 (from, to, kind) 조합은 1개로 dedupe (weight max 채택).
- (from, to) 같고 kind 다르면 별도 엣지 2개로 유지 (구조/의미는 다른 사실).
- `kind: "activity"`는 V1에서 빌드 시점에는 생성하지 않는다. 활동 레이어는 클라이언트 런타임에서 walk trail ring buffer를 사용해 합성한다 (아래 *Activity Layer Synthesis* 참고).

### SSE 이벤트 추가

기존 채널(`GET /events`)에 다음 이벤트 type을 추가한다.

```jsonc
{ "type": "graph-rebuilt", "source": "hybrid", "ts": 1777255838 }

{ "type": "agent-on-module",
  "agent": "executor",                  // OMC role
  "character": "🐹",                    // characters.js 매핑 결과
  "module": "crib-hood",                // node.id
  "taskId": "babde8f0-...",
  "since": 1777255838 }

{ "type": "agent-left-module",
  "agent": "executor",
  "module": "crib-hood",
  "ts": 1777255900 }
```

기존 `state-snapshot` 이벤트는 그대로 유지(상태 부트스트랩용).

### 활동 히스토리 (클라이언트만)

Walk Trail용 메모리 버퍼. 서버 영속화 X.

```js
// per-agent ring buffer in browser
{ "executor": [
    { module: "code-crib", at: 1777255800 },
    { module: "crib-hood", at: 1777255838 },
    ...up to N=5
]}
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Dashboard HTML (Map view) |
| GET | `/health` | 기존 (변경 없음) |
| GET | `/api/state` | 기존 (변경 없음) |
| GET | `/api/graph` | 현재 graph.json 반환. 없으면 `{ "exists": false }` |
| POST | `/api/graph/rebuild` | build-map 명령이 호출. 빌드 성공 시 SSE `graph-rebuilt` 브로드캐스트 |
| GET | `/events` | 기존 + agent-on-module / agent-left-module / graph-rebuilt 이벤트 |
| GET | `/*` | 기존 정적 파일 |

## Build Pipeline (`/crib-hood:build-map`)

```
1. resolve repoRoot (cwd or --repo flag)
2. compute repoHash; ensure ~/.claude/crib-hood/<repoHash>/ exists
3. detect code-crib stash for repoHash
   ├ present → run code-crib-source.js
   │   for each module dir:
   │     load chroma docs for that dir
   │     LLM call (single shot per module): "extract entities + relations"
   │     parse JSON response into nodes + semantic edges
   └ absent → skip
4. always run ast-source.js (skeleton)
   for each plugins/*/ (or src/* etc):
     parse imports via regex (V1, no tree-sitter dependency)
     emit module node + structural edges (count-based weight)
5. merge.js
   - dedupe nodes by id, prefer code-crib's summary if both have one
   - tag edges by kind, dedupe per (from,to,kind)
   - normalize weights to [0,1]
6. write graph.json (atomic: tmp + rename)
7. POST /api/graph/rebuild → server reloads + broadcasts SSE
```

LLM 호출 cap: 모듈 수만큼 (V1 기준 ~10회). 타임아웃 30s/호출, 실패 시 해당 모듈은 의미 엣지 없이 계속.

LLM 호출은 OMC 플러그인 런타임이 노출하는 Claude CLI 헬퍼(서브프로세스 invoke)를 사용한다. 별도 API 키 설정을 요구하지 않는다 (이미 Claude Code가 인증되어 있으므로). 각 호출은 모듈 docs를 컨텍스트로 넣고 `{ entities: [...], relations: [...] }` JSON을 강제하는 프롬프트를 사용한다.

AST 소스는 V1에서 tree-sitter를 도입하지 않고 정규식 기반 import 파싱(`require()`, `import ... from`)으로 시작한다. 정확도가 부족하면 V2에서 tree-sitter로 교체한다.

## Live Activity Mapping (server runtime)

`server/graph/activity-mapper.js`는 기존 watcher가 감지한 task 변경을 받아 모듈 매핑을 산출한다.

```
on task file change:
  parse task JSON
  pick path = task.currentFile || task.lastEdit?.path || task.workspaceFile
  if no path → skip
  module = findOwningModule(path):
    bestMatch = null; bestLen = -1
    for each node in graph.nodes:
      if path.startsWith(node.path) and node.path.length > bestLen:
        bestMatch = node.id; bestLen = node.path.length
    return bestMatch  // null = orphan
  prevModule = lastMappingFor(agent)
  if module !== prevModule:
    if prevModule → emit agent-left-module(prevModule)
    if module    → emit agent-on-module(module)
    update lastMappingFor(agent) = module
```

매핑 캐시는 인메모리 Map. 서버 재시작 시 SSE 첫 연결의 `state-snapshot`으로 재구축.

## Client Rendering

### Cytoscape 초기화 (server/public/map/map.js)

- `cy.layout({ name: 'cose', animate: true })` — force-directed
- 노드 스타일: 둥근 박스, 라벨은 모듈명, busy 상태(에이전트 1+ 존재)는 `border-color: #7fffaf` + glow
- 엣지 스타일: kind별 클래스
  - `.kind-structural` — solid, width = `2 + weight * 4`
  - `.kind-semantic` — dashed, color tint
  - `.kind-activity` — gradient, animated dash flow
- pan/zoom 활성화, fit-to-screen 초기 1회

### 동물 캐릭터 레이어 (animal-renderer.js)

Cytoscape DOM 위에 absolute 포지셔닝된 별도 div 컨테이너.

- 각 활성 에이전트 = `.creature` div, 이모지는 `characters.js`의 role→character 매핑
- 매 프레임 또는 cy 'render' 이벤트에 좌표 동기화:
  ```js
  const pos = cy.getElementById(module).renderedPosition();
  el.style.transform = `translate(${pos.x}px, ${pos.y - radius}px)`;
  ```
- Sit-on bob: CSS keyframe `translateY(0) ↔ translateY(-5px)` 2s
- 같은 모듈에 여러 에이전트: 각도 분산(360° / count)으로 노드 둘레에 배치

### Walk Trail (trail.js, 토글)

- 헤더 토글 칩 ON 시 활성화
- per-agent ring buffer(N=5) 사용
- `requestAnimationFrame` 기반 보간: 현재 모듈 → 다음 모듈로 1.5s 베지어
- 자취 점은 SVG circle, 30s 동안 opacity 1→0 페이드

### 레이어 토글 (map.js)

```js
function toggleLayer(kind, on) {
  cy.edges(`.kind-${kind}`).style('display', on ? 'element' : 'none');
}
```

기본값: 구조 ON, 의미 OFF (사용자가 켜야 GraphRAG 보임), 활동 OFF.

### Activity Layer Synthesis

활동 엣지는 graph.json에 저장하지 않고 클라이언트 메모리에서만 만든다.

- 입력: per-agent walk trail ring buffer (N=5 모듈 방문 히스토리)
- 합성 규칙: 인접 방문 페어 `(t-1, t)`마다 가상 엣지 `kind: "activity"` 1개 생성, 같은 페어가 반복되면 weight += 1
- 시간 감쇠: weight는 30s마다 0.8x로 곱해지며, 0.1 미만은 제거
- 렌더: 활동 레이어 토글 ON일 때만 Cytoscape에 add. 다른 kind 엣지와 시각적으로 구분 (`.kind-activity` gradient + animated dash)
- 활동 엣지는 페이지 새로고침 시 사라짐 (V2에서 영속화 후보)

## Commands

### `/crib-hood:build-map`

```
$ /crib-hood:build-map [--repo PATH] [--no-llm]
```

- `--repo PATH` — 대상 리포 (기본: cwd)
- `--no-llm` — code-crib 스태시 무시, AST 구조 그래프만 생성

동작:

1. 명령 실행 디렉토리에서 plugin runtime 헬퍼로 build-map 스크립트 호출
2. 진행 로그 출력 (모듈 수, 의미 엣지 수, 구조 엣지 수)
3. `~/.claude/crib-hood/<repoHash>/graph.json` 결과 경로 출력
4. 서버가 떠 있으면 `POST /api/graph/rebuild`로 알림, 없으면 다음 dashboard 시작 시 자동 로드

### `/crib-hood` (변경)

기존: 서버 시작 + 브라우저 열기.
변경: 동일하지만 진입 화면이 Map view. graph.json이 없으면 빈 상태 + "Build the map" CTA 버튼이 `/crib-hood:build-map`을 안내.

## Error Handling

| 상황 | 동작 |
|---|---|
| graph.json 없음 | 빈 상태 화면 + "Build the map" CTA, `/crib-hood:build-map` 실행 안내 |
| code-crib 스태시 없음 | AST-only 모드 배너 ("의미 엣지 비활성"), 빌드 계속 진행 |
| 소스 파일 0개 | "No source files found at <repoRoot>" 빈 상태 |
| LLM 호출 실패 (일부 모듈) | partial graph + 토스트 경고, 실패 모듈은 의미 엣지 누락으로 계속 |
| LLM 호출 전체 실패 | source: "ast"로 fallback 저장, 사용자에게 경고 |
| 빌드 도중 사용자 cancel | 임시 파일 unlink, 이전 graph.json 유지, "Build cancelled" 메시지 |
| `/api/graph/rebuild` 실패 | 500 응답 + 서버 stderr 로그, dashboard는 캐시된 graph 유지 |
| SSE disconnect | 기존 reconnect 로직 그대로 |
| agent path가 어느 모듈에도 매칭 안됨 | 조용히 ignore (orphan), 동물 안 그림 |
| 동일 agent가 두 모듈에 동시 존재 | 마지막 이벤트 승, 이전 모듈에서 left 이벤트 emit |
| graph.json 손상(JSON 파싱 실패) | 빈 상태로 폴백, stderr 로그, 사용자에게 rebuild 권장 |

## Testing Strategy

### Unit

- `code-crib-source.js` — 픽스처 chroma 응답 → 기대 노드/엣지 shape (LLM은 mock)
- `ast-source.js` — 픽스처 plugin tree → 기대 import 엣지 set
- `merge.js` — 같은 id 노드 합치기, kind 충돌 시 dedupe, weight normalize
- `activity-mapper.js` — longest-prefix 매칭, orphan, agent 이동 시 left+on 페어

### Integration

- `graph/builder.js` 전체 — 픽스처 리포 + mock LLM → 기대 graph.json 생성
- 서버 띄우고 `GET /api/graph`(없을 때 / 있을 때), `POST /api/graph/rebuild`, `/events` 이벤트 시퀀스
- task 파일 모킹으로 `agent-on-module` 이벤트 발화 검증

### E2E (수동 smoke)

1. 이 리포에서 `/code-crib:analyze` 실행 (전제 조건)
2. `/crib-hood:build-map` → 출력에 9개 모듈 노드, ≥1개 의미 엣지
3. `/crib-hood` → 브라우저에서 force layout 노드 9개 보임
4. 별도 세션에서 에이전트 작업 → 해당 모듈에 동물 등장, 모듈 이동 시 부드럽게 따라감
5. 헤더 칩으로 "의미" 토글 → 점선 엣지 등장/사라짐
6. "활동" 토글 → 빈도 높은 엣지 강조
7. Walk Trail 토글 → 동물이 자취 따라 이동
8. graph.json 삭제 후 새로고침 → 빈 상태 + CTA 노출 확인

## Open Items (deferred to V2)

- Tree-sitter AST 정확도 업그레이드 (정규식 fallback 한계 시).
- 코드 변경 watcher → 자동 graph rebuild 디바운스.
- 파일 단위 드릴다운 (모듈 클릭 → 내부 파일 그래프 확장).
- 멀티 리포 / 멀티 워크트리 동시 표시.
- Activity 히스토리 영속화 (서버 재시작 후 trail 복원).
- code-crib 외부 GraphRAG 라이브러리 백엔드 swap.
