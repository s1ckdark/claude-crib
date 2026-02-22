---
name: status
description: Show agent dashboard status in terminal
---

Read the current OMC agent state and agent team state, then display a formatted terminal summary.

## Steps

1. Read the active OMC state using `state_read` for each mode (autopilot, team, ultrawork, ralph, swarm, ultrapilot, pipeline, ecomode, ultraqa).
2. Read the current task list using `TaskList` if available.
3. Read team configs from `~/.claude/teams/*/config.json` to discover team members.
4. Format the output as:

```
🏠 The Crib Hood
━━━━━━━━━━━━━━━━━━━━━━━━━━━

[If teams exist, group by team:]

── Team: [team-name] ──────
[emoji] [agent-name]   [status]   [task-info]
...

── OMC Workflow ───────────
[emoji] [agent-name]   [status]   [task-info]
...

[If no teams, flat list:]
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
- v0-generator → 🔵
- gemini-generator → 🟢
- zai-generator → 🔴
- default/unknown → 🤖

## Status Display

- working → green text with task description
- pending → yellow text
- idle → gray text
- completed → cyan text with checkmark
- error → red text with error info
