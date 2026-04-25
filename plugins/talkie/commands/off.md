---
name: talkie:off
description: Disable TTS mode
user_invocable: true
allowed_tools: [Bash, Read]
---

# /talkie:off - Disable Voice Mode

1. Run: `echo '{"mode":"off"}' > ${CLAUDE_PLUGIN_ROOT}/state.json`
2. Display confirmation: "Talkie 모드가 꺼졌습니다."
3. Do NOT run say.sh (silent off).
