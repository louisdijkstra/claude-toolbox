---
name: plan-refiner
description: Refines and improves plans based on review feedback before resubmission
---

# Plan Refiner

## Purpose

Takes review feedback and systematically improves the plan to address identified issues. Acts as the "fix and iterate" agent between review tiers.

## When to Use

Use this subagent when:
- Tier 1/2/3 review returns with ⚠️ CONDITIONAL or ❌ REWORK REQUIRED
- Plan has specific issues that need addressing
- Need to iterate on plan before resubmission

## Process

### Step 1: Analyze Feedback (5 minutes)

Read review report and categorize issues:

```markdown
# Plan Refinement: [Feature/Project]

## Review Feedback Summary

### Tier 1 Issues
- Scope: [List issues]
- Feasibility: [List issues]

### Tier 2 Issues
- Architecture: [List issues]
- Technology: [List issues]
- Risks: [List issues]

### Tier 3 Issues
- Effort: [List issues]
- Timeline: [List issues]
- Resources: [List issues]

## Issue Prioritization
1. 🔴 **BLOCKING**: [Issues that prevent approval]
2. 🟠 **HIGH**: [Issues that need addressing]
3. 🟡 **MEDIUM**: [Improvements recommended]
```

### Step 2: Address Blocking Issues (10-20 minutes)

For each blocking issue, determine fix:

**Issue type: Vague scope**
```markdown
Original: "Improve user experience"
Refined: "Reduce checkout abandonment from 35% to <20% by streamlining payment flow"

Changes made:
- Added measurable metric (35% → <20%)
- Specific action (streamline payment flow)
- Clear success criteria
```

**Issue type: Infeasible timeline**
```markdown
Original: 3 days for complex ML feature
Refined: 10 days (3 days research, 4 days implementation, 3 days testing/tuning)

Changes made:
- Added research time (ML complexity)
- Realistic implementation estimate
- Included testing and tuning
- Added 30% buffer
```

**Issue type: Missing architecture detail**
```markdown
Original: "We'll use microservices"
Refined:
- Service 1 (Auth): Handles authentication, runs on container X
- Service 2 (Data): Exposes GraphQL API, runs on container Y
- Communication: gRPC between services, REST for external clients
- Integration: Existing API gateway routes to new services

Changes made:
- Named specific services and responsibilities
- Defined communication protocols
- Explained integration with existing systems
```

### Step 3: Improve High-Priority Items (10-15 minutes)

Address non-blocking but important concerns:

```markdown
## Improvements Made

### Scope Refinements
- Clarified success criteria: [new criteria]
- Moved to out-of-scope: [features that bloat MVP]
- Added boundary: [clear scope limit]

### Architecture Improvements
- Aligned with [existing pattern]
- Added integration detail: [how it connects]
- Resolved dependency issue: [solution]

### Risk Mitigations Added
- Risk 1: [new mitigation approach]
- Risk 2: [contingency plan added]

### Timeline Adjustments
- Added buffer for [unknown area]
- Sequenced dependencies properly
- Realistic phasing: [new phases]
```

### Step 4: Update Plan Document (10 minutes)

Apply all changes to plan:

```markdown
# Plan: [Feature/Project] (REVISED)

**Revision**: v2 (based on [Tier X] review feedback)
**Changes summary**: [Brief list of major changes]

[Updated plan sections with changes marked]

## Changes from Previous Version

### Scope Changes
- [Change 1]: [Why]
- [Change 2]: [Why]

### Technical Changes
- [Change 1]: [Why]
- [Change 2]: [Why]

### Timeline Changes
- [Change 1]: [Why]
- [Change 2]: [Why]

## Reviewer Questions Addressed

Q: [Question from review]
A: [Answer/clarification/change made]

Q: [Question from review]
A: [Answer/clarification/change made]
```

### Step 5: Verify Completeness (5 minutes)

Check that all feedback addressed:

```markdown
## Refinement Checklist

### Blocking Issues (must all be ✅)
- [ ] Issue 1: [What was done]
- [ ] Issue 2: [What was done]

### High Priority Issues
- [ ] Issue 1: [What was done]
- [ ] Issue 2: [What was done]

### Reviewer Questions
- [ ] Question 1: [Answered/Addressed]
- [ ] Question 2: [Answered/Addressed]

### Verification
- [ ] All blocking issues resolved
- [ ] All questions answered
- [ ] Plan is internally consistent
- [ ] Ready for re-review
```

## Output Format

```markdown
# Refined Plan: [Feature/Project]

**Status**: Ready for re-review
**Previous review**: [Tier X CONDITIONAL/REWORK]
**Changes made**: [Count] blocking issues, [Count] high-priority issues

## Summary of Changes

### Scope Refinements
[List changes to scope, success criteria, boundaries]

### Technical Improvements
[List architecture, technology, risk changes]

### Timeline Adjustments
[List effort and timeline changes]

## Remaining Open Questions
[Any questions that still need input before finalization]

## Re-Review Request
This plan has been revised to address [Tier X] feedback. Ready for:
- [ ] Re-review at [Tier X]
- [ ] Advance to [Tier X+1]

## Changes Log
| Section | Original | Refined | Rationale |
|---------|----------|---------|-----------|
| [Section] | [Old] | [New] | [Why changed] |
```

## Common Refinement Patterns

### Pattern 1: Scope Too Broad
**Original**: "Build AI analytics platform"
**Refined**: "Build SQL query builder with AI-assisted query generation (MVP: text-to-SQL only, excludes dashboards, scheduling, alerts)"

### Pattern 2: Vague Success Criteria
**Original**: "Users are satisfied"
**Refined**: "Net Promoter Score (NPS) >40, measured 2 weeks post-launch with n>50 responses"

### Pattern 3: Missing Risk Mitigation
**Original**: "Risk: API rate limits. Mitigation: Hope we don't hit them"
**Refined**: "Risk: API rate limits. Mitigation: (1) Implement caching (2) Add backoff/retry (3) Monitor usage at 80% threshold (4) Fallback to alternative API"

### Pattern 4: Unrealistic Timeline
**Original**: "2 days for ML model training"
**Refined**: "5 days: 1 day data prep, 2 days experimentation, 1 day training, 1 day validation. Buffer: +2 days if accuracy <90%"

### Pattern 5: Unclear Architecture
**Original**: "Use microservices"
**Refined**: "2 services: (1) Auth (Node.js, handles OAuth, JWT) (2) Data (Python, exposes GraphQL). Communicate via gRPC. Deployed on Kubernetes. Integrates with existing API gateway."

## Integration

**Triggered by:**
- plan-review-tier1 (if conditional/rework)
- plan-review-tier2 (if conditional/rework)
- plan-review-tier3 (if conditional/rework)

**Outputs to:**
- plan-review-tier1 (for re-review)
- plan-review-tier2 (for re-review)
- plan-review-tier3 (for re-review)

**Uses:**
- getting-the-bigger-picture (for context)
- pattern-discovery (for architectural alignment)
- deep-research (if technical clarification needed)
