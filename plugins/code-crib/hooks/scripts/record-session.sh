#!/bin/bash
# 수집 실패가 응답이나 종료를 막지 않도록 한다.
command -v python3 >/dev/null 2>&1 || exit 0
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" 2>/dev/null && pwd)" || exit 0
python3 "$SCRIPT_DIR/session-history.py" hook --provider claude
exit 0
