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

test('GET /api/graph returns exists:false when no graph file', async () => {
  const port = 53700;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'crib-hood-test-'));
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
