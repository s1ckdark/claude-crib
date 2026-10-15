#!/bin/bash
# 수집 실패가 응답이나 종료를 막지 않도록 한다.
command -v python3 >/dev/null 2>&1 || exit 0
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" 2>/dev/null && pwd)" || exit 0
# Claude Code와 Codex가 같은 훅을 실행하므로 provider는 훅 입력으로 판별한다.
python3 "$SCRIPT_DIR/session-history.py" hook
exit 0
