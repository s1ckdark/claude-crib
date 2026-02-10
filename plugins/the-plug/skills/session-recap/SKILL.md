---
name: session-recap
description: Use when the user asks what happened in a previous session, wants a recap of recent work, asks "what was I doing", "where did I leave off", or when the SessionStart hook triggers a recap after detecting a time gap. Also triggers on phrases like "what went down", "catch me up", or "what did we do".
version: 1.0.0
---

# Session Recap - Reading and Summarizing Past Sessions

You have access to Claude Code session data stored at `~/.claude/projects/`. Use this to provide recaps of previous work sessions.

## Data Sources

### Session Transcripts (JSONL)

Location: `~/.claude/projects/{project-dir-name}/{session-id}.jsonl`

The project directory name is the working directory path with `/` replaced by `-`:
- `/Users/dave/iWorks/claude-crib` -> `-Users-dave-iWorks-claude-crib`

Each JSONL file contains entries with these types:
- `user` - User messages (has `timestamp`, `message.content`, `sessionId`, `gitBranch`)
- `assistant` - Claude responses (has `message.content` with `tool_use` blocks)
- `summary` - Session title (has `summary` field, usually last entry)
- `system` - System messages
- `file-history-snapshot` - File change tracking

**Key fields to extract:**
- `timestamp` - ISO 8601 datetime for ordering
- `message.content` - User questions/requests or assistant responses
- `message.content[].type: "tool_use"` - Tools used (Edit, Write, Bash, etc.)
- `message.content[].input` - Tool inputs (file paths, commands)
- `gitBranch` - Active git branch
- `summary` - Session title/summary

### Session Memory Summaries

Location: `~/.claude/projects/{project-dir-name}/{session-id}/session-memory/summary.md`

Pre-generated summaries (not all sessions have these). Check first as they're the most concise source.

## How to Generate a Recap

### Step 1: Find Recent Sessions

```bash
# List JSONL files sorted by modification time (most recent first)
ls -t ~/.claude/projects/{project-dir-name}/*.jsonl | head -5
```

### Step 2: Parse Session Data

Use the parse-session.sh script if available:
```bash
bash $CLAUDE_PLUGIN_ROOT/scripts/parse-session.sh <jsonl_file>
```

Or read the JSONL directly with Grep/Read tools to find:
- Session summary (type: "summary")
- User messages to understand what was requested
- Tool usage to understand what was done
- File paths in tool inputs to identify modified files

### Step 3: Gather Git Context

```bash
# Current status
git status
# Recent commits since last session
git log --oneline --since="<last_session_timestamp>"
# Changed files
git diff --name-only HEAD~5
```

### Step 4: Compose the Recap

Include these sections:

1. **What went down** - Main tasks/features worked on
2. **Files touched** - Key files that were modified
3. **Unfinished business** - Any TODO items, pending work, or incomplete tasks
4. **Git status** - Current branch, uncommitted changes, recent commits

## Presentation Style

Keep it concise and slightly Hood-flavored:
- Start with "Yo, welcome back" or similar casual opener
- Use direct, no-nonsense language
- Bullet points over paragraphs
- Highlight what matters most first
- End with what to pick up next

## Example Output

```
Yo, welcome back. Been about 3 hours. Here's what went down:

**Last Session: "Add user authentication"** (branch: `feat/auth`)

**What we did:**
- Set up JWT middleware in `src/auth/middleware.ts`
- Created login/register endpoints in `src/routes/auth.ts`
- Added password hashing with bcrypt

**Files touched:**
- `src/auth/middleware.ts` (new)
- `src/routes/auth.ts` (new)
- `src/app.ts` (modified - added auth routes)
- `package.json` (added bcrypt, jsonwebtoken)

**Unfinished:**
- Token refresh endpoint not started yet
- Need to add rate limiting to login
- Tests not written

**Git:** 2 uncommitted files, 3 commits ahead of main

Ready to pick up where you left off?
```

## Configuration

Settings can be at project level (`.claude/the-plug.local.md`) or global (`~/.claude/the-plug-config.json`).

Project config format:
```markdown
---
auto_recap: true
gap_hours: 2
---
```

Global config format:
```json
{
  "auto_recap": true,
  "gap_hours": 2
}
```
