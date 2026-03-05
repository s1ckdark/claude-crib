<!--
Usage:
  /cypher:setup              # Run interactive setup wizard
  /cypher:setup --check      # Only check model availability
-->

# AI Cypher Setup Wizard

## Instructions

### 1. Check Available Models

Run these checks in parallel to verify which CLIs are installed:

```bash
# Check each CLI
which claude && claude --version 2>/dev/null || echo "NOT_FOUND: claude"
which codex && codex --version 2>/dev/null || echo "NOT_FOUND: codex"
which ollama && ollama --version 2>/dev/null || echo "NOT_FOUND: ollama"
which gemini && gemini --version 2>/dev/null || echo "NOT_FOUND: gemini"
[ -n "$Z_AI_API_KEY" ] && echo "zai:OK (API key set)" || echo "NOT_FOUND: zai (Z_AI_API_KEY not set)"
which openai || echo "NOT_FOUND: openai"
```

### 2. Check Environment Variables

```bash
# Check API keys (only show if set, don't expose values)
[ -n "$OPENAI_API_KEY" ] && echo "✓ OPENAI_API_KEY set" || echo "✗ OPENAI_API_KEY not set"
[ -n "$ANTHROPIC_API_KEY" ] && echo "✓ ANTHROPIC_API_KEY set" || echo "✗ ANTHROPIC_API_KEY not set"
[ -n "$GOOGLE_API_KEY" ] && echo "✓ GOOGLE_API_KEY set" || echo "✗ GOOGLE_API_KEY not set"
[ -n "$Z_AI_API_KEY" ] && echo "✓ Z_AI_API_KEY set" || echo "✗ Z_AI_API_KEY not set"
```

### 3. Display Status Report

```
=== AI Cypher Setup ===

Model Status:
  ✓ claude    - Claude Code CLI installed
  ✓ ollama    - Ollama installed (run: ollama serve)
  ✗ codex     - Not installed
  ✗ gemini    - Not installed
  ✓ zai       - Z.ai API key set (Coding Plan + Free)
  ✗ gpt       - OpenAI CLI not installed

API Keys:
  ✓ OPENAI_API_KEY
  ✗ GOOGLE_API_KEY
  ✗ Z_AI_API_KEY
```

### 4. Installation Instructions

For each missing model, provide installation commands:

**Claude Code CLI** (you're already using it!)
```bash
# Already installed if you're seeing this
```

**OpenAI Codex CLI**
```bash
npm install -g @openai/codex
# Then: export OPENAI_API_KEY="sk-..."
```

**Ollama (Local Models)**
```bash
# macOS
brew install ollama

# Then start the server and pull a model
ollama serve &
ollama pull llama3.2
```

**Google Gemini CLI**
```bash
pip install google-generativeai
# Then: export GOOGLE_API_KEY="AIza..."

# Or use OAuth (recommended)
gemini auth login
```

**OpenAI CLI (for GPT)**
```bash
pip install openai
# Then: export OPENAI_API_KEY="sk-..."
```

**Z.ai (GLM API)**
```bash
# No CLI installation needed - uses curl API
# Get API key at open.bigmodel.cn
# Two endpoints available:
#   zai      → api.z.ai/api/coding/paas/v4 (Coding Plan, glm-4.7)
#   zai-free → api.z.ai/api/paas/v4 (Free, glm-4.7-flash)
export Z_AI_API_KEY="your-key-here"
```

### 5. Create Config File

If `.claude/cypher.local.md` doesn't exist, create it with detected models.

### 6. Interactive Model Selection

Use AskUserQuestion to let user select which models to include in default crew:

```
Which models should be in your default cypher crew?
(Select all that are installed and you want to use)

☑ claude   - Anthropic Claude (installed)
☑ ollama   - Local Ollama (installed)
☐ codex    - OpenAI Codex (not installed)
☐ gemini   - Google Gemini (not installed)
☑ zai      - Z.ai Coding Plan (API key set)
☑ zai-free - Z.ai Free (glm-4.7-flash)
☐ gpt      - OpenAI GPT (not installed)
```

### 7. Test Connectivity (Optional)

If user wants, test each model with a simple prompt:

```bash
# Quick connectivity test
echo "Say 'ready' if you can hear me" | claude --print -p -
ollama run llama3.2 "Say 'ready' if you can hear me"
```

### 8. Final Summary

```
=== Setup Complete ===

Your default crew: claude, codex, gemini, ollama

To start a cypher:
  /cypher:start "Your topic here"

To add more models later:
  /cypher:config add-model

Configuration saved to: .claude/cypher.local.md
```
