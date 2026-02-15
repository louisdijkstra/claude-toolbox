---
name: plan-review-tier1
description: Tier 1 plan review - validates scope clarity and technical feasibility
---

# Plan Review - Tier 1: Scope & Feasibility

## Purpose

First-tier review that validates basic plan viability before deeper analysis. Catches scope issues and obvious feasibility problems early.

## Review Focus

### Scope Review (10-15 minutes)

**What to validate:**
- [ ] Problem statement is clear and specific
- [ ] Success criteria are measurable (not vague goals)
- [ ] MVP scope is focused (not trying to do too much)
- [ ] Out-of-scope items clearly defined
- [ ] Scope aligns with stated project goals

**Red flags:**
- Vague problem statement ("improve user experience")
- Unmeasurable success criteria ("make it better")
- MVP trying to solve too many problems
- No clear boundaries (everything is in scope)
- Misalignment with project goals

### Feasibility Review (10-15 minutes)

**What to validate:**
- [ ] Technology choices are appropriate for scale/constraints
- [ ] Team has required expertise (or realistic learning path)
- [ ] External dependencies are available and realistic
- [ ] Timeline is achievable given scope
- [ ] No obvious impossibilities

**Red flags:**
- Unproven technology for critical components
- Skills gap with no training plan
- Dependencies on unavailable/deprecated services
- Timeline doesn't account for unknowns
- Physically impossible requirements (violates laws of physics/math)

## Output Format

```markdown
## Tier 1: Scope & Feasibility Review

### Scope Assessment
✅ **PASS**: Clear problem, measurable criteria, focused scope
⚠️ **CONCERNS**: [List specific issues]
❌ **FAIL**: [Critical scope problems]

**Details:**
- Problem statement: [Clear/Vague/Missing]
- Success criteria: [Measurable/Vague/Missing]
- MVP scope: [Focused/Too broad/Unclear]
- Boundaries: [Well-defined/Fuzzy]
- Alignment: [Matches goals/Misaligned]

### Feasibility Assessment
✅ **PASS**: Technically feasible with current resources
⚠️ **CONCERNS**: [List specific feasibility risks]
❌ **FAIL**: [Critical feasibility blockers]

**Details:**
- Technology choices: [Appropriate/Questionable/Inappropriate]
- Team expertise: [Sufficient/Gap with plan/Insufficient]
- External dependencies: [Realistic/Risky/Blocked]
- Timeline: [Realistic/Tight/Unrealistic]
- Impossibilities: [None/[List]]

### Questions for Plan Author
1. [Clarifying question 1]
2. [Clarifying question 2]

### Recommendation
- ✅ **PROCEED TO TIER 2**: Plan is viable, continue review
- ⚠️ **CONDITIONAL**: Address concerns before Tier 2
- ❌ **REWORK REQUIRED**: Major scope/feasibility issues need resolution

**If conditional, required actions:**
1. [Action to address concern]
2. [Action to address concern]
```

## Common Issues

### Scope Issues
**Issue**: Success criteria like "users will love it"
**Fix**: Require measurable metrics: "90% user satisfaction score"

**Issue**: MVP includes "phase 2" features
**Fix**: Move non-essential features to out-of-scope

**Issue**: Problem statement is a solution
**Fix**: Reframe as user problem, not implementation

### Feasibility Issues
**Issue**: Plan assumes team knows unfamiliar technology
**Fix**: Add learning time or choose familiar alternative

**Issue**: Critical dependency on beta/deprecated service
**Fix**: Find stable alternative or add fallback plan

**Issue**: Timeline has no buffer for unknowns
**Fix**: Add 20-30% buffer or reduce scope

## Integration

**Feeds into:**
- plan-review-tier2 (if approved)
- plan-refiner (if rework needed)

**Uses output from:**
- getting-the-bigger-picture (for context)
- brainstorm-feature (original feature ideas)
