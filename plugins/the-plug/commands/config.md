---
name: config
description: Configure The Plug settings - auto-recap timing, enable/disable
allowed-tools: ["Read", "Write", "Edit", "Glob", "AskUserQuestion"]
---

# The Plug - Configuration

Manage The Plug settings for auto-recap behavior.

## Steps

### 1. Read Current Config

Check both config locations:

**Project-level:** `.claude/the-plug.local.md`
**Global:** `~/.claude/the-plug-config.json`

If neither exists, show defaults:
- `auto_recap: true`
- `gap_hours: 2`

### 2. Show Current Settings and Ask What to Change

Use AskUserQuestion:

```json
{
  "questions": [
    {
      "question": "What do you want to configure?",
      "header": "Settings",
      "multiSelect": true,
      "options": [
        {
          "label": "Auto-recap (currently {enabled/disabled})",
          "description": "Automatically show recap when you return after a gap"
        },
        {
          "label": "Gap time (currently {N}h)",
          "description": "How long you need to be away before auto-recap triggers"
        },
        {
          "label": "Scope: project / global",
          "description": "Apply settings to this project only or all projects"
        }
      ]
    }
  ]
}
```

### 3. For Gap Time Changes

Ask for new value:
```json
{
  "questions": [
    {
      "question": "How many hours away before auto-recap triggers?",
      "header": "Gap time",
      "options": [
        {"label": "30 minutes", "description": "0.5 hours - recap after short breaks"},
        {"label": "1 hour", "description": "Recap after a decent break"},
        {"label": "2 hours (default)", "description": "Recap after being away a while"},
        {"label": "4 hours", "description": "Only recap after long absence"}
      ]
    }
  ]
}
```

### 4. Save Configuration

**For project-level** (`.claude/the-plug.local.md`):

```markdown
---
auto_recap: {true/false}
gap_hours: {number}
---

The Plug configuration for this project.
Auto-recap is {enabled/disabled} with a {N}-hour gap threshold.
```

**For global** (`~/.claude/the-plug-config.json`):

```json
{
  "auto_recap": true,
  "gap_hours": 2
}
```

Ensure `.claude/` directory exists before writing project config.

### 5. Confirm

```
Settings updated:
- Auto-recap: {enabled/disabled}
- Gap threshold: {N} hours
- Scope: {project/global}

Changes take effect next session.
```

## Edge Cases

- If `.claude/` directory doesn't exist, create it
- If config file has extra fields, preserve them
- Project config overrides global config
