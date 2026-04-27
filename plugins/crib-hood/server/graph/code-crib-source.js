'use strict';
const fs = require('fs');
const path = require('path');

const PROMPT_TEMPLATE = (moduleId, doc) =>
  `You are extracting GraphRAG entities and relations from a code module's documentation.

Module: ${moduleId}
Documentation:
${doc}

Return ONLY a JSON object with this exact shape (no prose, no markdown fence):
{
  "entities": [{"id": string, "label": string}],
  "relations": [{"from": string, "to": string, "label": string, "confidence": number}]
}

Use module names (lowercase, hyphenated) as entity ids. Confidence is 0..1.`;

function readDocFor(stashRoot, moduleId) {
  const candidates = ['SCOPE.md', 'README.md', 'index.md'];
  for (const name of candidates) {
    const p = path.join(stashRoot, moduleId, name);
    if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
  }
  return '';
}

function summarize(doc) {
  const lines = doc.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#'));
  return (lines[0] || '').trim().slice(0, 200);
}

async function extractCodeCrib({ stashRoot, llmCall }) {
  if (!fs.existsSync(stashRoot)) return { nodes: [], edges: [] };

  const moduleDirs = fs.readdirSync(stashRoot, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
    .map((e) => e.name);

  const nodes = [];
  const edges = [];

  for (const id of moduleDirs) {
    const doc = readDocFor(stashRoot, id);
    nodes.push({
      id,
      label: id,
      kind: 'module',
      path: '',                    // filled by merge or AST source
      summary: summarize(doc),
      tags: [],
    });

    if (!doc) continue;

    let response;
    try {
      response = await llmCall(PROMPT_TEMPLATE(id, doc));
    } catch (_) {
      continue; // partial: skip relations for this module
    }

    let parsed;
    try {
      parsed = JSON.parse(response);
    } catch (_) {
      continue;
    }

    for (const r of parsed.relations || []) {
      if (!r.from || !r.to) continue;
      const w = typeof r.confidence === 'number' ? Math.max(0, Math.min(1, r.confidence)) : 0.5;
      edges.push({
        from: r.from,
        to: r.to,
        kind: 'semantic',
        weight: w,
        evidence: r.label || 'related',
      });
    }
  }

  return { nodes, edges };
}

module.exports = { extractCodeCrib };
