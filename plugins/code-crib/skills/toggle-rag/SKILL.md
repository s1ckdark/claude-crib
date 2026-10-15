---
name: toggle-rag
description: Toggle Auto-RAG on or off. Use when user wants to enable, disable, or toggle automatic knowledge retrieval.
---

# Toggle Auto-RAG

Quickly enable or disable Auto-RAG without running full setup.

> **Config:** `code-crib.local.md` is the first existing file among `<plugin root>/code-crib.local.md`, `./.claude/code-crib.local.md`, `~/.claude/code-crib.local.md` (same order as `hooks/scripts/check-rag-config.sh`).

## Usage

```
/code-crib:toggle-rag          # Show current status and toggle options
/code-crib:toggle-rag on       # Enable Auto-RAG
/code-crib:toggle-rag off      # Disable Auto-RAG
```

## Instructions

### Step 1: Read Current Config

Read `code-crib.local.md` (see **Config** above).

If file doesn't exist:
```
Auto-RAG is not configured. Run /setup first.
```

### Step 2: Determine Action

**If no argument provided:** Ask user

```yaml
question: "Toggle Auto-RAG?"
header: "Auto-RAG"
options:
  - label: "Enable"
    description: "Turn on automatic knowledge retrieval"
  - label: "Disable"
    description: "Turn off automatic knowledge retrieval"
```

**If argument is "on" or "enable":** Set enabled to true
**If argument is "off" or "disable":** Set enabled to false

### Step 3: Update Config

Modify `auto_rag.enabled` in `code-crib.local.md`:

```yaml
auto_rag:
  enabled: true   # or false
  max_results: 3
  min_relevance: 0.7
```

### Step 4: Report Result

**Enabled:**
```
✅ Auto-RAG enabled

When you ask questions, I'll automatically search your knowledge stash
and reference relevant past solutions.

To disable: /toggle-rag off
```

**Disabled:**
```
⏸️ Auto-RAG disabled

Automatic knowledge retrieval is off.
Use /grab to manually search your stash.

To enable: /toggle-rag on
```
