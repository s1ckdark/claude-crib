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
