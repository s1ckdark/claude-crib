---
name: crib-hood
description: Launch or check the Crib Hood agent dashboard. Use when user mentions "dashboard", "agent board", "crib hood", "crib board", "agent status", "show agents", "agent dashboard", "에이전트 대시보드", "에이전트 상태".
---

The Crib Hood is an agent visualization dashboard that shows OMC agent states with animated animal characters.

## When the user wants the browser dashboard:
Run the `/crib-hood` command to start the server and open the dashboard.

## When the user wants a quick terminal summary:
Run the `/crib-hood-status` command to display agent states in the terminal.

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
