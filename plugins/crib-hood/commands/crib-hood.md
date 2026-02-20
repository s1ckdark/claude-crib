---
name: crib-hood
description: Launch the Crib Hood agent dashboard in browser
---

Launch the Crib Hood dashboard to visualize OMC agent states in real-time.

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
