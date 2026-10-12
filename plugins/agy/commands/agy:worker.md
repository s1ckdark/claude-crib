---
name: agy:worker
description: Launch Antigravity as a long-running tmux worker for complex autonomous tasks
argument-hint: "<task-description>" [--stop] [--status]
allowed-tools: Bash, Read
---

<!--
Usage:
  /agy:worker "Fix all failing tests and update snapshots"
  /agy:worker --stop           # Stop active worker
  /agy:worker --status         # Check worker status
-->

# Antigravity Worker

Task: $ARGUMENTS

## Instructions

1. **Load Config**
   Read `~/.claude/agy.local.md` (없으면 기존 `~/.claude/gemini.local.md` 값 사용). Defaults:
   - agy_path: `agy`
   - worker_session_prefix: `agy-worker`

2. **Pre-flight Checks**
   ```bash
   which agy || echo "NOT_FOUND: agy"
   which tmux || echo "NOT_FOUND: tmux"
   ```
   If either missing, show install instructions and stop.

3. **Parse Arguments**
   - `--stop`: Kill active worker session(s)
   - `--status`: Show current worker session output
   - Otherwise: Task description text

4. **Handle --stop**
   ```bash
   tmux ls 2>/dev/null | grep "agy-worker"
   ```
   If sessions found, kill them:
   ```bash
   tmux kill-session -t {session_name}
   ```
   If none found: "No active Antigravity worker sessions."

5. **Handle --status**
   ```bash
   tmux ls 2>/dev/null | grep "agy-worker"
   tmux capture-pane -t {session_name} -p -S -30
   ```
   Show recent output from active session.

6. **Start Worker**
   ```bash
   SESSION="agy-worker-$(date +%Y%m%d-%H%M%S)"
   tmux new-session -d -s "$SESSION"
   tmux send-keys -t "$SESSION" 'agy' Enter
   sleep 3
   tmux send-keys -t "$SESSION" '{task_description}' Enter
   ```

7. **Monitor and Report**
   Poll every 10 seconds with `tmux capture-pane`.
   Detect completion when:
   - Last line matches `^[❯>]\s*$` (prompt returned)
   - OR output unchanged for 2 consecutive checks

8. **On Completion**
   Capture full output, present results, kill session.

## Error Handling

- tmux missing: "Install tmux: `brew install tmux`"
- Antigravity missing: Direct to `/agy:setup`
- Session conflict: Show existing sessions, ask user to --stop first or create parallel
