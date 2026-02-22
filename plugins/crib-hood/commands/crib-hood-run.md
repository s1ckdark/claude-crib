---
name: run
description: Run the Crib Hood orchestrator - analyzes your request, builds an agent team, and executes autonomously
argument-hint: "<description>" [--max-agents N]
---

# Crib Hood — Run Orchestrator

Request: $ARGUMENTS

## Instructions

1. **Parse Arguments**
   - Extract the quoted description from $ARGUMENTS
   - Extract --max-agents N if present (default: 5)

2. **Launch Dashboard (optional)**
   Check if the dashboard server is already running:
   ```bash
   lsof -ti:4567 >/dev/null 2>&1 && echo "running" || echo "not running"
   ```
   If not running, start it in background:
   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/server/index.js &
   sleep 1
   ```

3. **Spawn Coordinator**
   Use the Task tool to spawn the crib-hood-coordinator agent:
   - subagent_type: `crib-hood:crib-hood-coordinator`
   - prompt: Include the user's request description and max-agents limit

   The coordinator handles everything autonomously from here.

4. **Report to User**
   ```
   🏠 Crib Hood Orchestrator launched!
   📡 Dashboard: http://localhost:4567
   🤖 Coordinator is analyzing your request...

   The coordinator will:
   1. Analyze and decompose your request
   2. Assemble an agent team
   3. Monitor execution and handle failures
   4. Report results when complete
   ```
