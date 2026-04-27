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
