# crib-hood

A real-time agent dashboard for oh-my-claudecode (OMC). Visualizes active agent teams, task states, and workflow modes with animated animal characters in your browser.

## What It Does

crib-hood now renders a force-directed module graph for your codebase ("Crib Hood Map") and overlays live OMC agent characters on top — animals "sit on" the module they are currently working in. Edges come from two sources: a regex-based AST scan of `<repo>/plugins/*/` (structural) and the optional code-crib stash (semantic, via Claude). A layer toggle bar lets you switch structural / semantic / activity edges on or off independently.

It also ships a full autonomous orchestrator (the Crib Hood Coordinator) that can receive a plain-language task description, decompose it into atomic sub-tasks, assemble a team of specialized agents, monitor execution, handle failures, and report results.

## Commands

### `/crib-hood:crib-hood`

Launch the dashboard server and open it in the browser.

```
/crib-hood:crib-hood
```

Starts the server on port 4567 (configurable via `CRIB_HOOD_PORT`) and opens `http://localhost:4567`.

---

### `/crib-hood:build-map`

Build the GraphRAG module graph for the current repo.

```
/crib-hood:build-map [--repo PATH] [--no-llm]
```

- `--repo PATH` — target repo (default: current directory)
- `--no-llm` — skip code-crib semantic extraction; AST structural edges only

Writes `~/.claude/crib-hood/<repoHash>/graph.json`. If the dashboard server is running, it picks up the rebuild automatically. Run this once before opening the dashboard, and again whenever the codebase changes substantially.

---

### `/crib-hood:run <description> [--max-agents N]`

Run the full autonomous orchestrator against a task description.

```
/crib-hood:run "Add a login page with email and password fields" --max-agents 4
```

- `<description>` — what you want built or done (required)
- `--max-agents N` — cap on simultaneous agents (default: 5)

The command starts the dashboard server if it is not already running, then spawns the Crib Hood Coordinator agent. The coordinator handles the full lifecycle: exploration, task decomposition, agent team assembly, execution monitoring, and cleanup.

---

### `/crib-hood:status`

Print a formatted agent status summary in the terminal without opening the browser.

```
/crib-hood:status
```

Output groups agents by team and shows role, status, and current task. Summary line counts agents by state.

---

### `/crib-hood:stop`

Stop the running orchestrator and shut down all agents.

```
/crib-hood:stop
```

Finds any active `crib-hood-*` team, reports in-progress tasks, sends shutdown requests to each agent, cleans up the team, and optionally kills the dashboard server process.

## Dashboard

Open `http://localhost:4567` after starting the server. The dashboard shows:

- Each active agent as an animated animal character
- Status indicated by animation state (working, idle, completed, error)
- Task name shown below the character
- Team grouping
- Active OMC workflow mode (autopilot, ralph, team, etc.)

The browser connects to `GET /events` and receives a live stream. No polling. Updates arrive within 300 ms of a state file change.

## Map View

The dashboard opens directly into the Crib Hood Map. Layout:

- **Header bar** — title, mode/module/agent counts, source badge (`AST-only` / `Hybrid` / `code-crib`), layer toggle pills.
- **Map stage** — Cytoscape force-directed graph of module nodes with structural / semantic / activity edges.
- **Animal overlay** — DOM characters that sit on the module each agent is currently working in.

### Layer Toggle Pills

| Pill | What it shows |
|------|---------------|
| 구조 | Structural edges (AST imports). On by default. |
| 의미 | Semantic edges (LLM-extracted from code-crib docs). Off by default. |
| 활동 | Activity edges synthesized from recent agent module visits. Off by default. |
| 자취 | Walk Trail toggle — when on, animals walk between recent modules and a virtual activity edge graph forms. |

### Empty State

If `graph.json` has not been built yet, the Map area shows a "Build the map first" message and the `/crib-hood:build-map` command as a hint.

## Agent Role Characters

| Role | Character |
|------|-----------|
| executor | hamster |
| explorer | dog |
| planner | owl |
| architect | beaver |
| verifier | eagle |
| debugger | bug |
| reviewer | cat |
| writer | octopus |
| scientist | rat |
| designer | fox |
| test-engineer | turtle |
| security-reviewer | hedgehog |
| build-fixer | ant |
| git-master | black cat |
| critic | parrot |
| dependency-expert | squirrel |
| default / unknown | robot |

## Architecture

```
plugins/crib-hood/
  server/
    index.js        — Node.js HTTP + SSE server
    graph/                 — graph builder + sources
      builder.js
      ast-source.js
      code-crib-source.js
      merge.js
      activity-mapper.js
    public/
      index.html    — Dashboard shell
      app.js        — Frontend state management and rendering
      style.css     — Layout and animations
      characters.js — Animal character definitions and emoji map
      map/                 — map view (Cytoscape + animal overlay + walk trail)
        map.js
        map.css
        animal-renderer.js
        trail.js
  commands/
    crib-hood.md    — Launch dashboard command
    run.md          — Orchestrator run command
    status.md       — Terminal status command
    stop.md         — Stop orchestrator command
  agents/
    coordinator.md  — Crib Hood Coordinator agent definition
  skills/
    (reserved)
  scripts/
    build-map.js           — CLI entry for /crib-hood:build-map
  tests/                   — node --test suites + fixtures
  .claude-plugin/
    plugin.json     — Plugin manifest
```

The server watches three locations for changes:

- `.omc/state/` in the project worktree — OMC workflow mode state files
- `~/.claude/tasks/` — task files per team
- `~/.claude/teams/` — team config files listing members

Changes trigger a debounced broadcast (300 ms) to all connected SSE clients.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Dashboard HTML |
| GET | `/health` | Server health: status, uptime, port, active SSE client count, state directory |
| GET | `/api/state` | Full state snapshot as JSON |
| GET | `/api/graph` | Current graph.json (`{ exists: false }` if not built) |
| POST | `/api/graph/rebuild` | Reload graph.json from disk + broadcast SSE `graph-rebuilt` |
| GET | `/events` | SSE stream; sends state-snapshot on connect, then diffs on change (events: state-snapshot, graph-rebuilt, agent-on-module, agent-left-module) |
| GET | `/*` | Static files from `server/public/` |

### Health response example

```json
{
  "status": "ok",
  "uptime": 42.3,
  "port": 4567,
  "clients": 2,
  "stateDir": "/Users/you/project/.omc/state",
  "timestamp": 1771777915941
}
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `CRIB_HOOD_PORT` | `4567` | Port the server listens on |
| `CRIB_BOARD_PORT` | `4567` | Legacy alias for `CRIB_HOOD_PORT` |

## Error Handling

The server handles these failure modes at startup and runtime:

- **Port in use** (`EADDRINUSE`): logs a clear message and exits with code 1. Set `CRIB_HOOD_PORT` to use a different port.
- **Uncaught exceptions**: logged to stderr, process exits with code 1.
- **Unhandled promise rejections**: logged to stderr, process exits with code 1.
- **Graceful shutdown** on `SIGTERM` / `SIGINT`: closes all SSE connections and waits for the HTTP server to finish before exiting.
