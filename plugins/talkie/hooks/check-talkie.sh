#!/bin/bash
STATE_FILE="$CLAUDE_PLUGIN_ROOT/state.json"

# Fast exit: no state file means talkie is off (common case)
[ -f "$STATE_FILE" ] || exit 0

# Pure-bash extraction — zero subprocesses
# Malformed state gracefully degrades to off
read -r LINE < "$STATE_FILE"
MODE="${LINE##*\"mode\":\"}"
MODE="${MODE%%\"*}"

SAY_SCRIPT="$CLAUDE_PLUGIN_ROOT/scripts/say.sh"

case "$MODE" in
  "on")
    echo "[TALKIE: on] Summarize your most recent response in 2-3 sentences (match the response language), then run: $SAY_SCRIPT \"<summary>\""
    ;;
  "report")
    echo "[TALKIE: report] If the current task just completed, summarize the result in 2-3 sentences and run: $SAY_SCRIPT \"<summary>\". If not complete, do nothing."
    ;;
esac
