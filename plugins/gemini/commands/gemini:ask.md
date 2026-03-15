---
name: gemini:ask
description: Ask Gemini a question and get a text response (no file modifications)
argument-hint: "<question>"
allowed-tools: Bash, Read
---

<!--
Usage:
  /gemini:ask "What does this error mean?"
  /gemini:ask "Compare Redis pub/sub vs Kafka"
  /gemini:ask "Explain this regex: ^[a-z]+$"
-->

# Gemini Ask

Question: $ARGUMENTS

## Instructions

1. **Load Config**
   Read `~/.claude/gemini.local.md` for settings. If file doesn't exist, use defaults:
   - gemini_path: `gemini`
   - timeout: `120000`

2. **Pre-flight Check**
   ```bash
   which gemini || echo "NOT_FOUND"
   ```
   If not found, tell user: "Gemini CLI not installed. Run `/gemini:setup` first."

3. **Execute Query**
   ```bash
   gemini -p "{question}" 2>&1
   ```
   Apply timeout from config.

4. **Handle Result**
   - **Success** (exit 0): Display Gemini's response to the user
   - **Failure** (exit != 0): Display the error message

5. **Output Format**
   Present Gemini's response directly. Do not modify files. Do not add commentary unless the user asks for clarification.

## Error Handling

- CLI missing: Direct to `/gemini:setup`
- Auth missing: "Authentication not configured. Run `/gemini:setup` to configure."
- Timeout: Show timeout message with current limit
- Rate limit (429): "Gemini rate limited. Wait a moment and try again."
