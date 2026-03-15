# Codex Plugin Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a Claude Code plugin that integrates OpenAI Codex CLI for code generation, review, Q&A, and parallel worker execution.

**Architecture:** Multi-agent plugin with 5 commands (`ask`, `code`, `review`, `worker`, `setup`), 4 dedicated agents, 1 skill, and empty hooks. Each command delegates to a specialized agent via the Task tool. Config stored in `~/.claude/codex.local.md`.

**Tech Stack:** Claude Code plugin framework (markdown-based commands/agents/skills), Codex CLI, tmux (for worker mode)

**Spec:** `docs/superpowers/specs/2026-03-16-codex-plugin-design.md`

---

## File Map

| File | Responsibility |
|------|---------------|
| `plugins/codex/.claude-plugin/plugin.json` | Plugin manifest |
| `plugins/codex/commands/codex:setup.md` | CLI install check, API key verify, config creation |
| `plugins/codex/commands/codex:ask.md` | Question → `codex exec` → text response |
| `plugins/codex/commands/codex:code.md` | Instruction → `codex exec --full-auto` → file changes |
| `plugins/codex/commands/codex:review.md` | Diff/file → `codex exec` → review feedback |
| `plugins/codex/commands/codex:worker.md` | Task → tmux session → long-running Codex worker |
| `plugins/codex/agents/codex-responder.md` | Agent for ask (suggest only) |
| `plugins/codex/agents/codex-coder.md` | Agent for code (full-auto) |
| `plugins/codex/agents/codex-reviewer.md` | Agent for review (suggest only) |
| `plugins/codex/agents/codex-worker.md` | Agent for tmux worker management |
| `plugins/codex/skills/codex-flow/SKILL.md` | Workflow guide and command selection |
| `plugins/codex/hooks/hooks.json` | Empty hooks (future expansion) |
| `plugins/codex/README.md` | Plugin documentation |

---

## Chunk 1: Scaffold and Setup

### Task 1: Create plugin scaffold

**Files:**
- Create: `plugins/codex/.claude-plugin/plugin.json`
- Create: `plugins/codex/hooks/hooks.json`

- [ ] **Step 1: Create plugin.json**

```json
{
  "name": "codex",
  "version": "0.1.0",
  "description": "Codex CLI integration for Claude Code - ask questions, generate code, review, and run parallel workers via OpenAI Codex.",
  "author": {
    "name": "Dave"
  },
  "keywords": ["codex", "openai", "code-generation", "code-review", "worker", "tmux"],
  "commands": "./commands",
  "skills": "./skills",
  "agents": "./agents",
  "hooks": "./hooks/hooks.json"
}
```

- [ ] **Step 2: Create hooks.json**

```json
{
  "hooks": {}
}
```

- [ ] **Step 3: Verify structure**

Run: `ls -la plugins/codex/.claude-plugin/plugin.json plugins/codex/hooks/hooks.json`
Expected: Both files exist

- [ ] **Step 4: Commit**

```bash
git add plugins/codex/.claude-plugin/plugin.json plugins/codex/hooks/hooks.json
git commit -m "feat(codex): scaffold plugin with manifest and empty hooks"
```

---

### Task 2: Create setup command

**Files:**
- Create: `plugins/codex/commands/codex:setup.md`

- [ ] **Step 1: Write codex:setup.md**

```markdown
---
name: codex:setup
description: Check Codex CLI installation, verify API key, and create configuration
argument-hint: [--check]
allowed-tools: Bash, Read, Write, AskUserQuestion
---

<!--
Usage:
  /codex:setup          # Run full setup wizard
  /codex:setup --check  # Only check installation status
-->

# Codex Setup Wizard

## Instructions

### 1. Check Codex CLI

```bash
which codex && codex --version 2>/dev/null || echo "NOT_FOUND: codex"
```

- **Installed**: Show version, continue
- **Not installed**: Show installation command and stop

```
Codex CLI is not installed. Install it with:
  npm install -g @openai/codex

Then set your API key:
  export OPENAI_API_KEY="sk-..."
```

### 2. Check API Key

```bash
[ -n "$OPENAI_API_KEY" ] && echo "✓ OPENAI_API_KEY set (${OPENAI_API_KEY:0:8}...)" || echo "✗ OPENAI_API_KEY not set"
```

- **Set**: Show first 8 chars, continue
- **Not set**: Show setup instructions and stop

### 3. Check tmux (optional, for worker mode)

```bash
which tmux && tmux -V 2>/dev/null || echo "NOT_FOUND: tmux"
```

- **Installed**: Worker mode available
- **Not installed**: Worker mode disabled, show: `brew install tmux`

### 4. Connectivity Test

```bash
codex exec "Say hello" 2>&1
```

- **Success**: "Codex CLI connection verified"
- **Failure**: Show stderr content

If `--check` flag was provided, stop here and display status report.

### 5. Create Config File

Check if `~/.claude/codex.local.md` exists:
- **Exists**: Read and display current config
- **Not exists**: Create with defaults:

```markdown
---
codex_path: codex
default_model: o4-mini
confirm_full_auto: true
worker_session_prefix: codex-worker
timeout: 120000
---

# Codex Plugin Configuration

## Models
| Model | Description |
|-------|-------------|
| o4-mini | Fast, cost-effective (default) |
| o3 | More capable, slower |

## Notes
- OPENAI_API_KEY must be set in environment
- Codex CLI: npm install -g @openai/codex
- tmux required for /codex:worker
```

### 6. Display Summary

```
=== Codex Setup Complete ===

Status:
  ✓ Codex CLI    - vX.X.X
  ✓ API Key      - sk-xxxxx...
  ✓ tmux         - available (worker mode enabled)
  ✓ Connection   - verified

Config: ~/.claude/codex.local.md

Available commands:
  /codex:ask "question"     - Ask Codex a question
  /codex:code "instruction" - Generate/modify code (full-auto)
  /codex:review [file]      - Code review
  /codex:worker "task"      - Launch tmux worker
```

## Error Handling

- Missing CLI: Provide npm install command
- Missing API key: Provide export command
- Connection failure: Show error, suggest checking API key
- tmux missing: Warn but don't block (only affects /codex:worker)
```

- [ ] **Step 2: Verify file syntax**

Run: `head -6 plugins/codex/commands/codex:setup.md`
Expected: Valid YAML frontmatter with `---` delimiters

- [ ] **Step 3: Commit**

```bash
git add plugins/codex/commands/codex:setup.md
git commit -m "feat(codex): add setup command with install check and config wizard"
```

---

## Chunk 2: Core Commands (ask, code, review)

### Task 3: Create codex:ask command and codex-responder agent

**Files:**
- Create: `plugins/codex/commands/codex:ask.md`
- Create: `plugins/codex/agents/codex-responder.md`

- [ ] **Step 1: Write codex-responder agent**

```markdown
---
name: codex-responder
description: |
  Execute Codex CLI in suggest-only mode to answer questions.
  Returns text responses without modifying any files.

  <example>
  Context: User asks a coding question via /codex:ask
  user: "/codex:ask 'What does this error mean?'"
  assistant: "I'll use the codex-responder agent to get Codex's answer."
  </example>
model: inherit
color: green
tools: ["Bash", "Read"]
---

You are the Codex Responder. Your job is to relay questions to the Codex CLI and return the response.

## CRITICAL RULES

- **NEVER** modify any files. You are read-only.
- **NEVER** use Write or Edit tools. You only have Bash and Read.
- Always load config from `~/.claude/codex.local.md` first.

## Your Job

1. Read config from `~/.claude/codex.local.md` to get `codex_path`, `default_model`, `timeout`
2. Pre-flight check: `which {codex_path}` — if missing, tell user to run `/codex:setup`
3. Execute the question:
   ```bash
   {codex_path} exec -m {default_model} "{question}" 2>&1
   ```
   Use timeout from config (default 120000ms).
4. Check exit code:
   - **0**: Return the response text to the user
   - **Non-zero**: Show the error message from stderr
5. Format the response clearly — present Codex's answer directly without adding your own commentary

## Error Handling

- CLI not found: "Codex CLI not installed. Run `/codex:setup` to configure."
- Timeout: "Codex request timed out after {timeout}ms. Try a shorter question or increase timeout in config."
- Non-zero exit: Show stderr content
```

- [ ] **Step 2: Write codex:ask command**

```markdown
---
name: codex:ask
description: Ask Codex a question and get a text response (no file modifications)
argument-hint: "<question>"
allowed-tools: Bash, Read
---

<!--
Usage:
  /codex:ask "What does this error mean?"
  /codex:ask "Compare Redis pub/sub vs Kafka"
  /codex:ask "Explain this regex: ^[a-z]+$"
-->

# Codex Ask

Question: $ARGUMENTS

## Instructions

1. **Load Config**
   Read `~/.claude/codex.local.md` for settings. If file doesn't exist, use defaults:
   - codex_path: `codex`
   - default_model: `o4-mini`
   - timeout: `120000`

2. **Pre-flight Check**
   ```bash
   which codex || echo "NOT_FOUND"
   ```
   If not found, tell user: "Codex CLI not installed. Run `/codex:setup` first."

3. **Execute Query**
   ```bash
   codex exec -m {default_model} "{question}" 2>&1
   ```
   Apply timeout from config.

4. **Handle Result**
   - **Success** (exit 0): Display Codex's response to the user
   - **Failure** (exit != 0): Display the error message

5. **Output Format**
   Present Codex's response directly. Do not modify files. Do not add commentary unless the user asks for clarification.

## Error Handling

- CLI missing: Direct to `/codex:setup`
- API key missing: "OPENAI_API_KEY not set. Run `/codex:setup` to configure."
- Timeout: Show timeout message with current limit
- Rate limit (429): "Codex rate limited. Wait a moment and try again."
```

- [ ] **Step 3: Verify both files**

Run: `head -3 plugins/codex/agents/codex-responder.md plugins/codex/commands/codex:ask.md`
Expected: Valid YAML frontmatter in both

- [ ] **Step 4: Commit**

```bash
git add plugins/codex/agents/codex-responder.md plugins/codex/commands/codex:ask.md
git commit -m "feat(codex): add ask command and responder agent"
```

---

### Task 4: Create codex:code command and codex-coder agent

**Files:**
- Create: `plugins/codex/commands/codex:code.md`
- Create: `plugins/codex/agents/codex-coder.md`

- [ ] **Step 1: Write codex-coder agent**

```markdown
---
name: codex-coder
description: |
  Execute Codex CLI in full-auto mode to generate or modify code.
  Reports all file changes after execution.

  <example>
  Context: User delegates code work via /codex:code
  user: "/codex:code 'Add a debounce function to utils.ts'"
  assistant: "I'll use the codex-coder agent to run Codex in full-auto mode."
  </example>
model: inherit
color: orange
tools: ["Bash", "Read", "Glob"]
---

You are the Codex Coder. Your job is to execute code generation tasks via Codex CLI in full-auto mode.

## CRITICAL RULES

- **ALWAYS** run in `--full-auto` mode — Codex modifies files directly.
- **ALWAYS** show `git diff --stat` after execution so the user sees what changed.
- **ALWAYS** check config for `confirm_full_auto` before running.
- If `confirm_full_auto: true`, you MUST confirm with the user before executing.

## Your Job

1. Read config from `~/.claude/codex.local.md` to get settings
2. Pre-flight check: `which {codex_path}`
3. Record pre-execution state:
   ```bash
   git status --short
   ```
4. If `confirm_full_auto` is true, inform the user:
   "Codex will run in full-auto mode and may modify files directly. Proceed?"
   Wait for confirmation before continuing.
5. Execute:
   ```bash
   {codex_path} exec --full-auto -m {model} "{instruction}" 2>&1
   ```
6. Check exit code:
   - **0**: Show changes with `git diff --stat`
   - **Non-zero**: Show error from stderr
7. Report summary: files modified, lines added/removed

## Error Handling

- CLI not found: Direct to `/codex:setup`
- Timeout: Kill process, show partial output if available
- Non-zero exit: Show stderr, suggest checking the instruction
```

- [ ] **Step 2: Write codex:code command**

```markdown
---
name: codex:code
description: Delegate code generation or modification to Codex with full-auto mode
argument-hint: "<instruction>" [--model o4-mini|o3]
allowed-tools: Bash, Read, Glob
---

<!--
Usage:
  /codex:code "Add a debounce function to utils.ts"
  /codex:code "Fix the failing test in auth.spec.ts"
  /codex:code "Refactor this module to use async/await" --model o3
-->

# Codex Code

Instruction: $ARGUMENTS

## Instructions

1. **Load Config**
   Read `~/.claude/codex.local.md` for settings. Defaults:
   - codex_path: `codex`
   - default_model: `o4-mini`
   - confirm_full_auto: `true`
   - timeout: `120000`

2. **Parse Arguments**
   - Extract instruction text (everything before flags)
   - Extract `--model` flag if present (overrides default_model)

3. **Pre-flight Check**
   ```bash
   which codex || echo "NOT_FOUND"
   ```

4. **Confirm Full-Auto Mode**
   If `confirm_full_auto: true` in config:
   > "Codex will run in **full-auto** mode and may directly create, modify, or delete files. Continue?"

5. **Record Pre-State**
   ```bash
   git status --short
   ```

6. **Execute**
   ```bash
   codex exec --full-auto -m {model} "{instruction}" 2>&1
   ```

7. **Report Changes**
   ```bash
   git diff --stat
   ```
   Show list of modified files and summary of changes.

8. **Handle Errors**
   - Exit 0: Show success + changes
   - Exit != 0: Show error message
   - Timeout: "Codex timed out. Try breaking the task into smaller pieces."

## Error Handling

- CLI missing: Direct to `/codex:setup`
- API key missing: Show export command
- No changes made: "Codex completed but made no file changes."
```

- [ ] **Step 3: Verify both files**

Run: `head -3 plugins/codex/agents/codex-coder.md plugins/codex/commands/codex:code.md`
Expected: Valid YAML frontmatter

- [ ] **Step 4: Commit**

```bash
git add plugins/codex/agents/codex-coder.md plugins/codex/commands/codex:code.md
git commit -m "feat(codex): add code command and coder agent (full-auto mode)"
```

---

### Task 5: Create codex:review command and codex-reviewer agent

**Files:**
- Create: `plugins/codex/commands/codex:review.md`
- Create: `plugins/codex/agents/codex-reviewer.md`

- [ ] **Step 1: Write codex-reviewer agent**

```markdown
---
name: codex-reviewer
description: |
  Send code diffs or file contents to Codex for review.
  Provides feedback on bugs, performance, security, and readability.

  <example>
  Context: User requests code review via /codex:review
  user: "/codex:review src/auth.ts"
  assistant: "I'll use the codex-reviewer agent to get Codex's review."
  </example>
model: inherit
color: cyan
tools: ["Bash", "Read", "Grep"]
---

You are the Codex Reviewer. Your job is to send code to Codex for review and relay the feedback.

## CRITICAL RULES

- **NEVER** modify any files. You are read-only.
- **NEVER** use Write or Edit tools.
- Present Codex's feedback clearly, organized by category.

## Your Job

1. Read config from `~/.claude/codex.local.md`
2. Pre-flight check: `which {codex_path}`
3. Gather code to review:
   - **No args**: Run `git diff` to get unstaged changes
   - **`--staged`**: Run `git diff --staged`
   - **File path**: Read the file content
4. If diff/content is empty, tell user: "No changes to review."
5. Construct review prompt:
   ```
   Review the following code for:
   1. Bugs and logic errors
   2. Performance issues
   3. Security vulnerabilities
   4. Readability and maintainability

   Provide specific, actionable feedback with line references.

   Code:
   {code_content}
   ```
6. Execute:
   ```bash
   {codex_path} exec -m {default_model} "{review_prompt}" 2>&1
   ```
7. Present the review feedback to the user

## Error Handling

- Empty diff: "No changes to review. Stage changes or specify a file path."
- CLI not found: Direct to `/codex:setup`
- Large diff (>10000 chars): Warn about token limits, suggest reviewing specific files
```

- [ ] **Step 2: Write codex:review command**

```markdown
---
name: codex:review
description: Send code to Codex for review (bugs, performance, security, readability)
argument-hint: [file-path] [--staged]
allowed-tools: Bash, Read, Grep
---

<!--
Usage:
  /codex:review                  # Review unstaged changes (git diff)
  /codex:review --staged         # Review staged changes
  /codex:review src/auth.ts      # Review specific file
-->

# Codex Review

Target: $ARGUMENTS

## Instructions

1. **Load Config**
   Read `~/.claude/codex.local.md`. Defaults:
   - codex_path: `codex`
   - default_model: `o4-mini`
   - timeout: `120000`

2. **Pre-flight Check**
   ```bash
   which codex || echo "NOT_FOUND"
   ```

3. **Gather Code**
   Parse arguments to determine source:
   - No arguments: `git diff`
   - `--staged`: `git diff --staged`
   - File path: Read file content with Read tool

4. **Validate Content**
   If the gathered code is empty:
   > "No changes to review. Make some changes, stage them, or specify a file path."

5. **Build Review Prompt**
   ```
   Review the following code for:
   1. Bugs and logic errors
   2. Performance issues
   3. Security vulnerabilities
   4. Readability and maintainability

   Provide specific, actionable feedback with line references where possible.

   Code:
   {code_content}
   ```

6. **Execute**
   ```bash
   codex exec -m {default_model} "{review_prompt}" 2>&1
   ```

7. **Display Feedback**
   Present Codex's review feedback. Do not modify any files.

## Error Handling

- CLI missing: Direct to `/codex:setup`
- Empty diff: Suggest staging changes or specifying a file
- File not found: Show error, suggest checking the path
- Large content (>10000 chars): Warn about token limits
```

- [ ] **Step 3: Verify both files**

Run: `head -3 plugins/codex/agents/codex-reviewer.md plugins/codex/commands/codex:review.md`
Expected: Valid YAML frontmatter

- [ ] **Step 4: Commit**

```bash
git add plugins/codex/agents/codex-reviewer.md plugins/codex/commands/codex:review.md
git commit -m "feat(codex): add review command and reviewer agent"
```

---

## Chunk 3: Worker Command, Skill, and README

### Task 6: Create codex:worker command and codex-worker agent

**Files:**
- Create: `plugins/codex/commands/codex:worker.md`
- Create: `plugins/codex/agents/codex-worker.md`

- [ ] **Step 1: Write codex-worker agent**

```markdown
---
name: codex-worker
description: |
  Manage Codex as a long-running tmux worker session.
  Handles session creation, task dispatch, output monitoring, and cleanup.

  <example>
  Context: User needs a persistent Codex worker via /codex:worker
  user: "/codex:worker 'Fix all failing tests'"
  assistant: "I'll use the codex-worker agent to launch a tmux Codex session."
  </example>
model: inherit
color: purple
tools: ["Bash", "Read"]
---

You are the Codex Worker Manager. Your job is to launch and manage Codex in a tmux session for long-running tasks.

## CRITICAL RULES

- **ALWAYS** check tmux is installed before proceeding.
- **ALWAYS** use unique session names with timestamps.
- **ALWAYS** clean up sessions when done or on error.
- Monitor output periodically to detect completion.

## Your Job

### Starting a Worker

1. Read config from `~/.claude/codex.local.md` (get `worker_session_prefix`)
2. Pre-flight checks:
   ```bash
   which codex || echo "NOT_FOUND: codex"
   which tmux || echo "NOT_FOUND: tmux"
   ```
3. Check for existing sessions:
   ```bash
   tmux ls 2>/dev/null | grep "{worker_session_prefix}" || echo "NO_ACTIVE_SESSIONS"
   ```
4. Create session with unique name:
   ```bash
   SESSION="{worker_session_prefix}-$(date +%Y%m%d-%H%M%S)"
   tmux new-session -d -s "$SESSION"
   ```
5. Launch Codex in the session:
   ```bash
   tmux send-keys -t "$SESSION" 'codex --full-auto' Enter
   ```
6. Wait 3 seconds for Codex to initialize:
   ```bash
   sleep 3
   ```
7. Send the task:
   ```bash
   tmux send-keys -t "$SESSION" '{task_description}' Enter
   ```
8. Report session started:
   ```
   Codex worker launched in tmux session: {SESSION}
   Working on: {task_description}
   ```

### Monitoring

Poll for completion every 10 seconds:
```bash
tmux capture-pane -t "$SESSION" -p -S -50
```

Completion detection:
- Last line matches prompt pattern: `^[❯>]\s*$`
- OR: Two consecutive captures (10s apart) produce identical output

### Collecting Results

When complete:
```bash
tmux capture-pane -t "$SESSION" -p -S -500
```

Present the full output to the user.

### Stopping a Worker (`--stop`)

```bash
# List active sessions
tmux ls 2>/dev/null | grep "{worker_session_prefix}"

# Kill the session
tmux kill-session -t "$SESSION"
```

## Error Handling

- tmux not installed: "tmux is required for worker mode. Install: `brew install tmux`"
- Codex not installed: Direct to `/codex:setup`
- Session already exists with same prefix: Show existing sessions, ask to reuse or create new
- Session crashed: Capture last output, kill session, report error
```

- [ ] **Step 2: Write codex:worker command**

```markdown
---
name: codex:worker
description: Launch Codex as a long-running tmux worker for complex autonomous tasks
argument-hint: "<task-description>" [--stop] [--status]
allowed-tools: Bash, Read
---

<!--
Usage:
  /codex:worker "Fix all failing tests and update snapshots"
  /codex:worker --stop           # Stop active worker
  /codex:worker --status         # Check worker status
-->

# Codex Worker

Task: $ARGUMENTS

## Instructions

1. **Load Config**
   Read `~/.claude/codex.local.md`. Defaults:
   - codex_path: `codex`
   - worker_session_prefix: `codex-worker`

2. **Pre-flight Checks**
   ```bash
   which codex || echo "NOT_FOUND: codex"
   which tmux || echo "NOT_FOUND: tmux"
   ```
   If either missing, show install instructions and stop.

3. **Parse Arguments**
   - `--stop`: Kill active worker session(s)
   - `--status`: Show current worker session output
   - Otherwise: Task description text

4. **Handle --stop**
   ```bash
   tmux ls 2>/dev/null | grep "codex-worker"
   ```
   If sessions found, kill them:
   ```bash
   tmux kill-session -t {session_name}
   ```
   If none found: "No active Codex worker sessions."

5. **Handle --status**
   ```bash
   tmux ls 2>/dev/null | grep "codex-worker"
   tmux capture-pane -t {session_name} -p -S -30
   ```
   Show recent output from active session.

6. **Start Worker**
   ```bash
   SESSION="codex-worker-$(date +%Y%m%d-%H%M%S)"
   tmux new-session -d -s "$SESSION"
   tmux send-keys -t "$SESSION" 'codex --full-auto' Enter
   sleep 3
   tmux send-keys -t "$SESSION" '{task_description}' Enter
   ```

7. **Monitor and Report**
   Poll every 10 seconds with `tmux capture-pane`.
   Detect completion when:
   - Last line matches `^[❯>]\s*$` (prompt returned)
   - OR output unchanged for 2 consecutive checks

8. **On Completion**
   Capture full output, present results, kill session.

## Error Handling

- tmux missing: "Install tmux: `brew install tmux`"
- Codex missing: Direct to `/codex:setup`
- Session conflict: Show existing sessions, ask user to --stop first or create parallel
```

- [ ] **Step 3: Verify both files**

Run: `head -3 plugins/codex/agents/codex-worker.md plugins/codex/commands/codex:worker.md`
Expected: Valid YAML frontmatter

- [ ] **Step 4: Commit**

```bash
git add plugins/codex/agents/codex-worker.md plugins/codex/commands/codex:worker.md
git commit -m "feat(codex): add worker command and tmux worker agent"
```

---

### Task 7: Create skill and README

**Files:**
- Create: `plugins/codex/skills/codex-flow/SKILL.md`
- Create: `plugins/codex/README.md`

- [ ] **Step 1: Write SKILL.md**

```markdown
---
name: Codex Flow
description: This skill should be used when the user asks to "use codex", "run codex", "ask codex", "codex review", "codex worker", "delegate to codex", or needs guidance on which codex command to use for their task. Provides workflow guidance for the codex plugin.
version: 0.1.0
---

# Codex Flow - Command Selection & Workflow Guide

## Overview

Codex Flow helps you choose the right Codex command for your task and provides common workflow patterns.

## Command Selection

Use this decision tree to pick the right command:

| Need | Command | Mode |
|------|---------|------|
| Ask a question, get an explanation | `/codex:ask "question"` | suggest only |
| Generate or modify code | `/codex:code "instruction"` | full-auto |
| Review code for issues | `/codex:review [file]` | suggest only |
| Long-running complex task | `/codex:worker "task"` | tmux interactive |
| First-time setup | `/codex:setup` | config |

## Common Workflows

### Bug Fix Workflow
1. `/codex:ask "What could cause {error message}?"` — understand the issue
2. `/codex:code "Fix the bug in {file}: {description}"` — apply the fix
3. `/codex:review` — verify the fix looks correct

### Code Review Workflow
1. `/codex:review` — review unstaged changes
2. `/codex:review --staged` — review staged changes before commit
3. `/codex:review src/critical-module.ts` — review specific files

### Refactoring Workflow
1. `/codex:review src/module.ts` — identify improvement areas
2. `/codex:code "Refactor {module} to {improvement}"` — apply refactoring
3. `/codex:review` — verify refactoring quality

### Heavy Lifting Workflow
1. `/codex:worker "Run all tests and fix failures"` — long-running autonomous task
2. `/codex:worker --status` — check progress
3. `/codex:worker --stop` — stop if needed

## Tips

### Effective Prompts
- Be specific: "Add input validation to the signup form in `src/auth/signup.ts`" > "Add validation"
- Provide context: "The function uses Express middleware" helps Codex understand the codebase
- One task at a time: Break complex work into steps for `/codex:code`, use `/codex:worker` for multi-step tasks

### Model Selection
- `o4-mini` (default): Fast, good for most tasks
- `o3`: Better reasoning, use for complex logic or architecture decisions
- Override per-command: `/codex:code "task" --model o3`

### Safety
- `/codex:ask` and `/codex:review` never modify files
- `/codex:code` runs in full-auto mode — review changes with `git diff` after
- Set `confirm_full_auto: true` in config to require confirmation before full-auto execution
```

- [ ] **Step 2: Write README.md**

```markdown
# Codex Plugin

OpenAI Codex CLI integration for Claude Code. Ask questions, generate code, review, and run parallel workers.

## Setup

```bash
# Install Codex CLI
npm install -g @openai/codex

# Set API key
export OPENAI_API_KEY="sk-..."

# Run setup wizard
/codex:setup
```

## Commands

| Command | Description | Mode |
|---------|-------------|------|
| `/codex:ask "question"` | Ask Codex a question | suggest only |
| `/codex:code "instruction"` | Generate or modify code | full-auto |
| `/codex:review [file]` | Code review | suggest only |
| `/codex:worker "task"` | Long-running tmux worker | interactive |
| `/codex:setup` | Installation check & config | setup |

## Configuration

Config file: `~/.claude/codex.local.md`

| Setting | Default | Description |
|---------|---------|-------------|
| `codex_path` | `codex` | CLI executable path |
| `default_model` | `o4-mini` | Default model |
| `confirm_full_auto` | `true` | Confirm before full-auto execution |
| `worker_session_prefix` | `codex-worker` | tmux session name prefix |
| `timeout` | `120000` | Request timeout in ms |

## Requirements

- [Codex CLI](https://github.com/openai/codex) (`npm install -g @openai/codex`)
- `OPENAI_API_KEY` environment variable
- tmux (optional, for `/codex:worker`)
```

- [ ] **Step 3: Verify both files**

Run: `head -5 plugins/codex/skills/codex-flow/SKILL.md plugins/codex/README.md`
Expected: Valid content in both

- [ ] **Step 4: Final commit**

```bash
git add plugins/codex/skills/codex-flow/SKILL.md plugins/codex/README.md
git commit -m "feat(codex): add codex-flow skill and README"
```

---

## Chunk 4: Verification

### Task 8: Verify complete plugin structure

- [ ] **Step 1: Verify all files exist**

```bash
find plugins/codex -type f | sort
```

Expected output:
```
plugins/codex/.claude-plugin/plugin.json
plugins/codex/README.md
plugins/codex/agents/codex-coder.md
plugins/codex/agents/codex-responder.md
plugins/codex/agents/codex-reviewer.md
plugins/codex/agents/codex-worker.md
plugins/codex/commands/codex:ask.md
plugins/codex/commands/codex:code.md
plugins/codex/commands/codex:review.md
plugins/codex/commands/codex:setup.md
plugins/codex/commands/codex:worker.md
plugins/codex/hooks/hooks.json
plugins/codex/skills/codex-flow/SKILL.md
```

(13 files total)

- [ ] **Step 2: Validate plugin.json is valid JSON**

```bash
python3 -c "import json; json.load(open('plugins/codex/.claude-plugin/plugin.json')); print('Valid JSON')"
```

Expected: `Valid JSON`

- [ ] **Step 3: Validate hooks.json is valid JSON**

```bash
python3 -c "import json; json.load(open('plugins/codex/hooks/hooks.json')); print('Valid JSON')"
```

Expected: `Valid JSON`

- [ ] **Step 4: Check all command files have frontmatter**

```bash
for f in plugins/codex/commands/*.md; do
  echo "=== $f ==="
  head -1 "$f"
done
```

Expected: All files start with `---`

- [ ] **Step 5: Check all agent files have frontmatter**

```bash
for f in plugins/codex/agents/*.md; do
  echo "=== $f ==="
  head -1 "$f"
done
```

Expected: All files start with `---`

- [ ] **Step 6: Verify git status is clean**

```bash
git status
```

Expected: Nothing to commit, working tree clean
