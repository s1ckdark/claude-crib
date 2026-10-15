---
name: list
description: List docs in your stash - see what knowledge you have stored. Use when user wants to check, list, view, or browse their stashed documents.
---

# List Command

See what you got in your knowledge stash.

> **Plugin root:** `${CLAUDE_PLUGIN_ROOT}`. If it is empty or shown unexpanded (Codex), use the nearest ancestor of this file's directory that contains `hooks/scripts/` (`skills/<name>/SKILL.md` → 2 levels up, `.codex-plugin/migrated-command-skills/<name>/SKILL.md` → 3 levels up) and write that absolute path wherever `${CLAUDE_PLUGIN_ROOT}` appears.
>
> **Config:** `code-crib.local.md` is the first existing file among `<plugin root>/code-crib.local.md`, `./.claude/code-crib.local.md`, `~/.claude/code-crib.local.md` (same order as `hooks/scripts/check-rag-config.sh`).

## Usage

```
code-crib:list
```

## Instructions

### List Documents

1. Read configuration from `code-crib.local.md` (see **Config** above)
2. Query vector DB for all documents in namespace
3. Sort by date (newest first)
4. Display in clean format:

```markdown
## Your Stash (23 docs)

| Date | Type | Title | Tags |
|------|------|-------|------|
| 2024-01-19 | bugfix | Session timeout fix | auth, session |
| 2024-01-18 | feature | OAuth integration | auth, oauth |
| ... | ... | ... | ... |
```

### Show Stats

With `--stats` argument, display summary:

```markdown
## Stash Stats

**Total Docs**: 147

**By Type**:
- bugfix: 45 (31%)
- feature: 62 (42%)
- refactor: 23 (16%)
- analysis: 17 (12%)

**By Namespace**:
- main-project: 89
- side-project: 35
- experiments: 23

**Recent Activity**:
- Last 7 days: 12 docs
- Last 30 days: 34 docs
```

## Arguments

- `namespace`: Only show docs from this namespace
- `type`: Filter by work type (bugfix, feature, refactor, analysis)
- `limit`: Max docs to show (default 20)
- `stats`: Show stats summary instead of listing docs

## Examples

```bash
# See all your docs
code-crib:list

# Filter by project
code-crib:list --namespace my-project

# Only bugfixes
code-crib:list --type bugfix --limit 10

# Get the stats
code-crib:list --stats
```
