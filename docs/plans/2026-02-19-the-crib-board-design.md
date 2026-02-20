# The Crib Board - Agent Dashboard Plugin Design

**Date**: 2026-02-19
**Plugin**: the-crib-board
**Status**: Approved

## Overview

OMC 에이전트의 상태를 실시간으로 시각화하는 대시보드 플러그인. 각 에이전트를 개성 있는 동물 캐릭터로 표현하고, 상태에 따라 CSS 애니메이션으로 생동감을 부여한다.

## Key Decisions

| 항목 | 결정 |
|------|------|
| 렌더링 방식 | 하이브리드 (터미널 요약 + 브라우저 대시보드) |
| 데이터 소스 | OMC State + Team API |
| 기술 스택 | Vanilla HTML/CSS/JS + SSE (빌드 없음) |
| 에이전트 상태 | 5상태: working, pending, idle, completed, error |
| 플러그인 이름 | the-crib-board |

## Architecture

```
.omc/state/*.json ──fs.watch──▶ Node.js Server ──SSE──▶ Browser Dashboard
                                     │
                                     ├── GET /api/state (초기 로드)
                                     ├── GET /events (SSE 스트림)
                                     └── Static files (HTML/CSS/JS)

터미널 커맨드 ──state_read──▶ ANSI formatted summary
```

## Agent Character Mapping

| Agent | Character | Concept |
|-------|-----------|---------|
| executor | 🐹 Hamster | Runs on wheel, tireless worker |
| explorer | 🐕 Detective Dog | Sniffs through codebase |
| planner | 🦉 Owl | Wise strategist |
| architect | 🦫 Beaver | Builds structures |
| verifier | 🦅 Hawk | Sharp-eyed inspector |
| debugger | 🐛 Ladybug | Eats bugs |
| reviewer | 🐱 Cat | Picky code critic |
| writer | 🐙 Octopus | Multi-armed documenter |
| scientist | 🐀 Lab Mouse | Data researcher |
| designer | 🦊 Fox | Aesthetic sense |
| test-engineer | 🐢 Turtle | Slow but thorough |
| security-reviewer | 🦔 Hedgehog | Defends with spikes |
| build-fixer | 🐜 Ant | Diligent fixer |
| git-master | 🐈‍⬛ Black Cat | History wizard |
| critic | 🦜 Parrot | Sharp opinions |
| dependency-expert | 🐿️ Squirrel | Package collector |

## State Animations

| State | Animation | Character Behavior |
|-------|-----------|-------------------|
| working | active motion | Character-specific action (hamster wheel, dog sniffing, etc.) |
| pending | gentle stretch/yawn | Character stretching or yawning |
| idle | sleeping (Zzz) | Character dozing with Zzz bubbles |
| completed | celebration | Character jumping or dancing |
| error | panic | Character sweating and shaking |

## Browser Dashboard Layout

```
┌─────────────────────────────────────────────────┐
│  🏠 The Crib Board          ● Live    12:34:56  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ 🐹 spin  │ │ 🦉 yawn  │ │ 🐕 Zzz  │        │
│  │ executor │ │ planner  │ │ explorer │        │
│  │ working  │ │ pending  │ │  idle    │        │
│  │ Task #3  │ │          │ │          │        │
│  └──────────┘ └──────────┘ └──────────┘        │
│                                                 │
│  ┌──────────┐ ┌──────────┐                      │
│  │ 🦅 jump  │ │ 🐜 shake │                      │
│  │ verifier │ │ builder  │                      │
│  │completed │ │  error   │                      │
│  └──────────┘ └──────────┘                      │
│                                                 │
├─────────────────────────────────────────────────┤
│  Working: 1  Pending: 1  Idle: 1               │
│  Completed: 1  Error: 1       Total: 5         │
└─────────────────────────────────────────────────┘
```

## Terminal Output

```
🏠 The Crib Board
━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐹 executor   working   Task #3
🦉 planner    pending
🐕 explorer   idle
🦅 verifier   completed
🐜 builder    error     Exit: 1
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Working: 1 | Pending: 1 | Idle: 1 | Done: 1 | Error: 1
```

## Plugin Structure

```
plugins/the-crib-board/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── crib-board.md          # /crib-board - 브라우저 대시보드 실행
│   └── crib-board-status.md   # /crib-board-status - 터미널 상태 요약
├── skills/
│   └── crib-board.md          # 스킬 트리거
├── server/
│   ├── index.js               # Node.js SSE 서버 (포트 4567)
│   ├── watcher.js             # .omc/state 파일 감시
│   └── public/
│       ├── index.html         # 대시보드 HTML
│       ├── style.css          # 애니메이션 포함 스타일
│       ├── characters.js      # 캐릭터 SVG 정의
│       └── app.js             # SSE 클라이언트 + DOM 업데이트
└── README.md
```

## Data Flow

1. `/crib-board` 커맨드 실행 → Node.js 서버 시작 (포트 4567)
2. 서버가 `.omc/state/` 디렉토리를 `fs.watch`로 감시
3. 브라우저 자동 오픈 → `localhost:4567`
4. 초기 상태를 `/api/state`에서 로드
5. 이후 변경은 `/events` SSE 스트림으로 실시간 수신
6. 각 에이전트 카드가 상태에 맞는 CSS 애니메이션으로 전환

## Technical Notes

- 외부 의존성 없음 (Node.js 내장 모듈만 사용)
- 캐릭터는 인라인 SVG로 구현 (외부 이미지 불필요)
- CSS `@keyframes`로 모든 애니메이션 처리
- SSE 자동 재연결 내장
- 다크 모드 지원
