'use strict';
const fs = require('fs');
const path = require('path');

const REQUIRE_RE = /require\(\s*['"]([^'"]+)['"]\s*\)/g;
const IMPORT_RE = /import\s+(?:[^'"]*\s+from\s+)?['"]([^'"]+)['"]/g;

function listJsFiles(dir) {
  const out = [];
  function walk(d) {
    let entries;
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch (_) { return; }
    for (const ent of entries) {
      const full = path.join(d, ent.name);
      if (ent.isDirectory()) {
        if (ent.name === 'node_modules' || ent.name.startsWith('.')) continue;
        walk(full);
      } else if (ent.isFile() && (full.endsWith('.js') || full.endsWith('.mjs') || full.endsWith('.cjs'))) {
        out.push(full);
      }
    }
  }
  walk(dir);
  return out;
}

function resolveModuleId(specifier, fromFile, pluginsRoot) {
  if (!specifier.startsWith('.')) return null; // skip non-relative
  const resolved = path.resolve(path.dirname(fromFile), specifier);
  const rel = path.relative(pluginsRoot, resolved);
  if (rel.startsWith('..')) return null;
  const segments = rel.split(path.sep);
  if (segments.length < 1 || !segments[0]) return null;
  return segments[0];
}

function extractAst(repoRoot) {
  const pluginsRoot = path.join(repoRoot, 'plugins');
  if (!fs.existsSync(pluginsRoot)) {
    return { nodes: [], edges: [] };
  }

  const moduleDirs = fs.readdirSync(pluginsRoot, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
    .map((e) => e.name);

  const nodes = moduleDirs.map((id) => ({
    id,
    label: id,
    kind: 'module',
    path: `plugins/${id}`,
    summary: '',
    tags: [],
  }));

  // Count references per (from, to)
  const counts = new Map();
  for (const fromId of moduleDirs) {
    const dir = path.join(pluginsRoot, fromId);
    for (const file of listJsFiles(dir)) {
      const src = fs.readFileSync(file, 'utf8');
      for (const re of [REQUIRE_RE, IMPORT_RE]) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(src)) !== null) {
          const toId = resolveModuleId(m[1], file, pluginsRoot);
          if (!toId || toId === fromId) continue;
          if (!moduleDirs.includes(toId)) continue;
          const key = `${fromId}->${toId}`;
          counts.set(key, (counts.get(key) || 0) + 1);
        }
      }
    }
  }

  const edges = [];
  for (const [key, count] of counts) {
    const [from, to] = key.split('->');
    edges.push({
      from,
      to,
      kind: 'structural',
      weight: 1 - 1 / (1 + count),
      evidence: `${count} import/require reference${count === 1 ? '' : 's'}`,
    });
  }

  return { nodes, edges };
}

module.exports = { extractAst };
