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
