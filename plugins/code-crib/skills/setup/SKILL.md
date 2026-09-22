---
name: setup
description: Interactive setup wizard for code-crib - choose how to connect to Chroma (local server, remote server, local persistent, Chroma Cloud) and collection mode. Use when user wants to set up, configure, or initialize code-crib, or point it at a different vector DB.
---

# Code-Crib Setup Wizard

Interactive setup for first-time configuration, or for re-pointing code-crib at a different Chroma instance.

## Usage

```
/code-crib:setup
```

## How the connection actually works

The Chroma MCP server (`chroma-mcp`, launched from `${CLAUDE_PLUGIN_ROOT}/.mcp.json`) reads **only environment variables**. `.mcp.json` forwards `CHROMA_*` variables with safe defaults (`http` → `localhost:8000`, no SSL).

So the wizard configures the connection by writing `CHROMA_*` keys into the `env` block of `~/.claude/settings.json`. `code-crib.local.md` only records a human-readable summary — it never controls the connection. Secrets (API keys, auth credentials) go into settings.json only, never into `code-crib.local.md`.

| Mode | `CHROMA_CLIENT_TYPE` | Required vars | Optional vars |
|------|----------------------|---------------|---------------|
| Local server | `http` | `CHROMA_HOST=localhost`, `CHROMA_PORT` | — |
| Remote server | `http` | `CHROMA_HOST`, `CHROMA_PORT`, `CHROMA_SSL` | `CHROMA_CUSTOM_AUTH_CREDENTIALS` |
| Local persistent | `persistent` | `CHROMA_DATA_DIR` | — |
| Chroma Cloud | `cloud` | `CHROMA_TENANT`, `CHROMA_DATABASE`, `CHROMA_API_KEY` | — |

## Instructions

### Step 1: Welcome Message

Display:
```
🏠 Code-Crib Setup Wizard

Let's configure your knowledge stash!
```

If `~/.claude/settings.json` already has `CHROMA_*` keys in `env`, show them grouped by slot, marking the live one (mask `CHROMA_API_KEY` and `CHROMA_CUSTOM_AUTH_CREDENTIALS` as `****`):
```
Saved connections (● = active, from CHROMA_CLIENT_TYPE):
  ● http        my-server:8000  ssl=false  auth=none
    persistent  —
    cloud       tenant=abc  database=kb  api_key=****
```

### Step 2: Ask Connection Mode

Use AskUserQuestion tool:

```yaml
question: "How should code-crib connect to Chroma?"
header: "Connection"
options:
  - label: "Local server (Recommended)"
    description: "Chroma on this machine via Docker or `chroma run` (localhost:8000)."
  - label: "Remote server"
    description: "Self-hosted Chroma elsewhere — home server, VPS, Tailscale/VPN host, or public domain."
  - label: "Local persistent (no server)"
    description: "Store vectors in a local directory. No server process needed."
  - label: "Chroma Cloud"
    description: "Hosted at api.trychroma.com. Requires API key, tenant, and database."
```

### Step 2.1: Collect Mode-Specific Settings

Ask one question at a time. Accept the default when the user just confirms.

**If the chosen mode's slot already has saved values**, first ask via AskUserQuestion: "Use saved values (Recommended)" — show them masked — / "Enter new values". On "Use saved", skip the questions below and go to Step 3; switching is then just a `CHROMA_CLIENT_TYPE` change (plus the auth rule in Step 5).

Local and remote servers share the http slot. If the user picks **Local server** while the http slot holds a non-localhost host, warn that saving will replace it (e.g. `my-server` → `localhost`) before asking for the port.

**Local server:**
- Port (default `8000`)

**Remote server:**
- Host — hostname, MagicDNS name, or IP (e.g. `my-server`, `chroma.example.com`, `100.x.y.z`). No scheme, no port.
- Port (default `8000`; use `443` for an HTTPS reverse proxy)
- SSL — AskUserQuestion: "No (Recommended for Tailscale/VPN/LAN)" / "Yes (HTTPS)"
- Authentication — AskUserQuestion:
  - "None (Recommended for Tailscale/VPN/LAN)" — network-level protection only
  - "Basic auth" — then ask for credentials as `user:password`. This maps to `CHROMA_CUSTOM_AUTH_CREDENTIALS` and requires the server to run with Chroma basic authn enabled.
- If the user picks SSL = No **and** Auth = None for a host that is not a private/Tailscale address, warn once that the DB would be readable by anyone who can reach it.

**Local persistent:**
- Data directory (default `~/.code-crib/chroma`). Expand `~` to an absolute path and `mkdir -p` it.

**Chroma Cloud:**
- Tenant ID
- Database name
- API key

### Step 3: Ask Collection Mode

Use AskUserQuestion tool:

```yaml
question: "How do you want to organize your knowledge?"
header: "Mode"
options:
  - label: "Project mode (Recommended)"
    description: "Each project gets isolated collection. No cross-contamination."
  - label: "Shared mode"
    description: "All projects share one collection. Cross-project search enabled."
```

### Step 3.5: Ask Auto-RAG Setting

Use AskUserQuestion tool:

```yaml
question: "Enable automatic knowledge retrieval? (RAG)"
header: "Auto-RAG"
options:
  - label: "Enabled (Recommended)"
    description: "Automatically search past knowledge when you ask questions. Context injected seamlessly."
  - label: "Disabled"
    description: "Only search when you explicitly use /grab. More control, less magic."
```

### Step 4: Test Connectivity

Run before writing anything, so a typo doesn't get persisted.

**Local server / Remote server:**
```bash
curl -sS --max-time 5 {http|https}://{host}:{port}/api/v2/heartbeat
```
- Success: response contains `nanosecond heartbeat`.
- Failure: show the error and hints, then ask "Save anyway" / "Re-enter settings":
  - Local: is the server running? (`docker ps`, `chroma run --host localhost --port 8000`)
  - Remote: is the VPN/Tailscale up (`tailscale status`)? Does the name resolve? Is the port bound to an interface you can reach? Does SSL match the server?
  - HTTP 401/403: credentials missing or wrong.

**Local persistent:** Check the data directory exists and is writable.

**Chroma Cloud:** Can't be checked with curl without leaking the key into shell history. Skip here and verify after restart (Step 7).

### Step 5: Write Connection Env to `~/.claude/settings.json`

1. Read `~/.claude/settings.json` (create `{}` if missing).
2. Build `new_vars` from the table above for the chosen mode. Always set `CHROMA_CLIENT_TYPE`. For http modes, always set `CHROMA_SSL` explicitly (`chroma-mcp` defaults SSL to **true** when unset).
3. Merge `new_vars` into `settings.env` using the rule below.

**Merge rule for existing `CHROMA_*` keys** — keep every mode's values so the user can switch back without re-entering them; `CHROMA_CLIENT_TYPE` alone decides which one is live:
- Back up first: copy to `~/.claude/settings.json.bak-YYYYMMDDHHMMSS`.
- Keys the chosen mode sets → overwrite.
- Keys only other modes use → keep, secrets included (`chroma-mcp` ignores them for the active client type). One saved set per slot: http target (local and remote share `HOST`/`PORT`/`SSL`), persistent dir, Cloud account.
- Exception — http modes always write or delete `CHROMA_CUSTOM_AUTH_CREDENTIALS` per the auth answer: `chroma-mcp` sends it whenever it's set, so a stale remote credential would leak to a local server.
- Delete a slot's keys only when the user explicitly asks to forget that connection.

4. Write settings.json back, preserving every non-`CHROMA_*` key and formatting as 2-space JSON.
5. Report the result with secrets masked:
```
✅ Connection saved to ~/.claude/settings.json
   CHROMA_CLIENT_TYPE=http
   CHROMA_HOST=my-server
   CHROMA_PORT=8000
   CHROMA_SSL=false
```

### Step 5.5: Auto-Configure Permissions for Seamless Indexing

**Automatically add Chroma tools to auto-approve in `~/.claude/settings.json`.**

1. Read current `~/.claude/settings.json` (create if not exists)
2. Merge the following permissions into `permissions.allow` array:

```json
[
  "mcp__plugin_code-crib_chroma__chroma_add_documents",
  "mcp__plugin_code-crib_chroma__chroma_query_documents",
  "mcp__plugin_code-crib_chroma__chroma_list_collections",
  "mcp__plugin_code-crib_chroma__chroma_create_collection",
  "mcp__plugin_code-crib_chroma__chroma_get_collection_info",
  "mcp__plugin_code-crib_chroma__chroma_get_collection_count"
]
```

3. Write back the merged settings.json

**Example merge logic:**
```
existing = read ~/.claude/settings.json or {}
existing.permissions = existing.permissions or {}
existing.permissions.allow = existing.permissions.allow or []
existing.permissions.allow = dedupe(existing.permissions.allow + chroma_tools)
write ~/.claude/settings.json
```

4. Report to user:
```
✅ Auto-approve configured for Chroma tools
   - Zero-confirmation indexing with /rack
   - Seamless Auto-RAG searches
```

### Step 6: Write `code-crib.local.md`

Create/update `${CLAUDE_PLUGIN_ROOT}/code-crib.local.md`. Record the mode and non-secret connection details for reference only:

```yaml
---
collection_mode: {project|shared}
vector_db: chroma
# Informational only — the live connection comes from CHROMA_* in ~/.claude/settings.json env.
# Re-run /code-crib:setup to change it.
chroma:
  mode: {local-http|remote-http|persistent|cloud}
  host: {host}          # http modes only
  port: {port}          # http modes only
  ssl: {true|false}     # http modes only
  data_dir: {path}      # persistent only
  tenant: {tenant}      # cloud only
  database: {database}  # cloud only
auto_rag:
  enabled: {true|false}
  max_results: 3
  min_relevance: 0.7
---
```

Omit keys that don't apply to the chosen mode. Never write API keys or auth credentials here.

### Step 7: Show Next Steps

Always start with:
```
✅ Setup complete!

⚠️  Restart Claude Code — MCP servers read env only at startup.
```

Then the mode-specific part:

**Local server:**
```
1. Start Chroma (either):
   docker run -d -p 8000:8000 -v chroma-data:/data chromadb/chroma
   pip install chromadb && chroma run --host localhost --port 8000
2. After restart, test: /grab "test query"
```

**Remote server:**
```
1. Keep the network path up (e.g. Tailscale) whenever you use code-crib.
2. After restart, test: /grab "test query"
   Troubleshoot: curl {scheme}://{host}:{port}/api/v2/heartbeat
```

**Local persistent:**
```
1. Vectors are stored in {data_dir}. Back it up like any other data.
2. After restart, test: /grab "test query"
```

**Chroma Cloud:**
```
1. After restart, run /code-crib:list — it should list your cloud collections.
   Errors mentioning tenant/database/API key mean a value is wrong; re-run setup.
```

## Configuration File Location

- Connection: `~/.claude/settings.json` → `env.CHROMA_*`
- Preferences: `${CLAUDE_PLUGIN_ROOT}/code-crib.local.md` (git-ignored)
