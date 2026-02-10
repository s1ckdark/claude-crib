---
description: Configure AI Cypher settings (models, API keys, defaults)
argument-hint: [show|add-model|remove-model|set-default] [options]
allowed-tools: Read, Write, AskUserQuestion
---

<!--
Usage:
  /cypher:config                    # Show current config
  /cypher:config show               # Show current config
  /cypher:config add-model          # Add a new model (interactive)
  /cypher:config remove-model gpt   # Remove a model
  /cypher:config set-default crew claude,gpt,ollama
  /cypher:config set-default mc claude
-->

# AI Cypher Configuration

Action: $ARGUMENTS (default: show)

## Instructions

### 1. Locate Configuration File

Configuration stored at: `.claude/ai-cypher.local.md`

If file doesn't exist and user wants to modify settings, create it with template.

### 2. Parse Action

**show** (default):
- Read and display current configuration
- Show available models and their CLI commands
- Display default settings

**add-model**:
- Use AskUserQuestion to gather:
  - Model identifier (e.g., "gpt", "claude", "ollama-llama3", "gemini")
  - CLI command template (e.g., `ollama run llama3 "$PROMPT"`)
  - Description (optional)
- Add to configuration file

**remove-model [name]**:
- Remove specified model from configuration
- Warn if model is in default crew

**set-default [key] [value]**:
- Set default crew, mc, format, or rounds
- Valid keys: crew, mc, format, rounds
- Example: `set-default crew claude,gpt,ollama`

### 3. Configuration File Format

```markdown
---
# AI Cypher Configuration
version: 1.0
---

## Models (The Crew)

| Name | CLI Command | Description |
|------|-------------|-------------|
| claude | `claude --print -p "$PROMPT"` | Anthropic Claude |
| gpt | `openai api chat.completions.create -m gpt-4o -g user "$PROMPT"` | OpenAI GPT-4 |
| ollama | `ollama run llama3.2 "$PROMPT"` | Local Ollama model |
| gemini | `# API call via curl` | Google Gemini |
| zai | `curl -s "https://api.z.ai/api/coding/paas/v4/chat/completions" -H "Authorization: Bearer $Z_AI_API_KEY" -H "Content-Type: application/json" -d '{"model":"glm-4.7","messages":[{"role":"user","content":"$PROMPT"}]}' \| jq -r '.choices[0].message.content'` | Z.ai GLM-4.7 (Coding Plan) |
| zai-free | `curl -s "https://api.z.ai/api/paas/v4/chat/completions" -H "Authorization: Bearer $Z_AI_API_KEY" -H "Content-Type: application/json" -d '{"model":"glm-4.7-flash","messages":[{"role":"user","content":"$PROMPT"}]}' \| jq -r '.choices[0].message.content'` | Z.ai GLM-4.7-flash (Free) |

## Defaults

- **Default Crew**: claude, gpt, ollama
- **Default MC**: auto (selected based on topic)
- **Default Format**: auto (round or free, based on topic)
- **Default Rounds**: auto (2-5, based on complexity)

## API Notes

Add any API-specific notes or environment variable requirements here.
- OPENAI_API_KEY required for GPT
- Ollama must be running locally
- GOOGLE_API_KEY for Gemini
- Z_AI_API_KEY for Z.ai (both zai and zai-free)
```

### 4. Interactive Model Addition

When adding a model, ask:

1. "What identifier should I use for this model?" (e.g., gpt-4, claude-3, llama3)
2. "What CLI command invokes this model? Use $PROMPT as placeholder for the prompt."
3. "Any description for this model?" (optional)

### 5. Validation

- Verify CLI command syntax looks valid
- Check for duplicate model names
- Warn about missing environment variables if detectable

### 6. Output

Display configuration in readable format:

```
=== AI Cypher Configuration ===

The Crew (3 models configured):
  - claude: claude --print -p "$PROMPT"
  - gpt: openai api chat...
  - ollama: ollama run llama3.2 "$PROMPT"

Defaults:
  - Crew: claude, gpt, ollama
  - MC: auto
  - Format: auto
  - Rounds: auto

Config file: .claude/ai-cypher.local.md
```
