---
name: setup
description: Interactive Z.AI setup wizard - bootstrap Python venv, API key check, model selection, connectivity test
user_invocable: true
allowed_tools:
  - Bash
  - Read
  - Write
  - AskUserQuestion
---

# /zai:setup - Z.AI Setup Wizard

Interactive setup for the Z.AI plugin. Bootstraps the per-plugin Python virtualenv used by the MCP server, checks API connectivity, and lets you choose a default model.

## Instructions

### 1. Check Python & Bootstrap venv

The Z.AI MCP server runs in a per-plugin Python virtualenv at `${CLAUDE_PLUGIN_ROOT}/scripts/.venv`. The path is referenced by `.mcp.json`, so this venv must exist before any other `/zai:*` command will work. Create it if missing and (re)install requirements.

```bash
PLUGIN_DIR="$CLAUDE_PLUGIN_ROOT"
VENV_DIR="$PLUGIN_DIR/scripts/.venv"
REQUIREMENTS="$PLUGIN_DIR/scripts/requirements.txt"

if [ -z "$PLUGIN_DIR" ] || [ ! -d "$PLUGIN_DIR/scripts" ]; then
    echo "ERROR: CLAUDE_PLUGIN_ROOT not set or plugin layout missing."
    echo "  CLAUDE_PLUGIN_ROOT=$PLUGIN_DIR"
    exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
    echo "ERROR: python3 not found. Install Python 3.10+ first:"
    echo "  macOS:  brew install python@3.12"
    echo "  Linux:  apt install python3.12 python3.12-venv  (or distro equivalent)"
    exit 1
fi

PY_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
PY_OK=$(python3 -c 'import sys; print(1 if sys.version_info >= (3, 10) else 0)')
if [ "$PY_OK" != "1" ]; then
    echo "ERROR: Python $PY_VERSION found, but 3.10+ required (mcp lib needs it)."
    exit 1
fi
echo "Python: $PY_VERSION"

if [ ! -x "$VENV_DIR/bin/python3" ]; then
    echo "Creating venv at $VENV_DIR"
    python3 -m venv "$VENV_DIR" || { echo "ERROR: venv creation failed"; exit 1; }
fi

echo "Installing dependencies from requirements.txt..."
"$VENV_DIR/bin/pip" install --quiet --upgrade pip
"$VENV_DIR/bin/pip" install --quiet -r "$REQUIREMENTS" || { echo "ERROR: pip install failed"; exit 1; }
echo "venv ready: $VENV_DIR"
```

If this step fails (Python missing, network blocked, etc.), stop and surface the error — every other step depends on the venv.

### 2. Check API Key

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

### 3. Test API Connectivity

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

### 4. Select Default Model

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

### 5. Select Default Thinking Mode

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

### 6. Save Configuration

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

### 7. Display Summary

```
=== Z.AI Setup Complete ===

Python venv:   {VENV_DIR}
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
