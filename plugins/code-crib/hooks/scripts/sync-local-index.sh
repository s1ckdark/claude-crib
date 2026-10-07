#!/bin/bash
# 인덱싱 실패가 세션 시작을 막지 않도록 한다.
command -v python3 >/dev/null 2>&1 || exit 0
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" 2>/dev/null && pwd)" || exit 0
python3 "$SCRIPT_DIR/local-index.py" hook
exit 0
