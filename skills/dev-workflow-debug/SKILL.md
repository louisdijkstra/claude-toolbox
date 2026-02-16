---
name: dev-workflow-debug
description: Investigate and resolve complex bugs through structured analysis and hypothesis testing. Combines code analysis, error investigation, and root cause discovery. Use when tracking down elusive bugs or investigating unexpected behavior.
---

# Systematic Debugging

## Purpose

Resolve bugs systematically through structured investigation, hypothesis testing, and root cause analysis. Move from confusion to understanding to fix efficiently.

## When to Use This Skill

Use this skill when:
- Investigating production bugs
- Error occurs in complex system
- Bug is hard to reproduce
- Don't understand what's causing issue
- Need to find root cause before fixing
- Error symptoms don't match obvious causes

**Do NOT use for:**
- Simple fixes with obvious cause
- Obvious syntax errors
- Known issues with obvious fixes

## How It Works

### Stage 1: Symptom Documentation (5-10 minutes)

Document exactly what's happening:

```markdown
# Debugging: [Bug Description]

## What's Happening?
[Exactly what the user/system is experiencing]

## When Does It Happen?
[Conditions that trigger the bug]

## Error Messages
[Any error messages, stack traces, or output]

## Expected Behavior
[What should happen instead]

## Impact
- 🔴 Critical: System broken, users blocked
- 🟠 High: Major feature broken
- 🟡 Medium: Workaround exists
- 🟢 Low: Cosmetic or rare edge case

## Reproducibility
- 🟢 Easily reproducible (always happens)
- 🟡 Sometimes reproducible (happens X% of time)
- 🔴 Hard to reproduce (rare or specific conditions)

## System Info
- [Browser/OS if applicable]
- [Service/component affected]
- [Recent changes (if known)]
```

### Stage 2: Hypothesis Formation (5-15 minutes)

Generate potential explanations:

```markdown
## Hypotheses

### Hypothesis 1: [Possible cause]
**Why this might be it**: [What evidence points here]
**Likelihood**: [High/Medium/Low]
**How to test**: [What to check]

### Hypothesis 2: [Possible cause]
**Why this might be it**: [What evidence points here]
**Likelihood**: [High/Medium/Low]
**How to test**: [What to check]

### Hypothesis 3: [Possible cause]
**Why this might be it**: [What evidence points here]
**Likelihood**: [High/Medium/Low]
**How to test**: [What to check]

### Hypothesis 4: [Possible cause]
**Why this might be it**: [What evidence points here]
**Likelihood**: [High/Medium/Low]
**How to test**: [What to check]
```

**Question to ask for each hypothesis:**
- Is this consistent with the symptoms?
- What evidence would confirm/deny this?
- What would I need to check?

### Stage 3: Evidence Gathering (10-30 minutes)

Collect data to test hypotheses:

**Check error logs:**
```bash
# Backend logs
grep -i error logs/app.log | tail -20

# Frontend console errors
# [Check browser dev tools console tab]

# Service logs
journalctl -u service-name -n 50
```

**Examine code:**
```bash
# Find relevant code
find . -type f -name "*.py" -o -name "*.ts" | xargs grep -l "symptom_keyword"

# Understand the flow
head -200 [relevant_file]
```

**Test reproduction:**
```bash
# Try to reproduce with simple test case
# Create minimal example that triggers bug

# Run with debug output
DEBUG=true ./run_app

# Monitor in real-time
tail -f logs/app.log
```

**Check recent changes:**
```bash
# What changed recently?
git log --oneline -20 -- [relevant_files]

# What's different between working/broken?
git diff [working_commit]..[current]
```

**Gather metrics:**
```bash
# Performance metrics (if relevant)
# Memory usage (if applicable)
# Database queries (if relevant)
# Network activity (if applicable)
```

### Stage 4: Root Cause Analysis (5-15 minutes)

Trace the bug to its origin:

```markdown
## Root Cause Analysis

### Confirmed Hypothesis
[Which hypothesis was correct]

### Evidence
- [Evidence 1 that confirms this]
- [Evidence 2 that confirms this]
- [Evidence 3 that confirms this]

### Root Cause
[The fundamental issue causing the bug]

### Why It Happened
[How did this slip through? What conditions allowed it?]

### The Bug Path
1. [What happens first]
2. [What happens next]
3. [Incorrect behavior occurs here]
4. [Symptom manifests as described]

### Why We Didn't Catch It
- [Test gap: what test would catch this]
- [Code review gap: what review would catch this]
- [Monitoring gap: what monitoring would catch this]
```

### Stage 5: Implement Fix (varies)

Write minimal fix for root cause:

```bash
# Strategy: Fix the root cause, not the symptom

# Create test that reproduces bug first
# See: /dev-workflow-test-driven

# Implement minimal fix
# Verify fix works
# Check for side effects
```

### Stage 6: Verify and Learn (10-15 minutes)

Ensure bug is truly fixed and documented:

```markdown
## Verification

- [ ] Bug reproduction now fails (or passes)
- [ ] Original issue resolved
- [ ] No new test failures
- [ ] No related functionality broken
- [ ] Performance not degraded

## Prevention

### Root Cause
[Summary of root cause]

### Fix Applied
[Description of what was fixed]

### Future Prevention
- [ ] Add test to catch this: [Test description]
- [ ] Add monitoring for: [Metric/event]
- [ ] Update docs for: [Section]
- [ ] Code review checklist item: [Item]

## Learning
[What we learned from this bug]
```

## Debugging Techniques

### Technique 1: Binary Search (for flaky/intermittent bugs)

Use binary search to isolate the problematic change:

```bash
# Find when bug was introduced
git log --oneline | head -20

# Test old commit
git checkout [commit]
# Does bug exist? Yes/No

# If yes, bug is older
# If no, bug was introduced between this and next

# Repeat until you find the exact commit
git bisect start
git bisect bad HEAD
git bisect good [known-good-commit]
# Follow bisect's guidance until found
```

### Technique 2: Rubber Duck Debugging

Explain the code step-by-step:

```
1. Read the code aloud
2. Trace through what happens
3. When explanation doesn't match code, that's the bug
4. Often you'll find the issue just by explaining it
```

### Technique 3: Add Debug Output

Instrument code to understand flow:

```python
# Python example
def process_data(data):
    print(f"DEBUG: Input data: {data}")
    result = transform(data)
    print(f"DEBUG: After transform: {result}")
    output = validate(result)
    print(f"DEBUG: After validate: {output}")
    return output
```

```bash
# Run with debug output
DEBUG=true python app.py

# Filter for specific parts
DEBUG=true python app.py | grep "After transform"
```

### Technique 4: Isolate the Problem

Reduce to simplest reproducible case:

```python
# Instead of full application
# Create minimal test that shows bug

def test_bug_reproduction():
    # Minimal setup
    data = [1, 2, 3]

    # Single operation that fails
    result = problematic_function(data)

    # Verify failure
    assert result != expected
```

### Technique 5: Check Assumptions

Challenge your assumptions:

```markdown
## Assumption Checking

Assumption 1: The code I think is running is actually running
- [ ] Add debug output to verify code path
- [ ] Check if code is conditionally disabled
- [ ] Verify function actually gets called

Assumption 2: The data I think exists actually exists
- [ ] Print the data before the bug point
- [ ] Check data types
- [ ] Verify data wasn't modified elsewhere

Assumption 3: The behavior I observe is what I think it is
- [ ] Re-read error message carefully
- [ ] Check if error is from different component
- [ ] Verify test case is accurate

Assumption 4: The bug is where I think it is
- [ ] Trace full call stack
- [ ] Check dependent functions
- [ ] Look for side effects elsewhere
```

## Response Pattern

When debugging:

```
**Bug**: [What's happening]

**Symptoms**: [Exact behavior]

**Initial Hypotheses**:
1. [Hypothesis 1]: [Why likely]
2. [Hypothesis 2]: [Why likely]

**Testing**:
- ✅ [What I tested]
- ✅ [What I found]
- ✅ [What this means]

**Root Cause**: [The fundamental issue]

**Fix**: [Minimal fix to root cause]

**Verification**:
- ✅ Bug fixed
- ✅ No regressions
- ✅ Tests added

**Prevention**:
- [What to add to prevent recurrence]

**Learning**: [What we learned]
```

## Common Bug Patterns

### Pattern 1: Race Condition
**Symptoms**: Bug happens intermittently
**Investigation**: Add locks, check concurrent access
**Fix**: Synchronize access properly

### Pattern 2: State Corruption
**Symptoms**: Data gets corrupted unexpectedly
**Investigation**: Trace all state modifications
**Fix**: Ensure immutability or proper synchronization

### Pattern 3: Resource Leak
**Symptoms**: Memory grows, handles accumulate, performance degrades
**Investigation**: Check cleanup code, monitor resources
**Fix**: Ensure cleanup in all code paths

### Pattern 4: Timing Issue
**Symptoms**: Bug happens when timing is just right
**Investigation**: Add delays, check timing assumptions
**Fix**: Use proper synchronization instead of timing

### Pattern 5: Wrong Assumption
**Symptoms**: Code works in one case, not another
**Investigation**: Find what's different between cases
**Fix**: Handle both cases correctly

## Integration with Development

This skill pairs with:
- **Project Handle Ticket**: Use for bug tickets
- **Dev Workflow Test Driven**: Add test that reproduces bug
- **Research Deep**: For understanding complex issues
- **Review Critical**: Identify bugs before they ship

## Common Pitfalls to Avoid

**Don't:**
- Start fixing before understanding
- Assume you know the cause
- Fix symptom instead of root cause
- Add random debug code everywhere
- Ignore evidence that contradicts your hypothesis
- Give up and work around the bug
- Fix one instance of a broader problem

**Do:**
- Understand the problem completely first
- Form hypotheses and test them
- Follow the evidence
- Find root cause before fixing
- Add tests to prevent recurrence
- Document what you learn
- Share findings with team
