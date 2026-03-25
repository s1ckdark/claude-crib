# Talkie Plugin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a TTS plugin that reads Claude Code responses aloud using macOS `say`, with toggle modes (on/report/off) and AI summarization.

**Architecture:** PostToolUse hook checks state file, AI summarizes response, passes to `say.sh` which auto-detects language and selects Korean (Yuna) or English (Samantha) voice. Commands toggle state and update statusline.

**Tech Stack:** Bash (say.sh), Claude Code plugin system (markdown commands, JSON hooks), OMC state API

**Spec:** `docs/superpowers/specs/2026-03-25-talkie-plugin-design.md`

---

### Task 1: Plugin Scaffold

**Files:**
- Create: `plugins/talkie/.claude-plugin/plugin.json`
- Create: `plugins/talkie/README.md`

- [ ] **Step 1: Create plugin.json**

```json
{
  "name": "talkie",
  "version": "0.1.0",
  "description": "TTS voice feedback using macOS say",
  "author": { "name": "dave", "url": "https://github.com/s1ckdark" },
  "keywords": ["tts", "voice", "say", "accessibility"],
  "commands": "./commands"
}
```

- [ ] **Step 2: Create README.md**

Brief description: plugin name, purpose, available commands (`/talkie:on`, `/talkie:off`, `/talkie:report`), macOS requirement.

- [ ] **Step 3: Commit**

```bash
git add plugins/talkie/.claude-plugin/plugin.json plugins/talkie/README.md
git commit -m "feat(talkie): add plugin scaffold with manifest and README"
```

---

### Task 2: say.sh Script

**Files:**
- Create: `plugins/talkie/scripts/say.sh`

- [ ] **Step 1: Create say.sh**

```bash
#!/bin/bash
TEXT="$1"

# 이전 say 프로세스 중단 (중첩 방지)
killall say 2>/dev/null

# 한글 포함 여부로 언어 감지 (macOS BSD grep 호환)
if [[ "$TEXT" =~ [가-힣] ]]; then
  VOICE="Yuna"
else
  VOICE="Samantha"
fi

# 백그라운드 실행 (Claude 블로킹 방지)
say -v "$VOICE" "$TEXT" &
```

- [ ] **Step 2: Make executable**

```bash
chmod +x plugins/talkie/scripts/say.sh
```

- [ ] **Step 3: Test manually**

```bash
cd /Users/dave/iWorks/claude-crib
./plugins/talkie/scripts/say.sh "Hello, this is a test"
# Expected: Samantha voice reads the text

./plugins/talkie/scripts/say.sh "안녕하세요 테스트입니다"
# Expected: Yuna voice reads the text
```

- [ ] **Step 4: Commit**

```bash
git add plugins/talkie/scripts/say.sh
git commit -m "feat(talkie): add say.sh TTS wrapper with Korean/English auto-detection"
```

---

### Task 3: Commands

**Files:**
- Create: `plugins/talkie/commands/talkie:on.md`
- Create: `plugins/talkie/commands/talkie:off.md`
- Create: `plugins/talkie/commands/talkie:report.md`

- [ ] **Step 1: Create talkie:on.md**

```markdown
---
name: talkie:on
description: Enable TTS mode - all responses are summarized and read aloud
user_invocable: true
allowed_tools: [Bash, Read]
---

# /talkie:on - Enable Voice Mode

1. Use OMC `state_write` to save state: key `talkie`, value `{"mode": "on"}`
2. Update statusline to show `🔊 talkie`
3. Display confirmation: "🔊 Talkie 모드가 켜졌습니다. 모든 응답을 음성으로 요약합니다."
4. Run: `${CLAUDE_PLUGIN_ROOT}/scripts/say.sh "Talkie 모드가 켜졌습니다. 모든 응답을 음성으로 요약합니다."`
```

- [ ] **Step 2: Create talkie:off.md**

```markdown
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
```

- [ ] **Step 3: Create talkie:report.md**

```markdown
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
```

- [ ] **Step 4: Commit**

```bash
git add plugins/talkie/commands/
git commit -m "feat(talkie): add on/off/report toggle commands"
```

---

### Task 4: PostToolUse Hook

**Files:**
- Create: `plugins/talkie/hooks/hooks.json`

- [ ] **Step 1: Create hooks.json**

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "prompt",
            "prompt": "SILENT CHECK: Use OMC state_read with key 'talkie' to get current mode. If mode is 'off' or state doesn't exist, respond with just 'hook success: Success' and do nothing else. If mode is 'on': summarize your most recent response in 2-3 sentences (match the language of the response - Korean or English), then run $CLAUDE_PLUGIN_ROOT/scripts/say.sh with the summary text. If mode is 'report': determine if the current task has just been completed (look for completion signals like 'done', 'complete', test results, final output). If NOT complete, respond with just 'hook success: Success'. If complete, summarize the result in 2-3 sentences and run $CLAUDE_PLUGIN_ROOT/scripts/say.sh with the summary. Always end with 'hook success: Success'."
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add plugins/talkie/hooks/hooks.json
git commit -m "feat(talkie): add PostToolUse hook for automatic TTS trigger"
```

---

### Task 5: Marketplace Registration

**Files:**
- Modify: `.claude-plugin/marketplace.json`

- [ ] **Step 1: Add talkie to marketplace.json plugins array**

Add after the last plugin entry:

```json
{
  "name": "talkie",
  "source": "./plugins/talkie",
  "description": "TTS voice feedback for Claude Code responses using macOS say",
  "version": "0.1.0",
  "author": {
    "name": "dave",
    "url": "https://github.com/s1ckdark"
  },
  "keywords": ["tts", "voice", "say", "accessibility"],
  "category": "accessibility"
}
```

- [ ] **Step 2: Commit**

```bash
git add .claude-plugin/marketplace.json
git commit -m "feat(talkie): register plugin in marketplace"
```

---

### Task 6: End-to-End Verification

- [ ] **Step 1: Verify plugin structure**

```bash
find plugins/talkie -type f | sort
```

Expected output:
```
plugins/talkie/.claude-plugin/plugin.json
plugins/talkie/README.md
plugins/talkie/commands/talkie:off.md
plugins/talkie/commands/talkie:on.md
plugins/talkie/commands/talkie:report.md
plugins/talkie/hooks/hooks.json
plugins/talkie/scripts/say.sh
```

- [ ] **Step 2: Verify say.sh is executable and works**

```bash
test -x plugins/talkie/scripts/say.sh && echo "OK: executable" || echo "FAIL: not executable"
./plugins/talkie/scripts/say.sh "Verification complete"
```

- [ ] **Step 3: Verify marketplace.json is valid JSON**

```bash
python3 -c "import json; json.load(open('.claude-plugin/marketplace.json')); print('OK: valid JSON')"
```

- [ ] **Step 4: Verify plugin.json is valid JSON**

```bash
python3 -c "import json; json.load(open('plugins/talkie/.claude-plugin/plugin.json')); print('OK: valid JSON')"
```

- [ ] **Step 5: Test /talkie:on command manually**

Run `/talkie:on` in Claude Code and verify:
- State file created at `.omc/state/talkie-state.json` with `{"mode": "on"}`
- Confirmation message displayed
- Voice reads the confirmation
