---
name: code-crib:rack
description: Rack up local docs into the knowledge stash
allowed_args: "--path --force --local"
---

> **Plugin root:** `${CLAUDE_PLUGIN_ROOT}`. If it is empty or shown unexpanded (Codex), use the nearest ancestor of this file's directory that contains `hooks/scripts/` (`skills/<name>/SKILL.md` → 2 levels up, `.codex-plugin/migrated-command-skills/<name>/SKILL.md` → 3 levels up) and write that absolute path wherever `${CLAUDE_PLUGIN_ROOT}` appears.

로컬 문서 인덱스를 갱신하고 필요하면 벡터 DB에 업로드한다. `--local`은 원격 업로드 없이 실행한다. `${CLAUDE_PLUGIN_ROOT}/skills/index/SKILL.md`의 지침을 따른다.
