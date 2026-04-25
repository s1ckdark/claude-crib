# Claude Crib - Plugin Development Conventions

## Command Naming

Claude Code가 플러그인 이름을 자동으로 prefix로 붙이므로, **파일명에는 prefix를 넣지 않는다**.

- ✅ `plugins/code-crib/commands/setup.md` → 사용자 호출 `/code-crib:setup`
- ❌ `plugins/code-crib/commands/code-crib:setup.md` → `/code-crib:code-crib:setup` (이중 prefix)

명령 이름은 SKILL.md 또는 command 파일 frontmatter의 `name:` 필드로 명시한다.

```yaml
---
name: code-crib:setup
description: Interactive setup wizard
---
```

플러그인 이름과 user-facing prefix가 다를 때(예: 플러그인 `drip-ui`가 `/drip:` 명령을 노출)에만 파일명에 prefix를 포함시킨다.

다른 플러그인과 충돌 가능한 범용 이름(`ask`, `run`, `check` 등)은 frontmatter `name:`에서 plugin prefix를 명시하여 회피한다.
