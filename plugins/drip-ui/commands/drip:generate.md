---
name: drip:generate
description: Generate frontend UI components from text description or design image
argument-hint: "<description>" [--service v0|gemini|zai|all] [--from-image path] [--framework react|vue|svelte]
allowed-tools: Bash, Read, Write, WebFetch, AskUserQuestion
---

<!--
Usage examples:
  /drip:generate "Modern login form with dark theme"
  /drip:generate "Dashboard with charts and sidebar" --service v0
  /drip:generate --from-image ./mockup.png --service gemini
  /drip:generate "E-commerce product card" --service all --framework react
-->

# Drip UI - Generate Component

Description: $ARGUMENTS

## IMPORTANT: Service Invocation

**ALWAYS use `invoke-service.py` via Bash to call AI services. NEVER use MCP tools (ask_zai, etc.) directly.**

## Instructions

1. **Parse Arguments**
   - Extract design description (quoted string)
   - Extract --service (default: first available by priority)
   - Extract --from-image for design file input
   - Extract --framework (default: react)

2. **Determine Service**
   Check available services and select one:
   ```bash
   echo "V0: $([ -n "$V0_API_KEY" ] && echo 'available' || echo 'unavailable')"
   echo "GEMINI: $([ -n "$GOOGLE_API_KEY" ] && echo 'available' || echo 'unavailable')"
   echo "ZAI: $([ -n "$Z_AI_API_KEY" ] && echo 'available' || echo 'unavailable')"
   ```

   Priority order (when --service not specified): **v0 > gemini > zai**

3. **Prepare Prompt**
   Format the design description for the selected service:
   ```
   Create a [FRAMEWORK] component with the following specifications:

   Design: [USER_DESCRIPTION]

   Requirements:
   - Use [CSS_FRAMEWORK] for styling
   - Include TypeScript types
   - Add accessibility attributes (ARIA)
   - Make it responsive (mobile-first)
   - Use semantic HTML
   ```

4. **Execute Generation via Script**

   **For text-to-UI:**
   ```bash
   python ${CLAUDE_PLUGIN_ROOT}/scripts/invoke-service.py <service> "<formatted_prompt>" --json
   ```

   **For image-to-code (--from-image):**
   ```bash
   # Only Gemini supports multimodal
   python ${CLAUDE_PLUGIN_ROOT}/scripts/invoke-service.py gemini "<prompt>" --image <path> --json
   ```

5. **Process Output**
   - Parse JSON response from script
   - Extract code blocks from content
   - Validate syntax
   - Format with proper indentation

6. **Save and Display**
   - Optionally save to file (ask user)
   - Display formatted code with syntax highlighting
   - Show service used, tokens, and timing

## Service-Specific Prompts

### v0.dev Prompt Style
```
Build a React component using Next.js and Tailwind CSS.
Use shadcn/ui components where appropriate.

[DESCRIPTION]

Make it production-ready with:
- Proper TypeScript types
- Responsive design
- Dark mode support
```

### Gemini Prompt Style
```
You are an expert frontend developer. Create a [FRAMEWORK] component.

Design Requirements:
[DESCRIPTION]

Provide:
1. Complete component code
2. Required dependencies
3. Usage example
4. Accessibility considerations
```

### Z.ai Prompt Style
```
Generate a [FRAMEWORK] component with the following design:

[DESCRIPTION]

Output format:
- Single file component
- Inline styles or Tailwind classes
- TypeScript if applicable
```

## Output Format

```
+===================================================================+
|  DRIP: [COMPONENT_NAME]                                           |
+===================================================================+
|  Service: [SERVICE]  |  Framework: [FRAMEWORK]                    |
|  Tokens: [COUNT]     |  Time: [DURATION]                          |
+===================================================================+

[GENERATED_CODE]

---
Dependencies: [LIST]
Usage: [EXAMPLE]

Save to file? (Enter filename or skip)
```

## Error Handling

- **Missing auth**: Prompt to run `/drip:config`
- **Service unavailable**: Fall back to alternative service
- **Invalid description**: Ask for clarification
- **Generation failed**: Show error and suggest retry
