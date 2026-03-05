# Prompt Templates for AI Cyphers

## Round-Based Cypher Prompts

### Opening Bars - Position Statement

```
You are participating in a multi-AI cypher on the following topic:

TOPIC: {topic}

This is Round 1 of {total_rounds}. Your task is to state your initial position.

FORMAT YOUR RESPONSE AS:

## My Position
[Clear statement of your stance]

## Key Arguments
1. [First main point with brief explanation]
2. [Second main point with brief explanation]
3. [Third main point with brief explanation]

## Important Caveats
[Any conditions, exceptions, or nuances to your position]

Keep your response between 150-300 words. Be clear and direct.
```

### Call and Response - Challenge Round

```
You are participating in a multi-AI cypher on:

TOPIC: {topic}

This is Round {current} of {total_rounds}.

PREVIOUS POSITIONS:
---
{model_a}: {position_a_summary}
---
{model_b}: {position_b_summary}
---

Your task is to respond to the other positions.

FORMAT YOUR RESPONSE AS:

## Points of Agreement
[What you agree with from other crew members]

## Points of Disagreement
[What you disagree with and why]

## Questions or Clarifications Needed
[Any points that need more explanation]

## Updated Thoughts
[How this cypher has influenced your thinking]

Keep your response between 150-300 words.
```

### Final Verse - Synthesis

```
You are participating in a multi-AI cypher on:

TOPIC: {topic}

This is the final round ({current} of {total_rounds}).

CYPHER SUMMARY:
{full_cypher_summary}

Your task is to provide your final position.

FORMAT YOUR RESPONSE AS:

## Final Position
[Your refined stance after hearing all perspectives]

## Common Ground Identified
[What all crew members seem to agree on]

## Remaining Disagreements
[Where genuine differences persist]

## My Recommendation
[If applicable, your concrete recommendation]

Keep your response between 100-200 words. Focus on synthesis, not repetition.
```

## Free-Form Cypher Prompts

### Exploration Prompt

```
You are participating in an open cypher on:

TOPIC: {topic}

Recent flow:
{recent_exchanges}

Contribute to this cypher by:
- Building on interesting points raised
- Offering new perspectives
- Asking thought-provoking questions
- Identifying unexplored angles

This is a collaborative exploration, not a battle.
Keep your response between 100-250 words.
```

### Brainstorming Prompt

```
TOPIC: {topic}

Previous ideas shared:
{previous_ideas}

Add to this brainstorm with:
- Novel ideas not yet mentioned
- Combinations of previous ideas
- Challenges to consider
- Alternative approaches

Aim for creativity over criticism.
Keep your response between 100-200 words.
```

## MC (Host) Prompts

### MC Opening

```
You are the MC (HOST) of this AI cypher.

TOPIC: {topic}
FORMAT: {round_based|free_form}
ROUNDS: {total_rounds}
CREW: {participant_list}

Your responsibilities:
1. Introduce the topic and format
2. Facilitate fair participation
3. Guide toward productive cypher
4. Synthesize the final conclusion

Begin by introducing the cypher to the crew.
Keep your introduction under 100 words.
```

### MC Transition

```
Round {current} has concluded.

SUMMARY OF ROUND {current}:
{round_summary}

KEY THEMES EMERGED:
{key_themes}

Transition to Round {next} by:
1. Summarizing what was discussed
2. Highlighting interesting tensions
3. Framing the next round's focus

Keep your transition under 75 words.
```

### MC Conclusion Draft

```
The cypher has concluded.

FULL TRANSCRIPT:
{transcript}

Draft a conclusion that:
1. Summarizes the consensus (if any)
2. Captures key insights from each crew member
3. Notes areas of disagreement
4. Provides actionable recommendations (if appropriate)
5. Acknowledges limitations or open questions

FORMAT:
## Consensus Summary
## Key Insights
## Areas of Disagreement
## Recommendations
## Open Questions

Keep your conclusion between 200-400 words.
```

## Specialized Prompts

### Technical Decision Topic

```
TECHNICAL DECISION: {topic}

Consider these evaluation criteria:
- Performance implications
- Maintainability
- Scalability
- Team expertise required
- Migration/adoption cost
- Long-term support

Provide your technical recommendation with specific reasoning.
```

### Architecture Comparison

```
ARCHITECTURE COMPARISON: {option_a} vs {option_b}

Evaluate on:
- Complexity
- Flexibility
- Operational overhead
- Cost implications
- Team skillset alignment

Recommend one approach with clear justification.
```

### Process/Practice Discussion

```
PRACTICE DISCUSSION: {topic}

Consider:
- Implementation effort
- Expected benefits
- Potential pitfalls
- Measurement of success
- Organizational fit

Share your experience and recommendations.
```

## Response Parsing Patterns

### Extracting Structured Response

When model returns formatted response, extract sections:

```python
import re

def parse_cypher_response(response):
    sections = {}

    # Find all ## headers and their content
    pattern = r'## ([^\n]+)\n(.*?)(?=\n## |\Z)'
    matches = re.findall(pattern, response, re.DOTALL)

    for header, content in matches:
        sections[header.strip()] = content.strip()

    return sections
```

### Handling Unstructured Response

If model doesn't follow format, extract key content:

```python
def extract_position(response):
    # Look for position indicators
    position_markers = [
        r'I (?:believe|think|recommend|suggest)',
        r'My (?:position|view|recommendation)',
        r'In my opinion',
    ]

    for marker in position_markers:
        match = re.search(f'{marker}[^.]+\.', response)
        if match:
            return match.group(0)

    # Fallback: first sentence
    return response.split('.')[0] + '.'
```
