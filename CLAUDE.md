# Claude Crib - Plugin Development Conventions

## Command Naming

- 범용적인 이름(`ask`, `run`, `check` 등)은 다른 플러그인과 충돌할 수 있으므로, 플러그인 고유의 네임스페이스를 명시한다.
- 예: `ask` → `ask-zai`, `search` → `search-docs`
- 커맨드 이름은 `{plugin}:{command}` 형태로 등록되지만, 여러 플러그인이 같은 command 이름을 쓰면 혼동이 생기므로 command 자체에도 구분자를 포함시킨다.
