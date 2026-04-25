#!/bin/bash
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
STATE_FILE="$PLUGIN_ROOT/state.json"
SAY_SCRIPT="$PLUGIN_ROOT/scripts/say.sh"

# Fast exit: no state file means talkie is off
[ -f "$STATE_FILE" ] || exit 0

# Need jq for robust JSON parsing — assistant messages routinely contain
# escaped quotes and newlines that grep/${var//} parsing breaks on.
command -v jq >/dev/null 2>&1 || exit 0

MODE=$(jq -r '.mode // "off"' "$STATE_FILE" 2>/dev/null)
[ "$MODE" = "off" ] && exit 0
[ -z "$MODE" ] && exit 0

MSG=$(timeout 1 cat | jq -r '.last_assistant_message // empty' 2>/dev/null)
[ -z "$MSG" ] && exit 0

# Truncate to ~200 chars for TTS
MSG="${MSG:0:200}"

case "$MODE" in
  "on"|"report") "$SAY_SCRIPT" "$MSG" ;;
esac
