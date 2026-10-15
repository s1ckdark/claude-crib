---
name: code-crib:stash
description: Stash your work to the knowledge crib
allowed_args: "--type --title --tags --namespace"
---

> **Plugin root:** `${CLAUDE_PLUGIN_ROOT}`. If it is empty or shown unexpanded (Codex), use the nearest ancestor of this file's directory that contains `hooks/scripts/` (`skills/<name>/SKILL.md` → 2 levels up, `.codex-plugin/migrated-command-skills/<name>/SKILL.md` → 3 levels up) and write that absolute path wherever `${CLAUDE_PLUGIN_ROOT}` appears.

Stash this work session to your knowledge base. Read the skill instructions at `${CLAUDE_PLUGIN_ROOT}/skills/save/SKILL.md` for full instructions.
