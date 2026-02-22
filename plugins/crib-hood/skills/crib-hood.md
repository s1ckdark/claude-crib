---
name: crib-hood
description: Launch the Crib Hood agent dashboard or orchestrator. Use when user mentions "dashboard", "agent board", "crib hood", "crib board", "agent status", "show agents", "agent dashboard", "에이전트 대시보드", "에이전트 상태", "팀 만들어줘", "에이전트 배정", "run team", "팀 실행", "자동으로 해줘", "orchestrate".
---

The Crib Hood is an agent visualization dashboard AND autonomous orchestrator.

## Dashboard (visualization)

### Browser dashboard:
Run the `/crib-hood` command to start the server and open the dashboard.

### Terminal summary:
Run the `/crib-hood:status` command to display agent states in the terminal.

## Orchestrator (autonomous execution)

### Run orchestrator:
When the user wants to execute a task with an auto-assembled agent team:
Run the `/crib-hood:run` command with their request description.

Examples:
- "로그인 페이지 만들어줘" → `/crib-hood:run "로그인 페이지 만들어줘"`
- "에이전트 팀으로 이거 처리해줘" → `/crib-hood:run "<task>"`
- "팀 만들어서 해줘" → `/crib-hood:run "<task>"`

### Stop orchestrator:
Run the `/crib-hood:stop` command to gracefully shut down a running team.

## Available agent characters:
Each OMC agent role has a unique animal character:
🐹 executor, 🐕 explorer, 🦉 planner, 🦫 architect, 🦅 verifier,
🐛 debugger, 🐱 reviewer, 🐙 writer, 🐀 scientist, 🦊 designer,
🐢 test-engineer, 🦔 security-reviewer, 🐜 build-fixer, 🐈‍⬛ git-master,
🦜 critic, 🐿️ dependency-expert

## Agent states shown:
- **working** — character actively animating (spin/bounce)
- **pending** — character yawning/stretching (gentle pulse)
- **idle** — character sleeping with Zzz (floating)
- **completed** — character celebrating (pop bounce)
- **error** — character panicking (shake + red glow)
