---
name: talkie:setup
description: Setup talkie plugin - add Bash permissions for say.sh auto-execution
user_invocable: true
allowed_tools: [Bash, Read, Edit, Write]
---

# /talkie:setup - Talkie Plugin Setup

Configure permissions so that `say.sh` runs without approval prompts.

## Steps

1. Read `.claude/settings.local.json` (create if it doesn't exist)
2. Add the following permission rules to the `permissions.allow` array if not already present:
   - `Bash(/Users/dave/.claude/plugins/marketplaces/claude-crib/plugins/talkie/scripts/say.sh:*)`
   - `Bash(/Users/dave/.claude/plugins/cache/claude-crib/talkie/*/scripts/say.sh:*)`
   - `Bash(./plugins/talkie/scripts/say.sh:*)`
3. Also add `Bash(killall say:*)` for the overlap prevention in say.sh
4. Write the updated settings file
5. Display confirmation: "Talkie setup complete. say.sh will now run without approval."
6. Run: `${CLAUDE_PLUGIN_ROOT}/scripts/say.sh "토키 셋업이 완료되었습니다."`
