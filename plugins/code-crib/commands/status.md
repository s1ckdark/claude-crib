---
name: code-crib:status
description: 로컬 문서 인덱스의 갱신 시각, 미반영 변경, 실패 확인
---

다음 명령을 현재 프로젝트에서 실행한다. 상태 확인은 문서를 갱신하지 않는다.

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/local-index.py" status
```

- `indexed`: 로컬 인덱스에 들어 있는 문서 수
- `sources`: 등록된 각 경로의 `last_sync`, `pending`(추가·변경·삭제), 현재 `errors`, 직전 실행의 `last_sync_errors`
- 경로가 비어 있으면 기본 문서 디렉터리에 문서를 저장하거나 `/code-crib:rack --path ./docs/knowledge --local`로 등록하도록 안내한다.
- 미반영 변경이나 오류가 있으면 `/code-crib:rack --local`로 재시도하도록 안내한다. 접근할 수 없는 디렉터리는 삭제로 간주하지 않는다.
- 로컬 인덱스와 원격 벡터 DB는 별개다. `remote_sync: not_tracked`를 원격 동기화 완료로 표현하지 않는다.
- Python/SQLite FTS5 미지원이나 실행 오류는 그대로 알리고 기존 벡터 검색은 계속 사용할 수 있음을 안내한다.
