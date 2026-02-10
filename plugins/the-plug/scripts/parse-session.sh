#!/bin/bash
# parse-session.sh - Parse Claude Code session JSONL files
# Extracts key info: summary, timestamps, user messages, tool usage, git info
#
# Usage: bash parse-session.sh <jsonl_file> [--summary-only]
#
# Output: JSON with session metadata

set -euo pipefail

JSONL_FILE="${1:-}"
SUMMARY_ONLY="${2:-}"

if [ -z "$JSONL_FILE" ] || [ ! -f "$JSONL_FILE" ]; then
  echo '{"error": "JSONL file not found"}' >&2
  exit 1
fi

python3 -c "
import json, sys, os
from datetime import datetime

jsonl_file = sys.argv[1]
summary_only = len(sys.argv) > 2 and sys.argv[2] == '--summary-only'

entries = []
with open(jsonl_file) as f:
    for line in f:
        line = line.strip()
        if line:
            try:
                entries.append(json.loads(line))
            except json.JSONDecodeError:
                continue

if not entries:
    print(json.dumps({'error': 'Empty session'}))
    sys.exit(0)

# Extract summary
summary_text = ''
for e in entries:
    if e.get('type') == 'summary':
        summary_text = e.get('summary', '')

# Extract timestamps
timestamps = [e.get('timestamp') for e in entries if e.get('timestamp')]
first_ts = timestamps[0] if timestamps else None
last_ts = timestamps[-1] if timestamps else None

# Extract session ID
session_id = None
for e in entries:
    sid = e.get('sessionId')
    if sid:
        session_id = sid
        break

# Extract git branch
git_branch = None
for e in entries:
    branch = e.get('gitBranch')
    if branch:
        git_branch = branch
        break

if summary_only:
    print(json.dumps({
        'session_id': session_id,
        'summary': summary_text,
        'start': first_ts,
        'end': last_ts,
        'branch': git_branch
    }))
    sys.exit(0)

# Extract user messages (content text only)
user_messages = []
for e in entries:
    if e.get('type') == 'user' and e.get('message', {}).get('role') == 'user':
        # Skip meta entries (skill loads, system injections)
        if e.get('isMeta'):
            continue
        content = e['message'].get('content', '')
        if isinstance(content, str):
            # Skip meta/system messages
            if any(tag in content for tag in ['<command-message>', '<system-reminder>', '<local-command-', '<command-name>', '<task-notification>']):
                continue
            text = content[:200]
        elif isinstance(content, list):
            skip_tags = ['<command-message>', '<system-reminder>', '<local-command-', '<command-name>', '<task-notification>']
            texts = []
            for c in content:
                if c.get('type') == 'text':
                    t = c.get('text', '')
                    if not any(tag in t for tag in skip_tags):
                        texts.append(t[:200])
            text = ' '.join(texts)[:200]
        else:
            continue
        if text.strip():
            # Strip remaining system-reminder blocks from text
            import re
            clean = re.sub(r'<system-reminder>.*?</system-reminder>', '', text, flags=re.DOTALL).strip()
            if clean:
                user_messages.append(clean)

# Extract tools used
tools_used = set()
for e in entries:
    if e.get('type') == 'assistant':
        msg = e.get('message', {})
        content = msg.get('content', [])
        if isinstance(content, list):
            for block in content:
                if isinstance(block, dict) and block.get('type') == 'tool_use':
                    tools_used.add(block.get('name', ''))

# Count messages
user_count = len(user_messages)
assistant_count = sum(1 for e in entries if e.get('type') == 'assistant')

result = {
    'session_id': session_id,
    'summary': summary_text,
    'start': first_ts,
    'end': last_ts,
    'branch': git_branch,
    'user_messages': user_messages[:15],  # Last 15 for context
    'tools_used': sorted(list(tools_used)),
    'message_counts': {
        'user': user_count,
        'assistant': assistant_count,
        'total': len(entries)
    }
}

print(json.dumps(result, indent=2))
" "$JSONL_FILE" "$SUMMARY_ONLY"
