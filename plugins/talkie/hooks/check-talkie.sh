#!/bin/bash
# Resolve plugin root: env var > script location fallback
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
STATE_FILE="$PLUGIN_ROOT/state.json"

# Fast exit: no state file means talkie is off (common case)
[ -f "$STATE_FILE" ] || exit 0

# Pure-bash extraction — zero subprocesses
# Malformed state gracefully degrades to off
read -r LINE < "$STATE_FILE"
MODE="${LINE##*\"mode\":\"}"
MODE="${MODE%%\"*}"

SAY_SCRIPT="$PLUGIN_ROOT/scripts/say.sh"

case "$MODE" in
  "on")
    echo "[TALKIE: on] Summarize your most recent response in 2-3 sentences (match the response language), then run: $SAY_SCRIPT \"<summary>\""
    ;;
  "report")
    echo "[TALKIE: report] Check if your most recent response is a result, confirmation, or status update (e.g. 'done', 'complete', 'pushed', commit results, error reports, or any short completion message). If so, summarize it in 1-2 sentences and run: $SAY_SCRIPT \"<summary>\". If you're still mid-task with more work to do, do nothing."
    ;;
esac
