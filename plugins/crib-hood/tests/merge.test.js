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
