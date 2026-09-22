---
name: rag
description: RAG mode control and one-shot queries. Use when user wants to enable/disable RAG mode, check RAG status, or perform a one-shot RAG query.
---

# RAG Command

Control RAG mode or perform one-shot RAG queries.

## Usage

```
/code-crib:rag              # Show current status
/code-crib:rag on           # Enable RAG mode (persistent)
/code-crib:rag off          # Disable RAG mode
/code-crib:rag "질문"       # One-shot RAG query (search + answer)
```

## Behavior Matrix

| Input | Action |
|-------|--------|
| (empty) | Show current RAG status |
| `on` or `enable` | Enable persistent RAG mode |
| `off` or `disable` | Disable RAG mode |
| Any other text | Treat as one-shot RAG query |

## Instructions

### Step 1: Parse Arguments

Determine what the user wants:

```
args = $ARGUMENTS (trimmed)

if args == "" → STATUS
if args == "on" or "enable" → ENABLE
if args == "off" or "disable" → DISABLE
else → ONE_SHOT_QUERY with args as the query
```

### Step 2: Read Current Config

Read `${CLAUDE_PLUGIN_ROOT}/code-crib.local.md` to get current settings.

If file doesn't exist:
```
RAG is not configured. Run /code-crib:setup first to initialize.
```

Extract `auto_rag.enabled` from YAML frontmatter.

### Step 3: Execute Action

#### ACTION: STATUS

```markdown
## RAG Status

**Mode**: {{enabled ? "ON 🟢" : "OFF ⚪"}}

{{if enabled}}
All your questions will automatically search the knowledge stash for relevant context.

To disable: `/rag off`
To query once without persistent mode: `/rag "your question"`
{{else}}
RAG is disabled. Questions are answered without knowledge stash search.

- `/rag on` - Enable persistent RAG mode
- `/rag "question"` - One-shot RAG query
{{/if}}
```

#### ACTION: ENABLE

1. Update `code-crib.local.md`:
   ```yaml
   auto_rag:
     enabled: true
   ```

2. Report:
   ```markdown
   ## RAG Enabled 🟢

   All questions will now search your knowledge stash for relevant context.

   To disable: `/rag off`
   ```

#### ACTION: DISABLE

1. Update `code-crib.local.md`:
   ```yaml
   auto_rag:
     enabled: false
   ```

2. Report:
   ```markdown
   ## RAG Disabled ⚪

   Questions will be answered without automatic knowledge search.

   - `/rag on` - Re-enable persistent mode
   - `/rag "question"` - One-shot query when needed
   ```

#### ACTION: ONE_SHOT_QUERY

This is the key feature - RAG search without enabling persistent mode.

1. **Search Knowledge Stash**

   Use the same search logic as `/grab`:
   - Read `code-crib.local.md` for vector_db and collection settings
   - Execute vector search with the query
   - Get top 3-5 relevant results

2. **Build Context**

   From search results, extract:
   ```markdown
   ## Relevant Context from Knowledge Stash

   ### 1. {{title}} ({{type}})
   {{content summary or key points}}

   ### 2. {{title}} ({{type}})
   {{content summary or key points}}

   ...
   ```

3. **Answer with Context**

   Combine the retrieved context with the user's question:

   ```
   Based on the following context from your knowledge stash:

   [Retrieved Context]

   Now answering your question: "{{original query}}"

   [Your answer incorporating the context]
   ```

4. **Report Sources**

   After answering, show which documents were used:
   ```markdown
   ---
   📚 **Sources used**:
   - {{doc1_title}} ({{doc1_type}})
   - {{doc2_title}} ({{doc2_type}})
   ```

## Vector Search Details

### For Chroma (chroma, or legacy chroma-docker/chroma-local)

```
collection_name: code-crib-{project} (project mode) or code-crib (shared mode)
# {project} comes from: bash ${CLAUDE_PLUGIN_ROOT}/hooks/scripts/crib-identity.sh
query_texts: [user query]
n_results: 5
```

### For Pinecone

```
index: code-crib
namespace: {project-name}
query: user query
topK: 5
rerank: true
```

## Integration with RAG ON Mode

When RAG mode is ON (`auto_rag.enabled: true`), a UserPromptSubmit hook should automatically:
1. Take the user's message
2. Perform the same search
3. Inject context before Claude processes the message

This skill handles the manual invocation; the hook handles the automatic mode.
