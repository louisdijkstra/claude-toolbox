---
name: debugging-mode
description: Structured investigation and resolution of complex bugs through hypothesis-driven testing and root cause analysis
---

# Debugging Mode

## Purpose

Systematically investigate and resolve complex bugs through structured analysis, hypothesis testing, and minimal fixes. Emphasizes understanding root cause before implementing solutions.

## When to Use

**Best for:**
- Complex bugs with unclear cause
- Intermittent/hard-to-reproduce issues
- Performance problems requiring profiling
- Regressions without obvious trigger
- Production issues requiring root cause analysis
- Bugs spanning multiple components
- Issues requiring deep code investigation

**Don't use for:**
- Simple, obvious bugs (use Quick Fix Mode)
- Well-understood fixes (use Quick Fix Mode)
- Regressions with known cause (use Quick Fix Mode)

## Time Structure

**Total duration**: 60-120 minutes

**Stage breakdown:**
```
1. Plan      (5 min)   - Define what we're investigating
2. Research  (30-60 min) - Understand issue deeply
3. Verify    (15 min)  - Reproduce and test theories
4. Fix       (20-30 min) - Implement minimal fix
5. Test      (10 min)  - Ensure no regressions
6. Document  (5 min)   - Write root cause analysis
```

**Note**: Research stage is significantly longer than other modes

## Workflow

### Stage 1: Plan (5 minutes)

**Objective**: Frame the investigation clearly

**Activities:**
- Describe the symptom (not assumed cause)
- Gather initial evidence
- Define success criteria for investigation
- Scope the debugging effort

**Output template:**
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

**Example:**
```markdown
# Debugging Session: Users Can't Submit Forms

## Symptom
Submit button click does nothing, form doesn't submit

## Expected Behavior
Form should submit to API, show success message

## Initial Evidence
- Reported by: 3 users on support channel
- Frequency: Intermittent (works for some users)
- Environment: Production only
- First seen: 2 hours ago (after deploy)
- Related changes: v2.1.3 deployed 3 hours ago

## Investigation Scope
- Time budget: 90 minutes
- Components: Form component, API client, network layer
- Out of scope: Backend API (working for API tests)
```

**Completion gate:**
- [ ] Symptom clearly described
- [ ] Evidence gathered
- [ ] Scope defined
- [ ] Ready to investigate

### Stage 2: Research (30-60 minutes)

**Objective**: Understand the issue deeply through systematic investigation

**Sub-stages:**

#### 2a. Reproduce (10-15 min)

**Goal**: Make the bug happen reliably

**Steps:**
1. Try to reproduce with minimal steps
2. Identify conditions required
3. Document reproduction steps
4. Create test case if possible

**Reproduction documentation:**
```markdown
## Reproduction

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Result
[What happens]

### Environment Details
- Browser: [if applicable]
- Data state: [specific data required]
- Configuration: [relevant config]

### Reproduction Rate
[100% / X% / cannot reproduce locally]
```

**If cannot reproduce:**
- Gather more evidence (logs, screenshots)
- Try different environments
- Check for environment-specific config
- Consider data-dependent issue

#### 2b. Gather Evidence (10-15 min)

**Goal**: Collect all relevant information

**Sources:**
- **Logs**: Error logs, application logs, network logs
- **Error messages**: Stack traces, error codes
- **Network**: API calls, responses, timing
- **State**: Application state, database state
- **Timeline**: What changed recently

**Evidence log:**
```markdown
## Evidence

### Error Messages
\`\`\`
[Stack trace or error message]
\`\`\`

### Logs
- [Timestamp]: [Log entry]
- [Timestamp]: [Log entry]

### Network Activity
- API call to [endpoint]: [status code] [timing]

### Recent Changes
- [Commit/deploy]: [What changed]

### System State
- [Relevant state information]
```

#### 2c. Form Hypotheses (5-10 min)

**Goal**: List possible causes from most to least likely

**Hypothesis template:**
```markdown
## Hypotheses (most likely first)

1. **[Hypothesis 1]**: [Theory about root cause]
   - Likelihood: High/Medium/Low
   - Evidence for: [Supporting evidence]
   - Evidence against: [Conflicting evidence]
   - Test: [How to verify/disprove]

2. **[Hypothesis 2]**: [Theory about root cause]
   - Likelihood: High/Medium/Low
   - Evidence for: [Supporting evidence]
   - Evidence against: [Conflicting evidence]
   - Test: [How to verify/disprove]
```

**Example:**
```markdown
## Hypotheses

1. **Event handler not attached**: Button click handler missing
   - Likelihood: High
   - Evidence for: No console logs from click handler
   - Evidence against: Code looks correct
   - Test: Add console.log to click handler

2. **API client broken**: Network call failing silently
   - Likelihood: Medium
   - Evidence for: Recent API client refactor
   - Evidence against: Other forms work
   - Test: Check network tab for failed requests

3. **State issue**: Form state preventing submission
   - Likelihood: Low
   - Evidence for: Works for some users
   - Evidence against: No state changes in recent deploy
   - Test: Check Redux DevTools state
```

#### 2d. Test Hypotheses (10-20 min)

**Goal**: Systematically verify/disprove each hypothesis

**Testing approach:**
```markdown
## Hypothesis Testing

### Test 1: [Hypothesis to test]
**Method**: [How we'll test]
**Expected if true**: [What we'll see]
**Expected if false**: [What we'll see]

**Result**: [What actually happened]
**Conclusion**: ✅ Confirmed / ❌ Disproved / ❓ Unclear

### Test 2: [Next hypothesis]
[Same structure]
```

**Example:**
```markdown
## Hypothesis Testing

### Test 1: Event handler not attached
**Method**: Add console.log('clicked') to button handler
**Expected if true**: No console output on click
**Expected if false**: Console shows 'clicked'

**Result**: Console shows 'clicked' - handler is attached!
**Conclusion**: ❌ Disproved - handler works

### Test 2: API client broken
**Method**: Check network tab for API calls
**Expected if true**: No network call or failed call
**Expected if false**: Successful API call

**Result**: API call shows 404 error!
**Conclusion**: ✅ Root cause found - API endpoint wrong
```

**Test until finding root cause or exhausting hypotheses**

**Completion gate:**
- [ ] Issue reproduced (or strong evidence gathered)
- [ ] Evidence collected
- [ ] Hypotheses formed and tested
- [ ] Root cause identified (or narrowed down)

### Stage 3: Verify (15 minutes)

**Objective**: Confirm root cause and test potential fix

**Activities:**
1. **Confirm root cause** (5 min)
   - Verify hypothesis explains all symptoms
   - Check if fix will address root cause
   - Ensure no other contributing factors

2. **Design minimal fix** (5 min)
   - Smallest change to fix root cause
   - No refactoring or improvements
   - Address only this issue

3. **Predict side effects** (5 min)
   - What else might this change affect?
   - Are there edge cases?
   - Will this fix break anything?

**Verification template:**
```markdown
## Root Cause Verification

### Confirmed Root Cause
[Precise description of what's wrong]

### Why This Explains All Symptoms
- Symptom 1: [How root cause causes this]
- Symptom 2: [How root cause causes this]

### Proposed Fix
[Minimal change to address root cause]

**Files to change**:
- [file]: [specific change]

**Why this fixes it**:
[Explanation of how fix addresses root cause]

### Potential Side Effects
- [ ] [Potential side effect 1] - [mitigation]
- [ ] [Potential side effect 2] - [mitigation]

### Test Plan
- [ ] Verify fix resolves symptom
- [ ] Check no new issues introduced
- [ ] Test edge cases
```

**Completion gate:**
- [ ] Root cause confirmed
- [ ] Minimal fix designed
- [ ] Side effects predicted
- [ ] Ready to implement

### Stage 4: Fix (20-30 minutes)

**Objective**: Implement minimal, focused fix

**Approach:**
- Make smallest possible change
- Add test that would catch this bug
- Document why this fix works
- Keep change isolated

**Fix implementation:**
```markdown
## Implementation

### Changes Made
**File**: [filename]
**Lines**: [line numbers]
**Change**: [what changed]

### Why This Fixes It
[Clear explanation of how change addresses root cause]

### Test Added
**File**: [test filename]
**Test**: [what test verifies]
\`\`\`[language]
[Test code]
\`\`\`

### Documentation
[Updated comments/docs explaining fix]
```

**Example:**
```typescript
// Fix implementation
// src/api/client.ts

- const API_BASE = '/api/v1';  // ❌ Wrong version
+ const API_BASE = '/api/v2';  // ✅ Correct version (v2 deployed)

// Why this fixes it:
// Backend was upgraded to v2 API but frontend still calling v1
// v1 endpoints return 404, causing form submission to fail

// Test added
// tests/api/client.test.ts
test('uses correct API version', () => {
  expect(API_BASE).toBe('/api/v2');
});
```

**Key practices:**
- Minimal change only (resist refactoring)
- Add regression test
- Document root cause in comment
- Keep fix isolated

**Completion gate:**
- [ ] Fix implemented
- [ ] Test added
- [ ] Code documented
- [ ] Ready to verify

### Stage 5: Test (10 minutes)

**Objective**: Verify fix works and no regressions

**Testing checklist:**
1. **Verify fix resolves symptom** (3 min)
   - Original bug no longer occurs
   - Test with original reproduction steps

2. **Run regression tests** (5 min)
   ```bash
   npm test  # or pytest
   ```
   - All existing tests still pass
   - New test catches the bug

3. **Manual verification** (2 min)
   - Test happy path
   - Test edge cases identified in Stage 3
   - Check related functionality still works

**Test results:**
```markdown
## Test Results

### Bug Fix Verification
- ✅ Original symptom resolved
- ✅ Reproduction steps now work correctly
- ✅ New test catches the bug (verified by breaking fix)

### Regression Testing
- ✅ All existing tests passing (152/152)
- ✅ New test passing
- ✅ No new failures

### Manual Verification
- ✅ Form submission works
- ✅ Error handling works
- ✅ Related forms unaffected
```

**Completion gate:**
- [ ] Bug fixed
- [ ] No regressions
- [ ] Tests passing
- [ ] Ready to document

### Stage 6: Document (5 minutes)

**Objective**: Create root cause analysis for future reference

**Documentation template:**
```markdown
# Root Cause Analysis: [Issue Summary]

## Incident Summary
**Issue**: [Brief description]
**Impact**: [Who/what affected]
**Duration**: [When started - when fixed]
**Severity**: [Critical/High/Medium/Low]

## Root Cause
[Precise description of what was wrong]

## How It Happened
[Sequence of events that led to the bug]

## Why It Wasn't Caught
[Why tests/review didn't catch this]

## The Fix
**Files changed**: [list]
**Change**: [what changed]
**Why this fixes it**: [explanation]

## Prevention
**Short term**:
- [ ] [Action to prevent immediate recurrence]

**Long term**:
- [ ] [Process/test improvement]
- [ ] [Monitoring/alerting addition]

## Timeline
- [Time]: Issue first reported
- [Time]: Investigation started
- [Time]: Root cause identified
- [Time]: Fix implemented
- [Time]: Fix deployed

## Related Issues
- [Link to related bugs/tickets]
```

**Completion gate:**
- [ ] Root cause documented
- [ ] Fix explained
- [ ] Prevention steps identified
- [ ] Documentation saved

## Key Practices

**Do:**
- Start with symptom, not assumed cause
- Form multiple hypotheses before testing
- Test hypotheses systematically
- Keep fix minimal and focused
- Document root cause for future
- Add regression test

**Don't:**
- Jump to conclusions without evidence
- Fix symptom without understanding cause
- Refactor while debugging (separate concerns)
- Skip documentation (valuable for team)
- Over-engineer the fix

## Common Pitfalls

**Pitfall**: Fixing symptom without understanding cause → bug returns
**Fix**: Always identify root cause before fixing

**Pitfall**: Testing only one hypothesis → miss actual cause
**Fix**: Form multiple hypotheses, test systematically

**Pitfall**: Adding features while fixing → scope creep
**Fix**: Minimal fix only, create separate task for improvements

**Pitfall**: Skipping regression tests → introduce new bugs
**Fix**: Always run full test suite

**Pitfall**: Poor documentation → same bug happens again
**Fix**: Write clear root cause analysis

## Examples

### Example 1: Performance Degradation

**Stage 1: Plan** (5 min)
```markdown
# Debugging Session: Dashboard Loading Slowly

## Symptom
Dashboard takes 15 seconds to load (was 2 seconds last week)

## Expected Behavior
Dashboard should load in <3 seconds

## Initial Evidence
- Reported by: Multiple users
- Frequency: Always
- Environment: Production only
- First seen: After v2.3.0 deploy
- Related changes: Added user activity tracking
```

**Stage 2: Research** (45 min)

**2a. Reproduce**: ✅ Reproduced locally in production mode
**2b. Evidence**: Network tab shows API call takes 14 seconds
**2c. Hypotheses**:
1. Database query slow (High likelihood)
2. N+1 query problem (High likelihood)
3. Network latency (Low likelihood)

**2d. Test hypotheses**:
- Added query logging → found N+1 query
- Each user loads activities separately (100 users = 100 queries)

**Stage 3: Verify** (10 min)
```markdown
## Root Cause
N+1 query: Loading user activities in loop instead of batch query

## Proposed Fix
Use JOIN to load all activities in single query

## Test Plan
- Verify query count reduces from 100 to 1
- Check load time improves
```

**Stage 4: Fix** (20 min)
```python
# Before (N+1 query)
users = User.query.all()
for user in users:
    user.activities = Activity.query.filter_by(user_id=user.id).all()

# After (single query with join)
users = User.query.options(joinedload(User.activities)).all()
```

**Stage 5: Test** (10 min)
- ✅ Load time: 15s → 1.5s
- ✅ Query count: 101 → 1
- ✅ All tests passing

**Stage 6: Document** (5 min)
```markdown
# Root Cause Analysis: Dashboard Performance

## Root Cause
N+1 query loading user activities individually

## How It Happened
Added activity tracking in v2.3.0, forgot to use joinedload

## The Fix
Changed to single query with JOIN

## Prevention
- Add query count monitoring
- Review ORMs for N+1 patterns in code review
```

**Total**: 95 minutes

### Example 2: Intermittent Test Failure

**Stage 1: Plan** (5 min)
```markdown
# Debugging Session: Flaky Test in CI

## Symptom
TestUserRegistration fails intermittently in CI (passes locally)

## Expected Behavior
Test should pass consistently

## Initial Evidence
- Frequency: ~30% of CI runs
- Environment: CI only (never local)
- First seen: Unknown (always been flaky)
```

**Stage 2: Research** (50 min)

**2a. Reproduce**: ❌ Cannot reproduce locally, ran test 100 times

**2b. Evidence**:
```
AssertionError: Expected user_id=123, got user_id=122
```
- User IDs are auto-increment
- Test expects specific ID

**2c. Hypotheses**:
1. Database not reset between tests (High likelihood)
2. Parallel test execution (Medium likelihood)
3. Test order dependency (Medium likelihood)

**2d. Test hypotheses**:
- Checked test setup → database IS reset
- Checked CI config → tests run in parallel! (4 workers)
- Added test isolation → still fails
- Root cause: Test assumes user_id=123 but other parallel tests create users

**Stage 3: Verify** (10 min)
```markdown
## Root Cause
Test assumes specific auto-increment ID, but parallel tests create users too

## Proposed Fix
Check user properties, not specific ID
```

**Stage 4: Fix** (15 min)
```python
# Before (brittle - assumes specific ID)
assert user.id == 123

# After (robust - checks properties)
assert user.email == "test@example.com"
assert user.is_active == True
# Don't assert specific ID (auto-increment not deterministic in parallel)
```

**Stage 5: Test** (10 min)
- ✅ Ran test 100 times → all pass
- ✅ Ran in CI 10 times → all pass

**Stage 6: Document** (5 min)
```markdown
# Root Cause Analysis: Flaky Test

## Root Cause
Test assumed specific auto-increment ID, but parallel tests made ID non-deterministic

## The Fix
Check user properties, not specific ID

## Prevention
- Avoid asserting auto-increment IDs in tests
- Code review checklist: tests must be parallel-safe
```

**Total**: 95 minutes

## Integration with Other Skills

- **systematic-debugging**: Deep dive version of this mode with more structure
- **dev-tdd**: After fix, add regression test following TDD
- **deep-research**: For complex issues requiring extensive investigation
- **docs-manager**: Document root cause analysis in project docs

## Success Metrics

**Successful debugging session:**
- Root cause identified and documented
- Minimal fix implemented
- Regression test added
- No new bugs introduced
- Team learns from root cause analysis

**Poor debugging session:**
- Fixed symptom without understanding cause
- Over-engineered the fix
- No documentation of findings
- Introduced new bugs
- Same issue likely to recur
