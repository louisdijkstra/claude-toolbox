---
name: pattern-discovery
description: Identify recurring patterns and anti-patterns in codebase. Surface architectural insights and improvement opportunities. Use when analyzing code structure, identifying inconsistencies, or improving codebase quality.
---

# Pattern Discovery

## Purpose

Identify recurring patterns, inconsistencies, and architectural insights across the codebase. Surface improvement opportunities and ensure consistency.

## When to Use This Skill

Use this skill when:
- Analyzing large portions of codebase
- Looking for consistency issues
- Understanding how features are implemented
- Identifying code duplication
- Discovering architectural patterns
- Finding anti-patterns that should be refactored
- Evaluating codebase maturity and quality

**Do NOT use for:**
- Single-file changes (use specific skills)
- Quick fixes (direct approach)
- Syntax questions (use docs)

## How It Works

### 1. Define What You're Searching For

Be clear about what patterns to look for:

```markdown
# Pattern Discovery: [Pattern Name]

## What Pattern?
[Describe the pattern]

## Why Are We Looking?
[What problem does finding this help solve?]

## Search Scope
- [Which files/directories]
- [Which components]
- [Which features]

## Success Criteria
[How will we know we found relevant patterns?]
```

Examples of patterns to discover:
- Error handling patterns
- API response formats
- State management approaches
- Logging patterns
- Configuration management
- Test organization
- Code organization conventions

### 2. Search Systematically

**Find by naming convention:**
```bash
# Find all handler functions
find . -type f -name "*.py" | xargs grep -l "def.*_handler"

# Find all test files
find . -type f -name "test_*.py" -o -name "*_test.py"

# Find all configuration files
find . -type f -name "*.config.py" -o -name "*config*"
```

**Find by code structure:**
```bash
# Find all classes
find . -type f -name "*.py" | xargs grep "^class "

# Find all decorators
find . -type f -name "*.py" | xargs grep "@.*"

# Find specific patterns
find . -type f -name "*.py" | xargs grep "try:" | head -20
```

**Find by imports:**
```bash
# Find all files using specific library
find . -type f -name "*.py" | xargs grep "import pytest"

# Find pattern of imports
find . -type f -name "*.py" | xargs grep "from typing import"
```

**Find by comments/markers:**
```bash
# Find TODO or FIXME
grep -r "TODO\|FIXME" . 2>/dev/null

# Find deprecation markers
grep -r "@deprecated\|DEPRECATED" . 2>/dev/null

# Find specific patterns
grep -r "XXX\|HACK\|BUG" . 2>/dev/null
```

### 3. Analyze Patterns Found

For each pattern found:

```markdown
## Pattern: [Pattern Name]

### Instances Found
- [file1.py]: line [x]
- [file2.py]: line [y]
- [file3.py]: line [z]

### Pattern Variations
- Variation 1: [How it differs]
- Variation 2: [How it differs]

### Consistency Assessment
- 🟢 Consistent: [Standardized across codebase]
- 🟡 Mostly Consistent: [Has variations, but reasonable]
- 🔴 Inconsistent: [Major variations, confusing]

### Quality Assessment
- ✅ Good: [Why this is well-done]
- ⚠️ Needs Work: [What could be improved]
- ❌ Anti-pattern: [Why this is problematic]
```

### 4. Document Findings

Create discovery report:

```markdown
# Pattern Discovery Report: [Date]

## Executive Summary
[1-2 sentence summary of findings]

## Patterns Discovered

### Pattern 1: [Name]
**Prevalence**: Found in X files
**Consistency**: [Assessment]
**Quality**: [Assessment]
**Recommendation**: [What should we do]

### Pattern 2: [Name]
[Same structure]

## Consistency Opportunities
- [Where standardization would help]
- [Where centralization would reduce duplication]

## Anti-Patterns Found
- [Anti-pattern 1]: [Why it's problematic]
- [Anti-pattern 2]: [Why it's problematic]

## Improvement Opportunities
1. [Refactoring opportunity]
2. [Standardization opportunity]
3. [Consolidation opportunity]

## Recommendations
1. [Action 1]: [Why, effort, impact]
2. [Action 2]: [Why, effort, impact]
3. [Action 3]: [Why, effort, impact]
```

### 5. Categorize Findings

**By confidence:**
- 🟢 **Definite Pattern**: Clear consistency issue
- 🟡 **Likely Pattern**: Strong evidence but some variation
- 🔴 **Weak Signal**: Might be pattern, needs more investigation

**By impact:**
- 🔴 **High Impact**: Affects many files, significant quality/performance issue
- 🟡 **Medium Impact**: Affects several files, moderate quality issue
- 🟢 **Low Impact**: Affects few files, minor issue

**By effort to fix:**
- 🟢 **Quick Fix**: < 1 hour per instance
- 🟡 **Medium Effort**: 1-4 hours per instance
- 🔴 **Large Effort**: > 4 hours per instance

## Pattern Types

### Type 1: Consistency Patterns

**Question**: "Is this done consistently across the codebase?"

**Look for:**
- Naming conventions (do all handlers follow same pattern?)
- Error handling (all errors handled same way?)
- Configuration (all services configured same way?)
- Testing (all tests structured same way?)

**Example:**
```markdown
## Pattern: Error Handling

**Finding**: Error handling varies significantly
- Some functions raise exceptions
- Some return (error, data) tuples
- Some use Result type
- Some log and continue

**Impact**: High - inconsistent error handling across APIs
**Recommendation**: Standardize on single error handling approach
```

### Type 2: Duplication Patterns

**Question**: "Is this code duplicated across files?"

**Look for:**
- Similar helper functions
- Repeated code blocks
- Similar algorithms
- Copy-pasted logic

**Example:**
```markdown
## Pattern: CSV Export Logic

**Finding**: CSV export implemented 3 times
- analytics/export.py: 120 lines
- reports/export.py: 125 lines
- dashboards/export.py: 118 lines

**Impact**: Medium - maintenance burden, inconsistency
**Recommendation**: Extract to shared utility module
```

### Type 3: Anti-Pattern Discovery

**Question**: "Are we using problematic patterns?"

**Look for:**
- N+1 queries
- Memory leaks
- Race conditions
- Security issues
- Performance issues

**Example:**
```markdown
## Pattern: N+1 Queries

**Finding**: Query in loop pattern found in 4 locations
- user/loader.py:45
- product/service.py:78
- order/handler.py:102
- analytics/report.py:156

**Impact**: High - significant performance degradation
**Recommendation**: Use batch loading or eager loading
```

### Type 4: Architecture Patterns

**Question**: "How do we structure code? Is it consistent?"

**Look for:**
- Layering approach (MVC, MVVM, etc.)
- Dependency patterns
- Module organization
- Data flow patterns

**Example:**
```markdown
## Pattern: API Response Format

**Finding**: Response wrapping varies
- Some endpoints: {data: {...}}
- Some endpoints: {result: {...}}
- Some endpoints: {...} (unwrapped)

**Impact**: Medium - inconsistent API contract
**Recommendation**: Define standard response envelope
```

## Response Pattern

When reporting pattern discoveries:

```
**Patterns Discovered**: [How many and what types]

**High Priority Patterns**:
1. [Pattern with high impact]
   - Found in: [files]
   - Impact: [Consequences]
   - Recommendation: [Action]

2. [Pattern with high impact]
   - Found in: [files]
   - Impact: [Consequences]
   - Recommendation: [Action]

**Medium Priority Patterns**:
[Same structure]

**Recommendations by Effort**:
- Quick Wins (< 1 hour): [Actions]
- Medium Effort (1-4 hours): [Actions]
- Large Effort (> 4 hours): [Actions]

**Full Report**: [Link to detailed analysis]
```

## Integration with Development

This skill pairs well with:
- **Deep Research**: Understand WHY patterns exist
- **Systematic Debugging**: Find patterns in errors
- **Review Critically**: Identify anti-patterns in new code
- **Refactoring**: Plan refactoring based on patterns found

## Common Pitfalls to Avoid

**Don't:**
- Report patterns without context (why do they matter?)
- Assume all variation is wrong (sometimes it's intentional)
- Fix patterns without understanding why they exist
- Over-standardize (some variation is healthy)
- Get lost in analysis (report findings, don't rewrite code)

**Do:**
- Understand context before criticizing patterns
- Check git history to see WHY patterns emerged
- Distinguish between consistency issues and intentional variation
- Prioritize patterns by impact
- Provide specific recommendations
- Document patterns for future developers
