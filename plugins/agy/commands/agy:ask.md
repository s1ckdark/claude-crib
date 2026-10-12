---
name: agy:ask
description: Ask Antigravity a question and get a text response (no file modifications)
argument-hint: "<question>"
allowed-tools: Bash, Read
---

<!--
Usage:
  /agy:ask "What does this error mean?"
  /agy:ask "Compare Redis pub/sub vs Kafka"
  /agy:ask "Explain this regex: ^[a-z]+$"
-->

# Antigravity Ask

Question: $ARGUMENTS

## Instructions

1. **Load Config**
   Read `~/.claude/agy.local.md` (없으면 기존 `~/.claude/gemini.local.md` 값 사용) for settings. If file doesn't exist, use defaults:
   - agy_path: `agy`
   - timeout: `120000`

2. **Pre-flight Check**
   ```bash
   which agy || echo "NOT_FOUND"
   ```
   If not found, tell user: "Antigravity `agy` CLI not installed. Run `/agy:setup` first."

3. **Execute Query**
   ```bash
   agy -p "{question}" 2>&1
   ```
   Apply timeout from config.

4. **Handle Result**
   - **Success** (exit 0): Display Antigravity's response to the user
   - **Failure** (exit != 0): Display the error message

5. **Output Format**
   Present Antigravity's response directly. Do not modify files. Do not add commentary unless the user asks for clarification.

## Error Handling

- CLI missing: Direct to `/agy:setup`
- Auth missing: "Authentication not configured. Run `/agy:setup` to configure."
- Timeout: Show timeout message with current limit
- Rate limit (429): "Antigravity rate limited. Wait a moment and try again."
