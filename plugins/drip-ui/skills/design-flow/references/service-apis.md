# Service API Reference

## v0.dev Platform API

### Authentication

```bash
# Environment variable
export V0_API_KEY="v0_key_..."

# In code (v0-sdk)
import { v0 } from 'v0-sdk'
// Automatically uses process.env.V0_API_KEY
```

### SDK Installation

```bash
pnpm add v0-sdk
# or
npm install v0-sdk
```

### Key Endpoints

#### Create Chat (Generation)

```javascript
import { v0 } from 'v0-sdk'

const chat = await v0.chats.create({
  projectId: 'proj_xxx',  // optional
  messages: [
    {
      role: 'user',
      content: 'Create a modern login form with dark theme'
    }
  ]
})

// Stream response
for await (const chunk of chat.stream()) {
  console.log(chunk.content)
}
```

#### List Projects

```javascript
const projects = await v0.projects.list()
```

#### Get Messages

```javascript
const messages = await v0.chats.messages(chatId)
```

### REST API (without SDK)

```bash
# Create generation
curl -X POST https://api.v0.dev/v1/chat \
  -H "Authorization: Bearer $V0_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Create a button component"}]
  }'
```

### Rate Limits

- Premium: 100 requests/minute
- Team: Higher limits (varies)

---

## Google Gemini API

### Authentication Methods

#### OAuth (Recommended)

```bash
# Install CLI
pip install google-generativeai

# Login
gemini auth login

# Check status
gemini auth status

# Use in code - automatic token management
import google.generativeai as genai
model = genai.GenerativeModel('gemini-3-flash')
```

OAuth provides:
- 1,000 requests/day free
- Automatic token refresh
- No key exposure risk

#### API Key

```bash
# Environment variable
export GOOGLE_API_KEY="AIza..."

# In code
import google.generativeai as genai
genai.configure(api_key=os.environ['GOOGLE_API_KEY'])
```

API Key provides:
- 100 requests/day free (Gemini 2.5 Pro)
- Simpler setup
- Key management required

### Text Generation

```python
import google.generativeai as genai

model = genai.GenerativeModel('gemini-3-flash')

response = model.generate_content(
    "Create a React component for a user profile card"
)

print(response.text)
```

### Multimodal (Image-to-Code)

```python
import google.generativeai as genai
from PIL import Image

model = genai.GenerativeModel('gemini-3-flash')

# Load image
image = Image.open('mockup.png')

response = model.generate_content([
    "Convert this UI design to a React component with Tailwind CSS",
    image
])

print(response.text)
```

### REST API

```bash
# Text generation
curl "https://generativelanguage.googleapis.com/v1/models/gemini-3-flash:generateContent?key=$GOOGLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{"text": "Create a React button component"}]
    }]
  }'
```

### Available Models

| Model | Best For | Context |
|-------|----------|---------|
| gemini-3-flash | Fast generation | 1M tokens |
| gemini-3-pro | Complex reasoning | 2M tokens |

---

## Z.ai API (GLM)

### Authentication

```bash
# Environment variable
export Z_AI_API_KEY="zai_..."

# In code
from openai import OpenAI

client = OpenAI(
    api_key=os.environ['Z_AI_API_KEY'],
    base_url="https://api.z.ai/api/paas/v4"
)
```

### SDK Installation

```bash
pip install zai-sdk
# or use openai package with custom base_url
pip install openai
```

### Chat Completion (OpenAI Compatible)

```python
from openai import OpenAI

client = OpenAI(
    api_key=os.environ['Z_AI_API_KEY'],
    base_url="https://api.z.ai/api/paas/v4"
)

response = client.chat.completions.create(
    model="glm-4.7",
    messages=[
        {"role": "user", "content": "Create a React navbar component"}
    ],
    thinking={"type": "enabled"},
    max_tokens=4096
)

print(response.choices[0].message.content)
```

### Streaming

```python
stream = client.chat.completions.create(
    model="glm-4.7",
    messages=[{"role": "user", "content": "Create a form component"}],
    stream=True
)

for chunk in stream:
    print(chunk.choices[0].delta.content, end="")
```

### REST API

```bash
curl https://api.z.ai/api/paas/v4/chat/completions \
  -H "Authorization: Bearer $Z_AI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-4.7",
    "messages": [
      {"role": "user", "content": "Create a React card component"}
    ],
    "thinking": {"type": "enabled"},
    "max_tokens": 4096
  }'
```

### Available Models

| Model | Best For | Notes |
|-------|----------|-------|
| glm-4.7 | Complex tasks, thinking mode | Latest, recommended |
| glm-4.5 | General coding | Fast, cost-effective |

### Pricing

- Starter: $3/month
- Pro: Higher limits
- Pay-as-you-go available

---

## Unified Invocation Pattern

### Python Helper

```python
import os
from typing import Literal, Optional

async def generate_ui(
    prompt: str,
    service: Literal['v0', 'gemini', 'zai'],
    image_path: Optional[str] = None
) -> str:
    """
    Unified UI generation across services.
    """
    if service == 'v0':
        from v0_sdk import v0
        chat = await v0.chats.create(
            messages=[{"role": "user", "content": prompt}]
        )
        return await chat.get_response()

    elif service == 'gemini':
        import google.generativeai as genai
        model = genai.GenerativeModel('gemini-3-flash')

        if image_path:
            from PIL import Image
            image = Image.open(image_path)
            response = model.generate_content([prompt, image])
        else:
            response = model.generate_content(prompt)

        return response.text

    elif service == 'zai':
        from openai import OpenAI
        client = OpenAI(
            api_key=os.environ['Z_AI_API_KEY'],
            base_url="https://api.z.ai/api/paas/v4"
        )
        response = client.chat.completions.create(
            model="glm-4.7",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
```

### Shell Helper

```bash
#!/bin/bash
# invoke-service.sh <service> <prompt>

SERVICE="$1"
PROMPT="$2"

case "$SERVICE" in
  v0)
    curl -s -X POST https://api.v0.dev/v1/chat \
      -H "Authorization: Bearer $V0_API_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"messages\": [{\"role\": \"user\", \"content\": \"$PROMPT\"}]}"
    ;;
  gemini)
    curl -s "https://generativelanguage.googleapis.com/v1/models/gemini-3-flash:generateContent?key=$GOOGLE_API_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"contents\": [{\"parts\": [{\"text\": \"$PROMPT\"}]}]}"
    ;;
  zai)
    curl -s https://api.z.ai/api/paas/v4/chat/completions \
      -H "Authorization: Bearer $Z_AI_API_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"model\": \"glm-4.7\", \"messages\": [{\"role\": \"user\", \"content\": \"$PROMPT\"}]}"
    ;;
esac
```
