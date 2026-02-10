---
description: Compare UI generation results from v0, Gemini, and Z.ai side by side
argument-hint: "<description>" [--framework react|vue|svelte]
allowed-tools: Bash, Read, Write, WebFetch, Task
---

<!--
Usage examples:
  /drip:compare "Navigation bar with dropdown menus"
  /drip:compare "User profile card with avatar" --framework react
  /drip:compare "Data table with sorting and pagination"
-->

# Drip UI - Compare Services

Description: $ARGUMENTS

## Instructions

1. **Parse Arguments**
   - Extract design description
   - Extract --framework (default: react)

2. **Check All Services**
   Verify credentials for all three services:
   - v0: `V0_API_KEY`
   - gemini: OAuth or `GOOGLE_API_KEY`
   - zai: `Z_AI_API_KEY`

   Skip unavailable services, warn user.

3. **Parallel Generation**
   Use Task tool with design-coordinator to:
   - Send same prompt to all available services
   - Run in parallel for efficiency
   - Collect responses with timing data

4. **Analyze Results**
   For each result, evaluate:

   | Criteria | Weight | How to Assess |
   |----------|--------|---------------|
   | Code Quality | 25% | Syntax, structure, best practices |
   | Design Match | 25% | Adherence to description |
   | Accessibility | 20% | ARIA, semantic HTML, keyboard nav |
   | Responsiveness | 15% | Mobile support, breakpoints |
   | Performance | 15% | Code size, efficiency |

5. **Generate Comparison Report**
   - Side-by-side code snippets (truncated for display)
   - Scores for each criterion
   - Overall ranking
   - Recommendation based on use case

6. **Offer Actions**
   - View full code for any service
   - Save winner to file
   - Merge best parts (advanced)

## Comparison Metrics

### Code Quality Assessment
```
Check for:
- Proper component structure
- Type safety (TypeScript)
- Error handling
- Code comments
- Naming conventions
```

### Design Fidelity Assessment
```
Check for:
- All requested elements present
- Proper layout/positioning
- Correct styling approach
- Theme consistency
```

### Accessibility Assessment
```
Check for:
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Color contrast hints
- Screen reader support
```

## Output Format

```
+===================================================================+
|  DRIP COMPARE: [DESCRIPTION]                                      |
+===================================================================+
|  Services: v0, Gemini, Z.ai  |  Framework: React                  |
+===================================================================+

=== v0.dev ===
Tokens: 1,234  |  Time: 2.1s  |  Score: 87/100

export function Component() {
  return (
    <div className="...">
      // Preview (first 10 lines)
    </div>
  );
}

Strengths: Production-ready, shadcn/ui integration
Weaknesses: Less flexible styling

---

=== Gemini ===
Tokens: 1,456  |  Time: 3.2s  |  Score: 82/100

export const Component: React.FC = () => {
  return (
    <div style={{...}}>
      // Preview (first 10 lines)
    </div>
  );
}

Strengths: Detailed comments, flexible
Weaknesses: Requires more cleanup

---

=== Z.ai ===
Tokens: 1,100  |  Time: 1.8s  |  Score: 79/100

function Component() {
  return (
    <div className="...">
      // Preview (first 10 lines)
    </div>
  );
}

Strengths: Fast, cost-effective
Weaknesses: Less polished output

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

WINNER: v0.dev (Best for production use)

RECOMMENDATIONS:
- Production deployment: v0.dev
- Learning/customization: Gemini
- Budget projects: Z.ai

+===================================================================+

Actions:
[1] View full v0 code
[2] View full Gemini code
[3] View full Z.ai code
[4] Save winner to file
[5] Create hybrid (advanced)
```

## Hybrid Generation (Advanced)

When user selects "Create hybrid":
1. Extract best parts from each service
2. Merge structure from highest code quality
3. Merge styling from best design match
4. Add accessibility from most accessible
5. Present unified component
