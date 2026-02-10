---
description: Generate frontend UI components from text description or design image
argument-hint: "<description>" [--service v0|gemini|zai|all] [--from-image path] [--framework react|vue|svelte]
allowed-tools: Bash, Read, Write, WebFetch, Task
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

## Instructions

1. **Parse Arguments**
   - Extract design description (quoted string)
   - Extract --service (default: first available)
   - Extract --from-image for design file input
   - Extract --framework (default: react)

2. **Load Configuration**
   Check `.claude/drip-ui.local.md` for:
   - API keys and auth status
   - Default service preferences
   - Output preferences (TypeScript, CSS framework)

3. **Check Authentication**
   Verify required credentials:
   - v0: `V0_API_KEY` environment variable
   - gemini: OAuth status or `GOOGLE_API_KEY`
   - zai: `Z_AI_API_KEY` environment variable

4. **Prepare Prompt**
   Format the design description for optimal results:
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

5. **Execute Generation**

   **For text-to-UI:**
   - Use Task tool with design-coordinator agent
   - Pass formatted prompt and service selection
   - Handle streaming responses if supported

   **For image-to-code (--from-image):**
   - Only Gemini supports multimodal
   - Read image and encode for API
   - Include vision-specific prompt

6. **Process Output**
   - Extract code blocks from response
   - Validate syntax
   - Format with proper indentation
   - Add file extension hints

7. **Save and Display**
   - Optionally save to file (ask user)
   - Display formatted code with syntax highlighting
   - Show quality metrics

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
