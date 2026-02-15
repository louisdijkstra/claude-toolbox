---
name: deep-research
description: Conduct thorough research on complex topics combining documentation analysis, code exploration, and external resources. Synthesize findings into actionable insights. Use for understanding unfamiliar patterns, evaluating technologies, or investigating system behavior.
---

# Deep Research

## Purpose

Conduct comprehensive research on complex topics by combining multiple information sources. Synthesize documentation, code patterns, external resources, and experiments into clear, actionable insights.

## When to Use This Skill

Use this skill when:
- Understanding unfamiliar architecture or patterns
- Evaluating whether a technology fits your project
- Investigating unexpected system behavior
- Learning best practices for a specific domain
- Making technology recommendations
- Debugging complex multi-system issues
- Understanding third-party library behavior

**Do NOT use for:**
- Simple questions with obvious answers
- Syntax lookups (use direct docs)
- Single-file code changes
- Quick bug fixes

## How It Works

### 1. Define Research Question

Clarify what you're trying to learn:

```markdown
# Research: [Topic]

## Question
[What are we trying to understand?]

## Why It Matters
[How will this knowledge help us?]

## Success Criteria
[What would count as "understood"?]
```

Examples of good research questions:
- "How does LangGraph handle state persistence across agent steps?"
- "What are performance implications of DuckDB in-process SQL vs remote DB?"
- "How do we implement proper OIDC integration in React without security issues?"

### 2. Gather Information from Multiple Angles

**Read Existing Code:**
```bash
# Find related code
find . -type f -name "*.py" -o -name "*.ts" | xargs grep -l "topic_keyword"

# Understand patterns
head -100 [most relevant file]
```

Focus on:
- How the pattern is currently used
- Edge cases in implementation
- Error handling
- Performance considerations

**Check Project Documentation:**
```bash
# Look for relevant docs
ls -la docs/
cat docs/PROJECT_DESCRIPTION.md
cat CLAUDE.md
```

Extract:
- Architecture decisions
- Technology constraints
- Performance requirements
- Known trade-offs

**Search External Resources:**
- Official documentation
- Recent blog posts
- Relevant GitHub issues
- Stack Overflow discussions
- Library changelogs

**Experiment if Needed:**
```bash
# Create small proof-of-concept
# Run tests to verify behavior
# Measure performance impact
```

### 3. Synthesize Findings

Organize research into:

```markdown
# Research Report: [Topic]

## Summary
[1-2 sentence overview of what you learned]

## Key Findings

### Finding 1: [Finding Title]
**Source**: [Where you learned this]
**Relevance**: [Why this matters for our project]
**Details**: [What you found]

### Finding 2: [Finding Title]
[Same structure]

## How It Applies to Our Project

### Current Usage
[How is this used/relevant in our codebase?]

### Implications
- [What changes as a result of this knowledge?]
- [What risks or opportunities does this reveal?]

## Recommendations

### Immediate Actions
1. [What to do now based on findings]
2. [What to do now based on findings]

### Future Considerations
- [What to revisit later]
- [What to monitor]

## Open Questions
- [What's still unclear?]
- [What needs more investigation?]

## Sources
- [Source 1 with link]
- [Source 2 with link]
```

### 4. Document Learning

Create permanent record:

```bash
# Store research findings
mkdir -p docs/research/
cat > docs/research/YYYY-MM-DD-topic-slug.md << 'EOF'
[Research report content]
EOF

# Link from relevant documentation
echo "See: docs/research/YYYY-MM-DD-topic-slug.md" >> docs/ARCHITECTURE.md
```

## Research Strategies

### Strategy 1: Technology Evaluation

**Question**: "Should we use technology X for problem Y?"

**Process**:
1. Read official docs (features, limitations, pricing)
2. Check community (GitHub discussions, Stack Overflow)
3. Review benchmark data (performance vs alternatives)
4. Examine integration effort (dependencies, setup)
5. Assess risk (adoption, vendor lock-in, maintenance)

**Output**:
```markdown
# Technology Evaluation: [Technology]

## Summary
[Verdict: Recommended / Not recommended / Consider alternatives]

## Strengths
- [Strength 1]
- [Strength 2]

## Weaknesses
- [Weakness 1]
- [Weakness 2]

## Fit for Our Project
[How well does it match our constraints and goals?]

## Alternatives
- [Alternative 1]: [When better, when worse]
- [Alternative 2]: [When better, when worse]

## Recommendation
[Which should we use and why?]
```

### Strategy 2: Pattern Analysis

**Question**: "How does pattern X work in our codebase?"

**Process**:
1. Find all uses of the pattern
2. Analyze how it's implemented
3. Identify variations
4. Check for edge cases
5. Compare to best practices

**Output**:
```markdown
# Pattern Analysis: [Pattern Name]

## Current Implementation
[How is it currently used?]

## Variations Observed
- [Variation 1]
- [Variation 2]

## Edge Cases
- [Edge case 1]: [How it's handled]
- [Edge case 2]: [How it's handled]

## Issues Found
- [Issue 1]: [Impact, fix]
- [Issue 2]: [Impact, fix]

## Recommendations
[How to standardize or improve]
```

### Strategy 3: System Behavior Investigation

**Question**: "Why does the system behave like this?"

**Process**:
1. Trace code flow end-to-end
2. Identify decision points
3. Check for hidden dependencies
4. Look for performance bottlenecks
5. Verify against documentation

**Output**:
```markdown
# System Behavior: [Component/Feature]

## Request Flow
1. [Step 1 with file references]
2. [Step 2 with file references]
3. [Step 3 with file references]

## Key Decision Points
- At [location]: [Decision logic]
- At [location]: [Decision logic]

## Performance Characteristics
- [Metric]: [Measured value]
- [Metric]: [Measured value]

## Potential Issues
- [Issue 1]: [Impact, fix]
- [Issue 2]: [Impact, fix]
```

## Response Pattern

When presenting research findings:

```
**Question**: [What were you researching?]

**Finding**: [Main insight]

**Supporting Details**:
- [Detail 1 with source]
- [Detail 2 with source]

**How It Applies**:
[Specific relevance to project/current task]

**Recommendations**:
1. [Action 1]
2. [Action 2]

**Further Reading**:
- [Resource 1]
- [Resource 2]
```

## Examples

### Example: Researching LangGraph State Persistence

**Question**: How does LangGraph persist agent state across steps?

**Process**:
1. Read LangGraph documentation
2. Find `state_modifier` patterns in codebase
3. Check how checkpointing works
4. Review test patterns

**Finding**: LangGraph uses channel-based state with automatic versioning

**Documentation**: docs/research/2026-02-15-langgraph-state-persistence.md

### Example: Investigating Performance Issue

**Question**: Why are analytics queries slow?

**Process**:
1. Trace query execution path
2. Profile DuckDB execution
3. Check for N+1 queries
4. Measure network latency

**Finding**: Missing index on time column causing full scans

**Action**: Add index to improve by 10x

## Integration with Development

This skill pairs well with:
- **Getting the Bigger Picture**: Use research to inform architectural decisions
- **Researching Best Practices**: Specific domain vs general deep research
- **Systematic Debugging**: Deep research when debugging unknown system behavior
- **Brainstorm Feature**: Research viability before brainstorming implementation

## Common Pitfalls to Avoid

**Don't:**
- Research without clear question (wastes time)
- Trust single source (verify across multiple)
- Skip checking existing codebase patterns
- Research without documenting findings
- Spend excessive time on low-impact topics

**Do:**
- Start with clear research objective
- Combine multiple information sources
- Check for patterns in existing code
- Document findings for future reference
- Follow up on open questions
