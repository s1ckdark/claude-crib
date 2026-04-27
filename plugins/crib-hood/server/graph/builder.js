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
