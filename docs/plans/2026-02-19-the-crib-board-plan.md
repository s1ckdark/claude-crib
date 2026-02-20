# The Crib Board Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** OMC 에이전트 상태를 동물 캐릭터 기반 대시보드로 실시간 시각화하는 플러그인을 만든다.

**Architecture:** Node.js 내장 모듈로 HTTP+SSE 서버를 구동하고, `fs.watch`로 `.omc/state/` 변경을 감지해 브라우저에 푸시한다. 프론트엔드는 Vanilla HTML/CSS/JS로 빌드 없이 동작한다.

**Tech Stack:** Node.js (built-in http, fs, path), Vanilla HTML/CSS/JS, SSE, inline SVG

---

### Task 1: Plugin Scaffold

**Files:**
- Create: `plugins/the-crib-board/.claude-plugin/plugin.json`
- Create: `plugins/the-crib-board/commands/` (directory)
- Create: `plugins/the-crib-board/skills/` (directory)
- Create: `plugins/the-crib-board/server/` (directory)
- Create: `plugins/the-crib-board/server/public/` (directory)

**Step 1: Create plugin.json**

```json
{
  "name": "the-crib-board",
  "version": "0.1.0",
  "description": "Agent dashboard with animated animal characters - visualize OMC agent states in real-time",
  "author": {
    "name": "Dave"
  },
  "keywords": ["dashboard", "agents", "visualization", "animation", "monitoring"]
}
```

**Step 2: Create directory structure**

```bash
mkdir -p plugins/the-crib-board/{.claude-plugin,commands,skills,server/public}
```

**Step 3: Verify structure**

```bash
find plugins/the-crib-board -type d | sort
```

Expected:
```
plugins/the-crib-board
plugins/the-crib-board/.claude-plugin
plugins/the-crib-board/commands
plugins/the-crib-board/server
plugins/the-crib-board/server/public
plugins/the-crib-board/skills
```

**Step 4: Commit**

```bash
git add plugins/the-crib-board/
git commit -m "feat(the-crib-board): scaffold plugin structure"
```

---

### Task 2: Node.js SSE Server Core

**Files:**
- Create: `plugins/the-crib-board/server/index.js`

**Step 1: Write the HTTP + SSE server**

`server/index.js` handles:
- Static file serving from `public/`
- `GET /api/state` — reads all `.omc/state/*.json` files and returns merged state
- `GET /events` — SSE endpoint that pushes state updates
- CORS headers for local development
- Graceful shutdown on SIGTERM/SIGINT

```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.CRIB_BOARD_PORT || 4567;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Determine .omc/state directory
// Walk up from cwd to find .omc or use cwd/.omc
function findOmcStateDir() {
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    const candidate = path.join(dir, '.omc', 'state');
    if (fs.existsSync(candidate)) return candidate;
    dir = path.dirname(dir);
  }
  // fallback: create in cwd
  const fallback = path.join(process.cwd(), '.omc', 'state');
  fs.mkdirSync(fallback, { recursive: true });
  return fallback;
}

const STATE_DIR = findOmcStateDir();
const sseClients = new Set();

// MIME types for static serving
const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

function readAllState() {
  const result = { agents: [], mode: null, timestamp: Date.now() };
  try {
    const files = fs.readdirSync(STATE_DIR).filter(f => f.endsWith('.json'));
    for (const file of files) {
      try {
        const content = JSON.parse(fs.readFileSync(path.join(STATE_DIR, file), 'utf-8'));
        // Mode state files (autopilot-state.json, team-state.json, etc.)
        if (file.includes('-state')) {
          result.mode = { name: file.replace('-state.json', ''), ...content };
        }
      } catch (e) { /* skip invalid files */ }
    }
  } catch (e) { /* state dir may not exist yet */ }

  // Also read team task files if they exist
  const teamsDir = path.join(path.dirname(STATE_DIR), '..', '.claude', 'tasks');
  try {
    if (fs.existsSync(teamsDir)) {
      const teams = fs.readdirSync(teamsDir).filter(f => {
        return fs.statSync(path.join(teamsDir, f)).isDirectory();
      });
      for (const team of teams) {
        const taskDir = path.join(teamsDir, team);
        const taskFiles = fs.readdirSync(taskDir).filter(f => f.endsWith('.json'));
        for (const tf of taskFiles) {
          try {
            const task = JSON.parse(fs.readFileSync(path.join(taskDir, tf), 'utf-8'));
            if (task.owner) {
              result.agents.push({
                name: task.owner,
                status: mapTaskStatus(task.status),
                task: task.subject || '',
                team: team,
                taskId: tf.replace('.json', ''),
              });
            }
          } catch (e) { /* skip */ }
        }
      }
    }
  } catch (e) { /* no teams */ }

  return result;
}

function mapTaskStatus(status) {
  const map = { 'in_progress': 'working', 'pending': 'pending', 'completed': 'completed' };
  return map[status] || 'idle';
}

function broadcast(data) {
  const msg = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    client.write(msg);
  }
}

// File watcher
let watchDebounce = null;
fs.watch(STATE_DIR, { recursive: true }, () => {
  clearTimeout(watchDebounce);
  watchDebounce = setTimeout(() => {
    broadcast(readAllState());
  }, 300);
});

// HTTP Server
const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.url === '/api/state') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(readAllState()));
    return;
  }

  if (req.url === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    res.write(`data: ${JSON.stringify(readAllState())}\n\n`);
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }

  // Static files
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(PUBLIC_DIR, filePath);
  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`🏠 The Crib Board running at http://localhost:${PORT}`);
  console.log(`📡 Watching: ${STATE_DIR}`);
});

// Graceful shutdown
process.on('SIGTERM', () => { server.close(); process.exit(0); });
process.on('SIGINT', () => { server.close(); process.exit(0); });
```

**Step 2: Verify server starts**

```bash
cd plugins/the-crib-board && node server/index.js &
curl -s http://localhost:4567/api/state | head -c 200
kill %1
```

Expected: JSON response with `{"agents":[],"mode":null,"timestamp":...}`

**Step 3: Commit**

```bash
git add plugins/the-crib-board/server/index.js
git commit -m "feat(the-crib-board): add Node.js HTTP + SSE server"
```

---

### Task 3: SVG Character Definitions

**Files:**
- Create: `plugins/the-crib-board/server/public/characters.js`

**Step 1: Define SVG characters**

`characters.js` exports an object mapping agent role names to inline SVG strings. Each SVG is a 64x64 viewBox with a simple, expressive animal character. The SVGs use CSS classes for animatable parts (e.g., `.char-body`, `.char-eyes`, `.char-accessory`).

Define all 16 characters from the design doc:
- executor → hamster, explorer → dog, planner → owl, architect → beaver
- verifier → hawk, debugger → ladybug, reviewer → cat, writer → octopus
- scientist → mouse, designer → fox, test-engineer → turtle
- security-reviewer → hedgehog, build-fixer → ant, git-master → black cat
- critic → parrot, dependency-expert → squirrel
- default → generic robot for unknown agents

Each SVG should be simple (under 20 path elements) but recognizable.

**Step 2: Verify characters load in browser**

Create a temporary test page or open the dashboard and check console for errors.

**Step 3: Commit**

```bash
git add plugins/the-crib-board/server/public/characters.js
git commit -m "feat(the-crib-board): add SVG animal character definitions"
```

---

### Task 4: Dashboard HTML

**Files:**
- Create: `plugins/the-crib-board/server/public/index.html`

**Step 1: Write dashboard HTML**

```html
<!DOCTYPE html>
<html lang="ko" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Crib Board</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <h1>🏠 The Crib Board</h1>
    <div class="status-bar">
      <span class="live-indicator">● Live</span>
      <span class="clock" id="clock"></span>
    </div>
  </header>

  <main>
    <section class="mode-banner" id="mode-banner" hidden>
      <span class="mode-name" id="mode-name"></span>
      <span class="mode-phase" id="mode-phase"></span>
    </section>

    <section class="agent-grid" id="agent-grid">
      <!-- Agent cards injected by app.js -->
      <div class="empty-state" id="empty-state">
        <p>No agents running</p>
        <p class="hint">Start an OMC workflow to see agents here</p>
      </div>
    </section>
  </main>

  <footer>
    <div class="summary" id="summary">
      <span class="stat working">Working: 0</span>
      <span class="stat pending">Pending: 0</span>
      <span class="stat idle">Idle: 0</span>
      <span class="stat completed">Completed: 0</span>
      <span class="stat error">Error: 0</span>
      <span class="stat total">Total: 0</span>
    </div>
  </footer>

  <script src="characters.js"></script>
  <script src="app.js"></script>
</body>
</html>
```

**Step 2: Verify page loads**

```bash
cd plugins/the-crib-board && node server/index.js &
open http://localhost:4567
# Visual check: header, empty state message, footer visible
kill %1
```

**Step 3: Commit**

```bash
git add plugins/the-crib-board/server/public/index.html
git commit -m "feat(the-crib-board): add dashboard HTML structure"
```

---

### Task 5: CSS Styles & Animations

**Files:**
- Create: `plugins/the-crib-board/server/public/style.css`

**Step 1: Write base styles + dark theme**

Layout styles for header, agent-grid (CSS Grid, responsive), footer summary bar, agent cards.

**Step 2: Write state-specific animations**

5 `@keyframes` animations:

```css
/* working: active spin/bounce */
@keyframes working {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-4px) rotate(-5deg); }
  50% { transform: translateY(0) rotate(0deg); }
  75% { transform: translateY(-4px) rotate(5deg); }
}

/* pending: gentle pulse/yawn */
@keyframes pending {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.95); }
}

/* idle: floating Zzz */
@keyframes idle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

/* completed: celebration pop */
@keyframes completed {
  0% { transform: scale(1); }
  30% { transform: scale(1.2); }
  50% { transform: scale(0.95); }
  70% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* error: shake */
@keyframes error {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
}
```

Agent card classes: `.agent-card.working`, `.agent-card.pending`, `.agent-card.idle`, `.agent-card.completed`, `.agent-card.error` — each applies the corresponding animation to `.char-svg`.

State-specific card border colors:
- working: `#4ade80` (green glow)
- pending: `#fbbf24` (amber)
- idle: `#64748b` (slate)
- completed: `#22d3ee` (cyan)
- error: `#f87171` (red glow)

Card entrance: `@keyframes cardEnter` — slide up + fade in.
Card exit: `@keyframes cardExit` — scale down + fade out.

**Step 3: Add live indicator pulse**

```css
.live-indicator {
  color: #4ade80;
  animation: livePulse 2s infinite;
}
@keyframes livePulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
```

**Step 4: Verify animations**

Start server, open browser, inspect that styles load correctly via DevTools.

**Step 5: Commit**

```bash
git add plugins/the-crib-board/server/public/style.css
git commit -m "feat(the-crib-board): add CSS styles and state animations"
```

---

### Task 6: Frontend App Logic (SSE Client + DOM)

**Files:**
- Create: `plugins/the-crib-board/server/public/app.js`

**Step 1: Write SSE client and DOM rendering**

`app.js` responsibilities:
- Connect to `/events` SSE endpoint
- On message: parse state, diff with previous state, update DOM
- `renderAgentCard(agent)` — creates card element with SVG character, name, status badge, task info
- `updateSummary(agents)` — updates footer counts
- `updateModeBanner(mode)` — shows/hides active mode info
- Clock updater (1s interval)
- Card enter/exit animations via CSS class toggling
- Auto-reconnect on SSE disconnect

Key function signatures:

```javascript
// Map agent name to character key
function getCharacterKey(agentName) {
  // e.g., "oh-my-claudecode:executor" -> "executor"
  // also handle plain names like "executor"
  const parts = agentName.split(':');
  const role = parts[parts.length - 1];
  return CHARACTERS[role] ? role : 'default';
}

// Create or update an agent card
function renderAgent(agent) {
  let card = document.getElementById(`agent-${agent.name}`);
  if (!card) {
    card = createAgentCard(agent);
    document.getElementById('agent-grid').appendChild(card);
    card.classList.add('entering');
  }
  updateAgentCard(card, agent);
}

// Remove agents no longer in state
function removeStaleAgents(currentNames) { ... }

// SSE connection with auto-reconnect
function connectSSE() {
  const es = new EventSource('/events');
  es.onmessage = (e) => {
    const state = JSON.parse(e.data);
    render(state);
  };
  es.onerror = () => {
    es.close();
    setTimeout(connectSSE, 3000);
  };
}
```

**Step 2: Verify end-to-end**

1. Start server
2. Open browser
3. Manually create a test state file: `echo '{"active":true}' > .omc/state/test-state.json`
4. Verify the dashboard updates

**Step 3: Commit**

```bash
git add plugins/the-crib-board/server/public/app.js
git commit -m "feat(the-crib-board): add SSE client and DOM rendering logic"
```

---

### Task 7: Terminal Status Command

**Files:**
- Create: `plugins/the-crib-board/commands/crib-board-status.md`

**Step 1: Write terminal status command**

This command reads OMC state and team tasks via MCP tools (`state_read`, `TaskList`) and outputs a formatted ANSI summary to the terminal.

```markdown
---
name: crib-board-status
description: Show agent dashboard status in terminal
---

Read the current OMC state using `state_read` and `TaskList` tools.
Format as a terminal summary:

🏠 The Crib Board
━━━━━━━━━━━━━━━━━━━━━━━━━━━
[emoji] [agent-name]  [status]  [task-info]
...
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Working: N | Pending: N | Idle: N | Done: N | Error: N

Use these character emojis for agents:
executor→🐹 explorer→🐕 planner→🦉 architect→🦫
verifier→🦅 debugger→🐛 reviewer→🐱 writer→🐙
scientist→🐀 designer→🦊 test-engineer→🐢
security-reviewer→🦔 build-fixer→🐜 git-master→🐈‍⬛
critic→🦜 dependency-expert→🐿️ default→🤖
```

**Step 2: Commit**

```bash
git add plugins/the-crib-board/commands/crib-board-status.md
git commit -m "feat(the-crib-board): add terminal status command"
```

---

### Task 8: Browser Launch Command

**Files:**
- Create: `plugins/the-crib-board/commands/crib-board.md`

**Step 1: Write browser launch command**

```markdown
---
name: crib-board
description: Launch the Crib Board agent dashboard in browser
---

Launch the Crib Board dashboard:

1. Start the Node.js server:
   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/server/index.js &
   ```

2. Open the browser:
   ```bash
   open http://localhost:4567
   ```

3. Report to the user:
   "🏠 The Crib Board is running at http://localhost:4567
   📡 Watching .omc/state/ for agent updates
   To stop: kill the server process or press Ctrl+C"
```

**Step 2: Commit**

```bash
git add plugins/the-crib-board/commands/crib-board.md
git commit -m "feat(the-crib-board): add browser launch command"
```

---

### Task 9: Skill Trigger

**Files:**
- Create: `plugins/the-crib-board/skills/crib-board.md`

**Step 1: Write skill file**

```markdown
---
name: crib-board
description: Launch or check the Crib Board agent dashboard. Use when user mentions "dashboard", "agent board", "crib board", "agent status", "show agents".
---

The Crib Board is an agent visualization dashboard.

If the user wants to see the dashboard in a browser:
- Run the `/crib-board` command

If the user wants a quick terminal summary:
- Run the `/crib-board-status` command
```

**Step 2: Commit**

```bash
git add plugins/the-crib-board/skills/crib-board.md
git commit -m "feat(the-crib-board): add skill trigger"
```

---

### Task 10: Integration Test & Polish

**Step 1: Full end-to-end test**

1. Register plugin in claude-crib's plugin.json or test standalone
2. Start server, open dashboard
3. Create mock state files to simulate agents in different states
4. Verify all 5 state animations work
5. Verify SSE real-time updates
6. Verify terminal status command

**Step 2: Test mock script**

Create a quick test script to simulate agent states:

```bash
# plugins/the-crib-board/test-mock.sh
STATE_DIR=".omc/state"
mkdir -p "$STATE_DIR"

echo '{"active":true,"current_phase":"team-exec","team_name":"test-team"}' > "$STATE_DIR/team-state.json"
sleep 1
echo '{"active":true,"current_phase":"team-verify"}' > "$STATE_DIR/team-state.json"
sleep 1
echo '{"active":false,"current_phase":"complete"}' > "$STATE_DIR/team-state.json"
```

**Step 3: Final commit**

```bash
git add -A plugins/the-crib-board/
git commit -m "feat(the-crib-board): integration test and polish"
```
