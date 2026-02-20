---
name: crib-hood-status
description: Show agent dashboard status in terminal
---

Read the current OMC agent state and display a formatted terminal summary.

## Steps

1. Read the active OMC state using `state_read` for each mode (autopilot, team, ultrawork, ralph, swarm, ultrapilot, pipeline, ecomode, ultraqa).
2. Read the current task list using `TaskList` if available.
3. Format the output as:

```
🏠 The Crib Hood
━━━━━━━━━━━━━━━━━━━━━━━━━━━
[emoji] [agent-name]   [status]   [task-info]
...
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Working: N | Pending: N | Idle: N | Done: N | Error: N
```

## Character Emoji Mapping

Use these emojis for each agent role:
- executor → 🐹
- explorer → 🐕
- planner → 🦉
- architect → 🦫
- verifier → 🦅
- debugger → 🐛
- reviewer → 🐱
- writer → 🐙
- scientist → 🐀
- designer → 🦊
- test-engineer → 🐢
- security-reviewer → 🦔
- build-fixer → 🐜
- git-master → 🐈‍⬛
- critic → 🦜
- dependency-expert → 🐿️
- default/unknown → 🤖

## Status Display

- working → green text with task description
- pending → yellow text
- idle → gray text
- completed → cyan text with checkmark
- error → red text with error info
