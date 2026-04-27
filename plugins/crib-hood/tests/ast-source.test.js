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
