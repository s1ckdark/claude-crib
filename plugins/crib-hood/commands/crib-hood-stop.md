---
name: crib-hood-stop
description: Stop the running Crib Hood orchestrator and shut down all agents
allowed-tools: Bash, Read, TaskList, TaskUpdate, SendMessage, TeamDelete
---

# Crib Hood — Stop Orchestrator

## Instructions

1. **Find Active Team**
   Read ~/.claude/teams/ to find any team starting with "crib-hood-":
   ```bash
   ls ~/.claude/teams/ | grep "^crib-hood-"
   ```

2. **Check Running Tasks**
   Use TaskList to see current task statuses.
   Report how many tasks are in_progress, pending, and completed.

3. **Confirm with User**
   If there are in_progress tasks, warn:
   "⚠️ There are N tasks still in progress. Stopping will cancel them."

4. **Shutdown Agents**
   For each team member found in the team config:
   - SendMessage type: shutdown_request

5. **Cleanup**
   - Mark all pending/in_progress tasks as completed (or leave as-is)
   - TeamDelete the crib-hood team
   - Optionally kill the dashboard server:
     ```bash
     kill $(lsof -ti:4567) 2>/dev/null
     ```

6. **Report**
   ```
   🏠 Crib Hood — Stopped
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Tasks completed: N
   Tasks cancelled: N
   Agents shut down: N
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```
