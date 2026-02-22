/* ============================================================
   The Crib Hood — Browser App Logic
   Pure vanilla JS, no external dependencies
   ============================================================ */

'use strict';

// ------------------------------------------------------------
// Constants
// ------------------------------------------------------------
// Character theme management
let currentTheme = localStorage.getItem('crib-hood-theme') || 'original';

function getActiveCharacters() {
  return currentTheme === 'hood' && window.CHARACTERS_HOOD
    ? window.CHARACTERS_HOOD
    : window.CHARACTERS;
}

const STATUS_CLASSES = ['working', 'pending', 'idle', 'completed', 'error'];
const STATUS_LABELS = {
  working:   'Working',
  pending:   'Pending',
  idle:      'Idle',
  completed: 'Completed',
  error:     'Error',
};

// Cute nicknames for each agent role
const NICKNAMES = {
  'executor':          '뚝딱이',
  'explorer':          '킁킁이',
  'planner':           '지혜',
  'architect':         '댐댐이',
  'verifier':          '날카로미',
  'debugger':          '셜록',
  'reviewer':          '까칠냥',
  'writer':            '먹물이',
  'scientist':         '쥐박사',
  'designer':          '센스',
  'test-engineer':     '꼼꼼이',
  'security-reviewer': '뾰족이',
  'build-fixer':       '수리수리',
  'git-master':        '깜냥이',
  'critic':            '딴지',
  'dependency-expert': '도토리',
  'style-reviewer':    '까칠냥',
  'quality-reviewer':  '까칠냥',
  'api-reviewer':      '까칠냥',
  'performance-reviewer': '날카로미',
  'code-reviewer':     '까칠냥',
  'deep-executor':     '뚝딱이',
  'analyst':           '쥐박사',
  'product-manager':   '지혜',
  'ux-researcher':     '킁킁이',
  'information-architect': '댐댐이',
  'product-analyst':   '쥐박사',
  'quality-strategist':'지혜',
};

// ------------------------------------------------------------
// Character key resolution
// "oh-my-claudecode:executor" -> "executor"
// "style-reviewer"            -> "style-reviewer" or "default"
// Also tries base suffix: "style-reviewer" -> suffix "reviewer" -> cat SVG
// ------------------------------------------------------------
function getCharacterKey(agentName) {
  const parts = agentName.split(':');
  const role = parts[parts.length - 1];

  const chars = getActiveCharacters();
  if (chars[role]) {
    return role;
  }

  // Try stripping the last hyphen-segment to find a base character key.
  // e.g. "style-reviewer" -> "reviewer" (cat character)
  const dashIdx = role.lastIndexOf('-');
  if (dashIdx !== -1) {
    const suffix = role.slice(dashIdx + 1);
    if (chars[suffix]) {
      return suffix;
    }
  }

  return 'default';
}

// ------------------------------------------------------------
// Display name: extract role part, capitalize first letter
// "oh-my-claudecode:executor" -> "Executor"
// "style-reviewer"            -> "Style-reviewer"
// ------------------------------------------------------------
function getDisplayName(agentName) {
  const parts = agentName.split(':');
  const role = parts[parts.length - 1];
  if (!role) return agentName;
  const capitalized = role.charAt(0).toUpperCase() + role.slice(1);
  const nickname = NICKNAMES[role];
  return nickname ? `${nickname}` : capitalized;
}

function getRoleName(agentName) {
  const parts = agentName.split(':');
  const role = parts[parts.length - 1];
  if (!role) return '';
  return role.charAt(0).toUpperCase() + role.slice(1);
}

// ------------------------------------------------------------
// Create a brand-new agent card DOM element
// ------------------------------------------------------------
function createCard(agent) {
  const { name, status, task, team } = agent;
  const key = getCharacterKey(name);
  const safeStatus = STATUS_CLASSES.includes(status) ? status : 'idle';

  const card = document.createElement('div');
  card.className = `agent-card ${safeStatus} entering`;
  card.id = `agent-${CSS.escape(name)}`;
  card.dataset.status = safeStatus;
  card.dataset.name = name;
  if (team) card.dataset.team = team;

  // SVG comes exclusively from window.CHARACTERS, a static authored file
  // (characters.js bundled with this plugin). It is not user-supplied data.
  // eslint-disable-next-line no-unsanitized/property
  const charSvg = document.createElement('div');
  charSvg.className = 'char-svg';
  const chars = getActiveCharacters();
  const svgSource = chars[key] || chars['default'];
  charSvg.innerHTML = svgSource; // safe: plugin-authored SVG only

  const nameEl = document.createElement('div');
  nameEl.className = 'agent-name';
  nameEl.textContent = getDisplayName(name);

  const roleEl = document.createElement('div');
  roleEl.className = 'agent-role';
  roleEl.textContent = getRoleName(name);

  // Team badge
  if (team) {
    const teamEl = document.createElement('div');
    teamEl.className = 'agent-team-badge';
    teamEl.textContent = team;
    card.appendChild(teamEl);
  }

  const statusEl = document.createElement('div');
  statusEl.className = 'agent-status';
  statusEl.textContent = STATUS_LABELS[safeStatus] || safeStatus;

  const taskEl = document.createElement('div');
  taskEl.className = 'agent-task';
  taskEl.textContent = task || '';

  card.appendChild(charSvg);
  card.appendChild(nameEl);
  card.appendChild(roleEl);
  card.appendChild(statusEl);
  card.appendChild(taskEl);

  // Zzz bubble for idle state
  if (safeStatus === 'idle') {
    const zzz = document.createElement('span');
    zzz.className = 'zzz';
    zzz.textContent = 'Zzz';
    card.appendChild(zzz);
  }

  // Remove the entering class after the enter animation completes
  card.addEventListener('animationend', () => {
    card.classList.remove('entering');
  }, { once: true });

  return card;
}

// ------------------------------------------------------------
// Update an existing card's status, task text, and Zzz bubble
// ------------------------------------------------------------
function updateCard(card, agent) {
  const { status, task } = agent;
  const safeStatus = STATUS_CLASSES.includes(status) ? status : 'idle';
  const prevStatus = card.dataset.status;

  // Always keep task text current
  const taskEl = card.querySelector('.agent-task');
  if (taskEl) {
    taskEl.textContent = task || '';
  }

  // Nothing more to do if status unchanged
  if (prevStatus === safeStatus) return;

  // Brief scale-pulse on status transition
  card.style.transition = 'transform 0.15s ease';
  card.style.transform = 'scale(1.06)';
  setTimeout(() => {
    card.style.transform = '';
    setTimeout(() => {
      card.style.transition = '';
    }, 150);
  }, 150);

  // Swap status class
  STATUS_CLASSES.forEach((cls) => card.classList.remove(cls));
  card.classList.add(safeStatus);
  card.dataset.status = safeStatus;

  // Update status label
  const statusEl = card.querySelector('.agent-status');
  if (statusEl) {
    statusEl.textContent = STATUS_LABELS[safeStatus] || safeStatus;
  }

  // Manage Zzz bubble
  const existingZzz = card.querySelector('.zzz');
  if (safeStatus === 'idle') {
    if (!existingZzz) {
      const zzz = document.createElement('span');
      zzz.className = 'zzz';
      zzz.textContent = 'Zzz';
      card.appendChild(zzz);
    }
  } else {
    if (existingZzz) existingZzz.remove();
  }
}

// ------------------------------------------------------------
// Update summary counts in the footer
// ------------------------------------------------------------
function updateCounts(agents) {
  const counts = { working: 0, pending: 0, idle: 0, completed: 0, error: 0 };
  for (const agent of agents) {
    const s = agent.status;
    if (s in counts) counts[s]++;
  }

  document.getElementById('count-working').textContent   = counts.working;
  document.getElementById('count-pending').textContent   = counts.pending;
  document.getElementById('count-idle').textContent      = counts.idle;
  document.getElementById('count-completed').textContent = counts.completed;
  document.getElementById('count-error').textContent     = counts.error;
  document.getElementById('count-total').textContent     = agents.length;
}

// ------------------------------------------------------------
// Update mode banner
// ------------------------------------------------------------
function updateModeBanner(mode) {
  const banner  = document.getElementById('mode-banner');
  const nameEl  = document.getElementById('mode-name');
  const phaseEl = document.getElementById('mode-phase');

  if (mode && mode.active) {
    const modeName = mode.name || '';
    nameEl.textContent  = modeName.charAt(0).toUpperCase() + modeName.slice(1);
    phaseEl.textContent = mode.current_phase || '';
    banner.hidden = false;
  } else {
    banner.hidden = true;
  }
}

// ------------------------------------------------------------
// Main render function
// state: { agents: Array<{name, status, task, team, taskId}>, mode: object|null }
// ------------------------------------------------------------
function render(state) {
  const agents     = Array.isArray(state.agents) ? state.agents : [];
  const teams      = Array.isArray(state.teams) ? state.teams : [];
  const grid       = document.getElementById('agent-grid');
  const emptyState = document.getElementById('empty-state');

  // Deduplicate by agent name: prefer higher-priority status when the same
  // owner appears on multiple tasks (working > pending > error > idle > completed)
  const STATUS_PRIORITY = { working: 4, pending: 3, error: 2, idle: 1, completed: 0 };
  const incoming = new Map();
  for (const agent of agents) {
    if (!incoming.has(agent.name)) {
      incoming.set(agent.name, agent);
    } else {
      const prev = incoming.get(agent.name);
      const ppri = STATUS_PRIORITY[prev.status]  ?? 0;
      const npri = STATUS_PRIORITY[agent.status] ?? 0;
      if (npri > ppri) {
        incoming.set(agent.name, agent);
      }
    }
  }

  // Group agents by team
  const teamGroups = new Map();  // teamName -> [agent, ...]
  const ungrouped = [];          // agents without a team
  for (const [, agent] of incoming) {
    if (agent.team) {
      if (!teamGroups.has(agent.team)) teamGroups.set(agent.team, []);
      teamGroups.get(agent.team).push(agent);
    } else {
      ungrouped.push(agent);
    }
  }

  // Clear existing team sections (but keep agent-cards for reuse)
  const existingCards = new Map();
  for (const card of grid.querySelectorAll('.agent-card[data-name]')) {
    existingCards.set(card.dataset.name, card);
    // Detach from DOM temporarily
    card.remove();
  }
  // Remove old team sections and separators
  for (const el of grid.querySelectorAll('.team-section')) {
    el.remove();
  }

  // Helper: render an agent card (reuse or create)
  function renderAgent(agent, container) {
    if (existingCards.has(agent.name)) {
      const card = existingCards.get(agent.name);
      updateCard(card, agent);
      container.appendChild(card);
      existingCards.delete(agent.name);
    } else {
      container.appendChild(createCard(agent));
    }
  }

  // Render team groups
  for (const [teamName, teamAgents] of teamGroups) {
    const section = document.createElement('div');
    section.className = 'team-section';

    const header = document.createElement('div');
    header.className = 'team-header';
    header.textContent = teamName;
    section.appendChild(header);

    const teamGrid = document.createElement('div');
    teamGrid.className = 'team-grid';
    for (const agent of teamAgents) {
      renderAgent(agent, teamGrid);
    }
    section.appendChild(teamGrid);
    grid.appendChild(section);
  }

  // Render ungrouped agents (OMC workflow agents)
  if (ungrouped.length > 0 && teamGroups.size > 0) {
    const section = document.createElement('div');
    section.className = 'team-section';

    const header = document.createElement('div');
    header.className = 'team-header';
    header.textContent = 'OMC Workflow';
    section.appendChild(header);

    const omcGrid = document.createElement('div');
    omcGrid.className = 'team-grid';
    for (const agent of ungrouped) {
      renderAgent(agent, omcGrid);
    }
    section.appendChild(omcGrid);
    grid.appendChild(section);
  } else {
    // No teams — render flat (original behavior)
    for (const agent of ungrouped) {
      renderAgent(agent, grid);
    }
  }

  // Remove stale cards (agents no longer in state)
  for (const [, card] of existingCards) {
    card.classList.add('exiting');
    setTimeout(() => {
      if (card.parentNode) card.parentNode.removeChild(card);
    }, 300);
  }

  // Show/hide empty state placeholder
  emptyState.hidden = incoming.size > 0;

  // Footer counts use the deduplicated agent list
  updateCounts([...incoming.values()]);

  // Mode banner
  updateModeBanner(state.mode || null);
}

// ------------------------------------------------------------
// Clock — updates #clock every second with HH:MM:SS
// ------------------------------------------------------------
function startClock() {
  const clockEl = document.getElementById('clock');

  function tick() {
    const now = new Date();
    const hh  = String(now.getHours()).padStart(2, '0');
    const mm  = String(now.getMinutes()).padStart(2, '0');
    const ss  = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${hh}:${mm}:${ss}`;
  }

  tick();
  setInterval(tick, 1000);
}

// ------------------------------------------------------------
// SSE connection with 3-second auto-reconnect
// ------------------------------------------------------------
function connectSSE() {
  const es = new EventSource('/events');

  es.onmessage = (e) => {
    try {
      render(JSON.parse(e.data));
    } catch (err) {
      console.warn('[crib-hood] Failed to parse SSE message:', err);
    }
  };

  es.onerror = () => {
    es.close();
    setTimeout(connectSSE, 3000);
  };
}

// ------------------------------------------------------------
// Bootstrap on DOM ready
// ------------------------------------------------------------
// ------------------------------------------------------------
// Theme toggle — switch between Original and Hood character sets
// ------------------------------------------------------------
let lastState = null;

function applyTheme() {
  const btn = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');
  const label = document.getElementById('theme-label');

  if (currentTheme === 'hood') {
    btn.classList.add('hood');
    icon.textContent = '🔥';
    label.textContent = 'Hood';
  } else {
    btn.classList.remove('hood');
    icon.textContent = '🎮';
    label.textContent = 'Original';
  }

  // Re-render all cards with new character set
  const grid = document.getElementById('agent-grid');
  const cards = grid.querySelectorAll('.agent-card');
  cards.forEach((card) => {
    const name = card.dataset.name;
    const key = getCharacterKey(name);
    const chars = getActiveCharacters();
    const svgEl = card.querySelector('.char-svg');
    if (svgEl) {
      svgEl.innerHTML = chars[key] || chars['default'];
    }
  });
}

function toggleTheme() {
  currentTheme = currentTheme === 'hood' ? 'original' : 'hood';
  localStorage.setItem('crib-hood-theme', currentTheme);
  applyTheme();
}

// ------------------------------------------------------------
// Bootstrap on DOM ready
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  startClock();
  applyTheme();

  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  // Initial render via REST (avoids waiting for first SSE message)
  fetch('/api/state')
    .then((res) => res.json())
    .then((state) => { lastState = state; render(state); })
    .catch((err) => console.warn('[crib-hood] Initial fetch failed:', err));

  connectSSE();
});
