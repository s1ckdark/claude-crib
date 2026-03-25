---
name: talkie:off
description: Disable TTS mode
user_invocable: true
allowed_tools: [Bash, Read]
---

# /talkie:off - Disable Voice Mode

1. Use OMC `state_write` to save state: key `talkie`, value `{"mode": "off"}`
2. Remove statusline indicator
3. Display confirmation: "Talkie 모드가 꺼졌습니다."
4. Do NOT run say.sh (silent off).
