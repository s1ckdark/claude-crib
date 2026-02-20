'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = parseInt(process.env.CRIB_BOARD_PORT || '4567', 10);

// MIME types for static file serving
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

// Resolve the public directory relative to this file
const PUBLIC_DIR = path.join(__dirname, 'public');

// SSE clients set
const clients = new Set();

// ------------------------------------------------------------
// Find .omc/state/ directory by walking up from cwd
// ------------------------------------------------------------
function findOmcStateDir() {
  let dir = process.cwd();
  while (true) {
    const candidate = path.join(dir, '.omc', 'state');
    if (fs.existsSync(candidate)) {
      return candidate;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      // Reached filesystem root — create fallback in cwd
      const fallback = path.join(process.cwd(), '.omc', 'state');
      fs.mkdirSync(fallback, { recursive: true });
      return fallback;
    }
    dir = parent;
  }
}

const STATE_DIR = findOmcStateDir();
const TASKS_DIR = path.join(os.homedir(), '.claude', 'tasks');

// ------------------------------------------------------------
// Read all state
// ------------------------------------------------------------
function readAllState() {
  const result = {
    agents: [],
    mode: null,
    timestamp: Date.now(),
  };

  // Read mode state files from .omc/state/
  if (fs.existsSync(STATE_DIR)) {
    let files;
    try {
      files = fs.readdirSync(STATE_DIR);
    } catch (_) {
      files = [];
    }
    for (const file of files) {
      if (!file.endsWith('-state.json')) continue;
      try {
        const raw = fs.readFileSync(path.join(STATE_DIR, file), 'utf8');
        const data = JSON.parse(raw);
        if (data && data.active) {
          const modeName = file.replace('-state.json', '');
          result.mode = { name: modeName, ...data };
        }
      } catch (_) {
        // Skip unreadable/malformed files
      }
    }
  }

  // Read team task files from ~/.claude/tasks/*/
  if (fs.existsSync(TASKS_DIR)) {
    let teamDirs;
    try {
      teamDirs = fs.readdirSync(TASKS_DIR);
    } catch (_) {
      teamDirs = [];
    }
    for (const team of teamDirs) {
      const teamPath = path.join(TASKS_DIR, team);
      let stat;
      try {
        stat = fs.statSync(teamPath);
      } catch (_) {
        continue;
      }
      if (!stat.isDirectory()) continue;

      let taskFiles;
      try {
        taskFiles = fs.readdirSync(teamPath);
      } catch (_) {
        continue;
      }
      for (const taskFile of taskFiles) {
        if (!taskFile.endsWith('.json')) continue;
        try {
          const raw = fs.readFileSync(path.join(teamPath, taskFile), 'utf8');
          const task = JSON.parse(raw);
          if (!task || !task.owner) continue;

          // Map status
          let agentStatus;
          switch (task.status) {
            case 'in_progress':
              agentStatus = 'working';
              break;
            case 'pending':
              agentStatus = 'pending';
              break;
            case 'completed':
              agentStatus = 'completed';
              break;
            default:
              agentStatus = 'idle';
          }

          result.agents.push({
            name: task.owner,
            status: agentStatus,
            task: task.subject || task.description || null,
            team,
            taskId: task.id || taskFile.replace('.json', ''),
          });
        } catch (_) {
          // Skip unreadable/malformed task files
        }
      }
    }
  }

  return result;
}

// ------------------------------------------------------------
// SSE broadcast
// ------------------------------------------------------------
function broadcast(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) {
    try {
      res.write(payload);
    } catch (_) {
      clients.delete(res);
    }
  }
}

// ------------------------------------------------------------
// Debounced watcher
// ------------------------------------------------------------
let debounceTimer = null;

function scheduleUpdate() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    broadcast(readAllState());
  }, 300);
}

// Watch .omc/state/ directory
try {
  fs.watch(STATE_DIR, { recursive: true }, scheduleUpdate);
} catch (_) {
  // Ignore if watch fails (e.g., directory doesn't exist yet)
}

// Watch ~/.claude/tasks/ directory
if (fs.existsSync(TASKS_DIR)) {
  try {
    fs.watch(TASKS_DIR, { recursive: true }, scheduleUpdate);
  } catch (_) {
    // Ignore watch failures
  }
}

// ------------------------------------------------------------
// CORS headers helper
// ------------------------------------------------------------
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// ------------------------------------------------------------
// HTTP server
// ------------------------------------------------------------
const server = http.createServer((req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // GET /api/state
  if (req.method === 'GET' && pathname === '/api/state') {
    const state = readAllState();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(state));
    return;
  }

  // GET /events — SSE
  if (req.method === 'GET' && pathname === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.write('\n'); // flush headers

    // Send initial state
    res.write(`data: ${JSON.stringify(readAllState())}\n\n`);

    clients.add(res);

    req.on('close', () => {
      clients.delete(res);
    });
    return;
  }

  // Static file serving from public/
  let filePath;
  if (pathname === '/') {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  } else {
    // Prevent path traversal
    const safeSuffix = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
    filePath = path.join(PUBLIC_DIR, safeSuffix);
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`🏠 The Crib Board running at http://localhost:${PORT}`);
  console.log(`📡 Watching: ${STATE_DIR}`);
});

// ------------------------------------------------------------
// Graceful shutdown
// ------------------------------------------------------------
function shutdown() {
  for (const res of clients) {
    try {
      res.end();
    } catch (_) {}
  }
  clients.clear();
  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
