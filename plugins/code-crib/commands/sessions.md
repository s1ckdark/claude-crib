---
name: code-crib:sessions
description: Claude·Codex 로컬 작업일지의 수집 설정, 목록, 검색, 상세와 재개 명령 확인
allowed_args: "--enable --disable --status --provider --query --limit --all --refresh --show --resume --forget --codex-config"
---

> **Plugin root:** `${CLAUDE_PLUGIN_ROOT}`. If it is empty or shown unexpanded (Codex), use the nearest ancestor of this file's directory that contains `hooks/scripts/` (`skills/<name>/SKILL.md` → 2 levels up, `.codex-plugin/migrated-command-skills/<name>/SKILL.md` → 3 levels up) and write that absolute path wherever `${CLAUDE_PLUGIN_ROOT}` appears.

Manage the local Claude·Codex session history. Read the skill instructions at `${CLAUDE_PLUGIN_ROOT}/skills/session-history/SKILL.md` for full instructions.
