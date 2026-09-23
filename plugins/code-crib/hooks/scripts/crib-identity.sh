#!/bin/bash
# Resolve the identity stamped on every code-crib document:
#   project - which collection / project filter to use
#   host    - which machine wrote the document
# Output: {"project": "...", "host": "..."}
#
# Skills must call this instead of guessing, so every machine that shares
# one Chroma instance agrees on the same project name.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" 2>/dev/null && pwd)"

# Reuse check-rag-config.sh's config lookup (same priority order)
CONFIG_FILE=""
if [[ -f "$SCRIPT_DIR/check-rag-config.sh" ]]; then
    CONFIG_FILE=$(bash "$SCRIPT_DIR/check-rag-config.sh" 2>/dev/null \
        | sed -n 's/.*"config_file": *"\([^"]*\)".*/\1/p')
fi

# project_name from one file's YAML frontmatter (commented-out lines ignored)
read_project_name() {
    [[ -n "$1" && -f "$1" ]] || return 0
    awk '
        /^---$/ { n++; next }
        n == 1 && /^project_name:/ {
            sub(/^project_name:[ ]*/, ""); sub(/[ ]*#.*/, ""); gsub(/["'\'']/, "")
            print; exit
        }
    ' "$1" 2>/dev/null
}

# The repo's own .claude/code-crib.local.md wins over the plugin-wide one:
# check-rag-config.sh finds the plugin file first, which would shadow per-repo pins.
config_project_name() {
    local top name
    top=$(git rev-parse --show-toplevel 2>/dev/null) || top="$PWD"
    name=$(read_project_name "$top/.claude/code-crib.local.md")
    [[ -z "$name" ]] && name=$(read_project_name "$CONFIG_FILE")
    echo "$name"
}

# Repo name from the origin remote — same on every clone, whatever the local dir.
# Owner is dropped (single-user plugin); pin project_name if two owners' repos share a name.
# Handles git@host:owner/repo.git, https://host/owner/repo(.git)/, ssh://git@host:22/owner/repo.git
git_remote_repo_name() {
    local url
    url=$(git remote get-url origin 2>/dev/null) || return 0
    url="${url%/}"
    url="${url%.git}"
    echo "${url##*[/:]}"
}

git_toplevel_name() {
    local top
    top=$(git rev-parse --show-toplevel 2>/dev/null) || return 0
    basename "$top"
}

# Chroma collection names allow [a-zA-Z0-9._-], must start/end alphanumeric.
# Lowercased because git hosts treat owner/repo case-insensitively.
sanitize_name() {
    printf '%s' "$1" | tr '[:upper:]' '[:lower:]' \
        | sed -E 's/[^a-z0-9._-]+/-/g; s/-+/-/g; s/^[^a-z0-9]+//; s/[^a-z0-9]+$//'
}

# First non-empty wins: explicit override > origin (same on every clone) >
# clone dir (repo without origin) > cwd (not a git repo)
resolve_project() {
    local name source
    for source in config_project_name git_remote_repo_name git_toplevel_name; do
        name=$($source)
        [[ -n "$name" ]] && break
    done
    [[ -z "$name" ]] && name=$(basename "$PWD")
    name=$(sanitize_name "$name")
    echo "${name:-default}"
}

resolve_host() {
    if [[ -n "$CODE_CRIB_HOST" ]]; then
        echo "$CODE_CRIB_HOST"
    else
        # -s drops the domain; macOS names like "Daves-MacBook-Pro.local" drift, hence the override
        hostname -s 2>/dev/null || hostname
    fi
}

json_escape() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'; }

PROJECT=$(resolve_project)
HOST=$(resolve_host)
printf '{"project": "%s", "host": "%s"}\n' "$(json_escape "$PROJECT")" "$(json_escape "$HOST")"
