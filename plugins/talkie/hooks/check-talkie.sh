#!/bin/bash
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
STATE_FILE="$PLUGIN_ROOT/state.json"
SAY_SCRIPT="$PLUGIN_ROOT/scripts/say.sh"

# Fast exit: no state file means talkie is off
[ -f "$STATE_FILE" ] || exit 0

read -r LINE < "$STATE_FILE"
MODE="${LINE##*\"mode\":\"}"
MODE="${MODE%%\"*}"

[ "$MODE" = "off" ] && exit 0

# Read stdin JSON to extract last_assistant_message
STDIN_DATA=$(timeout 1 cat)
MSG=$(echo "$STDIN_DATA" | grep -o '"last_assistant_message":"[^"]*"' | head -1 | cut -d'"' -f4)

# Nothing to say
[ -z "$MSG" ] && exit 0

# Truncate to ~200 chars for TTS
MSG="${MSG:0:200}"

case "$MODE" in
  "on")
    "$SAY_SCRIPT" "$MSG"
    ;;
  "report")
    "$SAY_SCRIPT" "$MSG"
    ;;
esac
