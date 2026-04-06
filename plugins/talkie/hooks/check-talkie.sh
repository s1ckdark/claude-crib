#!/bin/bash
# Talkie PostToolUse hook: check state and signal main Claude if TTS needed
STATE_FILE="$CLAUDE_PLUGIN_ROOT/state.json"
SAY_SCRIPT="$CLAUDE_PLUGIN_ROOT/scripts/say.sh"

# Read mode from state file (default: off)
MODE="off"
if [ -f "$STATE_FILE" ]; then
  MODE=$(cat "$STATE_FILE" | grep -o '"mode":"[^"]*"' | cut -d'"' -f4)
fi

case "$MODE" in
  "on")
    echo "[TALKIE: on] Summarize your most recent response in 2-3 sentences (match the response language), then run: $SAY_SCRIPT \"<summary>\""
    ;;
  "report")
    echo "[TALKIE: report] If the current task just completed, summarize the result in 2-3 sentences and run: $SAY_SCRIPT \"<summary>\". If not complete, do nothing."
    ;;
  *)
    # off or missing — silent exit
    ;;
esac
