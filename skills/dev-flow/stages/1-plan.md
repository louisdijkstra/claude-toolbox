---
name: plan-stage
description: Define clear goals, deliverables, dependencies, and success criteria before starting implementation
---

# Stage 1: Plan

## Purpose

Establish complete clarity on what's being built, why, and how success will be measured. Prevents wasted effort and scope creep by defining concrete deliverables upfront.

## When to Use

**Required for:**
- All development work (every mode starts with planning)
- Beginning any work session
- Returning to work after break/interruption
- Unclear or ambiguous tasks

**Even quick fixes** need minimal planning (3 minutes in Quick Fix Mode)

## Time Investment

**By mode:**
- **Deep Work Mode**: 10 minutes (comprehensive)
- **Quick Fix Mode**: 3 minutes (minimal)
- **Collaboration Mode**: 10 minutes (extra clarity for team)
- **Debugging Mode**: 5 minutes (frame the investigation)

**Time well spent**: 10 minutes of planning saves hours of rework

## Objectives

At the end of planning stage, you should have:
1. **Clear goal**: One-sentence description of what we're building
2. **Concrete deliverables**: Specific, testable outputs
3. **Dependencies identified**: What must exist or be done first
4. **Success criteria**: How we'll know it's done correctly
5. **Time estimate**: Realistic duration for the work

## Planning Process

### Step 1: Define the Goal (2 minutes)

**Write one sentence describing what we're building**

**Good goals:**
- "Add CSV export button to analytics dashboard"
- "Fix form submission failure on production"
- "Refactor API client to use async/await"
- "Reduce dashboard load time from 5s to <2s"

**Poor goals (too vague):**
- "Improve user experience"
- "Make it faster"
- "Fix the bug"
- "Update the code"

**Template:**
```markdown
# Work Session: [Short Title]

## Goal
[One clear sentence: what we're building/fixing/improving]
```

**Test**: Can someone else understand exactly what we're doing from this one sentence?

### Step 2: List Deliverables (2 minutes)

**Identify concrete, testable outputs**

**Good deliverables:**
- [ ] ExportButton component with click handler
- [ ] CSVService utility with export() function
- [ ] Unit tests for CSV format validation
- [ ] Integration test for full export flow
- [ ] README updated with export feature docs

**Poor deliverables (not concrete):**
- [ ] Better performance
- [ ] Improved UI
- [ ] Fixed bug

**Template:**
```markdown
## Deliverables
- [ ] [Specific file/component/function to create]
- [ ] [Specific file/component/function to modify]
- [ ] [Specific tests to add]
- [ ] [Specific documentation to update]
```

**Test**: Each deliverable should be checkable (done or not done)

### Step 3: Identify Dependencies (2 minutes)

**List what must exist or be ready before we can complete this work**

**Types of dependencies:**
- **Files**: Existing code we'll build on
- **APIs**: External services we'll call
- **Data**: Database tables, test data
- **People**: Reviews, approvals, coordination
- **Environment**: Config, credentials, access

**Template:**
```markdown
## Dependencies
**Code dependencies**:
- [File/module that must exist]
- [API endpoint we'll use]

**Team dependencies**:
- [Person to get approval from]
- [Team to coordinate with]

**Environment dependencies**:
- [Config needed]
- [Credentials needed]
- [Access required]

**Blockers** (dependencies we don't have yet):
- [What's blocking us]
- [How to unblock]
```

**Test**: Can we start work immediately, or are we blocked?

### Step 4: Define Success Criteria (2 minutes)

**How will we know it's done correctly?**

**Good success criteria:**
- [ ] All tests passing (100%)
- [ ] User can download CSV with all visible data
- [ ] CSV opens correctly in Excel
- [ ] No regressions in existing functionality
- [ ] Load time <2 seconds (measured with Chrome DevTools)
- [ ] Code passes linting with no errors

**Poor success criteria:**
- [ ] It works
- [ ] Users are happy
- [ ] No bugs

**Template:**
```markdown
## Success Criteria
**Functional**:
- [ ] [Specific functionality works]
- [ ] [Specific edge case handled]

**Quality**:
- [ ] All tests passing
- [ ] No regressions detected
- [ ] Code passes linting

**Performance** (if applicable):
- [ ] [Metric] < [threshold]

**Project-specific**:
- [ ] [Follows project conventions]
- [ ] [Documentation updated]
```

**Test**: Could someone else verify these criteria objectively?

### Step 5: Estimate Time (2 minutes)

**How long will this actually take?**

**Estimation approach:**
- Break down by deliverable
- Add buffer for unknowns (20-30%)
- Be realistic, not optimistic

**Template:**
```markdown
## Time Estimate
**By deliverable**:
- Component creation: [X] min
- Tests: [Y] min
- Documentation: [Z] min
- Buffer (30%): [W] min

**Total: [X+Y+Z+W] minutes**

**Mode**: [Deep Work / Quick Fix / Collaboration / Debugging]
**Session length**: [Duration needed]
```

**Common mistakes:**
- Forgetting test time
- Forgetting documentation time
- No buffer for unknowns
- Assuming perfect execution

**Reality check:**
```
Simple change (1 file, few lines): 15-30 min
Small feature (2-3 files, tests): 45-90 min
Medium feature (multiple components): 2-4 hours
Complex feature (architecture change): 4-8 hours
```

## Output Templates

### Deep Work Mode Plan

```markdown
# Deep Work Session: [Feature Name]

## Goal
[Clear one-sentence description]

## Deliverables
- [ ] [Component/file 1]
- [ ] [Component/file 2]
- [ ] [Tests]
- [ ] [Documentation]

## Dependencies
**Code dependencies**:
- [Existing modules we'll use]
- [APIs we'll call]

**Blockers**: [None / List blockers]

## Success Criteria
- [ ] All tests passing
- [ ] [Specific functionality works]
- [ ] No regressions
- [ ] [Project-specific criterion]

## Time Estimate
- Plan: 10 min
- Design: 20 min
- Implement: [X] min
- Test: 20 min
- Review: 10 min
- Integrate: 5 min
**Total: [X+65] minutes**
```

### Quick Fix Mode Plan

```markdown
# Quick Fix: [Issue Name]

## Goal
[One sentence: what we're fixing]

## Files to Change
- [file1]: [Specific change]
- [file2]: [Specific change]

## Success
- [ ] [Simple test: what should work]
- [ ] No regressions

## Time: ~[20-45] minutes
```

### Collaboration Mode Plan

```markdown
# Collaboration Session: [Feature Name]

## Goal
[Clear description]

## Team Context
**Who's affected**: [List team members/teams]
**Dependencies on others**: [What we need from whom]
**Impact on others**: [Who depends on this]

## Deliverables
- [ ] [Deliverable 1]
- [ ] [Deliverable 2]

## Assumptions to Validate
- [ ] [Assumption 1] (confirm with [person])
- [ ] [Assumption 2] (confirm with [person])

## Coordination Points
- After Design: Get feedback from [person]
- After Test: Notify [person]
- Before Merge: Coordinate with [person]

## Success Criteria
- [ ] Tests passing
- [ ] Team reviewed and approved
- [ ] [Project-specific criterion]

## Time Estimate
[Breakdown by stage]
```

### Debugging Mode Plan

```markdown
# Debugging Session: [Issue Summary]

## Symptom
[What's actually happening - observable behavior only]

## Expected Behavior
[What should happen]

## Initial Evidence
- Reported by: [who/where]
- Frequency: [always/intermittent/rare]
- Environment: [prod/staging/dev]
- First seen: [when]
- Related changes: [recent deployments/commits]

## Investigation Scope
- Time budget: [X minutes]
- Components to investigate: [list]
- Out of scope: [what we won't investigate]

## Success Criteria
- [ ] Root cause identified
- [ ] Reproducible locally
- [ ] Fix implemented and tested
- [ ] No regressions introduced
```

## Common Mistakes

### Mistake: Goal is too vague
**Problem**: "Improve dashboard"
**Fix**: "Reduce dashboard load time from 5s to <2s by optimizing API queries"

### Mistake: Deliverables not concrete
**Problem**: "Better code"
**Fix**: "Refactored UserService with async/await, added error handling"

### Mistake: Missing dependencies
**Problem**: Start coding, discover needed API doesn't exist
**Fix**: List all dependencies first, identify blockers before starting

### Mistake: Success criteria not measurable
**Problem**: "It works"
**Fix**: "User can export CSV, file opens in Excel, all data present"

### Mistake: No time estimate
**Problem**: Work drags on for hours unexpectedly
**Fix**: Estimate time, use as reality check (if estimate is way off, rethink approach)

### Mistake: Planning too shallow
**Problem**: "I know what to do, let me just start coding"
**Result**: Discovers issues mid-implementation, wastes time
**Fix**: Spend full time allocation on planning (10 min for Deep Work, 3 min for Quick Fix)

## Completion Gate

**Before moving to Design/Implement stage, verify:**
- [ ] Goal is one clear sentence
- [ ] Deliverables are concrete and testable
- [ ] Dependencies identified (no hidden blockers)
- [ ] Success criteria are measurable
- [ ] Time estimate is realistic
- [ ] Understand what we're building and why

**If unclear**: Spend more time planning or ask clarifying questions

**Don't proceed** if:
- Goal is still vague
- Don't know what files to change
- Blocked on dependencies
- Can't define success criteria
- No idea how long it will take

## When to Re-Plan

**Re-plan if:**
- Scope changes mid-implementation
- Discover unexpected complexity
- Uncover hidden dependencies
- Original estimate way off (>2x)
- Requirements clarified by stakeholder

**How to re-plan:**
1. Pause implementation
2. Document what's changed
3. Update plan with new information
4. Get alignment if working with team
5. Resume with updated plan

## Examples

### Example 1: Feature Addition

```markdown
# Deep Work Session: CSV Export Feature

## Goal
Users can export analytics data as CSV file from dashboard

## Deliverables
- [ ] ExportButton component (src/components/ExportButton.tsx)
- [ ] CSVService utility (src/services/CSVService.ts)
- [ ] Integration in AnalyticsDashboard (src/pages/AnalyticsDashboard.tsx)
- [ ] Unit tests for CSVService (tests/CSVService.test.ts)
- [ ] Component tests for ExportButton (tests/ExportButton.test.tsx)
- [ ] Integration test for full flow (tests/integration/export.test.ts)
- [ ] README updated with export feature

## Dependencies
**Code dependencies**:
- AnalyticsDashboard component (exists)
- Analytics API endpoint (exists: GET /api/analytics)
- Redux store with analytics data (exists)

**Blockers**: None

## Success Criteria
- [ ] All tests passing (100%)
- [ ] User can click export button
- [ ] CSV file downloads with all visible data
- [ ] CSV opens correctly in Excel
- [ ] No regressions in existing dashboard
- [ ] Special characters in data are escaped properly

## Time Estimate
- Plan: 10 min
- Design: 20 min
- Implement: 90 min (3 components + utils)
- Test: 20 min (automated + manual)
- Review: 10 min
- Integrate: 5 min
**Total: 155 minutes (~2.5 hours)**

**Mode**: Deep Work Mode
```

### Example 2: Bug Fix

```markdown
# Quick Fix: Submit Button Not Working

## Goal
Fix form submission failure on production

## Files to Change
- src/components/Form.tsx: Fix event handler
- tests/Form.test.tsx: Add regression test

## Success
- [ ] Submit button submits form
- [ ] Test catches this bug
- [ ] No regressions

## Time: ~30 minutes
```

### Example 3: Investigation

```markdown
# Debugging Session: Dashboard Loading Slowly

## Symptom
Dashboard takes 15 seconds to load (was 2 seconds last week)

## Expected Behavior
Dashboard should load in <3 seconds

## Initial Evidence
- Reported by: Multiple users in #support
- Frequency: Always (all users affected)
- Environment: Production only (staging is fine)
- First seen: 2 hours ago, after v2.3.0 deploy
- Related changes: Added user activity tracking in v2.3.0

## Investigation Scope
- Time budget: 90 minutes
- Components to investigate:
  - Dashboard API endpoint performance
  - Database queries
  - Network latency
- Out of scope: Frontend rendering (profiled, is fast)

## Success Criteria
- [ ] Root cause identified
- [ ] Reproducible in dev/staging
- [ ] Fix implemented and tested
- [ ] Load time <3 seconds
- [ ] No regressions
```

## Integration with Other Stages

**Feeds into:**
- **Design stage**: Uses plan as input for design decisions
- **Implement stage**: Deliverables guide implementation
- **Test stage**: Success criteria guide testing
- **Review stage**: Checks against original plan
- **Integrate stage**: Verifies all deliverables complete

**Informed by:**
- **Ticket/requirements**: Original request or bug report
- **Context manager**: Previous session state
- **Team communication**: Stakeholder input

## Tips for Better Planning

**Do:**
- Write plan down (don't keep in head)
- Be specific about deliverables
- Identify blockers early
- Set measurable success criteria
- Estimate realistically (with buffer)
- Re-plan when scope changes

**Don't:**
- Rush through planning to start coding
- Skip planning for "obvious" tasks
- Plan and design simultaneously (separate stages)
- Commit to unrealistic timeline
- Ignore dependencies
- Keep plan vague to maintain flexibility
