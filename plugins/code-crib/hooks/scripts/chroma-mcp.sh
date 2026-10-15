#!/bin/bash
# Chroma MCP launcher shared by Claude Code and Codex.
# Codex does not expand ${VAR:-default} in plugin .mcp.json and forwards only the
# variables listed in env_vars, so defaults are applied here instead of in .mcp.json.
# Credentials stay in the environment; this script never reads or writes them to files.

: "${CHROMA_CLIENT_TYPE:=http}"
: "${CHROMA_SSL:=false}"
: "${CHROMA_HOST:=localhost}"
: "${CHROMA_PORT:=8000}"
export CHROMA_CLIENT_TYPE CHROMA_SSL CHROMA_HOST CHROMA_PORT
export CHROMA_CUSTOM_AUTH_CREDENTIALS="${CHROMA_CUSTOM_AUTH_CREDENTIALS:-}"
export CHROMA_DATA_DIR="${CHROMA_DATA_DIR:-}"
export CHROMA_TENANT="${CHROMA_TENANT:-}"
export CHROMA_DATABASE="${CHROMA_DATABASE:-}"
export CHROMA_API_KEY="${CHROMA_API_KEY:-}"

CMD=(uvx --with "pydantic<2.12" chroma-mcp)

if [[ "${1:-}" == "--dry-run" ]]; then
    for name in CHROMA_CLIENT_TYPE CHROMA_SSL CHROMA_HOST CHROMA_PORT CHROMA_DATA_DIR CHROMA_TENANT CHROMA_DATABASE; do
        printf '%s=%s\n' "$name" "${!name}"
    done
    for name in CHROMA_CUSTOM_AUTH_CREDENTIALS CHROMA_API_KEY; do
        printf '%s=%s\n' "$name" "$([[ -n "${!name}" ]] && echo '<set>' || echo '<unset>')"
    done
    printf 'exec:'; printf ' %q' "${CMD[@]}"; printf '\n'
    exit 0
fi

exec "${CMD[@]}"
