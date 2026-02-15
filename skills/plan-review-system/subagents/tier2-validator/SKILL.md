---
name: plan-review-tier2
description: Tier 2 plan review - validates technical approach and architecture
---

# Plan Review - Tier 2: Technical & Architecture

## Purpose

Second-tier review that validates technical soundness and architectural fit. Assumes Tier 1 approved scope and feasibility.

## Review Focus

### Architecture Review (10-15 minutes)

**What to validate:**
- [ ] Architecture matches existing project patterns
- [ ] Components are appropriately separated
- [ ] Integration points with existing systems are clear
- [ ] Data flow is well-understood
- [ ] No obvious architectural anti-patterns

**Red flags:**
- Violates established architectural principles
- Tight coupling between components
- Unclear integration points
- Circular dependencies
- Reinventing existing solutions

### Technology Choices Review (5-10 minutes)

**What to validate:**
- [ ] Choices align with project tech stack
- [ ] New technologies are justified
- [ ] Dependencies are reasonable in number/complexity
- [ ] Licensing is compatible
- [ ] Support/maintenance considerations addressed

**Red flags:**
- Adding technology without justification
- Incompatible licenses (GPL in proprietary code)
- Unmaintained dependencies
- Technology mismatch for scale (Redis for 10 users)
- Vendor lock-in without consideration

### Risk & Mitigation Review (5-10 minutes)

**What to validate:**
- [ ] Technical risks are identified
- [ ] Scope risks are addressed
- [ ] Timeline risks have mitigation plans
- [ ] Mitigations are realistic (not wishful thinking)
- [ ] No critical unmitigated risks

**Red flags:**
- Critical risk with no mitigation ("hope it works")
- Mitigation is "work harder/faster"
- Unknown risks not acknowledged
- Mitigation creates new risks
- No contingency for major risks

## Output Format

```markdown
## Tier 2: Technical & Architecture Review

### Architecture Assessment
✅ **PASS**: Sound architecture, fits project patterns
⚠️ **CONCERNS**: [List architectural concerns]
❌ **FAIL**: [Critical architectural problems]

**Details:**
- Pattern consistency: [Matches/Deviates/Unknown]
- Component separation: [Appropriate/Coupled/Unclear]
- Integration points: [Clear/Unclear/Missing]
- Data flow: [Well-defined/Complex/Unclear]
- Anti-patterns: [None/[List]]

**Architectural alignment:**
- Follows [existing pattern name]
- Integrates with [system] via [approach]
- Maintains separation between [layer1] and [layer2]

### Technology Assessment
✅ **PASS**: Good technology choices
⚠️ **CONCERNS**: [List technology concerns]
❌ **FAIL**: [Inappropriate technology choices]

**Details:**
- Stack alignment: [Consistent/Mixed/Inconsistent]
- New technologies: [Justified/Questionable/Unjustified]
- Dependency count: [Reasonable/High/Excessive]
- Licensing: [Compatible/Needs review/Incompatible]
- Support: [Active/Uncertain/Deprecated]

**Technology rationale:**
- [Tech 1]: [Why appropriate for this use case]
- [Tech 2]: [Why appropriate for this use case]

### Risk Assessment
✅ **PASS**: Risks identified and mitigated
⚠️ **CONCERNS**: [List risk concerns]
❌ **FAIL**: [Critical unmitigated risks]

**Risk coverage:**
- Technical risks: [Identified/Partial/Missing]
- Scope risks: [Mitigated/Acknowledged/Ignored]
- Timeline risks: [Planned for/Tight/Unrealistic]
- Critical risks: [All mitigated/Some unmitigated/Many unmitigated]

**High-priority risks:**
1. [Risk]: [Likelihood] - [Mitigation approach]
2. [Risk]: [Likelihood] - [Mitigation approach]

### Technical Questions
1. [Technical clarification needed]
2. [Architecture decision to explain]

### Recommendation
- ✅ **PROCEED TO TIER 3**: Architecture and tech are sound
- ⚠️ **CONDITIONAL**: Address concerns before Tier 3
- ❌ **REWORK REQUIRED**: Architectural changes needed

**If conditional, required actions:**
1. [Action to address concern]
2. [Action to address concern]
```

## Common Issues

### Architecture Issues
**Issue**: Plan violates existing layering (UI calls database directly)
**Fix**: Require proper layering (UI → Service → Repository)

**Issue**: Unclear how new component integrates
**Fix**: Add integration diagram and API contracts

**Issue**: Circular dependencies between components
**Fix**: Restructure to remove cycles

### Technology Issues
**Issue**: Adding new framework for single feature
**Fix**: Use existing framework or justify why new one needed

**Issue**: Dependency on abandoned library
**Fix**: Find maintained alternative

**Issue**: GPL library in commercial product
**Fix**: Find compatible license or get legal approval

### Risk Issues
**Issue**: "Mitigation: hope it doesn't happen"
**Fix**: Require real mitigation (fallback, monitoring, testing)

**Issue**: Critical path has no backup plan
**Fix**: Add contingency or reduce risk

**Issue**: Risk log is empty
**Fix**: Require risk identification session

## Integration

**Feeds into:**
- plan-review-tier3 (if approved)
- plan-refiner (if rework needed)

**Requires input from:**
- plan-review-tier1 (must pass Tier 1 first)
- getting-the-bigger-picture (for architecture context)
- pattern-discovery (for existing patterns)
