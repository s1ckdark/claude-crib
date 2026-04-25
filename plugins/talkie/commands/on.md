---
name: talkie:on
description: Enable TTS mode - all responses are summarized and read aloud
user_invocable: true
allowed_tools: [Bash, Read]
---

# /talkie:on - Enable Voice Mode

1. Run: `echo '{"mode":"on"}' > ${CLAUDE_PLUGIN_ROOT}/state.json`
2. Display confirmation: "🔊 Talkie 모드가 켜졌습니다. 모든 응답을 음성으로 요약합니다."
3. Run: `${CLAUDE_PLUGIN_ROOT}/scripts/say.sh "Talkie 모드가 켜졌습니다. 모든 응답을 음성으로 요약합니다."`
