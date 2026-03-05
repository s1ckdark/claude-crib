---
name: Cypher Strategy
description: This skill should be used when the user needs to "determine cypher format", "choose round vs free cypher", "decide number of rounds", "select MC model", "build consensus", "resolve disagreements", "synthesize viewpoints", or when orchestrating multi-model AI freestyle debates. Provides strategic guidance for effective AI cyphers.
version: 0.1.0
---

# Cypher Strategy for AI Freestyle Debates

## Overview

This skill provides strategic guidance for orchestrating effective cyphers between multiple AI models. It covers format selection, MC assignment, consensus building, and conclusion synthesis.

## When to Apply This Skill

- Determining whether a topic needs round-based or free-form cypher
- Selecting the optimal number of rounds
- Choosing which AI model should be MC (host/moderator)
- Building consensus from diverse AI viewpoints
- Synthesizing conclusions from multi-model debates

## Cypher Format Selection

### Round-Based Format

**Select when topic exhibits:**
- Binary choices (A vs B comparisons)
- Structured debates (pros vs cons)
- Technical decisions requiring systematic evaluation
- Topics with clear opposing positions

**Characteristics:**
- Each participant speaks in turn (structured bars)
- Defined phases: Opening Bars -> Call and Response -> Final Verse
- MC controls flow strictly
- Better for reaching concrete decisions

**Example topics:**
- "REST vs GraphQL for mobile apps"
- "Microservices vs monolith architecture"
- "SQL vs NoSQL for e-commerce"

### Free-Form Format

**Select when topic exhibits:**
- Open-ended exploration
- Brainstorming requirements
- Complex problems without clear positions
- Creative or philosophical discussions

**Characteristics:**
- Organic flow of responses (freestyle)
- Participants build on each other
- MC guides rather than controls
- Better for exploring possibilities

**Example topics:**
- "How to improve developer experience"
- "Future of AI in healthcare"
- "Best practices for code review"

### Format Decision Algorithm

```
IF topic contains comparison words (vs, or, versus, compare)
  -> Round-based
ELSE IF topic asks for list/brainstorm/explore/ideas
  -> Free-form
ELSE IF topic is a technical decision
  -> Round-based
ELSE IF topic is philosophical/open-ended
  -> Free-form
ELSE
  -> Default to Round-based (more structured output)
```

## Round Count Determination

Base round count on topic complexity:

| Complexity | Rounds | Indicators |
|------------|--------|------------|
| Simple | 2 | Clear binary choice, few factors |
| Moderate | 3 | Multiple factors, some nuance |
| Complex | 4 | Many stakeholders, trade-offs |
| Very Complex | 5 | Strategic decisions, long-term impact |

### Round Structure

**2 Rounds:**
1. Opening Bars (initial positions)
2. Final Verse (with responses)

**3 Rounds (Recommended default):**
1. Opening Bars (initial positions)
2. Call and Response (challenges)
3. Final Verse (refined positions and common ground)

**4+ Rounds:**
1. Opening Bars
2. Clarifying questions
3. Call and Response
4. Finding common ground
5. Final synthesis

## MC (Host) Model Selection

### Automatic Selection Criteria

| Topic Type | Recommended MC | Rationale |
|------------|----------------|-----------|
| Code/Technical | Claude or GPT | Strong reasoning |
| Creative/Design | Claude | Nuanced perspective |
| Research/Facts | Gemini or GPT | Knowledge breadth |
| Philosophy/Ethics | Claude | Careful reasoning |
| Business/Strategy | GPT | Practical focus |
| Local/Custom | Ollama | Privacy/speed |

### MC Responsibilities

1. **Facilitate** - Ensure all crew members contribute
2. **Clarify** - Request elaboration when needed
3. **Redirect** - Keep cypher on topic
4. **Synthesize** - Combine viewpoints fairly
5. **Conclude** - Draft balanced conclusion

## Consensus Building Strategies

### Identifying Agreement

Look for:
- Shared premises or assumptions
- Common recommendations with different reasoning
- Overlapping concerns or priorities
- Universal constraints acknowledged

### Handling Disagreement

**Genuine disagreement** (different valid perspectives):
- Document both positions clearly
- Explain trade-offs of each approach
- Note conditions where each might be preferred

**Factual disagreement** (one may be wrong):
- Flag for verification
- Note uncertainty in conclusion
- Recommend further research

### Consensus Levels

| Level | Description | Action |
|-------|-------------|--------|
| Strong | 80%+ agreement | State as recommendation |
| Moderate | 50-80% agreement | Present majority with minority view |
| Weak | <50% agreement | Present options without recommendation |
| None | Fundamental disagreement | Document positions, explain why |

## Conclusion Synthesis

### Structure Template

```markdown
## Consensus Summary
[What participants agreed on]

## Key Insights by Crew Member
- [Model A]: [Unique contribution]
- [Model B]: [Unique contribution]

## Areas of Disagreement
[Where opinions diverged and why]

## Recommendation
[Synthesized recommendation based on cypher]

## Confidence Level
[Strong/Moderate/Weak] - [Explanation]

## Open Questions
[Issues requiring further exploration]
```

### Quality Criteria for Conclusions

- **Balanced**: All viewpoints fairly represented
- **Actionable**: Clear next steps when appropriate
- **Honest**: Uncertainty acknowledged
- **Complete**: Key points captured
- **Concise**: Distilled to essentials

## Ralph Loop Integration

### Validation Criteria

Ralph Loop validates conclusions against:

1. **Representation**: Were all crew views included?
2. **Logic**: Is the conclusion logically consistent?
3. **Balance**: Is there unfair weighting of opinions?
4. **Completeness**: Are key points missing?
5. **Actionability**: Can the user act on this conclusion?

### Handling Validation Failures

If ralph-loop identifies issues:

1. **Weak consensus**: Add additional round to find common ground
2. **Missing perspective**: Re-prompt underrepresented model
3. **Logic gaps**: Have MC address specific inconsistency
4. **Bias detected**: Rebalance conclusion with explicit attention to minority views

## Prompt Templates

### Round 1: Opening Bars
```
Topic: [TOPIC]

State your position on this topic clearly and concisely.
Include:
- Your recommendation or stance
- Key reasoning (2-3 main points)
- Any important caveats or conditions

Respond in 150-250 words.
```

### Round 2: Call and Response
```
Topic: [TOPIC]

Previous positions:
[SUMMARY OF ROUND 1]

Respond to the other positions:
- What do you agree with?
- What do you disagree with and why?
- Any points that need clarification?

Respond in 150-250 words.
```

### Round 3: Final Verse
```
Topic: [TOPIC]

Cypher so far:
[SUMMARY OF ROUNDS 1-2]

Provide your refined position:
- Has your view changed? How?
- What common ground do you see?
- Final recommendation

Respond in 100-200 words.
```

## Additional Resources

### Reference Files

For detailed examples and edge cases:
- **`references/prompt-templates.md`** - Complete prompt library
- **`references/consensus-patterns.md`** - Advanced consensus techniques
