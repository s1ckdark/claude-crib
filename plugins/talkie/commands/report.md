---
name: talkie:report
description: Enable report-only TTS mode - voice feedback only on task completion
user_invocable: true
allowed_tools: [Bash, Read]
---

# /talkie:report - Enable Report Mode

1. Run: `echo '{"mode":"report"}' > ${CLAUDE_PLUGIN_ROOT}/state.json`
2. Display confirmation: "📋 리포트 모드입니다. 작업 완료 시에만 음성 리포트합니다."
3. Run: `${CLAUDE_PLUGIN_ROOT}/scripts/say.sh "리포트 모드입니다. 작업 완료 시에만 음성 리포트합니다."`
