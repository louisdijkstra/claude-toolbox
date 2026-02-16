---
name: plan-review-tier3
description: Tier 3 plan review - validates effort estimates and timeline feasibility
---

# Plan Review - Tier 3: Estimates & Timeline

## Purpose

Third-tier review that validates effort estimates, timeline, and resource planning. Assumes Tiers 1-2 approved scope and architecture.

## Review Focus

### Effort Estimation Review (10-15 minutes)

**What to validate:**
- [ ] Component estimates are realistic (not overly optimistic)
- [ ] Buffer is adequate (20-30% for unknowns)
- [ ] Testing effort is included
- [ ] Documentation effort is included
- [ ] Integration/debugging time accounted for
- [ ] No obvious omissions

**Red flags:**
- Estimates assume perfect execution (no buffer)
- Missing test/doc/integration time
- Estimates don't match component complexity
- First-time technology with same estimate as familiar tech
- Round numbers without justification (exactly 5 days)

**Estimation reality check:**
```markdown
| Component | Complexity | Estimate | Reality Check |
|-----------|-----------|----------|---------------|
| [Name] | [Simple/Medium/Complex] | [X days] | ✅ Realistic / ⚠️ Tight / ❌ Unrealistic |
```

### Timeline Review (5-10 minutes)

**What to validate:**
- [ ] Phases are logical and sequential
- [ ] Dependencies are sequenced properly
- [ ] Parallel work is actually parallelizable
- [ ] Critical path is identified
- [ ] Milestones are clear and measurable
- [ ] Final deadline is achievable
- [ ] Contingency time exists

**Red flags:**
- Dependencies out of order (tests before code)
- Assuming perfect parallelism (4 people = 4x speed)
- No critical path analysis
- Milestones are vague ("mostly done")
- No slack time for issues
- Deadline before work can finish

### Resource Planning Review (5-10 minutes)

**What to validate:**
- [ ] Team capacity is realistic
- [ ] Expertise is available or learning time included
- [ ] Dependencies on other teams are managed
- [ ] No resource conflicts/double-booking
- [ ] Vacation/holidays accounted for
- [ ] Context switching overhead considered

**Red flags:**
- Assuming 100% capacity (no meetings, no other work)
- Skills gap without training plan
- Depending on unavailable team members
- Concurrent commitments ignored
- No capacity for reviews/iterations

## Output Format

```markdown
## Tier 3: Estimates & Timeline Review

### Effort Assessment
✅ **PASS**: Realistic estimates with adequate buffer
⚠️ **CONCERNS**: [List estimation concerns]
❌ **FAIL**: [Unrealistic or incomplete estimates]

**Estimate analysis:**
| Component | Complexity | Estimate | Buffer | Assessment |
|-----------|-----------|----------|---------|------------|
| [Component 1] | [Level] | [X days] | [Y days] | ✅/⚠️/❌ + comment |
| [Component 2] | [Level] | [X days] | [Y days] | ✅/⚠️/❌ + comment |

**Coverage check:**
- Implementation: ✅ Included
- Testing: ✅/❌ [time allocated]
- Documentation: ✅/❌ [time allocated]
- Integration: ✅/❌ [time allocated]
- Buffer: ✅/❌ [percentage]

**Total effort:**
- Base estimate: [X] days
- Buffer: [Y] days ([Z]%)
- **Total: [X+Y] days**

### Timeline Assessment
✅ **PASS**: Achievable timeline with proper sequencing
⚠️ **CONCERNS**: [List timeline concerns]
❌ **FAIL**: [Unachievable or poorly sequenced]

**Phase analysis:**
| Phase | Duration | Dependencies | Parallelizable | Assessment |
|-------|----------|--------------|----------------|------------|
| [Phase 1] | [X days] | [None/List] | ✅/❌ | ✅/⚠️/❌ + comment |
| [Phase 2] | [Y days] | [Phase 1] | ✅/❌ | ✅/⚠️/❌ + comment |

**Critical path:**
- [Phase 1] → [Phase 2] → [Phase 3]
- Total: [X] days
- Deadline: [Date]
- Margin: [Y days] ✅ Adequate / ⚠️ Tight / ❌ Insufficient

**Risk factors:**
- Dependencies: ✅ Properly sequenced / ⚠️ Some issues / ❌ Major conflicts
- Parallelism: ✅ Realistic / ⚠️ Optimistic / ❌ Impossible
- Milestones: ✅ Clear / ⚠️ Vague / ❌ Missing

### Resource Assessment
✅ **PASS**: Resources available and properly allocated
⚠️ **CONCERNS**: [List resource concerns]
❌ **FAIL**: [Resource conflicts or gaps]

**Team capacity:**
| Team Member | Role | Availability | Allocation | Conflicts |
|-------------|------|--------------|------------|-----------|
| [Name] | [Role] | [%] | [% on this] | ✅ None / ⚠️ [List] |

**Expertise coverage:**
- [Skill 1]: ✅ Available / ⚠️ Learning needed / ❌ Gap
- [Skill 2]: ✅ Available / ⚠️ Learning needed / ❌ Gap

**External dependencies:**
- [Team/Service]: ✅ Committed / ⚠️ Tentative / ❌ Unavailable

### Questions for Estimation
1. [Clarification on estimate for X]
2. [Question about resource Y]

### Recommendation
- ✅ **PLAN APPROVED**: Estimates realistic, timeline achievable, resources available
- ⚠️ **CONDITIONAL APPROVAL**: Address concerns below
- ❌ **REWORK REQUIRED**: Estimates or timeline need major revision

**If conditional, required actions:**
1. [Action to address concern]
2. [Action to address concern]
```

## Common Issues & Fixes

### Estimation Issues

**Issue**: 2 days for complex ML feature (first time using ML)
```markdown
Problem: No learning curve, no experimentation time
Fix: 10 days (2 days learning, 3 days experimentation, 3 days implementation, 2 days tuning)
Rationale: ML requires iteration and tuning, not just coding
```

**Issue**: No buffer for any component
```markdown
Problem: Assumes perfect execution
Fix: Add 20-30% buffer: 10 days base → 13 days with buffer
Rationale: Always have unknowns, bugs, integration issues
```

**Issue**: Testing time not included
```markdown
Problem: "We'll test as we go" (but no time allocated)
Fix: Add explicit testing time: 30-40% of development time
Rationale: Proper testing takes time, can't be zero-cost
```

### Timeline Issues

**Issue**: Tests scheduled before implementation
```markdown
Problem: Dependency sequence is backwards
Fix: Reorder phases: Implementation → Testing → Integration
Rationale: Can't test what doesn't exist yet
```

**Issue**: Assuming 4 people = 4x faster
```markdown
Problem: Ignoring communication overhead
Fix: Account for coordination: 4 people ~2.5x speed, not 4x
Rationale: Brooks's Law - adding people adds coordination cost
```

**Issue**: Critical path has zero slack
```markdown
Problem: Any delay causes missed deadline
Fix: Add buffer to critical path or move deadline
Rationale: Critical path determines success, must have margin
```

### Resource Issues

**Issue**: Assuming 100% capacity
```markdown
Problem: No time for meetings, reviews, other work
Fix: Use 70-80% capacity for planning
Rationale: People have other responsibilities
```

**Issue**: Key expert unavailable
```markdown
Problem: Plan depends on unavailable person
Fix: Add training time for others or adjust scope
Rationale: Single point of failure is risky
```

**Issue**: Skills gap ignored
```markdown
Problem: Team doesn't know required technology
Fix: Add learning time or use familiar technology
Rationale: Learning curve is real and takes time
```

## Estimation Guidelines

### Simple Component (1-2 days base)
- Well-understood technology
- Similar to existing code
- Clear requirements
- Few integration points

### Medium Component (3-5 days base)
- Familiar technology, new use case
- Some existing patterns to follow
- Some unknowns in requirements
- Multiple integration points

### Complex Component (5-10+ days base)
- New technology or approach
- No existing patterns
- Many unknowns
- Complex integrations
- High risk/uncertainty

### Buffer Guidelines
- Well-known domain: 20% buffer
- Some unknowns: 30% buffer
- High uncertainty: 50% buffer
- First-time technology: 100%+ buffer

### Capacity Guidelines
- Individual contributor: 70-80% capacity
- Senior/lead: 60-70% capacity (more meetings)
- Manager: 40-50% capacity for hands-on work
- Across team members: Plan for vacations, sick days

## Integration

**Requires input from:**
- plan-review-tier1 (must pass Tier 1)
- plan-review-tier2 (must pass Tier 2)
- getting-the-bigger-picture (for team/resource context)

**Feeds into:**
- plan-review-report (final approval)
- plan-refiner (if conditional/rework)
- dev-flow (approved plan becomes work plan)

**Approval flow:**
```
Tier 1 ✅ → Tier 2 ✅ → Tier 3 ✅ → APPROVED
                ↓           ↓           ↓
            plan-refiner (if ⚠️ or ❌)
```
