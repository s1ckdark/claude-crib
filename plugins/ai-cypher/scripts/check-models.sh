#!/bin/bash
#
# check-models.sh - Check availability of configured AI models for the cypher
#
# Usage: check-models.sh [model-name]
#
# Without arguments, checks all configured models.
# With a model name, checks only that specific model.
#

set -euo pipefail

CONFIG_PATH="${CYPHER_CONFIG_PATH:-.claude/ai-cypher.local.md}"

check_claude() {
    if command -v claude &>/dev/null; then
        echo "  claude: available ($(claude --version 2>/dev/null || echo 'version unknown'))"
        return 0
    else
        echo "  claude: NOT AVAILABLE - install claude CLI"
        return 1
    fi
}

check_openai() {
    if command -v openai &>/dev/null; then
        if openai api models.list &>/dev/null; then
            echo "  openai/gpt: available"
            return 0
        else
            echo "  openai/gpt: CLI found but API not configured (check OPENAI_API_KEY)"
            return 1
        fi
    else
        echo "  openai/gpt: NOT AVAILABLE - install openai CLI"
        return 1
    fi
}

check_ollama() {
    if command -v ollama &>/dev/null; then
        if ollama list &>/dev/null; then
            MODELS=$(ollama list 2>/dev/null | tail -n +2 | awk '{print $1}' | tr '\n' ', ' | sed 's/,$//')
            echo "  ollama: available (models: $MODELS)"
            return 0
        else
            echo "  ollama: CLI found but server not running (run 'ollama serve')"
            return 1
        fi
    else
        echo "  ollama: NOT AVAILABLE - install ollama"
        return 1
    fi
}

check_gemini() {
    if [[ -n "${GOOGLE_API_KEY:-}" ]]; then
        echo "  gemini: available (API key configured)"
        return 0
    else
        echo "  gemini: NOT AVAILABLE - set GOOGLE_API_KEY"
        return 1
    fi
}

check_zai() {
    if [[ -n "${ZAI_API_KEY:-}" ]]; then
        echo "  zai: available (API key configured, glm-4.7 Coding Plan)"
        echo "  zai-free: available (API key configured, glm-4.7-flash Free)"
        return 0
    else
        echo "  zai: NOT AVAILABLE - set ZAI_API_KEY"
        echo "  zai-free: NOT AVAILABLE - set ZAI_API_KEY"
        return 1
    fi
}

echo "=== AI Cypher - Crew Availability Check ==="
echo ""

MODEL="${1:-all}"

case "$MODEL" in
    all)
        echo "Checking all known models (potential crew members)..."
        echo ""
        check_claude || true
        check_openai || true
        check_ollama || true
        check_gemini || true
        check_zai || true
        ;;
    claude)
        check_claude
        ;;
    openai|gpt)
        check_openai
        ;;
    ollama)
        check_ollama
        ;;
    gemini)
        check_gemini
        ;;
    zai|zai-free)
        check_zai
        ;;
    *)
        echo "Unknown model: $MODEL"
        echo "Known models: claude, openai/gpt, ollama, gemini, zai, zai-free"
        exit 1
        ;;
esac

echo ""
echo "To configure models, run: /cypher:config add-model"
