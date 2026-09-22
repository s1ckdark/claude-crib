---
name: save
description: Save your work to the knowledge stash. Use when the user wants to save, store, or document their work session.
---

# Save / Stash

Stash your work session as a doc in the knowledge base.

## Usage

```
/code-crib:stash                    # (stash command)
/code-crib:stash --type bugfix --tags "auth,session"
```

## Parameters

- `type`: Work type (bugfix, feature, refactor, analysis) - auto-detected if not provided
- `title`: Document title - auto-generated if not provided
- `tags`: Comma-separated tags for categorization
- `namespace`: Project namespace for organization

## Instructions

1. **Analyze the conversation** to understand what was accomplished
2. **Classify work type** if not provided:
   - `bugfix`: Bug fixes, error resolutions
   - `feature`: New functionality added
   - `refactor`: Code restructuring
   - `analysis`: Code exploration, architecture review

3. **Generate structured document** with:
   - Problem description
   - Solution implemented
   - Files modified
   - Key learnings

4. **Resolve identity** — never guess the project name:
   ```bash
   bash ${CLAUDE_PLUGIN_ROOT}/hooks/scripts/crib-identity.sh
   # → {"project": "claude-crib", "host": "macbook"}
   ```
   `--namespace`, if given, overrides `project`. `host` is always the script's value.

5. **Pick the target** from `code-crib.local.md`:
   - `collection_mode: project` → collection `code-crib-{project}`
   - `collection_mode: shared` → collection `code-crib`

6. **Save the record**

   Common fields:
   - id: `{project}-{YYYYMMDDTHHMMSS}-{8-char hash}`
   - content: Full document text
   - metadata: `type, title, project, host, date, tags, files` (tags/files as comma-separated strings)

   **For Chroma** (vector_db: chroma, or legacy chroma-docker / chroma-local):
   - Create the collection with `chroma_create_collection` if `chroma_list_collections` doesn't list it
   - `chroma_add_documents` with `collection_name`, `documents: [content]`, `ids: [id]`, `metadatas: [metadata]`

   **For Pinecone** (vector_db: pinecone):
   - upsert-records to index `code-crib`, namespace `{project}`, with the common fields

7. **Confirm to user** with document title, type, tags, host, collection, and record ID

## Auto-detection Hints

- "error", "bug", "fix" → `bugfix`
- "add", "implement", "new feature" → `feature`
- "refactor", "clean", "restructure" → `refactor`
- "how", "why", "explain" → `analysis`
