---
name: setup
description: Interactive Z.AI setup wizard - API key check, model selection, connectivity test
user_invocable: true
allowed_tools:
  - Bash
  - Read
  - Write
  - AskUserQuestion
---

# /zai:setup - Z.AI Setup Wizard

Interactive setup for the Z.AI plugin. Checks API connectivity and lets you choose a default model.

## Instructions

### 1. Check API Key

```bash
if [ -n "$Z_AI_API_KEY" ]; then
    echo "Z_AI_API_KEY: Set (${#Z_AI_API_KEY} chars)"
else
    echo "Z_AI_API_KEY: NOT SET"
    echo ""
    echo "Set it in your shell profile:"
    echo "  export Z_AI_API_KEY='your-key-here'"
    echo ""
    echo "Get your API key at: https://open.bigmodel.cn"
fi
```

If the API key is not set, show the instructions above and stop here.

### 2. Test API Connectivity

Test with a minimal request to verify the key works:

```bash
HTTP_STATUS=$(curl -s -o /tmp/zai-test-response.json -w "%{http_code}" \
  -X POST "https://api.z.ai/api/coding/paas/v4/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $Z_AI_API_KEY" \
  -d '{"model":"glm-5-turbo","messages":[{"role":"user","content":"ping"}],"max_tokens":5}')
echo "HTTP Status: $HTTP_STATUS"
cat /tmp/zai-test-response.json 2>/dev/null | python3 -m json.tool 2>/dev/null || true
rm -f /tmp/zai-test-response.json
```

If connectivity fails, display the error and suggest checking the API key.

### 3. Select Default Model

Use AskUserQuestion to let user pick a default model:

```
question: "Which Z.AI model should be your default?"
header: "Model"
options:
  - label: "glm-5-turbo (Recommended)"
    description: "Fast flagship with reasoning support - best balance of speed and quality"
  - label: "glm-5"
    description: "Latest flagship model - most capable for complex analysis"
  - label: "glm-5-code"
    description: "Code-specialized model - best for code generation tasks"
  - label: "glm-4.7-flash"
    description: "Fast inference - best for quick questions and simple tasks"
```

### 4. Select Default Thinking Mode

Use AskUserQuestion:

```
question: "Enable thinking mode by default?"
header: "Thinking"
options:
  - label: "Enabled (Recommended)"
    description: "Extended reasoning for deeper analysis - slightly slower but more thorough"
  - label: "Disabled"
    description: "Faster responses without reasoning chain"
```

### 5. Save Configuration

Write the configuration to `.claude/zai.local.md`:

```markdown
---
# Z.AI Plugin Configuration
version: 1.0
---

## Settings

- **Default Model**: {selected_model}
- **Thinking Mode**: {enabled|disabled}
- **API Endpoint**: https://api.z.ai/api/coding/paas/v4/chat/completions

## Available Models

| Model | Description | Best For |
|-------|-------------|----------|
| glm-5-turbo | Fast flagship with reasoning | Balanced tasks (default) |
| glm-5 | Latest flagship | Complex analysis, architecture |
| glm-5-code | Code-specialized | Code generation |
| glm-4.7-flash | Fast inference | Quick questions |
| glm-4.7 | Flagship with thinking | Deep analysis |

## Agent Roles

| Role | Description |
|------|-------------|
| architect | Software architecture guidance |
| code-reviewer | Bug/security/performance review |
| analyst | Requirements analysis |
| planner | Implementation planning |
| critic | Plan critique |
| writer | Technical documentation |
| designer | UI/UX guidance |
| security-reviewer | OWASP vulnerability detection |
| tdd-guide | Test-first development |

## Usage Examples

```
/zai:ask "How should I structure this service?"
/zai:ask --role code-reviewer --files src/api.ts "Review this"
/zai:ask --model glm-4-flash "Quick question about TypeScript generics"
```
```

### 6. Display Summary

```
=== Z.AI Setup Complete ===

API Key:       Set ({n} chars)
Connectivity:  OK
Default Model: {selected_model}
Thinking Mode: {enabled|disabled}

Config saved to: .claude/zai.local.md

Available commands:
  /zai:ask "question"       - Ask Z.AI a question
  /zai:code "instruction"   - Generate/modify code
  /zai:review [file]        - Code review
  /zai:worker "task"        - Launch tmux worker
  /zai:config               - View/change settings
```
