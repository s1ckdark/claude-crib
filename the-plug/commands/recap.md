---
description: Get a recap of your last session - what went down while you were away
argument-hint: Optional number of sessions to recap (default: 1)
allowed-tools: ["Read", "Grep", "Glob", "Bash", "Task"]
---

# The Plug - Recap

Yo, the user wants to know what went down. Give them the rundown on their last session(s).

## Steps

### 1. Find the Project Sessions Directory

Convert the current working directory to the Claude projects path format:
- Replace all `/` with `-` in the current path
- Look in `~/.claude/projects/{converted-path}/`

### 2. Find Recent Session Files

List JSONL files sorted by modification time:
```bash
ls -t ~/.claude/projects/{project-dir}/*.jsonl | head -N
```

Where N = `$ARGUMENTS` if provided (number of sessions to recap), otherwise 1.

### 3. Analyze Sessions

For each session JSONL file, use the session-reader agent (Task tool with `subagent_type: "the-plug:session-reader"`):
- Parse the JSONL to extract summary, timestamps, user messages, tools used, files modified
- If the session-reader agent is not available, read the file directly

Alternatively, use the parse script:
```bash
bash $CLAUDE_PLUGIN_ROOT/scripts/parse-session.sh <jsonl_file>
```

### 4. Get Current Git Context

Run in parallel:
```bash
git status --short
git log --oneline -10
```

### 5. Present the Recap

Format the output Hood-style but informative:

**For single session:**
```
Yo, welcome back. Here's what went down:

**Last Session: "{summary}"** ({time_ago} ago, branch: `{branch}`)

**What we did:**
- {task 1}
- {task 2}

**Files touched:**
- `{file1}` (new/modified)
- `{file2}` (modified)

**Unfinished business:**
- {pending item}

**Git status:** {branch info, uncommitted changes}

Ready to pick back up?
```

**For multiple sessions:**
```
Yo, here's the last {N} sessions:

### Session 1: "{summary}" ({time_ago})
- {brief description}

### Session 2: "{summary}" ({time_ago})
- {brief description}

**Current state:**
- Branch: `{branch}`
- {uncommitted changes}
```

## Tone Guide

- Casual, direct, Hood-flavored but not overdone
- "Yo" > "Hello"
- "What went down" > "What occurred"
- "Unfinished business" > "Remaining tasks"
- "Pick back up" > "Continue where you left off"
- Keep it real - don't sugarcoat if things were left incomplete

## Edge Cases

- **No sessions found:** "Yo, this is a fresh start - no previous sessions found for this project."
- **Very short session (<3 messages):** "Quick session last time - just {summary}. Nothing major."
- **Session with no summary:** Use first user message as title
- **Multiple days away:** Mention how long it's been prominently
