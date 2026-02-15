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
- Architectural decisions (use bigger picture)
- Quick syntax questions (direct answer fine)

## How It Works

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

### Stage 3: Planning and Design (15-30 minutes)

**For bugs:**
```markdown
## Root Cause Analysis

Expected Behavior: [What should happen]
Actual Behavior: [What actually happens]

Reproduction Steps:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Root Cause Hypothesis: [Why does this happen?]

Investigation Plan:
- [ ] Check [component]
- [ ] Verify [behavior]
- [ ] Test [scenario]
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
- For new code: Use `/dev-flow` or `/dev-tdd`
- For debugging: Use `/systematic-debugging`
- For review: Use `/review-critically`

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

**Investigation:**
```bash
# Find when it broke
git log --oneline | grep relevant-term

# Compare working vs broken version
git diff [working-version]..[broken-version] -- file.py
```

**Response:**
- Acknowledge it's regression
- Explain when it broke
- Provide immediate workaround if applicable
- Timeline for fix

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

## [Date] Analysis
- ✅ Root cause identified
- ✅ Solution planned

## [Date] Implementation
- ✅ Fix implemented
- ✅ Tests added

## [Date] Verification
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
- **Dev Flow**: Used for implementation
- **Systematic Debugging**: Used for bug investigation
- **Test-Driven Development**: Used for verification
- **Context Manager**: Track ticket progress

## Common Pitfalls to Avoid

**Don't:**
- Start fixing before understanding issue
- Assume you know what user wants
- Skip verification before closing
- Leave tickets in ambiguous state
- Fix symptom without addressing root cause
- Deploy without testing

**Do:**
- Ask clarifying questions upfront
- Understand before implementing
- Verify fix thoroughly
- Communicate status updates
- Address root cause, not symptom
- Test edge cases
- Document findings for future reference
