---
name: handle-ticket
description: Execute end-to-end ticket workflow from intake to delivery. Manages planning, implementation, testing, validation, and closure. Use for handling support tickets, bug reports, and feature requests systematically.
---

# Handle Ticket

## Purpose

Execute complete ticket lifecycle from intake through delivery. Ensure tickets are understood, properly scoped, implemented correctly, and validated before closure.

## When to Use This Skill

Use this skill when:
- Receiving bug report or support ticket
- Need to handle feature request through completion
- User reports issue that needs investigation and fix
- Ticket requires multiple steps to resolve
- Need to ensure nothing falls through cracks

**Do NOT use for:**
- Quick one-line fixes (direct approach fine)
- Obvious typos or simple syntax errors (fix directly)
- Architectural decisions (use docs-bigger-picture)
- Project planning or inception (use project-inception)
- Feature brainstorming (use project-brainstorm)
- Quick syntax questions (direct answer fine)

**If uncertain:** Use this skill when a ticket requires multiple steps (investigation, planning, implementation, testing, closure) or when systematic tracking is important. Skip for trivial one-line fixes or immediate answers.

## Process

### Overview of Workflow

```
1. Intake → Understand the ticket
2. Triage → Categorize and prioritize
3. [BUG VALIDATION] → Verify premise (bugs only) ⚠️ CRITICAL STEP
4. Planning → Design solution
5. Implementation → Execute work
6. Testing → Validate solution
7. Closure → Document and complete
```

**IMPORTANT**: For bug tickets, Stage 2.5 (Bug Validation) is MANDATORY before proceeding to planning.

### Stage 1: Intake and Understanding (10-15 minutes)

**Read the ticket thoroughly:**
- What is the exact problem?
- When does it occur?
- What's the impact?
- Has user provided reproduction steps?

**Clarify if needed:**
```markdown
# Ticket Intake: [Ticket Title]

## Original Report
[Copy of ticket content]

## What I Understand
- Problem: [What the issue is]
- When it occurs: [Reproduction steps or conditions]
- Impact: [User impact - blocker/high/medium/low]

## Questions for Clarity (if needed)
- [ ] [Question 1 if unclear]
- [ ] [Question 2 if unclear]

## Scope
- [ ] Clear and understood
- [ ] Needs more info
```

### Stage 2: Triage and Routing (5 minutes)

**Determine ticket category:**
- **Bug**: Something is broken
- **Feature Request**: User wants new capability
- **Support**: User needs help with existing functionality
- **Infrastructure**: Operations issue

**Assess priority:**
- 🔴 **Critical**: Blocks production, data loss risk, security issue
- 🟠 **High**: Major feature broken, significant workaround needed
- 🟡 **Medium**: Minor issue or nice-to-have feature
- 🟢 **Low**: Edge case or polish improvement

**Add metadata:**
```markdown
## Ticket Classification

Category: [Bug/Feature/Support/Infrastructure]
Priority: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low
Estimated Effort: [30 min / 2 hours / 1 day / multiple days]
Component: [Which part of system]
Tags: [bug, regression, performance, security, etc.]
```

### Stage 2.5: Bug Validation (10-20 minutes) **[CRITICAL FOR BUG TICKETS]**

**For bug tickets ONLY - validate before planning:**

Use `/debug` or `systematic-debugging` skill to verify the ticket's premise.

**STOP and validate these questions:**
```markdown
## Bug Validation Checklist

- [ ] Can we reproduce the reported bug?
- [ ] Is this actually a bug or expected behavior?
- [ ] If a fix is suggested in the ticket, is it the correct approach?
- [ ] What is the actual root cause?
- [ ] Do we have enough information to proceed?

## Validation Results

**Reproduction**: ✅ Reproduced / ❌ Cannot reproduce / ⚠️ Partial
**Verdict**: [Bug confirmed / Works as designed / Need more info]
**Root Cause**: [Actual cause based on investigation]
**Suggested Fix Validity**: [If fix suggested: Valid / Invalid / Needs modification]

**Evidence**:
- [Evidence 1]
- [Evidence 2]
- [Evidence 3]

**Proceed to Planning**: [YES/NO]
```

**Use systematic-debugging to:**
1. Document exact symptoms
2. Form hypotheses about root cause
3. Gather evidence (logs, code analysis, reproduction)
4. Validate or invalidate the ticket's premise
5. Challenge any suggested fixes
6. Confirm actual root cause

**Possible outcomes:**
- ✅ **Bug confirmed** → Proceed to Stage 3 (Planning)
- ❌ **Works as designed** → Respond to user, close ticket
- ⚠️ **Need more info** → Ask clarifying questions, wait for response
- 🔄 **Different root cause** → Update understanding, proceed with correct cause

**IMPORTANT**: Do NOT skip this stage for bugs. Validating the premise prevents wasted effort on incorrect fixes or non-existent problems.

### Stage 3: Planning and Design (15-30 minutes)

**For bugs (after Stage 2.5 validation confirms bug exists):**
```markdown
## Root Cause Analysis (From Validation Stage)

Expected Behavior: [What should happen]
Actual Behavior: [What actually happens]

Reproduction Steps (Confirmed):
1. [Step 1]
2. [Step 2]
3. [Step 3]

Root Cause (Validated): [Why does this happen?]

Solution Approach:
- [ ] Fix [specific issue identified]
- [ ] Add test to prevent regression
- [ ] Verify no side effects

Note: This builds on Stage 2.5 (Bug Validation) findings.
```

**For features:**
```markdown
## Feature Request Analysis

User Need: [What do they want?]
Use Case: [When would they use this?]
Value: [Why does this matter?]

Proposed Solution: [How to implement]
Alternative Approaches: [Other ways to solve]

Implementation Plan:
- [ ] [Component 1]
- [ ] [Component 2]
- [ ] [Tests]
```

**For support:**
```markdown
## Support Request Analysis

Issue: [What does user need help with?]
Attempted Solutions: [What have they tried?]

Resolution Plan:
- [ ] [Step 1]
- [ ] [Step 2]
- [ ] [Step 3]
```

### Stage 4: Implementation (varies)

**Use appropriate development skill:**
- For bugs: Use `/dev-tdd` or `/dev-flow` (validation already done in Stage 2.5)
- For new features: Use `/dev-flow` or `/dev-tdd`
- For complex refactoring: Use `/plan` then `/dev-flow`
- For review: Use `/review-critically`

**Note**: For bugs, systematic-debugging was already used in Stage 2.5 (Validation).

**Key practice:**
- Create test case that reproduces issue first
- Implement minimal fix
- Verify no regressions
- Commit with reference to ticket

```bash
# Commit with ticket reference
git commit -m "fix(ticket-123): description of fix

Resolves #123
- Root cause: [explanation]
- Solution: [what was done]
- Testing: [how verified]
"
```

### Stage 5: Testing and Validation (10-20 minutes)

**Verification checklist:**
```markdown
## Verification

- [ ] Reproduction steps now pass
- [ ] No new test failures
- [ ] No regressions in related features
- [ ] Performance impact verified (if applicable)
- [ ] Security implications checked (if applicable)
- [ ] Documentation updated (if applicable)
```

**Manual testing:**
- Follow exact reproduction steps from ticket
- Test edge cases
- Test on different environments if applicable
- Verify related functionality still works

### Stage 6: Response and Closure

**Communicate resolution:**
```markdown
## Resolution

**Status**: ✅ Resolved / ⏳ In Progress / ❌ Cannot Fix

**What was done**:
- [Action 1 taken]
- [Action 2 taken]

**Verification**:
- [How was it verified]
- [Test results]

**For user**:
[What the user needs to do]

**Related Tickets**:
- [Link to related issue]

**Deployed to**:
- [ ] Development
- [ ] Staging
- [ ] Production
```

## Ticket Response Templates

### For Bug Reports

```markdown
# Bug Ticket: [Title]

## Acknowledgment
Thank you for reporting this. I've reviewed the issue and confirm it.

## Root Cause
[Explanation of why this happens]

## Resolution
[What was fixed]

## Verification
[How to verify it's fixed]

## Prevention
[What we're doing to prevent recurrence]

**Status**: ✅ Fixed in [version/branch]
```

### For Feature Requests

```markdown
# Feature Request: [Title]

## Understanding
- Problem you're trying to solve: [Problem]
- How this would help: [User value]
- Use case: [When you'd use this]

## Feasibility Assessment
- Effort: [Estimate]
- Impact: [What changes]
- Priority: [Where in roadmap]

## Next Steps
[What happens next]

**Status**: ⏳ [Under review / Scheduled / Accepted / etc.]
```

### For Support Tickets

```markdown
# Support: [Topic]

## Your Question
[Summary of what they asked]

## Answer
[Clear explanation]

## Example
[If applicable, show example]

## Additional Resources
- [Related documentation]
- [Similar questions]

**Status**: ✅ Resolved
```

## Common Ticket Patterns

### Pattern 1: Regression (Something that was working broke)

**Stage 2.5 Validation:**
```bash
# Verify regression claim
# 1. Confirm it worked before
# 2. Confirm it's broken now
# 3. Find when it broke

git log --oneline | grep relevant-term

# Compare working vs broken version
git diff [working-version]..[broken-version] -- file.py

# Use /debug to validate premise
```

**After Validation, Response:**
- Acknowledge it's regression (if confirmed)
- Explain when it broke
- Provide immediate workaround if applicable
- Timeline for fix

**If Not Regression:**
- May be works-as-designed
- May be misunderstanding of previous behavior
- Clarify with user

### Pattern 2: Performance Issue

**Investigation:**
```bash
# Profile the code
# Identify bottleneck
# Compare to baseline

# Example for Python
python -m cProfile -s cumtime script.py
```

**Response:**
- Quantify the performance issue
- Explain the cause
- Describe optimization
- Show before/after metrics

### Pattern 3: Unclear Reproduction

**Investigation:**
```markdown
## Need More Information

To help resolve this, please provide:
- [ ] Step-by-step reproduction
- [ ] Browser/OS/version info
- [ ] Error message or screenshot
- [ ] When this started happening
- [ ] How frequently it occurs
```

### Pattern 4: Works As Designed

**Investigation:**
```markdown
## Analysis

This is actually expected behavior because [reason].

However, I can help you with:
- Option 1: [Alternative approach]
- Option 2: [Workaround]

Would one of these work for you?
```

## Ticket Tracking

Maintain status throughout:

```markdown
# Ticket Status Tracking

## [Date] Intake
- ✅ Understood
- ✅ Triaged as [Priority]

## [Date] Validation (For Bugs)
- ✅ Bug premise validated using /debug
- ✅ Reproduction confirmed
- ✅ Root cause identified
- ✅ Decision: Proceed to planning

## [Date] Planning
- ✅ Solution planned
- ✅ Approach validated

## [Date] Implementation
- ✅ Fix implemented
- ✅ Tests added

## [Date] Testing
- ✅ Bug reproduced and verified fixed
- ✅ No regressions

## [Date] Deployed
- ✅ Merged to main
- ✅ Deployed to production

## [Date] Closed
- ✅ User notified
- ✅ Ticket closed
```

## Response Pattern

```
**Ticket**: [ID and title]

**Status**: [Current stage]

**Current Work**:
- [What is being done]

**Progress**:
- ✅ [Completed step]
- ⏳ [In progress]
- ⬜ [Upcoming]

**Next Steps**:
1. [What happens next]
2. [Timeline]

**ETA**: [When to expect resolution]
```

## Integration with Development

This skill orchestrates:
- **dev-workflow-debug**: Used in Stage 2.5 for bug validation (REQUIRED for bugs)
- **dev-workflow-flow**: Used in Stage 4 for implementation workflow
- **dev-workflow-test-driven**: Used in Stage 4 for TDD implementation
- **dev-workflow-tdd**: Alternative TDD approach for Stage 4 implementation
- **review-critical**: Used in Stage 4 for code review
- **docs-context**: Track ticket progress and maintain state across work sessions

## Example: Validation Stage in Action

### Ticket: "Bug - CSV export returns empty file"

**Stage 1: Intake**
```markdown
Ticket #456: CSV export returns empty file
User reports: "When I click export CSV, it downloads but the file is empty"
```

**Stage 2: Triage**
```markdown
Category: Bug
Priority: 🟠 High (blocks data export)
Component: Export system
```

**Stage 2.5: Validation (CRITICAL)**
```markdown
Using /debug to validate:

HYPOTHESIS 1: Export logic is broken
- Test: Trigger export, check server logs
- Finding: Export runs successfully, returns 200 OK
- Evidence: Server logs show data being serialized

HYPOTHESIS 2: Data is actually empty
- Test: Check data source
- Finding: Data exists in database
- Evidence: Query returns 150 rows

HYPOTHESIS 3: Content-type or encoding issue
- Test: Inspect HTTP response headers
- Finding: Content-Type is "application/octet-stream" instead of "text/csv"
- Evidence: Response body has data but wrong MIME type causes browser issue

VALIDATION RESULT:
✅ Bug confirmed - Not a data issue, it's a headers issue
✅ Root cause: Incorrect Content-Type header
✅ User's premise partially correct (file appears empty due to encoding)
❌ This is NOT an empty file issue - it's a MIME type issue

Decision: PROCEED to planning with correct root cause
```

**Stage 3: Planning** (Now informed by validation)
```markdown
Fix approach:
1. Change Content-Type to "text/csv; charset=utf-8"
2. Add Content-Disposition header
3. Test with various browsers
4. Add test to verify headers
```

**Result**: Validation prevented wasting time on data export logic and identified the actual issue.

## Common Pitfalls to Avoid

**Don't:**
- **Skip Stage 2.5 validation for bug tickets** ⚠️ CRITICAL
- Start fixing before understanding issue
- Assume the reported bug is actually a bug
- Trust suggested fixes without validation
- Assume you know what user wants
- Skip verification before closing
- Leave tickets in ambiguous state
- Fix symptom without addressing root cause
- Deploy without testing

**Do:**
- **ALWAYS validate bug tickets before planning** ✅ REQUIRED
- Use `/debug` to verify premise and root cause
- Ask clarifying questions upfront
- Challenge assumptions about expected behavior
- Understand before implementing
- Verify fix thoroughly
- Communicate status updates
- Address root cause, not symptom
- Test edge cases
- Document findings for future reference
