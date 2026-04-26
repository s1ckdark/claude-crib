#!/bin/bash
# check-significance.sh - Stop hook for code-crib.
# Counts file-modifying tool uses in the session transcript and surfaces
# a gentle reminder to /code-crib:stash if the session looks substantial.
# Exits 0 on every path so the Stop pipeline is never blocked.

set -uo pipefail

THRESHOLD="${CODE_CRIB_STASH_THRESHOLD:-3}"

command -v python3 >/dev/null 2>&1 || exit 0
command -v jq >/dev/null 2>&1 || exit 0

INPUT=$(timeout 1 cat 2>/dev/null) || exit 0
TRANSCRIPT=$(printf '%s' "$INPUT" | jq -r '.transcript_path // empty' 2>/dev/null)
[ -n "$TRANSCRIPT" ] && [ -f "$TRANSCRIPT" ] || exit 0

EDITS=$(python3 - "$TRANSCRIPT" <<'PY' 2>/dev/null || echo 0
import json, sys

EDIT_TOOLS = {"Edit", "Write", "MultiEdit", "NotebookEdit"}

count = 0
try:
    with open(sys.argv[1]) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                continue
            if entry.get("type") != "assistant":
                continue
            content = entry.get("message", {}).get("content", [])
            if not isinstance(content, list):
                continue
            for item in content:
                if (
                    isinstance(item, dict)
                    and item.get("type") == "tool_use"
                    and item.get("name") in EDIT_TOOLS
                ):
                    count += 1
except Exception:
    pass
print(count)
PY
)

[ "${EDITS:-0}" -ge "$THRESHOLD" ] || exit 0

cat <<EOF
💡 code-crib reminder: this session made ${EDITS} file edits.
   Consider /code-crib:stash to save it to your knowledge stash.
   (User-facing reminder only — do not auto-invoke.)
EOF
