---
name: review-system
description: Execute comprehensive multi-tier code and design review process. Combines critical analysis, architectural validation, and quality assessment. Use for thorough review of major changes, architectural decisions, or production-ready code.
---

# Review System

## Purpose

Execute comprehensive review processes that combine security analysis, design validation, code quality, and architectural fit. Ensure production code meets all quality standards before deployment.

## When to Use This Skill

Use this skill when:
- Reviewing major features or changes
- Security-sensitive code ready for review
- Architectural decisions need validation
- Code review requires multiple perspectives
- Preparing code for production deployment
- Complex changes that span multiple components

**Do NOT use for:**
- Quick inline feedback (direct comments fine)
- Trivial changes or obvious bug fixes (skip heavy process)
- Early prototyping or exploratory work (review when ready)
- Single-file changes with no architectural impact (use review-critical)
- Documentation-only updates (use docs-manager)
- Quick syntax or style questions (direct answer fine)

**If uncertain:** Use this skill when changes are significant (multi-component, architectural impact, security-sensitive) or require comprehensive review across multiple dimensions. Skip for small, isolated changes or early-stage work.

## Process

### Stage 1: Pre-Review Preparation (10 minutes)

Gather necessary context:

```markdown
# Review: [Component/Feature]

## What's Being Reviewed?
- [Files/components affected]
- [Why this change matters]
- [Who requested this review]

## Context
- Related architectural decisions: [Links]
- Related tickets/issues: [Links]
- Previous reviews of related code: [Links]

## Key Questions to Answer
- Does this align with project goals?
- Does this fit the architecture?
- Are there security implications?
- Will this impact performance?
- Are tests adequate?
```

### Stage 2: Tier 1 Review - Critical Issues (20-30 minutes)

Scan for blocking issues using `/review-critically` approach:

**Security Checklist:**
- [ ] No hardcoded secrets/credentials
- [ ] Input validation on all user inputs
- [ ] SQL/command injection prevention
- [ ] Authentication required on protected endpoints
- [ ] Authorization checks in place
- [ ] Output encoding/XSS prevention
- [ ] CSRF protection if applicable
- [ ] Error messages don't leak sensitive info
- [ ] Cryptography uses standard algorithms
- [ ] Dependencies checked for CVEs

**Code Quality Checklist:**
- [ ] Follows project code conventions
- [ ] Error handling complete
- [ ] All edge cases considered
- [ ] No obvious performance issues
- [ ] Resource cleanup/memory management
- [ ] Logging is adequate (no PII leaked)
- [ ] Comments explain "why" not "what"
- [ ] Test coverage for critical paths

**Architectural Fit Checklist:**
- [ ] Follows existing patterns in codebase
- [ ] Doesn't violate architectural principles
- [ ] Proper separation of concerns
- [ ] Dependencies are appropriate
- [ ] No circular dependencies
- [ ] API contracts are clear

**Output:**
```markdown
## Tier 1 Review: Critical Issues

### 🔴 Blocking Issues
- [Issue 1]: [Description, file:line]
- [Issue 2]: [Description, file:line]

### 🟠 High Priority Issues
- [Issue 1]: [Description, file:line]
- [Issue 2]: [Description, file:line]

### Status
[PASS / NEEDS FIXES / REQUIRES CHANGES]
```

### Stage 3: Tier 2 Review - Design Validation (20-30 minutes)

Validate design and architectural decisions:

```markdown
## Tier 2 Review: Design & Architecture

### Design Review
**Question**: Does the design solve the problem well?

- [ ] Approach matches requirements
- [ ] Solution is minimal and focused
- [ ] No over-engineering for current scope
- [ ] Interfaces are clean and intuitive
- [ ] Error cases are handled properly

**Assessment**:
[Comment on design quality]

### Architectural Alignment
**Question**: Does this fit the overall architecture?

- [ ] Consistent with existing patterns
- [ ] Proper layering/separation of concerns
- [ ] Dependencies flow correctly
- [ ] Integration points are clear
- [ ] Future maintenance is reasonable

**Assessment**:
[Comment on architectural fit]

### Performance & Scalability
**Question**: Will this perform well at scale?

- [ ] No obvious performance bottlenecks
- [ ] Database queries are optimized
- [ ] Network calls minimized
- [ ] Resource usage is reasonable
- [ ] Monitoring points identified

**Assessment**:
[Comment on performance implications]

### Maintainability
**Question**: Can others understand and maintain this?

- [ ] Code is self-documenting
- [ ] Comments explain non-obvious logic
- [ ] Testing makes behavior clear
- [ ] Future changes won't cascade widely
- [ ] Complexity is justified

**Assessment**:
[Comment on long-term maintainability]
```

### Stage 4: Tier 3 Review - Completeness (15-20 minutes)

Verify all aspects are complete:

```markdown
## Tier 3 Review: Completeness

### Tests
- [ ] Unit tests for core logic
- [ ] Integration tests for dependencies
- [ ] Edge case coverage
- [ ] Error scenarios tested
- [ ] Coverage >80% for new code

**Assessment**: [Test quality and coverage]

### Documentation
- [ ] Code comments explain why
- [ ] API documentation updated
- [ ] Architecture notes updated (if applicable)
- [ ] Deployment requirements documented
- [ ] Breaking changes documented

**Assessment**: [Documentation completeness]

### Backward Compatibility
- [ ] No breaking changes to public APIs
- [ ] Data migrations handled (if applicable)
- [ ] Deprecation warnings added (if applicable)
- [ ] Deployment order considered

**Assessment**: [Compatibility status]

### Deployment Readiness
- [ ] All dependent services updated
- [ ] Configuration management reviewed
- [ ] Rollback plan exists
- [ ] Monitoring/alerts configured
- [ ] Deployment checklist created

**Assessment**: [Deployment readiness]
```

### Stage 5: Create Review Report

Generate comprehensive review document:

```markdown
# Review Report: [Component]

Date: YYYY-MM-DD
Reviewers: [Names]
Status: APPROVED / APPROVED_WITH_CONDITIONS / CHANGES_REQUIRED

## Executive Summary
[1-2 sentence summary of review outcome]

## Tier 1: Critical Issues

### Blocking Issues
[If any]

### High Priority Issues
[If any]

### Recommendation
[Can proceed with changes / Changes required before approval]

## Tier 2: Design Validation

### Design Assessment
[Strengths and weaknesses]

### Architectural Fit
[How well it aligns with existing architecture]

### Performance Considerations
[Potential performance implications]

### Maintainability Assessment
[Long-term considerations]

## Tier 3: Completeness

### Testing
[Test coverage and quality]

### Documentation
[What's documented, what's missing]

### Deployment Readiness
[Whether it's ready to deploy]

## Overall Assessment

### Strengths
- [Strength 1]
- [Strength 2]

### Areas for Improvement
- [Area 1]: [How to improve]
- [Area 2]: [How to improve]

### Recommendations Before Approval
- [ ] [Action required]
- [ ] [Action required]

### Recommendations for Next Phase
- [Future improvement 1]
- [Future improvement 2]

## Approval

**Recommendation**: APPROVED / APPROVED_WITH_CONDITIONS / CHANGES_REQUIRED

**Conditions** (if applicable):
1. [Condition 1]
2. [Condition 2]

**Approved by**: [Reviewer names]
**Date**: [Date]
```

## Response Patterns

### Pattern 1: Full Review Ready

```
**Review**: [Component]

**Tier 1: Critical Issues**
✅ No blocking issues found
⚠️ [X] high priority issues requiring fixes

**Tier 2: Design & Architecture**
✅ Design appropriate for problem
✅ Fits existing architecture
⚠️ [Performance consideration or note]

**Tier 3: Completeness**
✅ Tests adequate
✅ Documentation complete
✅ Deployment ready

**Recommendation**: APPROVED

[Link to full review report]
```

### Pattern 2: Issues Found

```
**Review**: [Component]

**Critical Issues Found**: 2
1. [Issue 1]: [Impact, fix required]
2. [Issue 2]: [Impact, fix required]

**Status**: CHANGES_REQUIRED

**Next Steps**:
1. Address issues above
2. Resubmit for review
3. Timeline: [Estimated time]

[Link to full review report]
```

## Integration with Development

This skill coordinates with:
- **review-critical**: Tier 1 security-focused review (critical issues detection)
- **dev-workflow-flow**: Review happens before Stage 4 (Integration)
- **project-handle-ticket**: Review ticket changes before Stage 6 (Closure)
- **review-plan**: Validate implementation plans before code is written
- **dev-workflow-test-driven**: Verify test coverage during Tier 3 review
- **docs-manager**: Ensure documentation is updated during Tier 3 review

## Multi-Reviewer Coordination

For complex reviews requiring multiple reviewers:

```markdown
## Multi-Reviewer Review: [Component]

### Reviewers
- Reviewer 1 (Role): Responsible for [Tier]
- Reviewer 2 (Role): Responsible for [Tier]
- Reviewer 3 (Role): Responsible for [Tier]

### Review Schedule
- Tier 1 review: [Reviewer + Date]
- Tier 2 review: [Reviewer + Date]
- Tier 3 review: [Reviewer + Date]

### Approval Gate
All tiers must pass before approval.

### Communication
- Sync meeting: [When]
- Decision: [How decision is made]
```

## Common Pitfalls to Avoid

**Don't:**
- Skip security review
- Review without project context
- Focus only on style (miss substance)
- Approve code you don't understand
- Let architectural misalignment slide
- Ignore test coverage gaps
- Skip documentation review
- Review when tired or rushed

**Do:**
- Review with project goals in mind
- Check for security issues first
- Understand the design before critiquing
- Require tests for all new code
- Verify architectural alignment
- Request documentation updates
- Take breaks during long reviews
- Provide constructive feedback
