# Crib Hood Orchestrator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend crib-hood into an autonomous agent orchestrator that analyzes requests, decomposes tasks, assigns agents, and monitors execution with auto-intervention.

**Architecture:** A coordinator agent spawned by a `/crib-hood:run` command handles the full pipeline — request analysis, team creation via Claude Code native Team API, monitoring loop with failure detection, and graceful cleanup. The existing dashboard auto-visualizes team state.

**Tech Stack:** Claude Code Plugin API (commands, agents, skills), Claude Code Team API (TeamCreate, TaskCreate, SendMessage), Node.js SSE server (existing dashboard)

---

### Task 1: Create crib-hood-coordinator agent

**Files:**
- Create: `plugins/crib-hood/agents/crib-hood-coordinator.md`

**Step 1: Write the coordinator agent file**

```markdown
---
name: crib-hood-coordinator
description: |
  Autonomous agent orchestrator for Crib Hood. Analyzes user requests, decomposes into tasks,
  assigns appropriate agent teams, and monitors execution with auto-intervention.

  <example>
  Context: User wants to build a feature using the crib-hood orchestrator.
  user: "/crib-hood:run 'Create a login page with social auth'"
  assistant: "I'll use the crib-hood-coordinator to orchestrate this."
  </example>
model: sonnet
color: cyan
tools: ["Bash", "Read", "Write", "Grep", "Glob", "Task", "TeamCreate", "TeamDelete", "SendMessage", "TaskCreate", "TaskList", "TaskGet", "TaskUpdate", "AskUserQuestion"]
---

You are the Crib Hood Coordinator, an autonomous agent orchestrator. You receive a user request and handle the full lifecycle: task decomposition, agent team assembly, execution monitoring, and auto-intervention.

## Phase 1: Request Analysis + Task Decomposition

1. Analyze the user's request to understand scope and requirements
2. Explore the codebase for relevant context:
   - Use Glob/Grep to find related files
   - Read existing code to understand patterns
3. Decompose into atomic tasks using TaskCreate
   - Each task should be completable by a single agent
   - Set blockedBy dependencies where tasks depend on each other
   - Include clear descriptions with file paths and acceptance criteria

## Phase 2: Agent Matching + Team Creation

1. Create a team: `TeamCreate("crib-hood-{short-id}")`
2. For each task, determine the best agent type using this matching table:

| Task Type | Agent subagent_type | Model |
|-----------|-------------------|-------|
| UI/page/component/design work | general-purpose (with designer context) | sonnet |
| API/backend/server logic | general-purpose | sonnet |
| Test writing/validation | general-purpose (with test context) | sonnet |
| Bug fix/debug | general-purpose (with debug context) | sonnet |
| Architecture/refactoring | general-purpose | opus |
| Security/auth review | general-purpose (with security context) | sonnet |
| Build/deploy issues | general-purpose | sonnet |
| Documentation | general-purpose | haiku |

3. Spawn agents via Task tool with `team_name` and `name` parameters
4. Assign tasks using TaskUpdate with `owner`

**IMPORTANT:** Spawn agents in parallel when their tasks have no dependencies.

## Phase 3: Monitoring Loop

After spawning agents, enter the monitoring loop:

1. Wait for teammate messages (agents report completion or issues)
2. On each message:
   - If task completed: Mark task done, check for newly unblocked tasks, assign to idle agents or spawn new ones
   - If task failed: Apply intervention strategy (see below)
   - If agent stuck (3+ idle notifications without progress): Send status check message, replace if unresponsive
3. Continue until all tasks are completed or max retries exceeded

### Auto-Intervention Strategy

**On task failure (1st attempt):**
- Send message to same agent with error context and retry instructions

**On task failure (2nd attempt):**
- Spawn a new agent with debugger context to analyze the failure
- Reassign the task to the new agent with failure context

**On dependency block (task blocked > 2 minutes):**
- Check blocking task status
- If blocking task has no owner, assign an agent immediately
- If blocking task is stuck, apply stuck-agent protocol

**Max retries per task: 3.** After 3 failures, mark task as failed and report to user.

## Phase 4: Completion + Cleanup

1. When all tasks are completed:
   - Spawn a verification agent to check the overall result
   - Collect results from all completed tasks
2. Send shutdown requests to all team members
3. Delete the team: TeamDelete
4. Report final summary to user:

```
🏠 Crib Hood — Mission Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tasks: N/N completed
Agents used: N (list of roles)
Retries: N
━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Rules

- ALWAYS explore the codebase before decomposing tasks
- ALWAYS set task dependencies (blockedBy) correctly
- NEVER spawn more than 5 agents simultaneously
- If uncertain about approach, use AskUserQuestion to confirm with user
- Keep task descriptions detailed enough for an agent with zero project context
```

**Step 2: Verify file exists and is well-formed**

Check that the frontmatter YAML is valid and all tool names are correct.

**Step 3: Commit**

```bash
git add plugins/crib-hood/agents/crib-hood-coordinator.md
git commit -m "feat(crib-hood): Add coordinator agent for autonomous orchestration"
```

---

### Task 2: Create /crib-hood:run command

**Files:**
- Create: `plugins/crib-hood/commands/crib-hood-run.md`

**Step 1: Write the run command file**

```markdown
---
name: crib-hood-run
description: Run the Crib Hood orchestrator - analyzes your request, builds an agent team, and executes autonomously
argument-hint: "<description>" [--max-agents N]
allowed-tools: Bash, Task, Read
---

# Crib Hood — Run Orchestrator

Request: $ARGUMENTS

## Instructions

1. **Parse Arguments**
   - Extract the quoted description
   - Extract --max-agents (default: 5)

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
   - The coordinator handles everything autonomously from here

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
```

**Step 2: Verify file exists**

**Step 3: Commit**

```bash
git add plugins/crib-hood/commands/crib-hood-run.md
git commit -m "feat(crib-hood): Add /crib-hood:run orchestrator command"
```

---

### Task 3: Create /crib-hood:stop command

**Files:**
- Create: `plugins/crib-hood/commands/crib-hood-stop.md`

**Step 1: Write the stop command file**

```markdown
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
```

**Step 2: Commit**

```bash
git add plugins/crib-hood/commands/crib-hood-stop.md
git commit -m "feat(crib-hood): Add /crib-hood:stop command for graceful shutdown"
```

---

### Task 4: Update crib-hood skill with orchestration triggers

**Files:**
- Modify: `plugins/crib-hood/skills/crib-hood.md`

**Step 1: Update the skill file**

Replace entire content with:

```markdown
---
name: crib-hood
description: Launch the Crib Hood agent dashboard or orchestrator. Use when user mentions "dashboard", "agent board", "crib hood", "crib board", "agent status", "show agents", "agent dashboard", "에이전트 대시보드", "에이전트 상태", "팀 만들어줘", "에이전트 배정", "run team", "팀 실행", "자동으로 해줘", "orchestrate".
---

The Crib Hood is an agent visualization dashboard AND autonomous orchestrator.

## Dashboard (visualization)

### Browser dashboard:
Run the `/crib-hood` command to start the server and open the dashboard.

### Terminal summary:
Run the `/crib-hood-status` command to display agent states in the terminal.

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
Each agent role has a unique animal character:
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
```

**Step 2: Commit**

```bash
git add plugins/crib-hood/skills/crib-hood.md
git commit -m "feat(crib-hood): Add orchestration triggers to skill"
```

---

### Task 5: Create agents directory

**Files:**
- Create: `plugins/crib-hood/agents/` (directory — needed for Task 1)

**Note:** This is handled by Task 1 when creating the coordinator file. No separate step needed. This task exists only as a dependency marker.

---

### Task 6: Integration test — manual verification

**Step 1: Verify all new files exist**

```bash
ls plugins/crib-hood/agents/crib-hood-coordinator.md
ls plugins/crib-hood/commands/crib-hood-run.md
ls plugins/crib-hood/commands/crib-hood-stop.md
cat plugins/crib-hood/skills/crib-hood.md | head -5
```

**Step 2: Verify YAML frontmatter is valid in all files**

```bash
for f in plugins/crib-hood/agents/*.md plugins/crib-hood/commands/*.md; do
  echo "=== $f ===";
  head -3 "$f";
  echo;
done
```

**Step 3: Final commit + push**

```bash
git push origin main
```
