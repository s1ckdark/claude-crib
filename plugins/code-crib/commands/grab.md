---
name: code-crib:grab
description: Grab docs from your knowledge stash
allowed_args: "--type --limit --project --tags --host --local --sessions --provider"
---

> **Plugin root:** `${CLAUDE_PLUGIN_ROOT}`. If it is empty or shown unexpanded (Codex), use the nearest ancestor of this file's directory that contains `hooks/scripts/` (`skills/<name>/SKILL.md` → 2 levels up, `.codex-plugin/migrated-command-skills/<name>/SKILL.md` → 3 levels up) and write that absolute path wherever `${CLAUDE_PLUGIN_ROOT}` appears.

Search your knowledge stash for relevant documents. Read the skill instructions at `${CLAUDE_PLUGIN_ROOT}/skills/search/SKILL.md` for full instructions.
