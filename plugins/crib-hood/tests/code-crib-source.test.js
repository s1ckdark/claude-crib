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
