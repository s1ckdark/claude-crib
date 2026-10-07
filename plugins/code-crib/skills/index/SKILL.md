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
/code-crib:rack --local           # 로컬 인덱스만 갱신 (벡터 DB 불필요)
```

## Parameters

- `path`: Path to directory containing markdown files (default .rag-docs/)
- `force`: Re-index existing documents (overwrite)
- `local`: 로컬 인덱스만 갱신하고 원격 업로드는 생략

로컬 인덱스는 세션 시작 및 `/grab` 검색 직전에 자동 갱신된다. `.rag-docs/`가 기본 대상이고, `--path`로 등록한 경로도 이후 자동 갱신 대상이 된다. 디렉터리는 현재 저장소 안에 있어야 하며 숨김 하위 경로와 심볼릭 링크는 제외한다.

## Instructions

### Step 0: 로컬 증분 인덱스 갱신

벡터 DB 설정을 읽기 전에 실행한다. Python 3.9+와 SQLite FTS5가 필요하다.

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/local-index.py" sync
# --path가 주어진 경우 (경로는 프로젝트 루트 기준):
python3 "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/local-index.py" sync --path "./docs/knowledge"
# --force가 주어진 경우 해당 호출에 --force 추가
```

사용자 인자는 셸 문자열로 이어 붙이지 말고 각각 안전하게 인용하여 전달한다.

- 내용 해시가 바뀐 문서만 갱신한다. 동일한 경로는 같은 레코드를 갱신하고 삭제된 파일은 로컬 인덱스에서 제거한다.
- `sync`의 추가·변경·삭제·변경 없음 수와 `errors`를 보고한다. 실패한 문서는 이전 레코드를 유지하므로 검색에 오래된 내용이 남을 수 있음을 알린다.
- `--local`이면 여기서 종료한다. 등록 경로가 없으면 문서 디렉터리를 만들거나 `--path`로 등록하도록 안내한다.
- 로컬 실행 실패가 원격 업로드까지 막지는 않는다. `--local`이 아니면 아래 기존 업로드 절차를 별도로 진행한다.
- 아래 원격 업로드는 로컬 증분 인덱스와 독립적이다. 로컬 갱신 성공만으로 Chroma/Pinecone 동기화 완료를 보고하지 않는다. 로컬 파일 삭제는 원격 문서를 자동 삭제하지 않는다.

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
