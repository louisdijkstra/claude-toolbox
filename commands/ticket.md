---
description: Execute end-to-end ticket workflow from intake to delivery. Systematically handle support tickets, bugs, and feature requests.
---

# Ticket Command

This command handles complete ticket workflow using the **handle-ticket** skill.

## What This Command Does

1. **Intake** - Understand ticket requirements
2. **Planning** - Break down into tasks
3. **Implementation** - Execute the work
4. **Testing** - Validate solution
5. **Validation** - Ensure requirements met
6. **Closure** - Document and complete

## When to Use

Use `/ticket` when:
- Handling support tickets
- Processing bug reports
- Implementing feature requests
- Managing user-reported issues
- Systematic task execution needed

## Ticket Workflow

**Phase 1: Intake**
- Read ticket description
- Identify ticket type (bug/feature/support)
- Extract requirements
- Clarify ambiguities
- Assess priority and complexity

**Phase 2: Validation (CRITICAL for Bugs)**
- Use `/debug` to verify bug premise
- Reproduce reported issue
- Validate suggested fix (if provided)
- Confirm root cause
- Decision: Proceed / Works as designed / Need info

**Phase 3: Planning**
- Break down into subtasks
- Identify affected components
- Determine approach (informed by validation)
- Estimate effort
- Create implementation plan

**Phase 4: Implementation**
- Execute planned tasks
- Follow appropriate workflow (TDD, dev-flow, etc.)
- Maintain progress tracking
- Handle blockers

**Phase 5: Testing**
- Validate functionality
- Run test suite
- Check edge cases
- Verify no regressions

**Phase 6: Validation**
- Confirm requirements met
- Test from user perspective
- Verify acceptance criteria
- Get feedback if needed

**Phase 7: Closure**
- Document changes
- Update ticket status
- Provide summary
- Archive artifacts

**Language Style for Ticket Communication:**
- Use natural, simple, informal language when writing ticket updates
- Write like you're talking to a colleague or user
- Be direct and clear, not formal or corporate
- Example: "Fixed the CSV export bug. It works now." not "The CSV export functionality has been successfully remediated"
- Example: "Added the feature you requested" not "Implementation of the requested functionality has been completed"

## Ticket Types

**Bug Report:**
1. Use `/debug` to validate bug premise (REQUIRED)
2. Confirm bug exists and identify root cause
3. Plan fix based on validated root cause
4. Implement fix with `/tdd` or `/dev-flow`
5. Verify resolution
6. Add regression test

**Feature Request:**
1. Clarify requirements
2. Use `/plan` for approach
3. Implement with `/tdd`
4. Validate against requirements
5. Update documentation

**Support Request:**
1. Understand the need
2. Research solution with `/research`
3. Provide guidance or implementation
4. Validate user can proceed
5. Document solution

## Example Workflow

```
/ticket #1234 "Users can't export data as CSV"

TICKET ANALYSIS
===============
Type: Bug
Priority: High
Component: Export system

PLAN
====
1. Reproduce export issue
2. Identify root cause (debug)
3. Implement fix
4. Add test for CSV export
5. Verify with actual data

EXECUTION
=========
[Phase 1: Reproduction]
✓ Confirmed bug - CSV export returns 500 error

[Phase 2: Investigation]
✓ Root cause: Missing content-type header

[Phase 3: Fix]
✓ Added content-type: text/csv
✓ Fixed encoding issues

[Phase 4: Testing]
✓ Added unit test for CSV export
✓ Tested with various data sizes
✓ All tests passing

[Phase 5: Validation]
✓ CSV exports correctly
✓ Data integrity verified
✓ No performance regression

CLOSURE
=======
Status: Resolved
Changes: src/export.py (+15 -3)
Tests: Added CSV export test
Documentation: Updated API docs

Ticket #1234 closed successfully
```

## Integration with Other Commands

- Use `/ticket` as overall orchestrator
- Call `/debug` for bug investigation
- Call `/plan` for complex features
- Call `/tdd` for implementation
- Call `/review` before closure
- Call `/docs` for documentation updates

## Related Skills

- **handle-ticket** - Complete ticket workflow
- **systematic-debugging** - Bug investigation
- **dev-flow** - Development workflow
- **test-driven-development** - Implementation
