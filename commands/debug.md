---
description: Systematically investigate and resolve complex bugs through structured analysis and hypothesis testing.
---

# Debug Command

This command provides systematic debugging workflow using the **systematic-debugging** skill.

## What This Command Does

1. **Reproduce Issue** - Confirm bug exists and document symptoms
2. **Gather Evidence** - Collect logs, stack traces, error messages
3. **Form Hypotheses** - Generate potential root causes
4. **Test Hypotheses** - Systematically validate each theory
5. **Identify Root Cause** - Find the actual problem
6. **Implement Fix** - Resolve the issue
7. **Verify Fix** - Ensure bug is resolved and no regression

## When to Use

Use `/debug` when:
- Investigating unexpected behavior
- Tracking down elusive bugs
- Application crashes or errors
- Performance issues
- Integration failures
- Data inconsistencies

## Debugging Process

**Step 1: Reproduce**
- Document exact steps to reproduce
- Identify conditions that trigger bug
- Capture error messages and logs

**Step 2: Gather Evidence**
- Collect stack traces
- Review relevant logs
- Check recent changes
- Review related code

**Step 3: Generate Hypotheses**
- What could cause these symptoms?
- List 3-5 potential root causes
- Rank by likelihood

**Step 4: Test Each Hypothesis**
- Design test for each hypothesis
- Add logging/debugging statements
- Run tests systematically
- Eliminate unlikely causes

**Step 5: Root Cause**
- Identify confirmed root cause
- Understand why it happens
- Check for related issues

**Step 6: Fix**
- Implement minimal fix
- Add test to prevent regression
- Verify fix works

**Step 7: Verify**
- Run full test suite
- Check for side effects
- Verify original issue resolved

## Debugging Best Practices

**DO:**
- Reproduce the bug reliably first
- Form hypotheses before changing code
- Test one hypothesis at a time
- Add tests to prevent regression
- Document findings
- Check for similar issues

**DON'T:**
- Make random changes hoping to fix it
- Skip reproduction step
- Test multiple hypotheses simultaneously
- Ignore related warnings/errors
- Leave debug statements in code

## Common Bug Categories

**Logic Errors**
- Off-by-one errors
- Incorrect conditionals
- Missing edge case handling

**Integration Issues**
- API contract mismatches
- Database schema mismatches
- Configuration errors

**Race Conditions**
- Concurrent access issues
- Timing-dependent behavior
- Async/await problems

**Resource Issues**
- Memory leaks
- File handle leaks
- Connection pool exhaustion

## Integration with Other Commands

- Use `/review` to check for additional issues
- Use `/tdd` to add regression tests
- Use `/build-fix` if fixes cause build errors
- Use `/flow` to integrate fix systematically

## Related Skills

- **systematic-debugging** - Complete debugging methodology
- **test-driven-development** - Regression test creation
- **pattern-discovery** - Find similar patterns
