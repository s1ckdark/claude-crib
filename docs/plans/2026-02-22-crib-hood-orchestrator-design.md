# Crib Hood Orchestrator Design

## Overview

Extend crib-hood from a passive agent dashboard into an autonomous orchestrator that:
1. Analyzes user requests and decomposes them into tasks
2. Automatically assigns appropriate agents based on task type
3. Monitors execution with automatic intervention on failures

## Architecture

```
User: "로그인 페이지 만들어줘"
  ↓
/crib-hood:run (entry command)
  ↓ spawns via Task tool
crib-hood-coordinator (agent)
  ├── Phase 1: Request Analysis + Task Decomposition
  │   └── TaskCreate × N
  ├── Phase 2: Agent Matching + Team Creation
  │   ├── TeamCreate("crib-hood-{timestamp}")
  │   └── Task tool spawns worker agents
  ├── Phase 3: Monitoring Loop
  │   ├── TaskList status checks
  │   ├── Failure detection → reassignment / debugger
  │   └── Bottleneck detection → spawn additional agents
  └── Phase 4: Completion + Cleanup
      ├── Result aggregation + report
      ├── SendMessage(shutdown_request) × N
      └── TeamDelete
```

### Key Properties

- **Independent of OMC**: Works without oh-my-claudecode installed
- **Uses Claude Code native Team API**: TeamCreate, TaskCreate, SendMessage, etc.
- **Dashboard auto-syncs**: Existing crib-hood dashboard visualizes team state via SSE

## Agent Role Matching

| Task Keywords | Assigned Agents |
|---------------|----------------|
| UI, page, component, design | executor + designer |
| API, backend, server | executor |
| test, validation | test-engineer |
| bug, error, debug | debugger |
| refactor, architecture | architect + executor |
| security, auth | security-reviewer + executor |
| build, deploy | build-fixer |
| docs, README | writer |

## Monitoring Loop

```
while (pending/in_progress tasks exist) {
  1. TaskList → check all task statuses
  2. Per-task evaluation:
     - completed → check next unblocked tasks, assign if needed
     - in_progress → timeout check (stuck if idle 3+ times with incomplete task)
     - failed/error → trigger auto-intervention
  3. Wait for teammate messages (completion/failure reports)
}
```

## Auto-Intervention Scenarios

| Situation | Detection | Action |
|-----------|-----------|--------|
| Task failure | Agent reports error | 1st: retry same agent. 2nd: spawn debugger |
| Agent stuck | 3 consecutive idle messages + incomplete task | SendMessage status check, replace if no response |
| Dependency block | blockedBy task stalled | Prioritize blocking task, add agents if needed |
| All tasks done | No pending/in_progress in TaskList | Spawn verifier → full validation → report |

## Interface

### New Components

**Command: `/crib-hood:run`**
- Entry point. Receives user request, spawns coordinator agent
- Arguments: `"<description>"` with optional `--max-agents N`

**Command: `/crib-hood:stop`**
- Graceful shutdown of running team
- Sends stop request to coordinator

**Agent: `crib-hood-coordinator`**
- Core orchestration logic
- Tools: Bash, Read, Write, Grep, Glob, Task, TeamCreate, TeamDelete, SendMessage, TaskCreate, TaskList, TaskGet, TaskUpdate, AskUserQuestion
- Autonomous operation with optional user confirmation for critical decisions

### Updated Components

**Skill: `crib-hood.md`**
- Add orchestration trigger keywords: "팀 만들어줘", "에이전트 배정", "run team"

### File Structure

```
plugins/crib-hood/
├── agents/
│   └── crib-hood-coordinator.md   ← NEW
├── commands/
│   ├── crib-hood.md               (existing: dashboard launch)
│   ├── crib-hood-status.md        (existing: terminal status)
│   ├── crib-hood-run.md           ← NEW
│   └── crib-hood-stop.md          ← NEW
├── server/                        (existing: dashboard server)
└── skills/
    └── crib-hood.md               (updated: orchestration keywords)
```

## Final Report Format

```
🏠 Crib Hood — Mission Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tasks: 5/5 completed
Agents used: 3 (executor, designer, test-engineer)
Retries: 1 (Task #3 failed once, recovered)
Duration: ~4 min
━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
