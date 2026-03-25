# Talkie Plugin Design Spec

## Overview

macOS `say` 명령어를 활용한 TTS(Text-to-Speech) 플러그인. Claude Code 응답을 AI가 2-3문장으로 요약하여 음성으로 읽어준다. 토글 방식으로 켜고 끌 수 있어 누워서도 음성 리포트를 받으며 작업할 수 있다.

## Plugin Structure

```
plugins/talkie/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── talkie:on.md
│   ├── talkie:off.md
│   └── talkie:report.md
├── hooks/
│   └── hooks.json
├── scripts/
│   └── say.sh
└── README.md
```

## Plugin Manifest (plugin.json)

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

## Modes

| Mode | Command | Description | Statusline |
|------|---------|-------------|------------|
| `on` | `/talkie:on` | 모든 응답을 요약하여 음성 출력 | `🔊 talkie` |
| `report` | `/talkie:report` | 작업 완료 시에만 음성 리포트 | `📋 talkie:report` |
| `off` | `/talkie:off` | TTS 비활성화 | 표시 없음 |

## State Management

- 상태 파일: `.omc/state/talkie-state.json`
- OMC `state_write` / `state_read` API 사용
- 상태 스키마:

```json
{
  "mode": "on" | "report" | "off"
}
```

## Commands

### `/talkie:on`

- 상태를 `on`으로 저장
- statusline에 `🔊 talkie` 표시
- 확인 메시지 출력 + `say`로 읽어줌: "Talkie 모드가 켜졌습니다. 모든 응답을 음성으로 요약합니다."

### `/talkie:off`

- 상태를 `off`로 저장
- statusline에서 제거
- 확인 메시지 출력 (음성 없이): "Talkie 모드가 꺼졌습니다."

### `/talkie:report`

- 상태를 `report`로 저장
- statusline에 `📋 talkie:report` 표시
- 확인 메시지 출력 + `say`로 읽어줌: "리포트 모드입니다. 작업 완료 시에만 음성 리포트합니다."

## Hook

### Configuration (hooks.json)

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "prompt",
            "prompt": "SILENT CHECK: Read .omc/state/talkie-state.json. If mode is 'off' or file doesn't exist, respond with just 'hook success: Success' and do nothing else. If mode is 'on': summarize your most recent response in 2-3 sentences (match the language of the response - Korean or English), then run $CLAUDE_PLUGIN_ROOT/scripts/say.sh with the summary text. If mode is 'report': determine if the current task has just been completed (look for completion signals like 'done', 'complete', test results, final output). If NOT complete, respond with just 'hook success: Success'. If complete, summarize the result in 2-3 sentences and run $CLAUDE_PLUGIN_ROOT/scripts/say.sh with the summary. Always end with 'hook success: Success'."
          }
        ]
      }
    ]
  }
}
```

### Hook Logic

PostToolUse 이벤트 발생 시:

1. `.omc/state/talkie-state.json` 읽기
2. `off`이면 즉시 리턴 (성능 최소화)
3. `on`이면:
   - 직전 Claude 응답을 2-3문장으로 요약
   - 응답 언어 자동 감지 (한/영)
   - `$CLAUDE_PLUGIN_ROOT/scripts/say.sh`에 요약 텍스트 전달
4. `report`이면:
   - 완료 시그널 감지 (done, complete, 테스트 결과, 최종 출력 등)
   - 완료가 아니면 아무것도 안 함
   - 완료라면 결과를 2-3문장으로 요약 → `say.sh` 실행

## Scripts

### say.sh

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

- 한국어 감지: bash 정규식 `[가-힣]` 매칭 (macOS BSD grep 호환)
- 한국어 → Yuna 음성, 영어 → Samantha 음성
- 백그라운드 실행으로 Claude 작업 논블로킹

## Statusline Integration

- OMC `state_write` 시 statusline 상태도 함께 업데이트
- `on` → `🔊 talkie` 표시
- `report` → `📋 talkie:report` 표시
- `off` → statusline에서 제거

## Constraints

- macOS 전용 (say 명령어 의존)
- 요약은 3문장 이내로 제한
- hook이 매 도구 호출마다 실행되므로 off 상태에서 즉시 리턴하여 성능 영향 최소화
- say는 비동기 실행하여 Claude 작업 흐름을 차단하지 않음

## Registration

`marketplace.json`의 `plugins` 배열에 다음 항목 추가:

```json
{
  "name": "talkie",
  "source": "./plugins/talkie",
  "description": "TTS voice feedback for Claude Code responses using macOS say",
  "version": "0.1.0",
  "author": { "name": "dave", "url": "https://github.com/s1ckdark" },
  "keywords": ["tts", "voice", "say", "accessibility"],
  "category": "accessibility"
}
```

## Command Frontmatter

각 커맨드 파일의 YAML frontmatter 예시 (`talkie:on.md`):

```yaml
---
name: talkie:on
description: Enable TTS mode - all responses are summarized and read aloud
user_invocable: true
allowed_tools: [Bash, Read]
---
```

`talkie:off.md`: `name: talkie:off`, `talkie:report.md`: `name: talkie:report` 형식으로 동일하게 적용.
