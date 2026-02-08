#!/bin/bash
# check-gap.sh - SessionStart hook for the-plug
# Checks if enough time has passed since last session to trigger a recap
#
# Reads config from:
#   1. .claude/the-plug.local.md (project-level)
#   2. ~/.claude/the-plug-config.json (global)
#
# Outputs system message prompting Claude to summarize last session

set -euo pipefail

# Read hook input from stdin
INPUT=$(cat)

CWD=$(echo "$INPUT" | python3 -c "import sys,json; print(json.loads(sys.stdin.read()).get('cwd',''))" 2>/dev/null || echo "")

if [ -z "$CWD" ]; then
  CWD="${CLAUDE_PROJECT_DIR:-$(pwd)}"
fi

# Default gap threshold: 2 hours (in seconds)
DEFAULT_GAP=7200

# Try to read project-level config
GAP_THRESHOLD="$DEFAULT_GAP"
AUTO_ENABLED="true"

# Check project-level config (.claude/the-plug.local.md)
PROJECT_CONFIG="$CWD/.claude/the-plug.local.md"
if [ -f "$PROJECT_CONFIG" ]; then
  # Parse frontmatter for gap_hours and auto_recap
  gap_val=$(python3 -c "
import re, sys
with open(sys.argv[1]) as f:
    content = f.read()
m = re.search(r'gap_hours:\s*(\d+\.?\d*)', content)
print(m.group(1) if m else '')
" "$PROJECT_CONFIG" 2>/dev/null || echo "")

  if [ -n "$gap_val" ]; then
    GAP_THRESHOLD=$(python3 -c "print(int(float('$gap_val') * 3600))")
  fi

  auto_val=$(python3 -c "
import re, sys
with open(sys.argv[1]) as f:
    content = f.read()
m = re.search(r'auto_recap:\s*(true|false)', content)
print(m.group(1) if m else 'true')
" "$PROJECT_CONFIG" 2>/dev/null || echo "true")

  AUTO_ENABLED="$auto_val"
fi

# Check global config (~/.claude/the-plug-config.json)
GLOBAL_CONFIG="$HOME/.claude/the-plug-config.json"
if [ -f "$GLOBAL_CONFIG" ] && [ "$GAP_THRESHOLD" = "$DEFAULT_GAP" ]; then
  gap_val=$(python3 -c "
import json, sys
with open(sys.argv[1]) as f:
    cfg = json.load(f)
print(cfg.get('gap_hours', ''))
" "$GLOBAL_CONFIG" 2>/dev/null || echo "")

  if [ -n "$gap_val" ]; then
    GAP_THRESHOLD=$(python3 -c "print(int(float('$gap_val') * 3600))")
  fi

  if [ "$AUTO_ENABLED" = "true" ]; then
    auto_val=$(python3 -c "
import json, sys
with open(sys.argv[1]) as f:
    cfg = json.load(f)
print(str(cfg.get('auto_recap', True)).lower())
" "$GLOBAL_CONFIG" 2>/dev/null || echo "true")
    AUTO_ENABLED="$auto_val"
  fi
fi

# If auto recap is disabled, exit silently
if [ "$AUTO_ENABLED" != "true" ]; then
  exit 0
fi

# Find project directory in ~/.claude/projects/
# Convert CWD path: /Users/dave/iWorks/claude-crib -> -Users-dave-iWorks-claude-crib
PROJECT_DIR_NAME=$(echo "$CWD" | sed 's|/|-|g')
SESSIONS_DIR="$HOME/.claude/projects/$PROJECT_DIR_NAME"

if [ ! -d "$SESSIONS_DIR" ]; then
  exit 0
fi

# Find the most recent JSONL file by modification time (excluding current session)
LATEST_JSONL=""
LATEST_MTIME=0

for f in "$SESSIONS_DIR"/*.jsonl; do
  [ -f "$f" ] || continue
  mtime=$(stat -f %m "$f" 2>/dev/null || stat -c %Y "$f" 2>/dev/null || echo "0")
  if [ "$mtime" -gt "$LATEST_MTIME" ]; then
    LATEST_MTIME="$mtime"
    LATEST_JSONL="$f"
  fi
done

if [ -z "$LATEST_JSONL" ] || [ "$LATEST_MTIME" = "0" ]; then
  exit 0
fi

# Calculate time gap
NOW=$(date +%s)
GAP=$((NOW - LATEST_MTIME))

# If gap is less than threshold, exit silently
if [ "$GAP" -lt "$GAP_THRESHOLD" ]; then
  exit 0
fi

# Gap exceeded! Get session summary
SESSION_INFO=$(bash "$CLAUDE_PLUGIN_ROOT/scripts/parse-session.sh" "$LATEST_JSONL" --summary-only 2>/dev/null || echo '{}')

SUMMARY=$(echo "$SESSION_INFO" | python3 -c "import sys,json; print(json.loads(sys.stdin.read()).get('summary','Unknown session'))" 2>/dev/null || echo "Unknown session")
LAST_TIME=$(echo "$SESSION_INFO" | python3 -c "import sys,json; print(json.loads(sys.stdin.read()).get('end','Unknown'))" 2>/dev/null || echo "Unknown")
BRANCH=$(echo "$SESSION_INFO" | python3 -c "import sys,json; print(json.loads(sys.stdin.read()).get('branch',''))" 2>/dev/null || echo "")

# Format gap as human-readable
GAP_TEXT=$(python3 -c "
gap = $GAP
if gap >= 86400:
    print(f'{gap // 86400}d {(gap % 86400) // 3600}h')
elif gap >= 3600:
    print(f'{gap // 3600}h {(gap % 3600) // 60}m')
else:
    print(f'{gap // 60}m')
")

# Output system message for Claude
BRANCH_INFO=""
if [ -n "$BRANCH" ]; then
  BRANCH_INFO=" on branch \`$BRANCH\`"
fi

cat << EOF
hook additional context: [THE PLUG] Yo, it's been ${GAP_TEXT} since the last session${BRANCH_INFO}. Last session: "${SUMMARY}" (ended ${LAST_TIME}). The session log is at: ${LATEST_JSONL}

Give the user a quick recap of what went down last time. Read the session log to provide details about:
1. What work was done (key tasks/changes)
2. Which files were modified
3. Any unfinished TODO items or pending work
4. Current git status

Keep it concise and Hood-flavored. Start with something like "Yo, welcome back. Here's what went down last time..."
EOF
