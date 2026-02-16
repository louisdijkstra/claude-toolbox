---
name: dev-workflow-flow
description: Execute efficient daily development workflow with clear stages and operational modes. Maintains momentum through planning, implementation, testing, and integration. Use to structure work sessions and coordinate multi-step development tasks.
---

# Dev Flow

## Purpose

Structure daily development work through clear, repeatable stages. Maintain momentum, minimize context switching, and ensure work integrates properly with the rest of the codebase.

## When to Use This Skill

Use this skill when:
- Starting a development work session
- Need to structure multi-hour work
- Coordinating multiple implementation tasks
- Returning from break (lunch, next day)
- Work spans multiple stages (plan → code → test → review)
- Need checklist to stay on track

**Do NOT use for:**
- Quick one-off fixes (direct approach)
- Individual task details (use specific skills)
- Strategic planning (use project-inception)
- Emergency hotfixes (skip to fix directly)

**If uncertain:** Use this skill for work sessions lasting 30+ minutes or involving multiple stages. Skip for quick fixes under 15 minutes.

## Development Stages

Development flows through these stages in order:

**Stage 1: Plan** (5-15 minutes)
- Clarify what's being built
- Identify dependencies
- List concrete deliverables
- Define success criteria

**Stage 2: Design** (10-30 minutes)
- Sketch implementation approach
- Identify test strategy
- Check for conflicts
- Get feedback if complex

**Stage 3: Implement** (varies)
- Write code following TDD
- Commit incrementally
- Keep tests passing

**Stage 4: Test** (10-30 minutes)
- Run full test suite
- Manual verification
- Check edge cases
- Verify no regressions

**Stage 5: Review** (5-15 minutes)
- Self-review code quality
- Check against guidelines
- Verify documentation
- Ready for merge

**Stage 6: Integrate** (5-10 minutes)
- Create/update PR
- Ensure CI passes
- Coordinate with team
- Merge when ready

## Operational Modes

### Mode 1: Deep Work Mode (3+ hours available)

**Best for:** Major features, significant refactors, complex fixes

**Structure:**
```
1. Plan (10 min) - Clarify goal completely
2. Design (20 min) - Sketch full approach
3. Implement (60-120 min) - Code with TDD
4. Test (20 min) - Full verification
5. Review (10 min) - Quality check
6. Integrate (5 min) - Commit/push
```

**Key practices:**
- No interruptions
- Commit every 15-20 minutes
- Take 5-minute breaks between stages
- Document decisions as you go

### Mode 2: Quick Fix Mode (< 1 hour)

**Best for:** Bug fixes, small feature additions, documentation

**Structure:**
```
1. Plan (3 min) - One sentence goal
2. Implement (15-30 min) - Make change
3. Test (5 min) - Quick verification
4. Integrate (2 min) - Commit/push
```

**Key practices:**
- Skip design phase
- One focused change only
- Minimal testing (critical path only)
- Commit directly if trivial

### Mode 3: Collaboration Mode (coordinating with others)

**Best for:** Coordination across team, shared codebase

**Structure:**
```
1. Plan (10 min) - Define scope clearly
2. Design (10 min) - Get feedback on approach
3. Implement (30-60 min) - Code independently
4. Test (10 min) - Thorough verification
5. Review (5 min) - Self review
6. Integrate (10 min) - Coordinate with team
```

**Key practices:**
- Extra clarity in documentation
- Sync at stage boundaries
- Get design feedback early
- Document assumptions
- Coordinate timing with team

### Mode 4: Debugging Mode (investigating issues)

**Best for:** Investigating complex issues, root cause analysis

**Structure:**
```
1. Plan (5 min) - Define what we're investigating
2. Research (30-60 min) - Understand issue deeply
3. Verify (15 min) - Reproduce and test theories
4. Fix (20-30 min) - Implement minimal fix
5. Test (10 min) - Ensure no regressions
6. Document (5 min) - Write root cause analysis
```

**Key practices:**
- Use dev-workflow-debug skill
- Test each theory independently
- Keep fix minimal and focused
- Document findings for future

## Process

### Step 1: Stage 1 - Plan

Define what you're building and success criteria.

```markdown
# Work Session: [Task Name]

## What Are We Building?
[Clear one-sentence description]

## Deliverables
- [ ] [Concrete deliverable 1]
- [ ] [Concrete deliverable 2]

## Dependencies
- [File/module that must exist]
- [External service needed]

## Success Criteria
- [ ] Tests passing
- [ ] No regressions
- [ ] [Project-specific criterion]

## Estimated Duration
[Time in minutes/hours]
```

### Step 2: Stage 2 - Design

Sketch implementation approach and test strategy.

```markdown
## Implementation Approach
[How will we build this?]

## Files to Create/Modify
- [file1.py]: [What changes]
- [file2.ts]: [What changes]

## Test Strategy
- [ ] Unit tests for: [what]
- [ ] Integration tests for: [what]
- [ ] Manual verification: [what]

## Potential Issues
- [Potential issue]: [How to avoid]
- [Potential issue]: [How to avoid]

## Approval Gate
If complex: [ ] Get feedback before proceeding
```

### Step 3: Stage 3 - Implement

Execute implementation using TDD.

- Use dev-workflow-tdd or dev-workflow-test-driven skill
- Commit at logical checkpoints
- Keep tests passing continuously
- Document code as you write

### Step 4: Stage 4 - Test

Verify implementation works correctly.

```bash
# Run all tests
pytest  # or npm test

# Check coverage
pytest --cov=src tests/

# Manual verification
# [Check specific functionality]

# Regression verification
# [Run critical path tests]
```

### Step 5: Stage 5 - Review

Self-review code quality and documentation.

```bash
# Self-review code
git diff main...HEAD

# Check code quality
# [Run linters, formatters]

# Verify documentation
# [Update comments if needed]

# Check against project guidelines
# [Follow CLAUDE.md conventions]
```

### Step 6: Stage 6 - Integrate

Create PR and coordinate merge.

```bash
# Create PR if needed
gh pr create --title "..." --body "..."

# Ensure CI passes
git push

# Merge when ready
gh pr merge
```

## Stage Transitions

At stage boundaries, verify:
- [ ] Previous stage complete and verified
- [ ] Deliverables documented
- [ ] Ready to move forward
- [ ] No surprises or blockers

**If blocked in a stage:**
1. Document what's blocking
2. Try to unblock (search docs, ask questions)
3. If unblockable, escalate to next planning session
4. Move to different task if possible

## Response Pattern

When structuring a dev session:

```
**Task**: [What are we building?]

**Stage 1: Plan**
- Deliverables: [What will be done]
- Success criteria: [How we know it's done]
- Estimated time: [Duration]

**Stage 2: Design**
- Approach: [How we'll build it]
- Files to change: [What changes]
- Test strategy: [How we'll verify]

**Stage 3+: Execute**
[Follow through implementation...]

**Tracking Progress**
- [ ] Plan complete
- [ ] Design reviewed
- [ ] Implementation done
- [ ] Tests passing
- [ ] Self-review complete
- [ ] Ready to integrate
```

## Example: Deep Work Session

**Task**: Add analytics export feature

**Stage 1: Plan** (10 min)
- Deliverable: Export analytics data to CSV
- Success: User can download CSV, contains all visible data
- Time: ~90 minutes

**Stage 2: Design** (15 min)
- Create ExportButton component
- Implement CSV generation utility
- Use existing analytics data APIs
- Test: Unit test CSV format + manual download

**Stage 3: Implement** (60 min)
- TDD: Write tests first
- Implement component
- Implement utility
- Keep tests passing

**Stage 4: Test** (15 min)
- All tests passing
- Manual download verification
- Check edge cases (empty data, large dataset)

**Stage 5: Review** (5 min)
- Code style check
- Documentation review

**Stage 6: Integrate** (5 min)
- Create PR with clear description
- Push and verify CI

## Integration with Development

This skill coordinates with:
- **review-plan**: Get feedback at stage boundaries
- **dev-workflow-tdd**: Used during Stage 3 (Implement)
- **dev-workflow-test-driven**: Alternative for Stage 3
- **review-critical**: Used during Stage 5 (Review)
- **docs-context**: Track progress across stages
- **dev-workflow-debug**: For Debugging Mode

## Common Pitfalls to Avoid

**Don't:**
- Skip stages to go faster (creates rework)
- Plan and design simultaneously (confusing)
- Test only at the end (finds too many issues)
- Commit without running tests (breaks CI)
- Skip documentation (future confusion)

**Do:**
- Complete one stage before moving to next
- Document decisions as you go
- Run tests after each code change
- Commit at logical checkpoints
- Use mode matching your constraints
