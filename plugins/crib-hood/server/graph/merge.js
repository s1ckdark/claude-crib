'use strict';

function mergeSources(sources) {
  const nodeMap = new Map();
  const edgeMap = new Map();

  for (const src of sources) {
    for (const n of src.nodes || []) {
      const existing = nodeMap.get(n.id);
      if (!existing) {
        nodeMap.set(n.id, { ...n });
      } else {
        if (n.summary && !existing.summary) existing.summary = n.summary;
        if (Array.isArray(n.tags) && n.tags.length && !(existing.tags || []).length) {
          existing.tags = [...n.tags];
        }
        if (n.path && !existing.path) existing.path = n.path;
      }
    }
    for (const e of src.edges || []) {
      const key = `${e.from}->${e.to}::${e.kind}`;
      const existing = edgeMap.get(key);
      const clamped = Math.max(0, Math.min(1, e.weight));
      const norm = { ...e, weight: clamped };
      if (!existing || norm.weight > existing.weight) {
        edgeMap.set(key, norm);
      }
    }
  }

  return {
    nodes: Array.from(nodeMap.values()),
    edges: Array.from(edgeMap.values()),
  };
}

module.exports = { mergeSources };
