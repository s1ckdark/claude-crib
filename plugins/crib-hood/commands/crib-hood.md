---
name: crib-hood
description: Launch the Crib Hood agent dashboard in browser
user_invocable: true
---

Launch the Crib Hood dashboard to visualize OMC agent states in real-time.

## Prerequisites

The dashboard's Map view requires a built graph. Before opening:

1. (Optional, recommended) Run `/code-crib:analyze` to populate the code-crib stash for semantic edges.
2. Run `/crib-hood:build-map` to produce `~/.claude/crib-hood/<repoHash>/graph.json`.

Without these, the dashboard shows an empty state with a `/crib-hood:build-map` CTA.

## Steps

1. Start the Node.js SSE server in the background:
```bash
node ${CLAUDE_PLUGIN_ROOT}/server/index.js &
```

2. Wait 1 second for the server to start, then open the browser:
```bash
sleep 1 && open http://localhost:4567
```

3. Report to the user:

"🏠 The Crib Hood is running at http://localhost:4567
📡 Watching .omc/state/ for agent updates
To stop the server: `kill $(lsof -ti:4567)` or press Ctrl+C in the terminal"
