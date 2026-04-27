# Crib Hood × GraphRAG Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a force-directed module graph view to the `crib-hood` plugin that hosts existing animal characters as live overlays, with edges sourced from `code-crib`'s Chroma stash (when available) and an AST regex fallback.

**Architecture:** Pre-built `graph.json` produced by `/crib-hood:build-map`, served by the existing crib-hood Node.js HTTP+SSE server. Client renders the graph via Cytoscape.js (CDN), with a separate DOM layer for animal characters that tracks Cytoscape's rendered node positions. Live agent activity mapped server-side from existing task watchers.

**Tech Stack:**
- Node.js (vanilla, CommonJS — no build step)
- Built-in `node:test` + `node:assert` for tests (Node 18+)
- Cytoscape.js 3.x via CDN (no bundling)
- Plain CSS for layer styling and animal animations

**Spec:** `docs/superpowers/specs/2026-04-27-crib-hood-graphrag-design.md`

---

## File Map

**Created:**

```
plugins/crib-hood/
├── package.json                           # for `npm test` script
├── server/
│   └── graph/
│       ├── builder.js                     # pipeline orchestrator
│       ├── code-crib-source.js            # chroma docs → LLM → semantic edges
│       ├── ast-source.js                  # regex import scan → structural edges
│       ├── merge.js                       # dedupe + kind tagging
│       └── activity-mapper.js             # task path → owning module
├── server/public/map/
│   ├── map.js                             # Cytoscape init + SSE handler
│   ├── map.css                            # layer styles + animal styling
│   ├── animal-renderer.js                 # DOM overlay coords sync
│   └── trail.js                           # walk trail toggle
├── commands/
│   └── build-map.md                       # /crib-hood:build-map
├── scripts/
│   └── build-map.js                       # CLI entry that build-map.md invokes
└── tests/
    ├── ast-source.test.js
    ├── merge.test.js
    ├── code-crib-source.test.js
    ├── builder.test.js
    ├── activity-mapper.test.js
    ├── server-graph-api.test.js
    └── fixtures/
        ├── sample-repo/                   # mock repo for AST tests
        └── sample-stash/                  # mock chroma docs for code-crib tests
```

**Modified:**

```
plugins/crib-hood/
├── server/index.js                        # add /api/graph, /api/graph/rebuild, new SSE events
├── server/public/index.html               # replace grid with map shell
├── server/public/app.js                   # bootstrap map.js, drop grid render
├── commands/crib-hood.md                  # mention map view + build-map prereq
└── README.md                              # update commands + dashboard sections
```

---

## Task 1: Test infrastructure setup

**Files:**
- Create: `plugins/crib-hood/package.json`
- Create: `plugins/crib-hood/tests/smoke.test.js`

- [ ] **Step 1: Write a smoke test that proves the runner works**

`plugins/crib-hood/tests/smoke.test.js`:

```javascript
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

test('test runner sanity', () => {
  assert.equal(1 + 1, 2);
});
```

- [ ] **Step 2: Create package.json with the test script**

`plugins/crib-hood/package.json`:

```json
{
  "name": "crib-hood",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "test": "node --test tests/**/*.test.js"
  }
}
```

- [ ] **Step 3: Run the test runner**

```bash
cd plugins/crib-hood && npm test
```

Expected: `# pass 1` and exit code 0.

- [ ] **Step 4: Commit**

```bash
git add plugins/crib-hood/package.json plugins/crib-hood/tests/smoke.test.js
git commit -m "test(crib-hood): add node:test runner with smoke test"
```

---

## Task 2: AST source (regex-based import scan)

**Files:**
- Create: `plugins/crib-hood/server/graph/ast-source.js`
- Create: `plugins/crib-hood/tests/ast-source.test.js`
- Create: `plugins/crib-hood/tests/fixtures/sample-repo/plugins/alpha/index.js`
- Create: `plugins/crib-hood/tests/fixtures/sample-repo/plugins/beta/server.js`
- Create: `plugins/crib-hood/tests/fixtures/sample-repo/plugins/gamma/util.js`

**Module contract:** `extractAst(repoRoot)` → `{ nodes: [{id, label, kind, path, summary, tags}], edges: [{from, to, kind, weight, evidence}] }`. Walks `<repoRoot>/plugins/*/`, treats each subdir as a module node, scans `*.js` files for `require('../<other-plugin>/...')` and `import ... from '../<other-plugin>/...'` references → structural edges weighted by reference count (capped at 1.0 via `1 - 1/(1+count)`).

- [ ] **Step 1: Create fixtures**

`plugins/crib-hood/tests/fixtures/sample-repo/plugins/alpha/index.js`:

```javascript
'use strict';
const beta = require('../beta/server');
const beta2 = require('../beta/server'); // duplicate to test counting
const gamma = require('../gamma/util');
module.exports = { beta, beta2, gamma };
```

`plugins/crib-hood/tests/fixtures/sample-repo/plugins/beta/server.js`:

```javascript
'use strict';
module.exports = { hello: () => 'beta' };
```

`plugins/crib-hood/tests/fixtures/sample-repo/plugins/gamma/util.js`:

```javascript
'use strict';
import gammaThing from '../beta/server.js';
export default { gammaThing };
```

- [ ] **Step 2: Write the failing test**

`plugins/crib-hood/tests/ast-source.test.js`:

```javascript
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { extractAst } = require('../server/graph/ast-source');

const FIXTURE = path.join(__dirname, 'fixtures', 'sample-repo');

test('extractAst returns three module nodes for alpha/beta/gamma', () => {
  const { nodes } = extractAst(FIXTURE);
  const ids = nodes.map((n) => n.id).sort();
  assert.deepEqual(ids, ['alpha', 'beta', 'gamma']);
  for (const n of nodes) {
    assert.equal(n.kind, 'module');
    assert.ok(n.path.startsWith('plugins/'));
  }
});

test('extractAst emits structural edges for require and import', () => {
  const { edges } = extractAst(FIXTURE);
  const pairs = edges.map((e) => `${e.from}->${e.to}:${e.kind}`).sort();
  assert.deepEqual(pairs, [
    'alpha->beta:structural',
    'alpha->gamma:structural',
    'gamma->beta:structural',
  ]);
  for (const e of edges) {
    assert.ok(e.weight > 0 && e.weight <= 1);
    assert.ok(e.evidence.length > 0);
  }
});

test('extractAst weights duplicate references higher', () => {
  const { edges } = extractAst(FIXTURE);
  const alphaBeta = edges.find((e) => e.from === 'alpha' && e.to === 'beta');
  const gammaBeta = edges.find((e) => e.from === 'gamma' && e.to === 'beta');
  // alpha references beta twice, gamma once → alpha→beta has higher weight
  assert.ok(alphaBeta.weight > gammaBeta.weight);
});
```

- [ ] **Step 3: Run the tests to verify they fail**

```bash
cd plugins/crib-hood && npm test
```

Expected: `Cannot find module '../server/graph/ast-source'` failure.

- [ ] **Step 4: Implement the module**

`plugins/crib-hood/server/graph/ast-source.js`:

```javascript
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
```

- [ ] **Step 5: Run the tests to verify they pass**

```bash
cd plugins/crib-hood && npm test
```

Expected: 4 passing tests (smoke + 3 ast-source tests).

- [ ] **Step 6: Commit**

```bash
git add plugins/crib-hood/server/graph/ast-source.js \
        plugins/crib-hood/tests/ast-source.test.js \
        plugins/crib-hood/tests/fixtures/sample-repo/
git commit -m "feat(crib-hood): regex-based AST source for module structural edges"
```

---

## Task 3: Merge utility

**Files:**
- Create: `plugins/crib-hood/server/graph/merge.js`
- Create: `plugins/crib-hood/tests/merge.test.js`

**Module contract:** `mergeSources(sources)` where `sources = [{ nodes, edges }, ...]` → `{ nodes, edges }`. Dedupes nodes by id (later source's `summary`/`tags` win if non-empty), dedupes edges by `(from, to, kind)` keeping max weight, normalizes all weights to `[0, 1]` (idempotent — already in range stays).

- [ ] **Step 1: Write the failing tests**

`plugins/crib-hood/tests/merge.test.js`:

```javascript
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { mergeSources } = require('../server/graph/merge');

test('mergeSources dedupes nodes by id, prefers non-empty summary', () => {
  const a = { nodes: [{ id: 'm1', label: 'm1', kind: 'module', path: 'p', summary: '', tags: [] }], edges: [] };
  const b = { nodes: [{ id: 'm1', label: 'm1', kind: 'module', path: 'p', summary: 'rich', tags: ['x'] }], edges: [] };
  const merged = mergeSources([a, b]);
  assert.equal(merged.nodes.length, 1);
  assert.equal(merged.nodes[0].summary, 'rich');
  assert.deepEqual(merged.nodes[0].tags, ['x']);
});

test('mergeSources keeps edges of different kinds between same pair', () => {
  const a = { nodes: [], edges: [{ from: 'a', to: 'b', kind: 'structural', weight: 0.5, evidence: 's' }] };
  const b = { nodes: [], edges: [{ from: 'a', to: 'b', kind: 'semantic', weight: 0.7, evidence: 't' }] };
  const merged = mergeSources([a, b]);
  assert.equal(merged.edges.length, 2);
});

test('mergeSources dedupes same kind edge by max weight', () => {
  const a = { nodes: [], edges: [{ from: 'a', to: 'b', kind: 'structural', weight: 0.3, evidence: 'lo' }] };
  const b = { nodes: [], edges: [{ from: 'a', to: 'b', kind: 'structural', weight: 0.8, evidence: 'hi' }] };
  const merged = mergeSources([a, b]);
  assert.equal(merged.edges.length, 1);
  assert.equal(merged.edges[0].weight, 0.8);
  assert.equal(merged.edges[0].evidence, 'hi');
});

test('mergeSources clamps weight to [0,1]', () => {
  const a = { nodes: [], edges: [{ from: 'a', to: 'b', kind: 'structural', weight: 1.7, evidence: '' }] };
  const merged = mergeSources([a]);
  assert.equal(merged.edges[0].weight, 1);
});
```

- [ ] **Step 2: Run tests, verify they fail**

```bash
cd plugins/crib-hood && npm test
```

Expected: `Cannot find module '../server/graph/merge'`.

- [ ] **Step 3: Implement the module**

`plugins/crib-hood/server/graph/merge.js`:

```javascript
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
```

- [ ] **Step 4: Run tests, verify they pass**

```bash
cd plugins/crib-hood && npm test
```

Expected: all 4 merge tests pass plus prior tests.

- [ ] **Step 5: Commit**

```bash
git add plugins/crib-hood/server/graph/merge.js plugins/crib-hood/tests/merge.test.js
git commit -m "feat(crib-hood): merge utility for graph sources with dedupe and weight normalize"
```

---

## Task 4: code-crib source (LLM-extracted semantic edges)

**Files:**
- Create: `plugins/crib-hood/server/graph/code-crib-source.js`
- Create: `plugins/crib-hood/tests/code-crib-source.test.js`
- Create: `plugins/crib-hood/tests/fixtures/sample-stash/alpha/SCOPE.md`
- Create: `plugins/crib-hood/tests/fixtures/sample-stash/beta/SCOPE.md`

**Module contract:** `async extractCodeCrib({ stashRoot, llmCall })` where `llmCall(prompt)` returns a string of JSON `{entities, relations}`. Returns same `{ nodes, edges }` shape with `kind: 'semantic'` edges. Tests inject a fake `llmCall` to avoid real subprocess.

- [ ] **Step 1: Create stash fixtures**

`plugins/crib-hood/tests/fixtures/sample-stash/alpha/SCOPE.md`:

```markdown
# alpha

Provides chroma vector store integration for the platform.
```

`plugins/crib-hood/tests/fixtures/sample-stash/beta/SCOPE.md`:

```markdown
# beta

Visualizes alpha's vector store as a force-directed graph.
```

- [ ] **Step 2: Write the failing tests**

`plugins/crib-hood/tests/code-crib-source.test.js`:

```javascript
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { extractCodeCrib } = require('../server/graph/code-crib-source');

const STASH = path.join(__dirname, 'fixtures', 'sample-stash');

test('extractCodeCrib returns nodes with summaries from SCOPE.md', async () => {
  const llm = async () => JSON.stringify({ entities: [], relations: [] });
  const { nodes } = await extractCodeCrib({ stashRoot: STASH, llmCall: llm });
  const ids = nodes.map((n) => n.id).sort();
  assert.deepEqual(ids, ['alpha', 'beta']);
  const alpha = nodes.find((n) => n.id === 'alpha');
  assert.ok(alpha.summary.includes('chroma'));
});

test('extractCodeCrib produces semantic edges from llm relations', async () => {
  const llm = async (prompt) => {
    if (prompt.includes('beta')) {
      return JSON.stringify({
        entities: [],
        relations: [{ from: 'beta', to: 'alpha', label: 'visualizes', confidence: 0.9 }],
      });
    }
    return JSON.stringify({ entities: [], relations: [] });
  };
  const { edges } = await extractCodeCrib({ stashRoot: STASH, llmCall: llm });
  assert.equal(edges.length, 1);
  assert.equal(edges[0].from, 'beta');
  assert.equal(edges[0].to, 'alpha');
  assert.equal(edges[0].kind, 'semantic');
  assert.equal(edges[0].weight, 0.9);
  assert.equal(edges[0].evidence, 'visualizes');
});

test('extractCodeCrib continues when llm throws for one module', async () => {
  const llm = async (prompt) => {
    if (prompt.includes('alpha')) throw new Error('llm down');
    return JSON.stringify({ entities: [], relations: [] });
  };
  const result = await extractCodeCrib({ stashRoot: STASH, llmCall: llm });
  // Both nodes still present; no edges from alpha
  assert.equal(result.nodes.length, 2);
});

test('extractCodeCrib returns empty result for missing stash dir', async () => {
  const llm = async () => '';
  const result = await extractCodeCrib({ stashRoot: '/nonexistent/path', llmCall: llm });
  assert.deepEqual(result, { nodes: [], edges: [] });
});
```

- [ ] **Step 3: Run tests, verify they fail**

```bash
cd plugins/crib-hood && npm test
```

Expected: `Cannot find module '../server/graph/code-crib-source'`.

- [ ] **Step 4: Implement the module**

`plugins/crib-hood/server/graph/code-crib-source.js`:

```javascript
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
```

- [ ] **Step 5: Run tests, verify they pass**

```bash
cd plugins/crib-hood && npm test
```

Expected: 4 new code-crib-source tests pass.

- [ ] **Step 6: Commit**

```bash
git add plugins/crib-hood/server/graph/code-crib-source.js \
        plugins/crib-hood/tests/code-crib-source.test.js \
        plugins/crib-hood/tests/fixtures/sample-stash/
git commit -m "feat(crib-hood): code-crib source extracts semantic edges via injected LLM"
```

---

## Task 5: Builder orchestrator

**Files:**
- Create: `plugins/crib-hood/server/graph/builder.js`
- Create: `plugins/crib-hood/tests/builder.test.js`

**Module contract:** `async buildGraph({ repoRoot, stashRoot, llmCall, now })` (`now` injectable for deterministic timestamps in tests) → writes nothing, returns the full `graph.json` object including `version`, `builtAt`, `source`, `repoRoot`, `nodes`, `edges`. The `source` field is `"hybrid"` when both AST and code-crib produced output, `"ast"` when stash is missing, `"code-crib"` if AST yields zero nodes (rare).

- [ ] **Step 1: Write the failing tests**

`plugins/crib-hood/tests/builder.test.js`:

```javascript
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { buildGraph } = require('../server/graph/builder');

const REPO = path.join(__dirname, 'fixtures', 'sample-repo');
const STASH = path.join(__dirname, 'fixtures', 'sample-stash');
const NOW = () => new Date('2026-04-27T00:00:00.000Z');

test('buildGraph hybrid source when both inputs available', async () => {
  const llm = async () => JSON.stringify({ entities: [], relations: [] });
  const g = await buildGraph({ repoRoot: REPO, stashRoot: STASH, llmCall: llm, now: NOW });
  assert.equal(g.version, 1);
  assert.equal(g.source, 'hybrid');
  assert.equal(g.builtAt, '2026-04-27T00:00:00.000Z');
  assert.equal(g.repoRoot, REPO);
  assert.ok(Array.isArray(g.nodes));
  assert.ok(Array.isArray(g.edges));
});

test('buildGraph source=ast when stash missing', async () => {
  const llm = async () => '';
  const g = await buildGraph({ repoRoot: REPO, stashRoot: '/nonexistent', llmCall: llm, now: NOW });
  assert.equal(g.source, 'ast');
  assert.ok(g.nodes.length >= 3); // alpha/beta/gamma
});

test('buildGraph merges semantic edges with structural edges', async () => {
  const llm = async (prompt) => {
    if (prompt.includes('alpha')) {
      return JSON.stringify({
        entities: [],
        relations: [{ from: 'alpha', to: 'beta', label: 'orchestrates', confidence: 0.7 }],
      });
    }
    return JSON.stringify({ entities: [], relations: [] });
  };
  const g = await buildGraph({ repoRoot: REPO, stashRoot: STASH, llmCall: llm, now: NOW });
  const semantic = g.edges.filter((e) => e.kind === 'semantic');
  const structural = g.edges.filter((e) => e.kind === 'structural');
  assert.ok(semantic.length >= 1);
  assert.ok(structural.length >= 1);
});

test('buildGraph fills node.path from AST source even when stash names match', async () => {
  const llm = async () => JSON.stringify({ entities: [], relations: [] });
  const g = await buildGraph({ repoRoot: REPO, stashRoot: STASH, llmCall: llm, now: NOW });
  const alpha = g.nodes.find((n) => n.id === 'alpha');
  assert.equal(alpha.path, 'plugins/alpha');
});
```

- [ ] **Step 2: Run tests, verify they fail**

```bash
cd plugins/crib-hood && npm test
```

Expected: `Cannot find module '../server/graph/builder'`.

- [ ] **Step 3: Implement the builder**

`plugins/crib-hood/server/graph/builder.js`:

```javascript
'use strict';
const fs = require('fs');
const { extractAst } = require('./ast-source');
const { extractCodeCrib } = require('./code-crib-source');
const { mergeSources } = require('./merge');

async function buildGraph({ repoRoot, stashRoot, llmCall, now }) {
  const astResult = extractAst(repoRoot);
  const stashAvailable = !!stashRoot && fs.existsSync(stashRoot);
  const ccResult = stashAvailable
    ? await extractCodeCrib({ stashRoot, llmCall })
    : { nodes: [], edges: [] };

  // AST first so its `path` field wins for shared node ids during merge
  const merged = mergeSources([astResult, ccResult]);

  let source;
  if (astResult.nodes.length && ccResult.nodes.length) source = 'hybrid';
  else if (astResult.nodes.length) source = 'ast';
  else source = 'code-crib';

  const ts = (now ? now() : new Date()).toISOString();

  return {
    version: 1,
    builtAt: ts,
    source,
    repoRoot,
    nodes: merged.nodes,
    edges: merged.edges,
  };
}

module.exports = { buildGraph };
```

Adjust `merge.js` so the *first* source's non-empty `path` is preserved on subsequent merges. Re-open `plugins/crib-hood/server/graph/merge.js` and replace the node-merge inner block with:

```javascript
      if (!existing) {
        nodeMap.set(n.id, { ...n });
      } else {
        if (n.summary && !existing.summary) existing.summary = n.summary;
        if (Array.isArray(n.tags) && n.tags.length && !(existing.tags || []).length) {
          existing.tags = [...n.tags];
        }
        if (n.path && !existing.path) existing.path = n.path;
      }
```

- [ ] **Step 4: Run tests, verify they pass**

```bash
cd plugins/crib-hood && npm test
```

Expected: all builder tests pass; merge tests still pass.

- [ ] **Step 5: Commit**

```bash
git add plugins/crib-hood/server/graph/builder.js \
        plugins/crib-hood/server/graph/merge.js \
        plugins/crib-hood/tests/builder.test.js
git commit -m "feat(crib-hood): graph builder orchestrating AST + code-crib sources"
```

---

## Task 6: Activity mapper (path → owning module)

**Files:**
- Create: `plugins/crib-hood/server/graph/activity-mapper.js`
- Create: `plugins/crib-hood/tests/activity-mapper.test.js`

**Module contract:** `createActivityMapper({ graph })` returns `{ map(agentName, taskInfo) → events[] }`. `taskInfo` carries `currentFile | lastEdit.path | workspaceFile`. Each call returns SSE events to broadcast (`agent-on-module` and/or `agent-left-module`). Maintains internal per-agent last-known-module state.

- [ ] **Step 1: Write the failing tests**

`plugins/crib-hood/tests/activity-mapper.test.js`:

```javascript
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createActivityMapper } = require('../server/graph/activity-mapper');

const GRAPH = {
  nodes: [
    { id: 'alpha', path: 'plugins/alpha' },
    { id: 'beta', path: 'plugins/beta' },
    { id: 'long-name', path: 'plugins/long-name' },
  ],
};

test('map emits agent-on-module on first hit', () => {
  const mapper = createActivityMapper({ graph: GRAPH });
  const events = mapper.map('executor', { currentFile: 'plugins/alpha/index.js' });
  assert.equal(events.length, 1);
  assert.equal(events[0].type, 'agent-on-module');
  assert.equal(events[0].agent, 'executor');
  assert.equal(events[0].module, 'alpha');
});

test('map emits left+on when agent moves modules', () => {
  const mapper = createActivityMapper({ graph: GRAPH });
  mapper.map('executor', { currentFile: 'plugins/alpha/index.js' });
  const events = mapper.map('executor', { currentFile: 'plugins/beta/server.js' });
  assert.deepEqual(events.map((e) => [e.type, e.module]), [
    ['agent-left-module', 'alpha'],
    ['agent-on-module', 'beta'],
  ]);
});

test('map emits no event when agent stays on same module', () => {
  const mapper = createActivityMapper({ graph: GRAPH });
  mapper.map('executor', { currentFile: 'plugins/alpha/index.js' });
  const events = mapper.map('executor', { currentFile: 'plugins/alpha/util.js' });
  assert.equal(events.length, 0);
});

test('map prefers longest matching path', () => {
  const mapper = createActivityMapper({ graph: GRAPH });
  // path "plugins/long-name/x.js" matches both "plugins/long-name" and (incorrectly) any prefix
  // longest-prefix should pick long-name
  const events = mapper.map('e', { currentFile: 'plugins/long-name/x.js' });
  assert.equal(events[0].module, 'long-name');
});

test('map returns empty for orphan path', () => {
  const mapper = createActivityMapper({ graph: GRAPH });
  const events = mapper.map('e', { currentFile: 'docs/readme.md' });
  assert.deepEqual(events, []);
});

test('map falls back to lastEdit.path then workspaceFile', () => {
  const mapper = createActivityMapper({ graph: GRAPH });
  const e1 = mapper.map('e', { lastEdit: { path: 'plugins/alpha/x.js' } });
  assert.equal(e1[0].module, 'alpha');

  const mapper2 = createActivityMapper({ graph: GRAPH });
  const e2 = mapper2.map('e', { workspaceFile: 'plugins/beta/x.js' });
  assert.equal(e2[0].module, 'beta');
});
```

- [ ] **Step 2: Run tests, verify they fail**

```bash
cd plugins/crib-hood && npm test
```

Expected: `Cannot find module '../server/graph/activity-mapper'`.

- [ ] **Step 3: Implement the module**

`plugins/crib-hood/server/graph/activity-mapper.js`:

```javascript
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
```

- [ ] **Step 4: Run tests, verify they pass**

```bash
cd plugins/crib-hood && npm test
```

Expected: 6 activity-mapper tests pass.

- [ ] **Step 5: Commit**

```bash
git add plugins/crib-hood/server/graph/activity-mapper.js plugins/crib-hood/tests/activity-mapper.test.js
git commit -m "feat(crib-hood): activity mapper resolves agent task paths to owning modules"
```

---

## Task 7: Server graph endpoints + SSE event extension

**Files:**
- Modify: `plugins/crib-hood/server/index.js` — add a graph cache + 2 endpoints + integration with the activity mapper into the SSE broadcast loop
- Create: `plugins/crib-hood/tests/server-graph-api.test.js`

**Plan for index.js changes:**
- Top-of-file: introduce `GRAPH_DIR = path.join(os.homedir(), '.claude', 'crib-hood')`, `repoHash()` helper, `loadGraph()`, `saveGraph()` (atomic write), and a module-level `graphCache` variable.
- Replace `readAllState()`'s sole use as the SSE payload — instead `broadcast(readAllState())` becomes `broadcast({ type: 'state-snapshot', state: readAllState() })`. (This is intentional: the client now receives typed events. Update `app.js` accordingly in Task 11.)
- Add `GET /api/graph` — returns `{ exists: false }` if cache empty, else the graph object.
- Add `POST /api/graph/rebuild` — re-reads the file from disk, refreshes `graphCache`, broadcasts `{ type: 'graph-rebuilt', source }`. Body of the request is ignored (the build script writes the file before calling this).
- In `scheduleUpdate()` (the debounced watcher), after computing state, run the activity mapper for each agent that has `taskId` and emit any returned events.

- [ ] **Step 1: Write the failing tests**

`plugins/crib-hood/tests/server-graph-api.test.js`:

```javascript
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const SERVER = path.join(__dirname, '..', 'server', 'index.js');

function getJson(port, urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${port}${urlPath}`, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(body) }); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function postJson(port, urlPath, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload || {});
    const req = http.request({
      host: '127.0.0.1', port, path: urlPath, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    }, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function startServer({ port, repoRoot }) {
  return new Promise((resolve) => {
    const proc = spawn(process.execPath, [SERVER], {
      cwd: repoRoot,
      env: { ...process.env, CRIB_HOOD_PORT: String(port) },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    proc.stdout.on('data', (chunk) => {
      if (chunk.toString().includes('Crib Hood running')) resolve(proc);
    });
  });
}

test('GET /api/graph returns exists:false when no graph file', async () => {
  const port = 53700;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'crib-hood-test-'));
  // No graph file in HOME — set HOME to tmp
  const proc = await new Promise((resolve) => {
    const p = spawn(process.execPath, [SERVER], {
      cwd: tmp,
      env: { ...process.env, HOME: tmp, CRIB_HOOD_PORT: String(port) },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    p.stdout.on('data', (chunk) => {
      if (chunk.toString().includes('Crib Hood running')) resolve(p);
    });
  });
  try {
    const resp = await getJson(port, '/api/graph');
    assert.equal(resp.status, 200);
    assert.equal(resp.body.exists, false);
  } finally {
    proc.kill();
  }
});

test('GET /api/graph returns saved graph after writing file', async () => {
  const port = 53701;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'crib-hood-test-'));
  const cribHoodDir = path.join(tmp, '.claude', 'crib-hood');
  fs.mkdirSync(cribHoodDir, { recursive: true });
  // We need to know the repoHash the server picks. Easier path: pre-seed every possible
  // location by writing to a wildcard `default.json` AND have the server pick a single file.
  // For simplicity in V1, server falls back to reading the single file in GRAPH_DIR if exactly one exists.
  fs.writeFileSync(path.join(cribHoodDir, 'graph.json'), JSON.stringify({
    version: 1, builtAt: '2026-04-27T00:00:00Z', source: 'ast',
    repoRoot: tmp, nodes: [{ id: 'alpha', path: 'plugins/alpha' }], edges: [],
  }));

  const proc = await new Promise((resolve) => {
    const p = spawn(process.execPath, [SERVER], {
      cwd: tmp,
      env: { ...process.env, HOME: tmp, CRIB_HOOD_PORT: String(port), CRIB_HOOD_GRAPH_FILE: path.join(cribHoodDir, 'graph.json') },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    p.stdout.on('data', (chunk) => {
      if (chunk.toString().includes('Crib Hood running')) resolve(p);
    });
  });
  try {
    const resp = await getJson(port, '/api/graph');
    assert.equal(resp.status, 200);
    assert.equal(resp.body.version, 1);
    assert.equal(resp.body.nodes[0].id, 'alpha');
  } finally {
    proc.kill();
  }
});

test('POST /api/graph/rebuild reloads graph from disk', async () => {
  const port = 53702;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'crib-hood-test-'));
  const file = path.join(tmp, 'graph.json');
  fs.writeFileSync(file, JSON.stringify({ version: 1, source: 'ast', repoRoot: tmp, nodes: [], edges: [], builtAt: 't1' }));

  const proc = await new Promise((resolve) => {
    const p = spawn(process.execPath, [SERVER], {
      cwd: tmp,
      env: { ...process.env, HOME: tmp, CRIB_HOOD_PORT: String(port), CRIB_HOOD_GRAPH_FILE: file },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    p.stdout.on('data', (chunk) => {
      if (chunk.toString().includes('Crib Hood running')) resolve(p);
    });
  });
  try {
    fs.writeFileSync(file, JSON.stringify({
      version: 1, source: 'ast', repoRoot: tmp,
      nodes: [{ id: 'newone', path: 'plugins/newone' }], edges: [], builtAt: 't2',
    }));
    const resp = await postJson(port, '/api/graph/rebuild', {});
    assert.equal(resp.status, 200);
    const after = await getJson(port, '/api/graph');
    assert.equal(after.body.nodes[0].id, 'newone');
  } finally {
    proc.kill();
  }
});
```

- [ ] **Step 2: Run tests, verify they fail**

```bash
cd plugins/crib-hood && npm test
```

Expected: server starts but `/api/graph` returns 404.

- [ ] **Step 3: Modify `server/index.js` — add graph cache + endpoints**

In `plugins/crib-hood/server/index.js`, after the existing `TEAMS_DIR` declaration (line 51), add:

```javascript
const DEFAULT_GRAPH_DIR = path.join(os.homedir(), '.claude', 'crib-hood');
const GRAPH_FILE = process.env.CRIB_HOOD_GRAPH_FILE || (() => {
  // V1 simplification: if exactly one *.json exists in DEFAULT_GRAPH_DIR or its first subdir,
  // use it; otherwise return path that may not exist (graph endpoint returns exists:false).
  try {
    if (!fs.existsSync(DEFAULT_GRAPH_DIR)) return path.join(DEFAULT_GRAPH_DIR, 'graph.json');
    const direct = path.join(DEFAULT_GRAPH_DIR, 'graph.json');
    if (fs.existsSync(direct)) return direct;
    const subs = fs.readdirSync(DEFAULT_GRAPH_DIR, { withFileTypes: true })
      .filter((e) => e.isDirectory()).map((e) => path.join(DEFAULT_GRAPH_DIR, e.name, 'graph.json'))
      .filter((p) => fs.existsSync(p));
    return subs[0] || direct;
  } catch (_) {
    return path.join(DEFAULT_GRAPH_DIR, 'graph.json');
  }
})();

let graphCache = null;
function loadGraph() {
  try {
    if (!fs.existsSync(GRAPH_FILE)) { graphCache = null; return null; }
    const raw = fs.readFileSync(GRAPH_FILE, 'utf8');
    graphCache = JSON.parse(raw);
    return graphCache;
  } catch (err) {
    console.error('[crib-hood] Failed to load graph:', err.message);
    graphCache = null;
    return null;
  }
}
loadGraph();

const { createActivityMapper } = require('./graph/activity-mapper');
let activityMapper = createActivityMapper({ graph: graphCache || { nodes: [] } });
```

- [ ] **Step 4: Add the `/api/graph` and `/api/graph/rebuild` route handlers**

In `server/index.js`, inside the `http.createServer((req, res) => { ... })` body, *after* the existing `/api/state` handler and *before* the `/events` handler, insert:

```javascript
  // GET /api/graph
  if (req.method === 'GET' && pathname === '/api/graph') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    if (!graphCache) {
      res.end(JSON.stringify({ exists: false }));
    } else {
      res.end(JSON.stringify(graphCache));
    }
    return;
  }

  // POST /api/graph/rebuild
  if (req.method === 'POST' && pathname === '/api/graph/rebuild') {
    const g = loadGraph();
    if (!g) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'graph file not found' }));
      return;
    }
    activityMapper = createActivityMapper({ graph: g });
    broadcast({ type: 'graph-rebuilt', source: g.source, ts: Date.now() });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
```

- [ ] **Step 5: Update SSE payload shape and add agent-on-module emission**

In `server/index.js`, locate `function broadcast(data)` and `scheduleUpdate()`. Replace `scheduleUpdate`'s body:

```javascript
function scheduleUpdate() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    const state = readAllState();
    broadcast({ type: 'state-snapshot', state });

    // Emit per-agent module mapping events
    for (const agent of state.agents) {
      if (!agent.task) continue;
      const taskInfo = { workspaceFile: agent.task.path, lastEdit: { path: agent.task } };
      // V1: agent.task is a string subject. Activity mapping requires a file path.
      // Until task records carry currentFile, this loop is a no-op for string tasks.
      // The mapper handles missing/orphan paths gracefully.
      const events = activityMapper.map(agent.name, taskInfo);
      for (const e of events) broadcast(e);
    }
  }, 300);
}
```

Also update the `/events` route's "Send initial state" block:

```javascript
    // Send initial state
    res.write(`data: ${JSON.stringify({ type: 'state-snapshot', state: readAllState() })}\n\n`);
    if (graphCache) {
      res.write(`data: ${JSON.stringify({ type: 'graph-rebuilt', source: graphCache.source, ts: Date.now() })}\n\n`);
    }
```

- [ ] **Step 6: Run tests, verify they pass**

```bash
cd plugins/crib-hood && npm test
```

Expected: 3 server-graph-api tests pass; prior tests still pass.

- [ ] **Step 7: Commit**

```bash
git add plugins/crib-hood/server/index.js plugins/crib-hood/tests/server-graph-api.test.js
git commit -m "feat(crib-hood): /api/graph endpoints + typed SSE events"
```

---

## Task 8: Build-map command + script

**Files:**
- Create: `plugins/crib-hood/scripts/build-map.js`
- Create: `plugins/crib-hood/commands/build-map.md`

**Behavior:** `node scripts/build-map.js [--repo PATH] [--no-llm]` resolves repo root, computes `repoHash` (SHA1 of absolute path, 8 chars), writes `~/.claude/crib-hood/<repoHash>/graph.json`, and POSTs to `http://localhost:<port>/api/graph/rebuild` (best effort, ignores failure).

LLM caller for production: spawns `claude -p <prompt>` and reads stdout; on non-zero exit, throws.

- [ ] **Step 1: Implement `scripts/build-map.js`**

`plugins/crib-hood/scripts/build-map.js`:

```javascript
#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const http = require('http');
const { spawn } = require('child_process');
const { buildGraph } = require('../server/graph/builder');

function parseArgs(argv) {
  const args = { repo: process.cwd(), llm: true };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--repo') args.repo = path.resolve(argv[++i]);
    else if (argv[i] === '--no-llm') args.llm = false;
  }
  return args;
}

function repoHash(absPath) {
  return crypto.createHash('sha1').update(absPath).digest('hex').slice(0, 8);
}

function findStash(repoRoot) {
  const repo = path.basename(repoRoot);
  const candidate = path.join(os.homedir(), '.claude', 'code-crib', 'docs', repo);
  return fs.existsSync(candidate) ? candidate : null;
}

function makeClaudeLlm() {
  return (prompt) => new Promise((resolve, reject) => {
    const proc = spawn('claude', ['-p', prompt], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    proc.stdout.on('data', (c) => (stdout += c));
    proc.stderr.on('data', (c) => (stderr += c));
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`claude exited ${code}: ${stderr}`));
    });
  });
}

function notifyServer(port = 4567) {
  return new Promise((resolve) => {
    const data = '{}';
    const req = http.request({
      host: '127.0.0.1', port, path: '/api/graph/rebuild', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    }, (res) => { res.on('data', () => {}); res.on('end', resolve); });
    req.on('error', () => resolve()); // server may not be running
    req.write(data); req.end();
  });
}

async function main() {
  const args = parseArgs(process.argv);
  const stashRoot = args.llm ? findStash(args.repo) : null;
  const llm = args.llm && stashRoot ? makeClaudeLlm() : async () => '';

  console.log(`[build-map] repo: ${args.repo}`);
  console.log(`[build-map] stash: ${stashRoot || '(none — AST only)'}`);

  const graph = await buildGraph({ repoRoot: args.repo, stashRoot, llmCall: llm });

  const outDir = path.join(os.homedir(), '.claude', 'crib-hood', repoHash(args.repo));
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'graph.json');
  const tmpFile = outFile + '.tmp';
  fs.writeFileSync(tmpFile, JSON.stringify(graph, null, 2));
  fs.renameSync(tmpFile, outFile);

  console.log(`[build-map] wrote ${graph.nodes.length} nodes, ${graph.edges.length} edges`);
  console.log(`[build-map] source: ${graph.source}`);
  console.log(`[build-map] file:   ${outFile}`);

  await notifyServer(parseInt(process.env.CRIB_HOOD_PORT || '4567', 10));
  console.log('[build-map] done');
}

main().catch((err) => {
  console.error('[build-map] failed:', err.message);
  process.exit(1);
});
```

Make it executable:

```bash
chmod +x plugins/crib-hood/scripts/build-map.js
```

- [ ] **Step 2: Create the slash command**

`plugins/crib-hood/commands/build-map.md`:

```markdown
---
name: crib-hood:build-map
description: Build the GraphRAG module map for the current repo
---

# /crib-hood:build-map

Builds `graph.json` for the current repository at `~/.claude/crib-hood/<repoHash>/graph.json`.

## Usage

```
/crib-hood:build-map [--repo PATH] [--no-llm]
```

- `--repo PATH` — target repo root (default: current working directory)
- `--no-llm` — skip code-crib semantic edge extraction; AST structural edges only

## What it does

1. Detects whether `~/.claude/code-crib/docs/<repoName>/` exists (the code-crib stash).
2. If present, reads each module's `SCOPE.md` and calls Claude to extract semantic relations.
3. Always runs the regex AST source over `<repoRoot>/plugins/*/`.
4. Merges sources into a single `graph.json`.
5. POSTs `/api/graph/rebuild` to the running crib-hood server (best-effort).

## Implementation

Run the build script:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/build-map.js" "$@"
```

Tip: run `/code-crib:analyze` first to populate the code-crib stash for richer semantic edges.
```

- [ ] **Step 3: Smoke test the build-map script against this repo**

```bash
cd /Users/dave/iWorks/claude-crib && node plugins/crib-hood/scripts/build-map.js --no-llm
ls ~/.claude/crib-hood/*/graph.json
```

Expected: stdout shows `wrote N nodes, M edges` (N >= 9 for current plugins/), and the listed file exists.

Inspect the output:

```bash
cat ~/.claude/crib-hood/*/graph.json | head -40
```

Expected: valid JSON with `version: 1`, `source: "ast"`, and the 9 plugin module ids.

- [ ] **Step 4: Commit**

```bash
git add plugins/crib-hood/scripts/build-map.js plugins/crib-hood/commands/build-map.md
git commit -m "feat(crib-hood): add /crib-hood:build-map command and build script"
```

---

## Task 9: Map view shell — replace grid with map container

**Files:**
- Modify: `plugins/crib-hood/server/public/index.html`
- Modify: `plugins/crib-hood/server/public/app.js` — remove grid render, bootstrap map module
- Create: `plugins/crib-hood/server/public/map/map.css`

**Approach:** Convert the existing grid container into the map shell. Add `<div id="cy"></div>` for Cytoscape, an absolute-positioned `<div id="creatures"></div>` overlay for animals, and a top-bar toggle. Load Cytoscape from CDN.

- [ ] **Step 1: Read the current index.html and app.js entry points**

```bash
sed -n '1,30p' plugins/crib-hood/server/public/index.html
sed -n '1,40p' plugins/crib-hood/server/public/app.js
```

Note the existing root container id and the entry function name.

- [ ] **Step 2: Replace the grid container in `index.html`**

In `plugins/crib-hood/server/public/index.html`, replace the body content with this map shell. Keep the existing `<head>` (title, style.css link). Append the Cytoscape CDN script and the new map module scripts:

```html
<body>
  <div id="header">
    <div id="title">🌌 Crib Hood Map</div>
    <div id="meta">
      <span id="meta-mode">—</span>
      <span id="meta-count">0 modules</span>
      <span id="meta-agents">0 agents</span>
      <span id="meta-source" data-source="">—</span>
    </div>
    <div id="layer-toggle">
      <button class="layer-pill on" data-layer="structural">구조</button>
      <button class="layer-pill" data-layer="semantic">의미</button>
      <button class="layer-pill" data-layer="activity">활동</button>
      <button id="trail-toggle" class="layer-pill" data-trail>자취</button>
    </div>
  </div>

  <div id="empty-state" hidden>
    <p>Build the map first.</p>
    <pre><code>/crib-hood:build-map</code></pre>
  </div>

  <div id="stage">
    <div id="cy"></div>
    <div id="creatures"></div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/cytoscape@3.30.2/dist/cytoscape.min.js"></script>
  <script src="characters.js"></script>
  <script src="map/animal-renderer.js"></script>
  <script src="map/trail.js"></script>
  <script src="map/map.js"></script>
  <script src="app.js"></script>
</body>
```

- [ ] **Step 3: Strip grid logic out of `app.js` and call `initMap()`**

Replace the contents of `plugins/crib-hood/server/public/app.js` with:

```javascript
'use strict';
(function () {
  const stream = new EventSource('/events');
  const handlers = {
    'state-snapshot': (msg) => window.__map?.onStateSnapshot?.(msg.state),
    'graph-rebuilt': () => window.__map?.refreshGraph(),
    'agent-on-module': (msg) => window.__map?.onAgentOnModule?.(msg),
    'agent-left-module': (msg) => window.__map?.onAgentLeftModule?.(msg),
  };

  stream.onmessage = (evt) => {
    let data;
    try { data = JSON.parse(evt.data); } catch (_) { return; }
    if (data && data.type && handlers[data.type]) handlers[data.type](data);
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.__map = window.initMap();
    window.__map.refreshGraph();
  });
})();
```

- [ ] **Step 4: Create the map CSS**

`plugins/crib-hood/server/public/map/map.css`:

```css
#header {
  display: flex; align-items: center; gap: 16px;
  padding: 10px 14px; background: #0a0a0a; border-bottom: 1px solid #222;
}
#title { font-weight: 600; color: #7fffaf; }
#meta { display: flex; gap: 12px; color: #888; font-size: 12px; align-items: center; }
#meta-source { padding: 2px 8px; border-radius: 4px; font-size: 10px; }
#meta-source[data-source="ast"] { background: #3e3527; color: #d4a373; }
#meta-source[data-source="hybrid"] { background: #2d4a3e; color: #7fffaf; }
#meta-source[data-source="code-crib"] { background: #2d3e4a; color: #7fafff; }
#layer-toggle { margin-left: auto; display: flex; gap: 6px; }
.layer-pill {
  background: #1a1a1a; color: #888; border: 1px solid #2a2a2a;
  padding: 4px 10px; border-radius: 6px; font-size: 11px; cursor: pointer;
}
.layer-pill.on { background: #2d4a3e; color: #7fffaf; border-color: #3d6a5e; }
.layer-pill[data-layer="semantic"].on { background: #3e3527; color: #d4a373; border-color: #5e4f37; }
.layer-pill[data-layer="activity"].on { background: #2e2730; color: #d4a3ff; border-color: #4e3f5a; }

#stage { position: relative; height: calc(100vh - 56px); }
#cy { position: absolute; inset: 0; }
#creatures { position: absolute; inset: 0; pointer-events: none; }

.creature {
  position: absolute; font-size: 28px;
  transform: translate(-50%, -100%);
  filter: drop-shadow(0 0 6px #7fffaf);
  animation: bob 2s ease-in-out infinite;
  transition: transform 0.6s ease-out;
}
@keyframes bob {
  0%, 100% { transform: translate(-50%, -100%) translateY(0); }
  50% { transform: translate(-50%, -100%) translateY(-5px); }
}

#empty-state {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; color: #888; gap: 8px;
}
```

Wire `map.css` into `style.css`. Append to `plugins/crib-hood/server/public/style.css`:

```css
@import url('map/map.css');
```

- [ ] **Step 5: Smoke test the shell (no Cytoscape rendering yet — that's Task 10)**

Start the server and load the page:

```bash
node plugins/crib-hood/server/index.js &
SERVER_PID=$!
sleep 1
curl -s http://localhost:4567/ | grep -E '(cy|creatures|layer-toggle)' && echo OK || echo FAIL
kill $SERVER_PID
```

Expected: lines containing `cy`, `creatures`, and `layer-toggle` appear → "OK".

- [ ] **Step 6: Commit**

```bash
git add plugins/crib-hood/server/public/index.html \
        plugins/crib-hood/server/public/app.js \
        plugins/crib-hood/server/public/style.css \
        plugins/crib-hood/server/public/map/map.css
git commit -m "feat(crib-hood): replace grid with map shell + layer toggle UI"
```

---

## Task 10: Cytoscape rendering + layer toggle

**Files:**
- Create: `plugins/crib-hood/server/public/map/map.js`

**Behavior:** Exposes `window.initMap()` returning `{ refreshGraph, onStateSnapshot, onAgentOnModule, onAgentLeftModule, ...internals }`. `refreshGraph` fetches `/api/graph`, builds Cytoscape elements, applies the cose layout, wires layer toggle clicks. Animals are not yet wired (Task 11).

- [ ] **Step 1: Implement `map.js`**

`plugins/crib-hood/server/public/map/map.js`:

```javascript
'use strict';
window.initMap = function initMap() {
  const cyContainer = document.getElementById('cy');
  const empty = document.getElementById('empty-state');
  const metaCount = document.getElementById('meta-count');
  const metaAgents = document.getElementById('meta-agents');
  const metaMode = document.getElementById('meta-mode');
  const layerButtons = document.querySelectorAll('.layer-pill[data-layer]');

  let cy = null;
  const layerState = { structural: true, semantic: false, activity: false };
  const animals = window.AnimalRenderer ? window.AnimalRenderer.create({ container: document.getElementById('creatures') }) : null;
  const trail = window.Trail ? window.Trail.create() : null;

  function showEmpty(on) { empty.hidden = !on; cyContainer.style.display = on ? 'none' : ''; }

  function buildElements(graph) {
    const nodes = graph.nodes.map((n) => ({ data: { id: n.id, label: n.label, path: n.path, summary: n.summary || '' } }));
    const edges = graph.edges.map((e, i) => ({
      data: { id: `e${i}`, source: e.from, target: e.to, kind: e.kind, weight: e.weight, evidence: e.evidence || '' },
      classes: `kind-${e.kind}`,
    }));
    return [...nodes, ...edges];
  }

  function applyLayerVisibility() {
    if (!cy) return;
    for (const kind of ['structural', 'semantic', 'activity']) {
      cy.edges(`.kind-${kind}`).style('display', layerState[kind] ? 'element' : 'none');
    }
  }

  function renderGraph(graph) {
    if (!graph || !graph.nodes || !graph.nodes.length) { showEmpty(true); return; }
    showEmpty(false);

    if (cy) cy.destroy();
    cy = cytoscape({
      container: cyContainer,
      elements: buildElements(graph),
      style: [
        { selector: 'node', style: {
          'background-color': '#2a3a4a', 'border-color': '#6a8aaa', 'border-width': 2,
          label: 'data(label)', color: '#c0c0c0', 'font-size': 12,
          'text-valign': 'bottom', 'text-margin-y': 6, width: 48, height: 48,
        }},
        { selector: 'node.busy', style: { 'border-color': '#7fffaf', 'shadow-color': '#7fffaf', 'shadow-blur': 16, 'shadow-opacity': 0.7 }},
        { selector: 'edge', style: { 'curve-style': 'bezier', 'target-arrow-shape': 'none' }},
        { selector: 'edge.kind-structural', style: { width: 'mapData(weight, 0, 1, 1, 5)', 'line-color': '#4a6a8a' }},
        { selector: 'edge.kind-semantic', style: { 'line-style': 'dashed', 'line-color': '#d4a373', width: 2 }},
        { selector: 'edge.kind-activity', style: { 'line-color': '#d4a3ff', width: 'mapData(weight, 0, 1, 1, 4)', 'line-style': 'dotted' }},
      ],
      layout: { name: 'cose', animate: true, randomize: true, nodeRepulsion: 8000 },
      minZoom: 0.3, maxZoom: 3,
    });

    cy.on('render position', () => animals?.syncPositions(cy));
    applyLayerVisibility();
    metaCount.textContent = `${graph.nodes.length} modules`;
    const src = document.getElementById('meta-source');
    src.textContent = graph.source === 'ast' ? '🔍 AST-only' : graph.source === 'hybrid' ? '🌐 Hybrid' : '📚 code-crib';
    src.dataset.source = graph.source || '';
  }

  async function refreshGraph() {
    try {
      const resp = await fetch('/api/graph');
      const data = await resp.json();
      if (data && data.exists === false) { showEmpty(true); return; }
      window.__currentGraph = data;
      renderGraph(data);
    } catch (err) {
      console.error('[map] failed to load graph', err);
      showEmpty(true);
    }
  }

  for (const btn of layerButtons) {
    btn.addEventListener('click', () => {
      const kind = btn.dataset.layer;
      layerState[kind] = !layerState[kind];
      btn.classList.toggle('on', layerState[kind]);
      applyLayerVisibility();
    });
  }

  function onStateSnapshot(state) {
    metaMode.textContent = state.mode ? state.mode.name : '—';
    metaAgents.textContent = `${state.agents.length} agents`;
  }

  function onAgentOnModule(msg) {
    if (cy) cy.getElementById(msg.module).addClass('busy');
    animals?.placeAgent(msg.agent, msg.module, msg.character);
    trail?.push(msg.agent, msg.module);
  }

  function onAgentLeftModule(msg) {
    animals?.removeAgent(msg.agent);
    // V1: re-derive busy classes from the live animal map after removal
    if (cy) {
      cy.nodes('.busy').removeClass('busy');
      const stillActive = animals ? animals.activeModules() : new Set();
      stillActive.forEach((m) => cy.getElementById(m).addClass('busy'));
    }
  }

  return { refreshGraph, onStateSnapshot, onAgentOnModule, onAgentLeftModule, _cy: () => cy };
};
```

- [ ] **Step 2: Smoke test in a browser**

```bash
node plugins/crib-hood/scripts/build-map.js --no-llm
node plugins/crib-hood/server/index.js &
sleep 1
open http://localhost:4567/
```

Expected: 9 module nodes laid out with structural edges visible. Click "의미" pill → semantic edges (none yet, but no error). Click "구조" pill off → all edges hidden.

Stop the server: `kill %1`.

- [ ] **Step 3: Commit**

```bash
git add plugins/crib-hood/server/public/map/map.js
git commit -m "feat(crib-hood): cytoscape map render + layer toggle wiring"
```

---

## Task 11: Animal renderer (DOM overlay tracking node positions)

**Files:**
- Create: `plugins/crib-hood/server/public/map/animal-renderer.js`

**Behavior:** Maintains a `Map<agentName, {el, module}>`. `placeAgent(name, module, character)` inserts/moves an emoji div into `#creatures`. `syncPositions(cy)` reads each agent's module's rendered position and writes `transform: translate(...)` so the animal hovers above the node. Multiple agents on one module are scattered around the node circumference.

- [ ] **Step 1: Implement the renderer**

`plugins/crib-hood/server/public/map/animal-renderer.js`:

```javascript
'use strict';
window.AnimalRenderer = (() => {
  function create({ container }) {
    const animals = new Map(); // name → { el, module, character }

    function placeAgent(name, moduleId, character) {
      let entry = animals.get(name);
      if (!entry) {
        const el = document.createElement('div');
        el.className = 'creature';
        el.dataset.agent = name;
        container.appendChild(el);
        entry = { el, module: moduleId, character };
        animals.set(name, entry);
      } else {
        entry.module = moduleId;
        if (character) entry.character = character;
      }
      entry.el.textContent = entry.character || '🤖';
    }

    function removeAgent(name) {
      const entry = animals.get(name);
      if (entry) { entry.el.remove(); animals.delete(name); }
    }

    function activeModules() {
      const set = new Set();
      for (const entry of animals.values()) set.add(entry.module);
      return set;
    }

    function syncPositions(cy) {
      // Group agents by module so we can scatter co-located ones
      const byModule = new Map();
      for (const [name, entry] of animals) {
        if (!byModule.has(entry.module)) byModule.set(entry.module, []);
        byModule.get(entry.module).push(entry);
      }
      for (const [moduleId, entries] of byModule) {
        const node = cy.getElementById(moduleId);
        if (!node || node.empty()) continue;
        const pos = node.renderedPosition();
        const radius = (node.renderedWidth() / 2) + 18;
        const count = entries.length;
        entries.forEach((entry, i) => {
          const angle = count === 1 ? -Math.PI / 2 : (Math.PI * 2 * i) / count - Math.PI / 2;
          const x = pos.x + Math.cos(angle) * (count === 1 ? 0 : radius);
          const y = pos.y + Math.sin(angle) * (count === 1 ? -radius : radius);
          entry.el.style.left = `${x}px`;
          entry.el.style.top = `${y}px`;
        });
      }
    }

    return { placeAgent, removeAgent, syncPositions, activeModules };
  }
  return { create };
})();
```

- [ ] **Step 2: Smoke test by simulating an SSE event in the browser console**

Start the server and the page (as in Task 10 step 2). Then in the browser DevTools console:

```javascript
window.__map.onAgentOnModule({ agent: 'executor', module: 'crib-hood', character: '🐹' });
```

Expected: a 🐹 appears above the `crib-hood` node and stays attached when you pan/zoom.

```javascript
window.__map.onAgentOnModule({ agent: 'planner', module: 'crib-hood', character: '🦉' });
```

Expected: 🐹 and 🦉 appear scattered around the same node (not overlapping).

```javascript
window.__map.onAgentLeftModule({ agent: 'executor', module: 'crib-hood' });
```

Expected: 🐹 disappears, 🦉 stays.

- [ ] **Step 3: Commit**

```bash
git add plugins/crib-hood/server/public/map/animal-renderer.js
git commit -m "feat(crib-hood): animal overlay renderer with co-location scatter"
```

---

## Task 12: Walk Trail toggle + Activity edge synthesis

**Files:**
- Create: `plugins/crib-hood/server/public/map/trail.js`
- Modify: `plugins/crib-hood/server/public/map/map.js` — wire trail toggle, synthesize activity edges, decay loop

**Behavior:** When the trail pill is ON, every `agent-on-module` push enters a per-agent ring buffer (size 5). Adjacent visits create virtual edges with `kind: 'activity'`, `weight = 0.3 + 0.1 * count`. A timer decays activity-edge weights by `0.8` every 30s and removes weights < `0.1`.

- [ ] **Step 1: Implement `trail.js`**

`plugins/crib-hood/server/public/map/trail.js`:

```javascript
'use strict';
window.Trail = (() => {
  function create() {
    const RING_SIZE = 5;
    const buffers = new Map(); // agent → [{module, at}]

    function push(agent, moduleId) {
      const buf = buffers.get(agent) || [];
      buf.push({ module: moduleId, at: Date.now() });
      while (buf.length > RING_SIZE) buf.shift();
      buffers.set(agent, buf);
    }

    function recentPairs() {
      // Returns array of [from, to] adjacency pairs across all agents (most recent within ring)
      const pairs = [];
      for (const buf of buffers.values()) {
        for (let i = 1; i < buf.length; i++) {
          if (buf[i - 1].module !== buf[i].module) {
            pairs.push([buf[i - 1].module, buf[i].module]);
          }
        }
      }
      return pairs;
    }

    function clear() { buffers.clear(); }
    return { push, recentPairs, clear };
  }
  return { create };
})();
```

- [ ] **Step 2: Wire trail + activity synthesis into `map.js`**

In `plugins/crib-hood/server/public/map/map.js`, add an activity-edge synthesis routine after the layer toggle wiring. Inside `initMap()` (before `return { ... }`), insert:

```javascript
  let trailEnabled = false;
  const trailToggle = document.getElementById('trail-toggle');
  trailToggle?.addEventListener('click', () => {
    trailEnabled = !trailEnabled;
    trailToggle.classList.toggle('on', trailEnabled);
    if (!trailEnabled) {
      trail?.clear();
      removeActivityEdges();
    }
  });

  function removeActivityEdges() {
    if (cy) cy.edges('.kind-activity').remove();
  }

  const activityWeights = new Map(); // "from->to" → weight
  function synthesizeActivity() {
    if (!cy || !trail || !trailEnabled) return;
    for (const [from, to] of trail.recentPairs()) {
      const key = `${from}->${to}`;
      const w = Math.min(1, (activityWeights.get(key) || 0) + 0.1);
      activityWeights.set(key, w);
    }
    removeActivityEdges();
    let i = 0;
    for (const [key, w] of activityWeights) {
      const [from, to] = key.split('->');
      cy.add({
        group: 'edges',
        data: { id: `act-${i++}`, source: from, target: to, kind: 'activity', weight: w, evidence: 'recent agent traffic' },
        classes: 'kind-activity',
      });
    }
    applyLayerVisibility();
  }

  // Decay loop
  setInterval(() => {
    if (!trailEnabled) return;
    for (const [k, w] of activityWeights) {
      const decayed = w * 0.8;
      if (decayed < 0.1) activityWeights.delete(k);
      else activityWeights.set(k, decayed);
    }
    synthesizeActivity();
  }, 30000);
```

In the existing `onAgentOnModule(msg)` handler, after `trail?.push(...)`, add:

```javascript
    synthesizeActivity();
```

- [ ] **Step 3: Smoke test trail behavior**

Start the server and page, then in the browser console:

```javascript
window.__map.onAgentOnModule({ agent: 'a', module: 'crib-hood', character: '🐹' });
document.getElementById('trail-toggle').click();   // turn trail on
document.querySelector('.layer-pill[data-layer="activity"]').click(); // show activity
window.__map.onAgentOnModule({ agent: 'a', module: 'code-crib', character: '🐹' });
window.__map.onAgentOnModule({ agent: 'a', module: 'cypher', character: '🐹' });
```

Expected: dotted purple edges appear connecting `crib-hood→code-crib→cypher`. Toggle activity off → they hide.

- [ ] **Step 4: Commit**

```bash
git add plugins/crib-hood/server/public/map/trail.js \
        plugins/crib-hood/server/public/map/map.js
git commit -m "feat(crib-hood): walk trail buffer + client-side activity edge synthesis"
```

---

## Task 13: Update `/crib-hood` command and README

**Files:**
- Modify: `plugins/crib-hood/commands/crib-hood.md`
- Modify: `plugins/crib-hood/README.md`

- [ ] **Step 1: Update the `/crib-hood` command**

Read the current file: `cat plugins/crib-hood/commands/crib-hood.md`. Add (or update existing) sections:

- Mention that the dashboard now opens directly into the Map view.
- Add a "Prerequisite" section pointing to `/crib-hood:build-map` (and optionally `/code-crib:analyze` for richer semantic edges).
- Note that without `graph.json` the page shows an empty state with a "Build the map" CTA.

Example block to insert near the top:

```markdown
## Prerequisites

The dashboard's Map view requires a built graph. Before opening:

1. (Optional, recommended) Run `/code-crib:analyze` to populate the code-crib stash for semantic edges.
2. Run `/crib-hood:build-map` to produce `~/.claude/crib-hood/<repoHash>/graph.json`.

Without these, the dashboard shows an empty state with a `/crib-hood:build-map` CTA.
```

- [ ] **Step 2: Update the README**

In `plugins/crib-hood/README.md`:

- Replace the "What It Does" paragraph to describe the Map view (force-directed module graph + animal overlay).
- Add a new "Map View" section listing the three layer pills, the trail toggle, and the empty-state behavior.
- Add `/crib-hood:build-map` to the Commands section.
- Update the Architecture section's file tree to include `server/graph/`, `server/public/map/`, `scripts/build-map.js`, and `tests/`.
- Update the API table: add `GET /api/graph` and `POST /api/graph/rebuild`. Note new SSE event types: `state-snapshot`, `graph-rebuilt`, `agent-on-module`, `agent-left-module`.

- [ ] **Step 3: Commit**

```bash
git add plugins/crib-hood/commands/crib-hood.md plugins/crib-hood/README.md
git commit -m "docs(crib-hood): document map view, build-map command, new endpoints"
```

---

## Task 14: End-to-end smoke verification

**Files:** none (verification only).

- [ ] **Step 1: Run the full unit + integration suite**

```bash
cd plugins/crib-hood && npm test
```

Expected: all suites pass (smoke + ast-source + merge + code-crib-source + builder + activity-mapper + server-graph-api).

- [ ] **Step 2: Build the map for this repo and serve**

```bash
cd /Users/dave/iWorks/claude-crib
node plugins/crib-hood/scripts/build-map.js --no-llm
node plugins/crib-hood/server/index.js &
SERVER_PID=$!
sleep 1
curl -s http://localhost:4567/api/graph | node -e 'let s=""; process.stdin.on("data",c=>s+=c).on("end",()=>{const g=JSON.parse(s); console.log("nodes:",g.nodes.length,"edges:",g.edges.length,"source:",g.source);})'
```

Expected: `nodes: 9 edges: N source: ast` (N depends on cross-plugin imports — likely small or zero).

- [ ] **Step 3: Open the dashboard**

```bash
open http://localhost:4567/
```

Manual checklist:

- [ ] 9 module nodes visible in a force layout
- [ ] Hovering pans/zooms work
- [ ] "구조" pill toggles structural edges
- [ ] "의미" pill toggles (no edges yet without LLM, but no error)
- [ ] In console: `window.__map.onAgentOnModule({ agent: 'demo', module: 'crib-hood', character: '🐹' })` → 🐹 appears on `crib-hood` node
- [ ] `window.__map.onAgentOnModule({ agent: 'demo', module: 'code-crib' })` → 🐹 moves smoothly
- [ ] Trail pill ON, activity pill ON → dotted purple edge appears between recent visits
- [ ] `window.__map.onAgentLeftModule({ agent: 'demo', module: 'code-crib' })` → 🐹 disappears

- [ ] **Step 4: Tear down**

```bash
kill $SERVER_PID
```

- [ ] **Step 5: Final commit (if README/checklist updates needed)**

```bash
git status                  # should be clean
```

If everything passed, no further commit needed. Otherwise capture any cleanup with a single commit message such as `chore(crib-hood): post-smoke cleanup`.

---

## Self-Review Notes

(Author's check before handoff. The plan was reviewed against the spec for coverage and consistency. Findings inline above; no outstanding gaps.)

- Spec § Build Pipeline → Task 8 (build-map.js)
- Spec § Live Activity Mapping → Task 6 (activity-mapper.js) + Task 7 step 5 (server hookup)
- Spec § Client Rendering / Cytoscape → Task 9 + Task 10
- Spec § Animal layer → Task 11
- Spec § Walk Trail + Activity Layer Synthesis → Task 12
- Spec § Layer toggle defaults (structural ON, semantic/activity OFF) → Task 9 (HTML markup) + Task 10 (`layerState` initial values)
- Spec § Error handling — empty state for missing graph.json → Task 9 (#empty-state) + Task 10 (showEmpty)
- Spec § Error handling — orphan agent paths → Task 6 test "returns empty for orphan path"
- Spec § Error handling — graph.json corruption → Task 7 (`loadGraph` try/catch)
- Spec § Goals — grid retired → Task 9 step 3
- Spec § Tests — Unit + Integration sections covered by Tasks 2/3/4/5/6/7

Open trade-off acknowledged: in Task 7 step 5, the activity-mapper hookup runs even though existing task records carry `task` as a *string* (the subject), not a file path. The mapper handles missing paths gracefully (returns no events). When OMC tasks evolve to carry `currentFile`, this loop activates without code change. Smoke verification of agent overlay therefore relies on console-injected events in Task 11/12/14 until OMC task records add file paths.
