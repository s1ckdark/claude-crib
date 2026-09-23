---
name: index
description: Index local docs into the knowledge stash. Use when the user wants to index, import, or bulk upload existing documentation.
---

# Index / Rack

Rack up your local docs into the vector database.

## Usage

```
/code-crib:rack                   # (rack command)
/code-crib:rack --path ./docs/knowledge
/code-crib:rack --force           # Re-index all documents
```

## Parameters

- `path`: Path to directory containing markdown files (default .rag-docs/)
- `force`: Re-index existing documents (overwrite)

## Instructions

### Step 1: Determine Collection Name

Read `code-crib.local.md` in the plugin directory to get configuration:

```yaml
collection_mode: project | shared
project_name: (optional pin; put it in the repo's .claude/code-crib.local.md)
```

**Collection Name Logic**:
- **project mode**: `code-crib-{project}` (one collection per repo)
  - Example: origin `s1ckdark/claude-crib` → collection: `code-crib-claude-crib`
- **shared mode**: `code-crib`
  - All documents get `project` metadata field

**Get Project Name and Host** — never guess; every machine must agree:
```bash
bash ${CLAUDE_PLUGIN_ROOT}/hooks/scripts/crib-identity.sh
# → {"project": "claude-crib", "host": "macbook"}
```
Use `project` for the collection name and metadata, `host` for metadata.

### Step 2: Determine Vector DB Backend

Read `code-crib.local.md` to get `vector_db` setting:
- `chroma` (or legacy `chroma-docker` / `chroma-local`) → Use Chroma MCP tools
- `pinecone` → Use Pinecone MCP tools

### Step 3: Ensure Collection/Index Exists

**For Chroma** (vector_db: chroma, or legacy chroma-docker / chroma-local):
```
1. List collections with chroma_list_collections
2. If collection doesn't exist, create with chroma_create_collection:
   - collection_name: determined from Step 1
   - metadata: { "description": "Code-Crib knowledge base", "project": project_name }
```

**For Pinecone** (vector_db: pinecone):
```
1. Check if index exists using describe-index
2. If not, guide user to create index via Pinecone console
   - Dimension: 1536 (for OpenAI embeddings)
   - Metric: cosine
```

### Step 4: Locate Documents

- Default path: `.rag-docs/` in current project
- Scan for all `.md` files recursively
- Report total files found

### Step 5: Parse Each Document

Extract YAML frontmatter for metadata:
```yaml
---
type: codebase-structure | bugfix | feature | refactor | analysis
date: YYYY-MM-DD
tags: [tag1, tag2]
path: directory/path/
title: Document Title
priority_score: 0-100
---
```

### Step 6: Generate Record IDs

Format: `{project}-{path-slug}-{hash}`

Example: `claude-crib-plugins-code-crib-abc123`

### Step 7: Add Project Metadata

**Always add to every document**:
```json
{
  "project": "claude-crib",
  "host": "macbook",
  "type": "...",
  "date": "...",
  "tags": "...",
  "path": "...",
  "title": "...",
  "priority_score": "..."
}
```

This ensures documents work in both modes:
- **project mode**: Isolated by collection name
- **shared mode**: Filterable by `project` field

### Step 8: Batch Upsert

**IMPORTANT: Maximize batch size to minimize tool calls and avoid confirmation prompts.**

**For Chroma** (vector_db: chroma, or legacy chroma-docker / chroma-local):
```
Use chroma_add_documents with:
- collection_name: determined from Step 1
- documents: [document contents]
- ids: [generated IDs]
- metadatas: [metadata objects with project field]

Process in batches of 50 documents (or all at once if < 100).
Single call preferred over multiple small batches.
```

**For Pinecone** (vector_db: pinecone):
```
Use upsert-records with:
- index: code-crib
- namespace: project name (from Step 1)
- records: [{ id, content, metadata }]

Process in batches of 50-100 documents.
Single call preferred over multiple small batches.
```

**Batch Strategy:**
- < 50 docs: Single call (no batching)
- 50-200 docs: 2 batches max
- > 200 docs: 50-doc batches

### Step 9: Report Progress

```
Indexing to collection: code-crib-claude-crib
Mode: project

Indexing: 15/25 documents...
✓ Indexed: root.md
✓ Indexed: plugins-code-crib.md
...

Complete: 25 indexed, 0 skipped
Collection: code-crib-claude-crib (25 documents)
```

## Directory Structure Expected

```
.rag-docs/
├── structure/
│   ├── root.md
│   ├── plugins-code-crib.md
│   └── ...
└── sessions/
    ├── 2024-01-15-session-timeout-fix.md
    └── ...
```

## Mode Comparison

| Aspect | Project Mode | Shared Mode |
|--------|--------------|-------------|
| Collection | `code-crib-{project}` | `code-crib` |
| Isolation | Complete | Via metadata |
| Cross-search | No | Yes |
| Use case | Independent work | Multi-project |
