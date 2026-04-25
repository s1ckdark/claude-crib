---
name: code-crib:update
description: Update code-crib plugin to latest version
---

# Update Code-Crib

Update the plugin to the latest version from GitHub.

## Instructions

### Step 1: Get Plugin Directory

**Priority order for finding the plugin directory:**

1. `${CLAUDE_PLUGIN_ROOT}` environment variable (if available)
2. Marketplace installation path: `~/.claude/plugins/marketplaces/claude-crib/plugins/code-crib`
3. Direct plugin path: `~/.claude/plugins/code-crib`

```bash
# Check marketplace path first (most common for installed plugins)
if [ -d ~/.claude/plugins/marketplaces/claude-crib/plugins/code-crib ]; then
  PLUGIN_DIR=~/.claude/plugins/marketplaces/claude-crib/plugins/code-crib
elif [ -d ~/.claude/plugins/code-crib ]; then
  PLUGIN_DIR=~/.claude/plugins/code-crib
else
  echo "Plugin directory not found"
  exit 1
fi
```

### Step 2: Fetch Latest Changes

```bash
cd <plugin-directory>
git fetch origin main
```

### Step 3: Check for Updates

```bash
git log HEAD..origin/main --oneline
```

**If no updates:**
```
code-crib is already up to date!
```

**If updates available:**
Show list of new commits.

### Step 4: Pull Updates

```bash
git pull origin main
```

### Step 5: Ensure Permissions are Up-to-Date

**After pulling updates, ensure Chroma tool permissions are configured.**

1. Read `~/.claude/settings.json`
2. Check if all required Chroma tools are in `permissions.allow`
3. If any missing, merge them in:

```json
[
  "mcp__plugin_code-crib_chroma__chroma_add_documents",
  "mcp__plugin_code-crib_chroma__chroma_query_documents",
  "mcp__plugin_code-crib_chroma__chroma_list_collections",
  "mcp__plugin_code-crib_chroma__chroma_create_collection",
  "mcp__plugin_code-crib_chroma__chroma_get_collection_info",
  "mcp__plugin_code-crib_chroma__chroma_get_collection_count"
]
```

4. Write back if changed

### Step 6: Report Result

**Success:**
```
code-crib updated successfully!

Changes:
- <commit 1>
- <commit 2>
- ...

Permissions verified/updated
Restart Claude Code to apply changes.
```

**Failure:**
```
Update failed

Error: <error message>

Try manual update:
  cd <plugin-directory>
  git pull origin main
```

## Notes

- Local changes will be preserved (git stash if needed)
- `code-crib.local.md` is git-ignored, settings are safe
- Permissions are auto-synced on each update
- Restart Claude Code after update to load new features
