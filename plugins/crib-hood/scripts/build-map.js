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
