---
description: Execute comprehensive multi-tier code and design review. Combines critical analysis, security validation, and quality assessment.
---

# Review Command

This command performs thorough code review using the **review-system** and **review-critically** skills.

## What This Command Does

1. **Security Review** - Check for vulnerabilities and security issues
2. **Code Quality** - Assess structure, complexity, maintainability
3. **Best Practices** - Verify adherence to standards
4. **Architecture** - Validate design decisions
5. **Testing** - Check test coverage and quality
6. **Generate Report** - Provide actionable findings

## When to Use

Use `/review` when:
- Completing a feature before merge
- Reviewing pull requests
- Before production deployment
- After major refactoring
- Validating security-critical code
- Regular code health checks

## Review Tiers

**Tier 1: Security (CRITICAL)**
- Hardcoded credentials, API keys, tokens
- SQL injection vulnerabilities
- XSS vulnerabilities
- Missing input validation
- Insecure dependencies
- Path traversal risks

**Tier 2: Code Quality (HIGH)**
- Functions > 50 lines
- Files > 800 lines
- Nesting depth > 4 levels
- Missing error handling
- Debug statements (console.log)
- TODO/FIXME comments

**Tier 3: Best Practices (MEDIUM)**
- Mutation patterns
- Missing tests for new code
- Accessibility issues
- Performance concerns
- Code duplication

## How It Works

1. **Get changed files**: `git diff --name-only HEAD` (or specify files)
2. **For each file, check** all review tiers
3. **Generate report** with:
   - Severity: CRITICAL, HIGH, MEDIUM, LOW
   - File location and line numbers
   - Issue description
   - Suggested fix
4. **Block if critical** - Don't proceed with CRITICAL issues

**Language Style for Review Comments:**
- Use natural, simple, informal language
- Write like a helpful teammate, not a robot
- Be direct and specific, not formal
- Example: "This function is too long, let's split it up" not "It is recommended to refactor this function to improve maintainability"
- Example: "Missing validation here" not "Input validation should be implemented"

## Review Report Format

```
CODE REVIEW REPORT
==================

CRITICAL ISSUES (0)
-------------------
None found

HIGH PRIORITY (2)
-----------------
File: src/auth.py:45
Issue: Missing input validation on user_id parameter
Fix: Add validation: if not user_id or not isinstance(user_id, int)

File: src/api.py:120
Issue: Function exceeds 50 lines (78 lines)
Fix: Extract helper functions for parsing and validation

MEDIUM PRIORITY (3)
-------------------
...

SUMMARY
-------
Total Issues: 5
Critical: 0
High: 2
Medium: 3
Low: 0

RECOMMENDATION: Fix HIGH priority issues before merging
```

## Important Notes

**Never approve code with security vulnerabilities!**

Block commits/merges if:
- CRITICAL issues found
- HIGH security issues found
- Multiple HIGH issues without plan to fix

## Integration with Other Commands

- Use `/plan` to plan fixes for issues found
- Use `/tdd` to add missing tests
- Use `/build-fix` to resolve build errors
- Use `/review` again after fixes applied

## Related Skills

- **review-system** - Multi-tier review orchestration
- **review-critically** - Security-focused review
- **test-driven-development** - Test coverage validation
