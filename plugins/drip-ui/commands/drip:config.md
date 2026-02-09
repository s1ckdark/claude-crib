---
description: Configure Drip UI services (v0, Gemini, Z.ai API keys and preferences)
argument-hint: [show|setup|test] [service]
allowed-tools: Bash, Read, Write, AskUserQuestion
---

<!--
Usage:
  /drip:config                  # Show current config and status
  /drip:config show             # Same as above
  /drip:config setup            # Interactive setup for all services
  /drip:config setup v0         # Setup only v0
  /drip:config setup gemini     # Setup Gemini (OAuth or API key)
  /drip:config setup zai        # Setup Z.ai
  /drip:config test             # Test all configured services
  /drip:config test v0          # Test specific service
-->

# Drip UI Configuration

Action: $ARGUMENTS (default: show)

## Instructions

### 1. Locate Configuration File

Configuration stored at: `.claude/drip-ui.local.md`

### 2. Parse Action

**show** (default):
- Display current configuration
- Show authentication status for each service
- Display default preferences

**setup [service]**:
- Interactive setup wizard
- If service specified, setup only that service
- Guide through API key or OAuth setup

**test [service]**:
- Test connectivity to services
- Verify API keys work
- Report any issues

### 3. Authentication Methods

#### v0.dev (API Key)
```bash
# Set environment variable
export V0_API_KEY="your-api-key"

# Or add to shell profile (~/.bashrc, ~/.zshrc)
echo 'export V0_API_KEY="your-api-key"' >> ~/.bashrc

# Get key from: https://v0.dev/chat/settings/keys
# Requires: Premium or Team subscription
```

#### Google Gemini (OAuth - Recommended)
```bash
# Login with Google account (higher rate limits)
gemini auth login

# Check status
gemini auth status

# Alternative: API key (lower rate limits)
export GOOGLE_API_KEY="your-api-key"

# Get key from: https://aistudio.google.com/apikey
```

#### Z.ai (API Key)
```bash
# Set environment variable
export ZAI_API_KEY="your-api-key"

# Get key from: https://z.ai/subscribe
# OpenAI-compatible API
```

### 4. Configuration File Format

```markdown
---
# Drip UI Configuration
version: 1.0
---

## Services

| Service | Auth Method | Status |
|---------|-------------|--------|
| v0.dev | API Key | ✅ Configured |
| Gemini | OAuth | ✅ Logged in |
| Z.ai | API Key | ❌ Not configured |

## Defaults

- **Default Service**: v0 (or first available)
- **Default Framework**: react
- **CSS Framework**: tailwind
- **TypeScript**: true
- **Include Types**: true

## API Endpoints

| Service | Endpoint |
|---------|----------|
| v0 | https://api.v0.dev |
| Gemini | https://generativelanguage.googleapis.com |
| Z.ai | https://api.z.ai/api/paas/v4 |

## Rate Limits

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| v0 | N/A | Premium required |
| Gemini (OAuth) | 1,000/day | Higher |
| Gemini (API Key) | 100/day | 500/day |
| Z.ai | Varies | $3/month+ |
```

### 5. Interactive Setup Flow

When running `setup`:

1. **Service Selection**
   Ask which services to configure:
   - [ ] v0.dev (Vercel)
   - [ ] Google Gemini
   - [ ] Z.ai

2. **v0.dev Setup**
   ```
   v0.dev requires a Premium or Team subscription.

   Get your API key from: https://v0.dev/chat/settings/keys

   Enter your V0_API_KEY (or press Enter to skip):
   ```

   Save to environment or config file.

3. **Gemini Setup**
   ```
   Gemini supports two authentication methods:

   [1] OAuth (Recommended - 1,000 req/day free)
       Run: gemini auth login

   [2] API Key (100 req/day free)
       Get from: https://aistudio.google.com/apikey

   Choose method (1/2):
   ```

4. **Z.ai Setup**
   ```
   Z.ai uses an OpenAI-compatible API.

   Get your API key from: https://z.ai/subscribe
   Plans start at $3/month.

   Enter your ZAI_API_KEY (or press Enter to skip):
   ```

### 6. Test Connectivity

```bash
# Test v0
curl -s -H "Authorization: Bearer $V0_API_KEY" \
  https://api.v0.dev/v1/projects

# Test Gemini (OAuth)
gemini models list

# Test Gemini (API Key)
curl -s "https://generativelanguage.googleapis.com/v1/models?key=$GOOGLE_API_KEY"

# Test Z.ai
curl -s -H "Authorization: Bearer $ZAI_API_KEY" \
  https://api.z.ai/api/paas/v4/models
```

### 7. Output Format

**Show Config:**
```
+===================================================================+
|  DRIP UI CONFIGURATION                                            |
+===================================================================+

Services Status:
  ✅ v0.dev      - API Key configured
  ✅ Gemini      - OAuth logged in (expires: 2026-02-06)
  ❌ Z.ai        - Not configured

Defaults:
  - Default Service: v0
  - Framework: react
  - CSS: tailwind
  - TypeScript: true

Config file: .claude/drip-ui.local.md

Run '/drip:config setup' to configure missing services.
Run '/drip:config test' to verify connectivity.
```

**Test Results:**
```
+===================================================================+
|  DRIP UI SERVICE TEST                                             |
+===================================================================+

Testing v0.dev...
  ✅ Connection successful
  ✅ API key valid
  ℹ️  Subscription: Premium
  ℹ️  Rate limit: 100 req/min

Testing Gemini...
  ✅ OAuth token valid
  ℹ️  Expires: 2026-02-06 14:30:00
  ℹ️  Rate limit: 1,000 req/day

Testing Z.ai...
  ❌ Not configured
  → Run '/drip:config setup zai' to configure

Summary: 2/3 services available
```

## Troubleshooting

### v0 "Unauthorized"
- Verify API key is correct
- Check subscription status (Premium required)
- Key may have expired - regenerate at v0.dev

### Gemini "Token expired"
- Run `gemini auth login` to refresh
- Or set GOOGLE_API_KEY as fallback

### Z.ai "Invalid API key"
- Verify key from z.ai dashboard
- Check account subscription status
