---
name: plan-review-system
description: Review and validate work plans before implementation. Multi-tier review process that validates scope, feasibility, and alignment. Use when planning complex work or seeking feedback on implementation approach.
---

# Plan Review System

## Purpose

Validate work plans before implementation through structured, multi-tier review. Catch feasibility issues, scope problems, and architectural concerns early. Ensure plans are realistic, complete, and aligned with project goals.

## When to Use This Skill

Use this skill when:
- Planning complex feature or project
- Uncertain if plan is feasible
- Want feedback before starting implementation
- Team needs to align on approach
- Feature planning requires architectural decisions
- Major refactoring or infrastructure change planned

**Do NOT use for:**
- Simple tasks with obvious approach (implement directly)
- Quick fixes or obvious bug fixes
- Trivial changes (typos, formatting)
- Code review of implemented code (use review-critical or review-system)
- Early brainstorming (use project-brainstorm)
- Documentation updates (use docs-manager)

**If uncertain:** Use this skill when planning complex features requiring architecture decisions, multiple phases, or team coordination. Skip for straightforward tasks with obvious implementation approaches.

## Process

### Stage 1: Plan Submission (varies)

Prepare the plan to be reviewed:

```markdown
# Plan: [Feature/Project Name]

## Overview
[1-2 sentence summary of what we're building]

## Problem Statement
[What problem does this solve?]

## Success Criteria
- [ ] [Measurable success metric 1]
- [ ] [Measurable success metric 2]
- [ ] [Measurable success metric 3]

## Scope

### In Scope (MVP)
- [Feature 1]
- [Feature 2]
- [Feature 3]

### Out of Scope (Phase 2+)
- [Feature that's not in MVP]
- [Nice-to-have feature]

## Implementation Approach

### High-Level Architecture
[Diagram or description of how it works]

### Technology Choices
- [Technology 1]: [Why we chose it]
- [Technology 2]: [Why we chose it]

### Key Components
1. [Component 1]: [What it does]
2. [Component 2]: [What it does]
3. [Component 3]: [What it does]

### Integration Points
- [Existing system 1]: [How we integrate]
- [Existing system 2]: [How we integrate]

## Risks and Mitigations

### Technical Risks
- Risk 1: [What could go wrong]
  - Mitigation: [How to prevent/handle]
- Risk 2: [What could go wrong]
  - Mitigation: [How to prevent/handle]

### Scope Risks
- Risk 1: [Scope creep concern]
  - Mitigation: [How to prevent]
- Risk 2: [Underestimation concern]
  - Mitigation: [How to prevent]

### Timeline Risks
- Risk 1: [Timeline concern]
  - Mitigation: [How to protect timeline]

## Effort Estimation

### Component Estimates
- Component 1: X days
- Component 2: Y days
- Component 3: Z days
- **Total**: [Sum] days

### Buffer
- Estimated buffer: [20-30%]
- **Total with buffer**: [Final estimate] days

## Testing Strategy

### Test Coverage
- Unit tests: [What will be tested]
- Integration tests: [What will be tested]
- End-to-end tests: [What will be tested]
- Performance tests: [If applicable]

### Manual Testing
- [Testing scenario 1]
- [Testing scenario 2]

## Dependencies

### Internal Dependencies
- [System 1]: [When needed]
- [System 2]: [When needed]

### External Dependencies
- [Service 1]: [When needed]
- [Third-party library]: [When needed]

### Team Dependencies
- [Team member 1]: [What they need to do]
- [Team member 2]: [What they need to do]

## Timeline

### Phases
1. **Phase 1 - [Name]** (X days)
   - [Deliverable 1]
   - [Deliverable 2]

2. **Phase 2 - [Name]** (Y days)
   - [Deliverable 1]
   - [Deliverable 2]

3. **Phase 3 - [Name]** (Z days)
   - [Deliverable 1]
   - [Deliverable 2]

**Total Timeline**: [End date]

## Assumptions

- [Assumption 1]: [Why we're making this]
- [Assumption 2]: [Why we're making this]
- [Assumption 3]: [Why we're making this]

## Open Questions

- [ ] [Question 1]
- [ ] [Question 2]
- [ ] [Question 3]

## Approval Checklist

- [ ] Scope is clear and achievable
- [ ] Success criteria are measurable
- [ ] Architecture is sound
- [ ] Effort estimation is realistic
- [ ] Risks are identified and mitigated
- [ ] Testing strategy is complete
- [ ] Timeline is realistic
- [ ] Dependencies are managed
- [ ] Assumptions are documented
- [ ] Stakeholders approve
```

### Stage 2: Tier 1 Review - Scope & Feasibility (20-30 minutes)

Validate basic plan elements:

**Scope Review:**
- [ ] Problem statement is clear
- [ ] Success criteria are specific and measurable
- [ ] MVP scope is focused (not too broad)
- [ ] Out-of-scope items are clearly defined
- [ ] Scope matches project goals

**Feasibility Review:**
- [ ] Technology choices are appropriate
- [ ] Team has required expertise (or can learn)
- [ ] External dependencies are realistic
- [ ] Timeline is achievable
- [ ] Nothing obviously impossible

**Assessment:**
```markdown
## Tier 1: Scope & Feasibility

### Scope Assessment
✅ Clear and well-defined
⚠️ [Issue with scope, if any]

### Feasibility Assessment
✅ Technically feasible
⚠️ [Feasibility concern, if any]

### Questions
- [Question 1]
- [Question 2]

### Recommendation
- ✅ Proceed to Tier 2
- ⚠️ Address concerns before proceeding
- ❌ Rework needed
```

### Stage 3: Tier 2 Review - Technical & Architecture (20-30 minutes)

Validate technical approach:

**Architecture Review:**
- [ ] Architecture matches project patterns
- [ ] Components are appropriately separated
- [ ] Integration points are clear
- [ ] Data flow is understood
- [ ] No obvious architectural issues

**Technology Choices:**
- [ ] Choices align with project tech stack
- [ ] Justification for any new technologies
- [ ] Dependencies are reasonable
- [ ] Licensing and support considerations addressed

**Risks & Mitigations:**
- [ ] Risks are identified
- [ ] Mitigations are realistic
- [ ] Contingency plans exist
- [ ] No critical unmitigated risks

**Assessment:**
```markdown
## Tier 2: Technical & Architecture

### Architecture Assessment
✅ Sound and appropriate
⚠️ [Concern, if any]

### Technology Assessment
✅ Good choices
⚠️ [Concern, if any]

### Risk Assessment
✅ Risks identified and mitigated
⚠️ [Risk concern, if any]

### Technical Questions
- [Question 1]
- [Question 2]

### Recommendation
- ✅ Proceed to Tier 3
- ⚠️ Address concerns before proceeding
- ❌ Architectural rework needed
```

### Stage 4: Tier 3 Review - Estimates & Timeline (15-20 minutes)

Validate effort and timeline:

**Effort Estimation:**
- [ ] Component estimates are realistic
- [ ] Buffer is adequate (20-30%)
- [ ] Testing effort included
- [ ] Documentation effort included
- [ ] No obvious omissions

**Timeline:**
- [ ] Phases are logical
- [ ] Sequencing makes sense
- [ ] Dependencies are sequenced properly
- [ ] Milestones are clear
- [ ] Final date is achievable

**Resource Planning:**
- [ ] Team capacity assessed
- [ ] Dependencies on other teams managed
- [ ] No resource conflicts
- [ ] Expertise available or plan to acquire

**Assessment:**
```markdown
## Tier 3: Estimates & Timeline

### Effort Assessment
✅ Realistic estimates with adequate buffer
⚠️ [Concern, if any]

### Timeline Assessment
✅ Achievable with current resources
⚠️ [Concern, if any]

### Resource Assessment
✅ Resources available
⚠️ [Concern, if any]

### Questions
- [Question 1]
- [Question 2]

### Recommendation
- ✅ Plan approved, ready to implement
- ⚠️ Address concerns before starting
- ❌ Significant rework needed
```

### Stage 5: Generate Review Report

Create comprehensive plan review:

```markdown
# Plan Review Report: [Feature/Project]

Date: YYYY-MM-DD
Reviewers: [Names]
Status: APPROVED / APPROVED_WITH_CONDITIONS / NEEDS_REWORK

## Executive Summary
[1-2 sentence summary of review outcome]

## Tier 1: Scope & Feasibility

### Scope Assessment
[Assessment of scope clarity and focus]

### Feasibility Assessment
[Assessment of technical/resource feasibility]

### Recommendation
[Can proceed / Address concerns / Rework needed]

## Tier 2: Technical & Architecture

### Architecture Assessment
[Assessment of design approach]

### Technology Assessment
[Assessment of technology choices]

### Risk Assessment
[Assessment of identified risks and mitigations]

### Recommendation
[Can proceed / Address concerns / Rework needed]

## Tier 3: Estimates & Timeline

### Effort Assessment
[Assessment of estimation realism]

### Timeline Assessment
[Assessment of deadline achievability]

### Resource Assessment
[Assessment of team capacity]

### Recommendation
[Can proceed / Address concerns / Rework needed]

## Overall Recommendation

### Approval Status
- ✅ **APPROVED**: Plan is ready to implement
- ⚠️ **APPROVED WITH CONDITIONS**: Address items below
- ❌ **NEEDS REWORK**: Major changes needed

### Items to Address (if any)
1. [Condition/concern 1]
2. [Condition/concern 2]
3. [Condition/concern 3]

### Suggestions for Success
- [Suggestion 1]
- [Suggestion 2]

### Next Steps
1. [Action if approved]
2. [Action if conditional]
3. [Action if rejected]

---

**Approved by**: [Reviewer names]
**Date**: [Date]
```

## Response Pattern

When reviewing a plan:

```
**Plan**: [Feature/Project]

**Tier 1: Scope & Feasibility**
✅ Scope is clear and achievable
⚠️ [Issues found, if any]

**Tier 2: Technical & Architecture**
✅ Architecture is sound
⚠️ [Issues found, if any]

**Tier 3: Estimates & Timeline**
✅ Estimates realistic, timeline achievable
⚠️ [Issues found, if any]

**Overall Recommendation**: APPROVED / APPROVED_WITH_CONDITIONS / NEEDS_REWORK

[Details about any concerns or suggestions]

**Next Steps**: [What to do next]
```

## Multi-Tier Reviewer Coordination

For complex plans requiring multiple reviewers:

```markdown
## Multi-Reviewer Plan Review: [Feature]

### Reviewers
- Reviewer 1 (Role): Tier [1/2/3] lead
- Reviewer 2 (Role): Tier [1/2/3] lead
- Reviewer 3 (Role): Tier [1/2/3] lead

### Review Schedule
- Tier 1 review: [Reviewer + Date]
- Tier 2 review: [Reviewer + Date]
- Tier 3 review: [Reviewer + Date]

### Sync Meeting
Date: [When]
Agenda:
- Tier 1 findings
- Tier 2 findings
- Tier 3 findings
- Final recommendation

### Decision Gate
All tiers must pass for approval.
Conditional approval requires addressing flagged items.
```

## Integration with Development

This skill coordinates with:
- **dev-workflow-flow**: Use reviewed plan as blueprint for implementation
- **project-brainstorm**: Generate plans for features during brainstorming
- **dev-workflow-tdd**: Use plan for test component structure and TDD approach
- **dev-workflow-test-driven**: Use plan for comprehensive test strategy
- **project-inception**: Review plans created during project launch (Stage 3)
- **docs-manager**: Document plan decisions and approved approaches

## Common Pitfalls to Avoid

**Don't:**
- Review without understanding project goals
- Rubber-stamp plans without reading
- Ignore timeline/resource constraints
- Skip architectural review
- Approve plans with unmitigated risks
- Accept unrealistic estimates
- Overlook dependencies
- Review when tired/distracted

**Do:**
- Read plan carefully before reviewing
- Understand project context
- Challenge assumptions respectfully
- Ask clarifying questions
- Look for completeness
- Verify estimates are realistic
- Identify all dependencies
- Document all concerns
- Provide constructive feedback
- Recommend improvements
