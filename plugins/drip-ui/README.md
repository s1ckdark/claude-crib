# Drip UI

> Generate stylish frontend components using v0, Gemini, and Z.ai

Drip UI는 여러 AI 서비스를 활용해 프론트엔드 컴포넌트를 생성하는 Claude Code 플러그인입니다. 텍스트 설명에서 UI를, 디자인 이미지에서 코드를, 그리고 여러 서비스의 결과를 비교해서 최적의 결과를 얻을 수 있습니다.

## Features

- **Text → UI**: 텍스트 설명에서 React/Vue/Svelte 컴포넌트 생성
- **Image → Code**: 디자인 이미지에서 코드 추출 (Gemini 비전)
- **Multi-Service Compare**: v0, Gemini, Z.ai 결과를 비교해서 최적 선택
- **Smart Auth**: Gemini OAuth, v0/Z.ai API 키 지원

## Quick Start

```bash
# 기본 컴포넌트 생성
/drip:generate "Modern login form with dark theme"

# 특정 서비스 사용
/drip:generate "Dashboard with charts" --service v0

# 이미지에서 코드 생성
/drip:generate --from-image ./mockup.png --service gemini

# 서비스 비교
/drip:compare "Navigation bar with dropdown menus"
```

## Commands

| Command | Description |
|---------|-------------|
| `/drip:generate <desc>` | UI 컴포넌트 생성 |
| `/drip:compare <desc>` | 모든 서비스 결과 비교 |
| `/drip:config` | 설정 확인 및 관리 |
| `/drip:config setup` | 서비스 인증 설정 |
| `/drip:config test` | 연결 테스트 |

## Supported Services

| Service | Auth | Best For |
|---------|------|----------|
| **v0.dev** | API Key | Production-ready React/Next.js |
| **Gemini** | OAuth / API Key | Image-to-code, detailed explanations |
| **Z.ai** | API Key | Budget-friendly, fast iteration |

## Authentication Setup

### v0.dev
```bash
# Premium/Team subscription required
export V0_API_KEY="v0_key_..."
# Get from: https://v0.dev/chat/settings/keys
```

### Google Gemini (OAuth - Recommended)
```bash
# Higher rate limits (1,000/day free)
gemini auth login
```

### Google Gemini (API Key)
```bash
# Lower rate limits (100/day free)
export GOOGLE_API_KEY="AIza..."
# Get from: https://aistudio.google.com/apikey
```

### Z.ai
```bash
# $3/month starter plan
export Z_AI_API_KEY="zai_..."
# Get from: https://z.ai/subscribe
```

## Output Example

```
+===================================================================+
|  DRIP: LoginForm                                                  |
+===================================================================+
|  Service: v0.dev  |  Framework: React                             |
|  Tokens: 1,234    |  Time: 2.3s                                   |
+===================================================================+

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <form className="space-y-4 p-6 bg-card rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold">Welcome Back</h2>
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit" className="w-full">
        Sign In
      </Button>
    </form>
  )
}

---
Quality Score: 87/100
Dependencies: @/components/ui/button, @/components/ui/input
```

## Architecture

```
drip-ui/
├── agents/
│   └── design-coordinator.md   # Multi-service orchestrator
├── commands/
│   ├── drip:generate.md        # Component generation
│   ├── drip:compare.md         # Service comparison
│   └── drip:config.md          # Configuration
├── skills/
│   └── design-flow/            # Generation workflow
│       ├── SKILL.md
│       └── references/
│           └── service-apis.md
├── scripts/
│   ├── test-services.sh        # Connectivity test
│   └── invoke-service.py       # Unified invocation
└── templates/
    └── drip-ui.local.md        # Config template
```

## Requirements

- Claude Code CLI
- At least one of:
  - v0.dev Premium/Team subscription
  - Google account (for Gemini OAuth)
  - Z.ai subscription ($3/month)

## Sources

- [v0.dev Platform API](https://v0.app/docs/api/platform/overview)
- [v0-sdk GitHub](https://github.com/vercel/v0-sdk)
- [Gemini API OAuth](https://ai.google.dev/gemini-api/docs/oauth)
- [Gemini API Keys](https://ai.google.dev/gemini-api/docs/api-key)
- [Z.ai API](https://docs.z.ai/guides/overview/quick-start)
- [zai-sdk PyPI](https://pypi.org/project/zai-sdk/)

## License

MIT
