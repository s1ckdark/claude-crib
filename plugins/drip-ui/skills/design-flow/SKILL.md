---
name: Design Flow
description: This skill should be used when the user asks to "generate UI", "create frontend component", "convert design to code", "compare AI design services", "use v0", "use gemini for design", "use zai for frontend", or needs to generate React/Vue/Svelte components from text descriptions or images. Provides multi-service orchestration for frontend code generation.
version: 0.1.0
---

# Design Flow - Multi-Service Frontend Generation

## Overview

Design Flow orchestrates v0.dev, Google Gemini, and Z.ai to generate high-quality frontend components. It handles authentication, prompt optimization, output comparison, and quality assessment.

## When to Apply This Skill

- Generating UI components from text descriptions
- Converting design images/mockups to code
- Comparing outputs from multiple AI services
- Setting up authentication for design services
- Optimizing prompts for each service's strengths

## Service Overview

### v0.dev (Vercel)

**Strengths:**
- Production-ready React/Next.js components
- Native shadcn/ui and Tailwind integration
- Consistent code style
- Built-in dark mode support

**Best for:**
- Production deployments
- shadcn/ui component systems
- Next.js projects

**Auth:** `V0_API_KEY` (Premium/Team subscription required)

### Google Gemini

**Strengths:**
- Multimodal (image-to-code)
- Detailed explanations
- Flexible output formats
- Higher free tier with OAuth

**Best for:**
- Design file conversion
- Learning and customization
- Complex reasoning about design

**Auth:** OAuth (recommended) or `GOOGLE_API_KEY`

### Z.ai (GLM)

**Strengths:**
- Cost-effective ($3/month)
- Fast responses
- OpenAI-compatible API
- Good for iteration

**Best for:**
- Budget projects
- Rapid prototyping
- Alternative implementations

**Auth:** `Z_AI_API_KEY`

## Prompt Engineering

### Universal Prompt Structure

```
Create a [FRAMEWORK] component for: [DESCRIPTION]

Technical Requirements:
- Use [CSS_FRAMEWORK] for styling
- Include TypeScript types
- Add ARIA accessibility attributes
- Make responsive (mobile-first)
- Use semantic HTML elements

Output Format:
- Single file component
- Include import statements
- Add JSDoc comments for props
```

### Service-Specific Optimization

**v0.dev:**
```
Add to prompt:
- "Use shadcn/ui components where appropriate"
- "Follow Next.js App Router conventions"
- "Include 'use client' directive if needed"
```

**Gemini:**
```
Add to prompt:
- "Explain your design decisions"
- "List required dependencies"
- "Provide usage example"
```

**Z.ai:**
```
Add to prompt:
- "Keep code concise"
- "Use inline Tailwind classes"
- "Focus on functionality over comments"
```

## Image-to-Code Workflow

Only Gemini supports multimodal input:

1. **Prepare Image**
   - Accept PNG, JPG, WebP formats
   - Resize if > 4MB
   - Encode as base64 for API

2. **Vision Prompt**
   ```
   Analyze this UI design and create a React component that replicates it.

   Extract:
   - Layout structure (flexbox/grid)
   - Color palette (exact hex values)
   - Typography (font sizes, weights)
   - Spacing (padding, margins)
   - Interactive elements

   Then generate complete component code.
   ```

3. **Process Output**
   - Extract code blocks
   - Validate syntax
   - Add missing imports

## Quality Assessment

### Scoring Criteria

| Criterion | Weight | Indicators |
|-----------|--------|------------|
| Code Quality | 25% | Clean structure, TypeScript, best practices |
| Design Match | 25% | All elements present, correct layout |
| Accessibility | 20% | ARIA, keyboard nav, semantic HTML |
| Responsiveness | 15% | Mobile breakpoints, fluid layouts |
| Performance | 15% | Code size, efficient patterns |

### Quality Checks

**Code Quality:**
- Valid TypeScript/JavaScript syntax
- Proper component structure
- Named exports preferred
- Props interface defined

**Accessibility:**
- ARIA labels on interactive elements
- Role attributes where needed
- Focus states defined
- Alt text for images

**Responsiveness:**
- Mobile-first approach
- Breakpoint utilities used
- Flexible units (rem, %)

## Error Handling

### Authentication Errors

| Error | Service | Solution |
|-------|---------|----------|
| 401 Unauthorized | v0 | Check V0_API_KEY, verify subscription |
| Token expired | Gemini | Run `gemini auth login` |
| Invalid API key | Z.ai | Verify key at z.ai dashboard |

### Rate Limits

| Service | Limit | Handling |
|---------|-------|----------|
| v0 | 100/min | Exponential backoff |
| Gemini OAuth | 1,000/day | Track usage, warn at 80% |
| Gemini API Key | 100/day | Recommend OAuth upgrade |
| Z.ai | Varies | Check subscription tier |

### Generation Failures

1. **Timeout**: Return partial if available
2. **Empty response**: Retry with simplified prompt
3. **Invalid code**: Try alternate service
4. **Service down**: Fall back to available services

## Comparison Workflow

When comparing all services:

1. **Parallel Execution**
   - Fire requests simultaneously
   - Set per-service timeouts
   - Collect with Promise.allSettled pattern

2. **Normalize Outputs**
   - Extract code from varied response formats
   - Standardize component structure
   - Remove service-specific artifacts

3. **Score and Rank**
   - Apply quality criteria
   - Weight by use case priorities
   - Generate comparison matrix

4. **Recommend**
   - Best overall (highest weighted score)
   - Best for production (code quality + accessibility)
   - Best for learning (design match + explanations)
   - Best budget option (Z.ai if acceptable quality)

## Additional Resources

### Reference Files

For detailed API documentation and examples:
- **`references/service-apis.md`** - Complete API specifications
- **`references/prompt-library.md`** - Tested prompts for each service

### Scripts

Utility scripts for service interaction:
- **`scripts/test-services.sh`** - Test all service connections
- **`scripts/invoke-service.py`** - Unified service invocation
