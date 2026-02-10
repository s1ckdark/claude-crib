---
name: zai:config
description: Configure Z.AI plugin settings - API key, default model, thinking mode
user_invocable: true
allowed_tools:
  - Bash
  - Read
  - Write
---

# /zai:config - Configure Z.AI Plugin

View and manage Z.AI plugin configuration.

## Behavior

1. Check if `Z_AI_API_KEY` is set in the environment
2. Test API connectivity with a minimal request
3. Display current configuration status

## Steps

### Check API Key
```bash
if [ -n "$Z_AI_API_KEY" ]; then
    echo "Z_AI_API_KEY: Set (${#Z_AI_API_KEY} chars)"
else
    echo "Z_AI_API_KEY: NOT SET"
    echo ""
    echo "Set it in your shell profile or .claude/.env:"
    echo "  export Z_AI_API_KEY='your-key-here'"
fi
```

### Test Connectivity
Make a minimal API call to verify the key works:

```bash
curl -s -o /dev/null -w "%{http_code}" \
  -X POST "https://api.z.ai/api/paas/v4/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $Z_AI_API_KEY" \
  -d '{"model":"glm-4-flash","messages":[{"role":"user","content":"ping"}],"max_tokens":5}'
```

### Display Status
Show:
- API key status (set/not set)
- Connectivity test result
- Default model
- Available models (from list_zai_models)
- MCP server status
