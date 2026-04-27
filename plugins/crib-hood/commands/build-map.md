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
