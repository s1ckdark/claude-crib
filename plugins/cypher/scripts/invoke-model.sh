#!/bin/bash
#
# invoke-model.sh - Invoke an AI model via its configured CLI command
#
# Usage: invoke-model.sh <model-name> <prompt>
#
# This script reads model configurations from .claude/cypher.local.md
# and invokes the specified model with the given prompt.
#
# Environment variables:
#   CYPHER_CONFIG_PATH - Override default config path
#   CYPHER_TIMEOUT - Override default timeout (default: 120s)
#

set -euo pipefail

MODEL_NAME="${1:-}"
PROMPT="${2:-}"

if [[ -z "$MODEL_NAME" || -z "$PROMPT" ]]; then
    echo "Usage: invoke-model.sh <model-name> <prompt>" >&2
    exit 1
fi

# Configuration file path
CONFIG_PATH="${CYPHER_CONFIG_PATH:-.claude/cypher.local.md}"
TIMEOUT_SECONDS="${CYPHER_TIMEOUT:-120}"

# Check if config exists
if [[ ! -f "$CONFIG_PATH" ]]; then
    echo "Error: Configuration file not found at $CONFIG_PATH" >&2
    echo "Run /cypher:config to set up model configurations." >&2
    exit 1
fi

# Extract CLI command for the model from markdown table
# Format: | model-name | `command template` | description |
CLI_COMMAND=$(grep -E "^\| *${MODEL_NAME} *\|" "$CONFIG_PATH" | \
    sed -E 's/.*\| *`([^`]+)`.*/\1/' | \
    head -1)

if [[ -z "$CLI_COMMAND" ]]; then
    echo "Error: Model '$MODEL_NAME' not found in configuration." >&2
    echo "Available crew members:" >&2
    grep -E "^\| *[a-z]" "$CONFIG_PATH" | awk -F'|' '{print "  - " $2}' | sed 's/^ *- */  - /' >&2
    exit 1
fi

# Escape prompt for shell
ESCAPED_PROMPT=$(printf '%s' "$PROMPT" | sed "s/'/'\\\\''/g")

# Replace $PROMPT placeholder with actual prompt
FINAL_COMMAND=$(echo "$CLI_COMMAND" | sed "s/\\\$PROMPT/'$ESCAPED_PROMPT'/g")

# Execute with timeout
echo "Invoking $MODEL_NAME..." >&2
if timeout "$TIMEOUT_SECONDS" bash -c "$FINAL_COMMAND" 2>/dev/null; then
    exit 0
else
    EXIT_CODE=$?
    if [[ $EXIT_CODE -eq 124 ]]; then
        echo "Error: Model invocation timed out after ${TIMEOUT_SECONDS}s" >&2
    else
        echo "Error: Model invocation failed with exit code $EXIT_CODE" >&2
    fi
    exit $EXIT_CODE
fi
