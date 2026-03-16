---
name: start
description: Start an AI cypher - multi-model freestyle debate on a topic
argument-hint: "<topic>" [--crew model1,model2,...] [--mc model]
allowed-tools: Bash, Read, Write, Task
---

<!--
Usage examples:
  /cypher:start "REST vs GraphQL for mobile apps"
  /cypher:start "Best testing strategy for microservices" --crew claude,gpt,ollama
  /cypher:start "Database choice for real-time app" --mc claude --crew gpt,gemini,ollama
-->

# AI Cypher Session

Topic: $ARGUMENTS

## Instructions

### 0. **Pre-flight Check** (REQUIRED)

Before starting, verify setup is complete:

```bash
# Check if config exists
[ -f ".claude/cypher.local.md" ] && echo "CONFIG_EXISTS" || echo "NO_CONFIG"
```

**If NO_CONFIG:**
- Display message: "AI Cypher not configured yet. Running setup..."
- Invoke `/cypher:setup` first
- Return after setup completes

**If CONFIG_EXISTS:**
- Parse the config to get available models
- Verify requested crew members are configured
- Check CLI availability for each crew member:

```bash
# Quick availability check for requested models
which claude >/dev/null 2>&1 && echo "claude:OK" || echo "claude:MISSING"
which ollama >/dev/null 2>&1 && echo "ollama:OK" || echo "ollama:MISSING"
which codex >/dev/null 2>&1 && echo "codex:OK" || echo "codex:MISSING"
which gemini >/dev/null 2>&1 && echo "gemini:OK" || echo "gemini:MISSING"
which openai >/dev/null 2>&1 && echo "gpt:OK" || echo "gpt:MISSING"
# zai uses API, check for key
[ -n "$Z_AI_API_KEY" ] && echo "zai:OK" || echo "zai:MISSING (no Z_AI_API_KEY)"
```

**If any requested crew member is MISSING:**
- Warn user: "Model [X] is not installed. Run /cypher:setup to install."
- Ask if they want to continue with available models only
- Or offer to run setup

---

1. **Parse Arguments**
   - Extract the topic (quoted string)
   - Extract --crew if provided (comma-separated model names, replaces --participants)
   - Extract --mc if provided (the host model, replaces --host)
   - If no crew specified, use default: claude, gpt, ollama

2. **Load Configuration**
   Check for user settings at `.claude/cypher.local.md` for:
   - API configurations
   - Default crew members
   - Custom model commands

3. **Determine Cypher Format**
   Analyze the topic and decide:
   - **Round-based**: For structured debates (A vs B comparisons, pros/cons analysis)
   - **Free-form**: For brainstorming, exploration, open-ended questions

   Also determine optimal round count (2-5) based on topic complexity.

4. **Select MC (Host Model)**
   If --mc not specified, select based on topic:
   - Technical/code topics -> Claude or GPT
   - Creative/open topics -> Claude
   - Research/factual -> Gemini or GPT

   MC responsibilities:
   - Moderate the cypher
   - Ensure all crew members contribute
   - Synthesize viewpoints
   - Draft conclusion

5. **Initialize Cypher**
   Create cypher record:
   ```
   .cyphers/YYYY-MM-DD-HH-MM-topic-slug.json
   ```

   Structure:
   ```json
   {
     "id": "uuid",
     "topic": "...",
     "format": "round|free",
     "rounds": N,
     "mc": "model-name",
     "crew": ["model1", "model2", ...],
     "startedAt": "ISO-timestamp",
     "transcript": [],
     "conclusion": null,
     "consensus": null
   }
   ```

6. **Execute Cypher**
   Use the Task tool with `cypher-host` agent to:
   - Coordinate crew responses via CLI tools
   - Manage turn-taking
   - Track cypher progress
   - Display real-time transcript

7. **Validate Consensus with Ralph Loop**
   After MC drafts conclusion:
   - Trigger ralph-loop to verify consensus quality
   - Check if all perspectives were fairly represented
   - Validate logical consistency of conclusion
   - Iterate if consensus is weak

8. **Finalize and Report**
   - Update JSON with final conclusion
   - Display formatted summary:
     - Topic and crew
     - Key points from each model
     - Areas of agreement/disagreement
     - Final consensus
     - Validation status

9. **Save Markdown Transcript** (NEW)
   Save human-readable transcript alongside JSON:
   ```
   .cyphers/YYYY-MM-DD-HH-MM-topic-slug.md
   ```

   Use the Markdown Template below for formatting.

10. **Save to Project Docs**
    Also save the markdown transcript to `docs/cypher/` for project documentation:
    ```
    docs/cypher/YYYY-MM-DD-HH-MM-topic-slug.md
    ```

    - Create `docs/cypher/` directory if it doesn't exist
    - Use the same Markdown Template as step 9
    - This makes cypher conclusions accessible as project documentation

## Model CLI Commands Reference

Use these CLI patterns to invoke models (actual commands from config):

| Model | CLI Command |
|-------|-------------|
| **claude** | `claude --print -p "prompt"` |
| **gpt** | `openai api chat.completions.create -m gpt-4o -g user "prompt"` |
| **ollama** | `ollama run llama3.2 "prompt"` |
| **gemini** | `gemini -p "prompt"` |
| **codex** | `codex exec "prompt"` |
| **zai** | `curl -s "https://api.z.ai/api/coding/paas/v4/chat/completions" -H "Authorization: Bearer $Z_AI_API_KEY" -H "Content-Type: application/json" -d '{"model":"glm-4.7","messages":[{"role":"user","content":"prompt"}]}' \| jq -r '.choices[0].message.content'` |
| **zai-free** | `curl -s "https://api.z.ai/api/paas/v4/chat/completions" -H "Authorization: Bearer $Z_AI_API_KEY" -H "Content-Type: application/json" -d '{"model":"glm-4.7-flash","messages":[{"role":"user","content":"prompt"}]}' \| jq -r '.choices[0].message.content'` |

Check `.claude/cypher.local.md` for user's specific configurations and customizations.

## Output Format

Display cypher progress in real-time:

```
=== AI CYPHER: [Topic] ===
Format: [Round/Free] | Rounds: N | MC: [Model]
Crew: [list]

--- Round 1: Opening Bars ---
[Claude]: ...
[GPT]: ...
[Ollama]: ...

--- Round 2: Call and Response ---
...

--- MC Summary ---
[MC synthesizes cypher]

--- Ralph Loop Validation ---
Consensus Quality: [Strong/Moderate/Weak]
Representation: [Fair/Needs improvement]
Logic: [Consistent/Issues found]

=== Conclusion ===
[Final consensus statement]
```

## Markdown Template

Save the following format to `.cyphers/YYYY-MM-DD-HH-MM-topic-slug.md`:

```markdown
---
title: "[Topic]"
date: YYYY-MM-DD HH:MM
format: round|free
rounds: N
mc: model-name
crew: [model1, model2, ...]
status: completed|in-progress
consensus: strong|moderate|weak
---

# AI Cypher: [Topic]

> **Format**: [Round/Free] | **Rounds**: N | **MC**: [Model]
> **Crew**: model1, model2, model3
> **Date**: YYYY-MM-DD HH:MM

---

## Round 1: Opening Bars

### 🔵 Claude
[Claude's opening statement]

### 🟢 GPT
[GPT's opening statement]

### 🟠 Ollama
[Ollama's opening statement]

---

## Round 2: Call and Response

### 🔵 Claude
[Claude's response to others]

### 🟢 GPT
[GPT's response to others]

### 🟠 Ollama
[Ollama's response to others]

---

## Round 3: Final Verse

### 🔵 Claude
[Claude's final position]

### 🟢 GPT
[GPT's final position]

### 🟠 Ollama
[Ollama's final position]

---

## MC Summary

**Areas of Agreement:**
- Point 1
- Point 2

**Key Disagreements:**
- Point 1
- Point 2

**Synthesis:**
[MC's synthesis of all viewpoints]

---

## Validation

| Metric | Rating |
|--------|--------|
| Consensus Quality | Strong/Moderate/Weak |
| Representation | Fair/Needs Improvement |
| Logic | Consistent/Issues Found |

---

## Conclusion

> [Final consensus statement - the key takeaway from this cypher]

---

*Generated by AI Cypher on YYYY-MM-DD*
```
