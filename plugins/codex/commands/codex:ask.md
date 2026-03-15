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
