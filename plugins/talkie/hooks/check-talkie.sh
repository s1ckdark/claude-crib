#!/bin/bash
# Resolve plugin root: env var > script location fallback
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
STATE_FILE="$PLUGIN_ROOT/state.json"
SAY_SCRIPT="$PLUGIN_ROOT/scripts/say.sh"

# Fast exit: no state file means talkie is off (common case)
[ -f "$STATE_FILE" ] || exit 0

# Pure-bash extraction — zero subprocesses
read -r LINE < "$STATE_FILE"
MODE="${LINE##*\"mode\":\"}"
MODE="${MODE%%\"*}"

case "$MODE" in
  "on")
    "$SAY_SCRIPT" "응답이 준비되었습니다."
    ;;
  "report")
    "$SAY_SCRIPT" "작업이 완료되었습니다."
    ;;
esac
