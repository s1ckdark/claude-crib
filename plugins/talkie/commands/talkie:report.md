---
name: talkie:report
description: Enable report-only TTS mode - voice feedback only on task completion
user_invocable: true
allowed_tools: [Bash, Read]
---

# /talkie:report - Enable Report Mode

1. Use OMC `state_write` to save state: key `talkie`, value `{"mode": "report"}`
2. Update statusline to show `📋 talkie:report`
3. Display confirmation: "📋 리포트 모드입니다. 작업 완료 시에만 음성 리포트합니다."
4. Run: `${CLAUDE_PLUGIN_ROOT}/scripts/say.sh "리포트 모드입니다. 작업 완료 시에만 음성 리포트합니다."`
