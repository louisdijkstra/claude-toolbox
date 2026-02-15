---
description: Research production-ready best practices for features or technical decisions. Validates against 2026 industry standards.
---

# Research Command

This command researches best practices using the **deep-research** and **deep-research** skills.

## What This Command Does

1. **Understand Context** - Read project goals, architecture, constraints
2. **Research Best Practices** - Find industry standards and patterns
3. **Validate Against 2026** - Ensure current, not outdated approaches
4. **Assess Fit** - Match solutions to project context
5. **Provide Recommendations** - Actionable, production-ready options

## When to Use

Use `/research` when:
- Choosing between technologies or approaches
- Implementing unfamiliar features
- Need to validate technical decisions
- Want industry-standard solutions
- Avoiding common pitfalls
- Ensuring production-ready quality

## How It Works

1. **Get project context** using getting-the-bigger-picture skill
2. **Research best practices** for the specific feature/decision
3. **Validate with web search** against 2026 standards
4. **Check MCP servers** for additional insights
5. **Filter out hacks** - only production-ready solutions
6. **Align with architecture** - ensure it fits the project
7. **Provide options** with trade-offs and recommendations

## Research Sources

**Project Context:**
- docs/ directory for goals, architecture, constraints
- Existing codebase patterns
- Current tech stack

**External Research:**
- Web search for 2026 best practices
- Official documentation
- Industry standards
- MCP servers (package registries, advisories)

## Research Output Format

```
RESEARCH: [Feature/Decision Name]
=================================

CONTEXT
-------
Project: [Brief description]
Stack: [Current technologies]
Constraints: [Scale, requirements, limitations]

RECOMMENDATIONS
---------------

Option 1: [Recommended Approach] ⭐
Pros:
- [Benefit 1]
- [Benefit 2]

Cons:
- [Drawback 1]

Why Recommended:
[Clear reasoning for this choice]

Option 2: [Alternative Approach]
Pros:
- [Benefit 1]

Cons:
- [Drawback 1]

When to Use:
[Specific scenarios where this is better]

ANTI-PATTERNS TO AVOID
-----------------------
❌ [Anti-pattern 1]: [Why it's problematic]
❌ [Anti-pattern 2]: [Why it's problematic]

REFERENCES
----------
- [Official documentation link]
- [Industry standard / RFC]
- [2026 best practice article]
```

## Quality Criteria

Research must be:
- **Production-ready** - No hacks or workarounds
- **Current** - 2026 best practices, not outdated
- **Aligned** - Fits project architecture and scale
- **Practical** - Actually implementable given constraints
- **Comprehensive** - Covers trade-offs and alternatives

## Integration with Other Commands

- Use `/research` before `/plan` to inform planning
- Use `/plan` after research to create implementation plan
- Use `/tdd` to implement researched solution
- Use `/review` to validate implementation

## Related Skills

- **deep-research** - Production-ready research
- **deep-research** - 2026 standards validation
- **getting-the-bigger-picture** - Project context
- **pattern-discovery** - Existing codebase patterns
