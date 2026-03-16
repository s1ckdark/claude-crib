---
name: auto-rag
description: Automatically searches knowledge stash and injects relevant context before responding
event: UserPromptSubmit
---

# Auto-RAG Hook

Automatically searches knowledge stash and injects relevant context before responding.

## Trigger Conditions

**MUST search when user prompt contains:**
- Error messages or stack traces
- "how did I", "how do I", "remember when"
- Technical questions about the current project
- Bug descriptions or debugging requests
- "last time", "before", "previously"

**SKIP search when:**
- Simple greetings ("hi", "hello")
- Meta commands ("/stash", "/grab", "/setup")
- Very short prompts (< 10 characters)
- Explicit "don't search" or "no rag"

## Execution Steps

### Step 1: Read Configuration

Read `code-crib.local.md` in the plugin directory.

**If file doesn't exist or auto_rag is not enabled:** Skip silently.

**If enabled, extract:**
```yaml
auto_rag:
  enabled: true
  max_results: 3
  min_relevance: 0.7  # optional threshold
```

### Step 2: Extract Search Query

From the user's prompt, extract key terms:
1. Error names/codes if present
2. Function/class names mentioned
3. Technical concepts (authentication, caching, etc.)
4. Action verbs with objects ("fix login", "debug timeout")

**Query construction:**
- Use the most specific technical terms
- Limit to 5-7 keywords max
- Exclude common words (the, a, is, etc.)

### Step 3: Execute Vector Search

**Determine collection name:**
- Project mode: `code-crib-{current-directory-name}`
- Shared mode: `code-crib`

**For Chroma:**
```
Use chroma_query_documents with:
- collection_name: from config
- query_texts: [extracted query]
- n_results: max_results (default 3)
```

**For Pinecone:**
```
Use search-records with:
- Index: code-crib
- Query: extracted query
- TopK: max_results
```

### Step 4: Filter Results

Only include results that are likely relevant:
- Check similarity score if available (> min_relevance)
- Prefer recent documents (within last 30 days)
- Prefer same project documents

### Step 5: Inject Context

**If relevant results found, prepend to your response context:**

```markdown
<rag-context source="code-crib">
## Relevant Past Knowledge

### From: {document_title} ({date})
**Type**: {bugfix|feature|refactor|analysis}
**Relevance**: {why this might help}

{key content excerpt - max 500 chars}

---
</rag-context>
```

**Then continue with normal response, referencing the context naturally:**
- "Based on a similar issue you solved before..."
- "I found relevant context from your previous work..."
- "This looks related to the {title} fix from {date}..."

### Step 6: No Results Behavior

**If no relevant results:** Proceed normally without mentioning RAG.

Do NOT say "I searched but found nothing" - just respond naturally.

## Configuration Options

In `code-crib.local.md`:

```yaml
auto_rag:
  enabled: true           # Master switch
  max_results: 3          # How many docs to retrieve
  min_relevance: 0.7      # Similarity threshold (0-1)
  include_related: true   # Also fetch tag-related docs
  quiet_mode: false       # If true, don't mention "found in stash"
```

## Example Behaviors

**User asks:** "Why is the auth timing out?"

**Auto-RAG finds:** Previous bugfix about session timeout configuration

**Response starts with:**
> I found relevant context from your previous work on "Fix session timeout in auth middleware" (Jan 15). That issue was caused by...

---

**User asks:** "Add dark mode toggle"

**Auto-RAG finds:** Nothing relevant

**Response:** (Normal response without mentioning RAG)

---

**User asks:** "/stash this work"

**Auto-RAG:** Skips (meta command detected)
