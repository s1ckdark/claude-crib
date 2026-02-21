---
description: Compare UI generation results from v0, Gemini, and Z.ai using parallel team agents
argument-hint: "<description>" [--framework react|vue|svelte]
allowed-tools: Bash, Read, Write, Task, TeamCreate, TeamDelete, SendMessage, TaskCreate, TaskList, TaskUpdate, AskUserQuestion
---

<!--
Usage examples:
  /drip:compare "Navigation bar with dropdown menus"
  /drip:compare "User profile card with avatar" --framework react
  /drip:compare "Data table with sorting and pagination"
-->

# Drip UI - Compare Services (Team Mode)

Description: $ARGUMENTS

## Instructions

### 1. Parse Arguments
- Extract design description (quoted string)
- Extract --framework (default: react)

### 2. Check Available Services
```bash
echo "V0: $([ -n "$V0_API_KEY" ] && echo 'available' || echo 'unavailable')"
echo "GEMINI: $([ -n "$GOOGLE_API_KEY" ] && echo 'available' || echo 'unavailable')"
echo "ZAI: $([ -n "$Z_AI_API_KEY" ] && echo 'available' || echo 'unavailable')"
```
Only spawn agents for available services. Warn user about unavailable ones.

### 3. Prepare the Design Prompt

Format for each service:
```
Create a [FRAMEWORK] component with the following specifications:

Design: [USER_DESCRIPTION]

Requirements:
- Use Tailwind CSS for styling
- Include TypeScript types
- Add accessibility attributes (ARIA)
- Make it responsive (mobile-first)
- Use semantic HTML
```

### 4. Create Team and Spawn Agents

```
TeamCreate: drip-compare
```

Create one task per available service, then spawn the matching agent:

- **v0-agent** → `drip-ui:v0-generator` agent type — calls v0.dev API
- **gemini-agent** → `drip-ui:gemini-generator` agent type — calls Gemini API
- **zai-agent** → `drip-ui:zai-generator` agent type — calls Z.ai API

Each agent receives the formatted prompt and:
1. Optimizes it for their service's strengths
2. Calls `invoke-service.py` via Bash (NEVER MCP tools)
3. Analyzes the generated code quality
4. Reports back with code + score + analysis

**Spawn agents in parallel** using multiple Task calls in a single message.

### 5. Collect Results

Wait for all agents to complete their tasks. Each agent sends back:
- SERVICE name
- SCORE (0-100)
- STRENGTHS list
- WEAKNESSES list
- Generated CODE

### 6. Generate Comparison Report

After all agents report, compile the comparison:

```
+===================================================================+
|  DRIP COMPARE: [DESCRIPTION]                                      |
+===================================================================+
|  Services: [available]  |  Framework: [FRAMEWORK]                  |
+===================================================================+

=== v0.dev ===
Score: XX/100
[Code preview - first 10 lines]
Strengths: ...
Weaknesses: ...

---

=== Gemini ===
Score: XX/100
[Code preview - first 10 lines]
Strengths: ...
Weaknesses: ...

---

=== Z.ai ===
Score: XX/100
[Code preview - first 10 lines]
Strengths: ...
Weaknesses: ...

+===================================================================+
|  COMPARISON SUMMARY                                               |
+===================================================================+

| Criterion      | v0   | Gemini | Z.ai |
|----------------|------|--------|------|
| Code Quality   | ★★★★★ | ★★★★☆  | ★★★☆☆ |
| Design Match   | ★★★★☆ | ★★★★★  | ★★★★☆ |
| Accessibility  | ★★★★★ | ★★★★☆  | ★★★☆☆ |
| Responsiveness | ★★★★☆ | ★★★★☆  | ★★★☆☆ |
| Performance    | ★★★★☆ | ★★★☆☆  | ★★★★★ |

WINNER: [best service] ([reason])

RECOMMENDATIONS:
- Production deployment: v0.dev
- Learning/customization: Gemini
- Budget projects: Z.ai
+===================================================================+
```

### 7. Offer Actions

Ask user what to do next:
- View full code for any service
- Save winner to file
- Create hybrid (merge best parts from each)

### 8. Cleanup

Send shutdown requests to all agents and delete the team:
```
SendMessage: shutdown_request to each agent
TeamDelete: drip-compare
```

## Hybrid Generation (Advanced)

When user selects "Create hybrid":
1. Extract best parts from each service
2. Merge structure from highest code quality
3. Merge styling from best design match
4. Add accessibility from most accessible
5. Present unified component
