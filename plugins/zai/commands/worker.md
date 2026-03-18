---
name: worker
description: Launch Z.AI as a long-running tmux worker for complex autonomous tasks
argument-hint: "<task-description>" [--stop] [--status]
user_invocable: true
allowed_tools:
  - Bash
  - Read
---

<!--
Usage:
  /zai:worker "Analyze all API endpoints for security issues"
  /zai:worker --stop           # Stop active worker
  /zai:worker --status         # Check worker status
-->

# Z.AI Worker

Task: $ARGUMENTS

## Instructions

1. **Pre-flight Checks**
   ```bash
   which tmux || echo "NOT_FOUND: tmux"
   [ -n "$Z_AI_API_KEY" ] && echo "API_KEY: Set" || echo "API_KEY: NOT SET"
   ```
   If tmux missing, show: "Install tmux: `brew install tmux`"
   If API key missing, show: "Run `/zai:setup` to configure."

2. **Parse Arguments**
   - `--stop`: Kill active worker session(s)
   - `--status`: Show current worker session output
   - Otherwise: Task description text

3. **Handle --stop**
   ```bash
   tmux ls 2>/dev/null | grep "zai-worker"
   ```
   If sessions found, kill them:
   ```bash
   tmux kill-session -t {session_name}
   ```
   If none found: "No active Z.AI worker sessions."

4. **Handle --status**
   ```bash
   tmux ls 2>/dev/null | grep "zai-worker"
   tmux capture-pane -t {session_name} -p -S -30
   ```
   Show recent output from active session.

5. **Start Worker**
   Create a worker script that loops through the task using Z.AI API:
   ```bash
   SESSION="zai-worker-$(date +%Y%m%d-%H%M%S)"
   tmux new-session -d -s "$SESSION"
   ```

   Send a curl-based loop that:
   - Calls Z.AI API with the task description
   - Streams output to the tmux pane
   ```bash
   tmux send-keys -t "$SESSION" 'curl -s -X POST "https://api.z.ai/api/coding/paas/v4/chat/completions" -H "Content-Type: application/json" -H "Authorization: Bearer $Z_AI_API_KEY" -d '"'"'{"model":"glm-5-turbo","messages":[{"role":"user","content":"{task_description}"}],"max_tokens":4096}'"'"' | python3 -m json.tool' Enter
   ```

6. **Monitor and Report**
   Poll every 10 seconds with `tmux capture-pane`.
   Detect completion when output stops changing for 2 consecutive checks.

7. **On Completion**
   Capture full output, present results to user.

## Error Handling

- tmux missing: "Install tmux: `brew install tmux`"
- API key missing: Direct to `/zai:setup`
- Session conflict: Show existing sessions, ask to --stop first
- Balance error: "Z.AI balance insufficient. Recharge at https://open.bigmodel.cn"
