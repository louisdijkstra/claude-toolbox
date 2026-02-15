---
name: getting-the-bigger-picture
description: Reads project documentation to contextualize technical decisions and suggestions within the project's actual requirements, constraints, and architecture. Use when making recommendations or decisions that should align with project goals.
---

# Getting the Bigger Picture

## Purpose
Before suggesting solutions or making technical decisions, understand the project's actual context by reading its documentation. This prevents recommending approaches that conflict with established constraints, architecture, or business requirements.

## When to Use This Skill

Use this skill when:
- Making architectural or design recommendations
- Suggesting technology choices or alternatives
- Evaluating trade-offs between approaches
- Proposing new features or changes
- Debugging issues that might relate to broader system design
- User asks about project constraints or requirements
- Decision could impact cost, performance, security, or scalability
- Recommendation involves LLM usage (cost/rate implications)
- Uncertain whether a suggestion fits the project's maturity level (MVP vs production-ready)

**Do NOT use for:**
- Simple syntax fixes
- Pure code refactoring within existing patterns
- Documentation typos
- Questions with obvious answers from immediate context

## How It Works

### 1. Check What Documentation Exists

```bash
ls -la docs/ 2>/dev/null || echo "No docs directory found"
```

Look for:
- `docs/PROJECT_DESCRIPTION.md` (concise overview - **read this first**)
- `docs/FULL_PROJECT_DESCRIPTION.md` (complete details)

### 2. Read Appropriate Documentation

**For most decisions:** Read `PROJECT_DESCRIPTION.md` first
```bash
cat docs/PROJECT_DESCRIPTION.md
```

**For deep analysis:** Read `FULL_PROJECT_DESCRIPTION.md`
```bash
cat docs/FULL_PROJECT_DESCRIPTION.md
```

### 3. Extract Relevant Context

Focus on sections relevant to your decision:

**For technology choices:**
- Application type and tech stack
- Integration requirements
- Constraints and non-negotiables

**For LLM-related decisions:**
- LLM providers and models
- Cost control mechanisms
- Rate limiting strategy
- Budget constraints

**For architecture decisions:**
- Application architecture
- Data storage approach
- Deployment environment
- Scalability needs

**For security decisions:**
- Data sensitivity level
- Compliance requirements
- Authentication/authorization

**For performance decisions:**
- Response time requirements
- Load expectations
- Availability SLA

**For feature suggestions:**
- Key features (priorities)
- Business constraints
- Success metrics

## Decision Framework

After reading documentation, answer:

1. **Does this align with the project's core purpose?**
   - What problem is it solving?
   - Does my suggestion support or distract from that?

2. **Does this fit within the constraints?**
   - Technical constraints (must-use/cannot-use technologies)
   - Budget constraints (especially LLM costs)
   - Security/compliance requirements
   - Performance requirements

3. **Is this appropriate for the maturity level?**
   - MVP → Focus on speed, validate concepts
   - Production-ready → Reliability, monitoring, testing
   - Enterprise-grade → Scalability, security, compliance

4. **What are the trade-offs in THIS context?**
   - Cost implications (infrastructure, LLM, maintenance)
   - Performance impact
   - Complexity vs value
   - Time to implement vs benefit

5. **Are there documented decisions that conflict?**
   - Check decision log if available
   - Look for architectural decisions
   - Check for specific technology choices already made

## Response Pattern

Structure your recommendation using this format:

```
**Context from Project**: [Brief summary of relevant project constraints/goals]

**Recommendation**: [Your suggestion]

**Why this fits**:
- Aligns with [specific project requirement]
- Respects [specific constraint]
- Supports [specific goal]

**Trade-offs to consider**:
- [Trade-off 1]: [Impact in this project's context]
- [Trade-off 2]: [Impact in this project's context]

**Alternative approaches** (if applicable):
- [Alternative 1]: [When it might be better]
- [Alternative 2]: [When it might be better]
```

## Examples

### Example 1: Technology Choice

**User asks**: "Should we use Redis or Memcached for caching?"

**Process**:
1. Read `PROJECT_DESCRIPTION.md`
2. Check: Performance requirements, deployment environment, budget constraints
3. Note: Project requires 99.9% uptime, deployed on AWS, tight budget

**Response**:
```
**Context from Project**: You need 99.9% uptime with tight budget constraints, deployed on AWS.

**Recommendation**: Redis with AWS ElastiCache

**Why this fits**:
- Aligns with 99.9% uptime requirement (Redis persistence and replication)
- AWS ElastiCache is cost-effective for your scale
- Supports your data persistence needs mentioned in backup requirements

**Trade-offs**:
- Slightly higher cost than Memcached (~$10-20/month more at your scale)
- More features than you might need (but enables future growth)

**Alternative**: Memcached if you truly need only ephemeral caching and can tolerate cache misses, saving ~$15/month.
```

### Example 2: LLM Usage Decision

**User asks**: "Should we add an AI summarization feature?"

**Process**:
1. Read `PROJECT_DESCRIPTION.md`
2. Check: LLM cost control, budget constraints, key features
3. Note: Monthly LLM budget is $500, already using Claude for chat feature

**Response**:
```
**Context from Project**: Your LLM budget is $500/month, already allocated to the chat feature. Cost control is listed as a non-negotiable.

**Recommendation**: Not yet - would risk exceeding budget

**Why this matters**:
- Your chat feature likely uses ~$400/month at current usage
- Summarization could add $200-300/month for expected volume
- Exceeds your $500 budget cap significantly

**When this could work**:
1. After analyzing actual usage patterns (might be under budget)
2. With per-user limits (only for paid tier)
3. Using cached summaries (only generate once per document)
4. Increasing budget allocation for Q2

**Alternative**: Implement extractive summarization (no LLM cost) as MVP to validate feature demand first.
```

### Example 3: Architecture Decision

**User asks**: "Should we split this into microservices?"

**Process**:
1. Read `PROJECT_DESCRIPTION.md`
2. Check: Scale, maturity level, team size, deployment complexity
3. Note: MVP stage, 2-person team, expecting <1000 users initially

**Response**:
```
**Context from Project**: You're in MVP stage with a 2-person team and expecting <1000 users.

**Recommendation**: Keep it as a modular monolith

**Why this fits**:
- MVP priority is speed and validation
- Small team can't maintain multiple services efficiently
- Your scale doesn't need distributed architecture yet
- Easier to iterate quickly in single codebase

**Trade-offs**:
- Tighter coupling than microservices
- Need to refactor if scaling beyond 10K users
- All components deployed together

**When to revisit**: After validating product-market fit and growing beyond 5K users, or when adding distinct bounded contexts with separate teams.
```

## Quick Reference Checklist

Before making a recommendation, confirm:

- [ ] Read relevant project documentation
- [ ] Identified applicable constraints
- [ ] Checked budget implications (especially LLM costs)
- [ ] Verified alignment with maturity level (MVP/production/enterprise)
- [ ] Considered documented architectural decisions
- [ ] Evaluated trade-offs in THIS project's context
- [ ] Provided alternatives with clear decision criteria

## Common Pitfalls to Avoid

**Don't:**
- Suggest "industry best practices" without checking if they fit this project
- Recommend expensive solutions when budget is constrained
- Propose enterprise patterns for MVP projects
- Ignore documented constraints because "that's how it's usually done"
- Add LLM features without checking cost controls
- Recommend technologies that conflict with existing stack
- Suggest scaling solutions before the project needs them

**Do:**
- Ground recommendations in actual project requirements
- Acknowledge trade-offs specific to this context
- Respect documented non-negotiables
- Consider the project's current maturity stage
- Flag when documentation seems outdated or incomplete
- Suggest updating documentation if constraints have changed

## Integration with Development

This skill pairs well with:
- **Architecture decisions**: Read bigger picture before proposing structure
- **Code reviews**: Ensure changes align with project goals
- **Feature planning**: Validate ideas against constraints
- **Debugging**: Understand if issue stems from architectural mismatch
- **Refactoring**: Ensure improvements respect project requirements

## Notes

- PROJECT_DESCRIPTION.md is designed to be lightweight (read it liberally)
- FULL_PROJECT_DESCRIPTION.md has complete details (read when deep analysis needed)
- Documentation should be updated as project evolves
- Missing documentation? Help create it using the `determining-project-goal` skill
- If documentation conflicts with conversation, confirm with user which is current