'use strict';

function pickPath(taskInfo) {
  if (!taskInfo) return null;
  return taskInfo.currentFile || (taskInfo.lastEdit && taskInfo.lastEdit.path) || taskInfo.workspaceFile || null;
}

function findOwningModule(graph, filePath) {
  if (!filePath || !graph || !Array.isArray(graph.nodes)) return null;
  let best = null;
  let bestLen = -1;
  for (const node of graph.nodes) {
    const p = node.path || '';
    if (!p) continue;
    if (filePath === p || filePath.startsWith(p + '/')) {
      if (p.length > bestLen) {
        best = node.id;
        bestLen = p.length;
      }
    }
  }
  return best;
}

function createActivityMapper({ graph }) {
  const lastSeen = new Map(); // agent → moduleId

  function map(agent, taskInfo) {
    const filePath = pickPath(taskInfo);
    const next = findOwningModule(graph, filePath);
    const prev = lastSeen.get(agent) || null;

    if (next === prev) return [];

    const events = [];
    const ts = Math.floor(Date.now() / 1000);
    if (prev) events.push({ type: 'agent-left-module', agent, module: prev, ts });
    if (next) events.push({ type: 'agent-on-module', agent, module: next, since: ts });

    if (next) lastSeen.set(agent, next);
    else lastSeen.delete(agent);

    return events;
  }

  return { map };
}

module.exports = { createActivityMapper };
