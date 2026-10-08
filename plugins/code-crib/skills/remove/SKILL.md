---
name: remove
description: Remove docs from your stash - delete unwanted knowledge. Use when user wants to remove, delete, dump, or clean up their stashed documents.
---

# Remove Command

Delete docs from your knowledge stash.

## Usage

```
code-crib:remove
```

## Instructions

### Option 1: Remove by ID

1. Fetch the document from vector DB to confirm existence
2. Show document title and metadata
3. Ask for confirmation (unless --confirm)
4. Delete from vector DB

### Option 2: Remove by Search

1. Search for matching documents
2. Display list with numbers
3. Let user select which to remove
4. Delete selected documents

### Option 3: Bulk Cleanup

1. Find all docs matching criteria (e.g., older than X days)
2. Display count and sample titles
3. Require explicit confirmation
4. Delete in batches

## Arguments

- `id`: Document ID to remove
- `query`: Search query to find docs to remove (interactive selection)
- `namespace`: Only remove from this namespace
- `older-than`: Remove docs older than X days
- `confirm`: Skip confirmation prompt

## Safety Features

- Always shows what will be deleted before acting
- Requires confirmation unless `--confirm` is passed
- Logs deleted document IDs for recovery reference

로컬 인덱스는 파일을 원본으로 사용한다. 원격 문서를 지워도 로컬 사본은 자동 삭제되지 않는다. `local_path`가 있거나 사용자가 로컬 검색 결과를 선택한 경우, 원격 레코드와 로컬 원본 중 무엇을 삭제할지 명확히 확인한다. 로컬 원본은 현재 프로젝트 내부의 실제 파일인지 확인하고, 삭제 승인을 받은 경우에만 제거한다. 다른 기기의 `local_path`나 제목만으로 로컬 파일을 추측하여 삭제하지 않는다. 이후 `local-index.py sync`로 로컬 검색에서도 반영한다. 원본을 남겼다면 로컬 검색에는 계속 표시됨을 알린다.

## Examples

```bash
# Remove specific document
code-crib:remove --id "myproject-2024-01-15-fix123"

# Find and remove interactively
code-crib:remove --query "deprecated feature"

# Clean old docs (careful!)
code-crib:remove --older-than 180 --confirm

# Remove from specific namespace
code-crib:remove --namespace old-project --older-than 90
```

## Recovery Note

Deleted docs are gone from vector DB. If you have local `.rag-docs/` files, you can re-index them with `code-crib:rack`.
