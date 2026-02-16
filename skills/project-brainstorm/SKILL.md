---
name: brainstorm-feature
description: Generate creative and diverse feature ideas aligned with project goals. Explores multiple angles, constraints, and implementation approaches. Use when planning new capabilities or validating feature feasibility.
---

# Brainstorm Feature

## Purpose

Generate creative feature ideas grounded in project goals and constraints. Explore multiple angles, identify implementation trade-offs, and validate feasibility before committing to development.

## When to Use This Skill

Use this skill when:
- Planning new features or capabilities
- Exploring multiple approaches to a problem
- Validating feature feasibility against constraints
- Seeking diverse perspectives on problem-solving
- Brainstorming without immediate implementation pressure
- Need to evaluate feature impact on architecture or budget

**Do NOT use for:**
- Making final technical decisions (use `getting-the-bigger-picture`)
- Code implementation (use `test-driven-development`)
- Reviewing existing code (use `review-critically`)

## How It Works

### 1. Gather Context

```bash
# Read project goals and constraints
cat docs/PROJECT_DESCRIPTION.md 2>/dev/null || cat CLAUDE.md
```

Identify:
- Key project goals
- Current tech stack
- Budget constraints (especially LLM costs)
- User audience
- MVP vs production-ready state

### 2. Brainstorm Multiple Angles

For each feature idea, explore:

**User Value Angle:**
- What problem does it solve?
- Who benefits most?
- What's the user frequency?

**Technical Angle:**
- What infrastructure changes needed?
- New dependencies required?
- Integration complexity?

**Cost Angle:**
- Development time estimate
- Infrastructure cost delta
- LLM token usage impact
- Maintenance burden

**Risk Angle:**
- What could go wrong?
- Security implications?
- Performance impact?
- Compatibility issues?

### 3. Generate Ideas Systematically

Structure brainstorm output as:

```markdown
# Feature Brainstorm: [Feature Name]

## Problem Statement
[What user problem does this solve?]

## Feature Ideas

### Idea 1: [Name]
**Value**: [User benefit]
**Effort**: [Dev time estimate]
**Risk Level**: Low/Medium/High
**Why this works**: [Why it solves the problem]
**Trade-offs**: [What's the downside?]

### Idea 2: [Name]
[Same structure]

### Idea 3: [Name]
[Same structure]

## Recommended Approach
[Which idea or combination to pursue, and why]

## Implementation Path
1. [Phase 1]
2. [Phase 2]
3. [Phase 3 if applicable]

## Open Questions
- [Question to clarify with user]
- [Technical constraint to verify]
```

### 4. Validate Against Constraints

Before recommending, check:
- Aligns with project maturity (MVP/production)
- Fits within budget constraints
- Respects tech stack decisions
- No conflicting architectural decisions
- Feasible with current team capacity

## Brainstorming Patterns

### Expand the Solution Space

**Ask "What if?" questions:**
- What if we simplified this feature?
- What if we automated part of it?
- What if we combined it with existing features?
- What if we built it for just power users first?

**Consider different scopes:**
- Minimal viable feature (1-2 days)
- Complete feature (1 week)
- Production-grade with monitoring (2 weeks)

**Explore implementation approaches:**
- Using existing integrations
- Building custom solution
- Third-party service integration
- Hybrid approach

### Evaluate Feasibility

For each idea, ask:
1. **Can we build it?** (skill/tech available)
2. **Can we afford it?** (time/money/LLM cost)
3. **Should we build it now?** (aligns with roadmap)
4. **What breaks if we add this?** (side effects)

## Response Pattern

Structure recommendations as:

```
**Problem**: [What the user/product needs]

**Multiple Approaches**:
1. **[Approach 1]** - Best for [use case]
   - Pros: [advantages]
   - Cons: [disadvantages]
   - Effort: [estimate]

2. **[Approach 2]** - Alternative if [condition]
   - Pros: [advantages]
   - Cons: [disadvantages]
   - Effort: [estimate]

3. **[Approach 3]** - Most innovative/risky
   - Pros: [advantages]
   - Cons: [disadvantages]
   - Effort: [estimate]

**Recommendation**: Start with [Approach X] because [reasons]

**Implementation Path**:
- Phase 1: [MVP scope]
- Phase 2: [Complete feature]
- Phase 3: [Polish/monitoring if needed]

**Decision Points**:
- [Question to resolve before starting]
- [Constraint to verify]
```

## Examples

### Example: Brainstorming Analytics Dashboard

**Problem**: Users can't see trends in their data

**Multiple Approaches**:

1. **Simple table with sorting** - Lowest effort
   - Pros: Can ship in 2 days, familiar UI pattern
   - Cons: No visual trend detection
   - Effort: 2 days

2. **Charts using Plotly** - Balance of value/effort
   - Pros: Visual trends clear, renders in browser
   - Cons: New dependency, mobile display tricky
   - Effort: 4 days

3. **AI-powered insights dashboard** - Most valuable but complex
   - Pros: Unique feature, highest user value
   - Cons: LLM cost per view, slower performance
   - Effort: 1 week
   - Cost impact: +$200-500/month LLM usage

**Recommendation**: Start with Approach 2 (Charts), then add AI insights (Approach 3) once we validate usage patterns

## Integration with Development

This skill pairs well with:
- **Getting the Bigger Picture**: Validate ideas fit project constraints
- **Project Inception**: Define features during project setup
- **Plan Review System**: Evaluate brainstorm outputs before committing
- **Test-Driven Development**: Once feature is decided, implement TDD

## Common Pitfalls to Avoid

**Don't:**
- Generate ideas in vacuum without reading project docs
- Recommend features that exceed budget constraints
- Propose "gold-plated" solutions when MVP needed
- Ignore feasibility when brainstorming
- Skip cost analysis for LLM-intensive features

**Do:**
- Ground ideas in actual user problems
- Consider multiple implementation angles
- Always include cost/effort estimates
- Validate against project constraints
- Keep ideas actionable and testable
