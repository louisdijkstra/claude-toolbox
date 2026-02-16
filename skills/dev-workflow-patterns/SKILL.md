---
name: pattern-discovery
description: Discovers how features are currently implemented in the codebase to maintain consistency. Use before implementing new functionality to match existing patterns and conventions.
---

# Pattern Discovery

## Purpose

Find how something is CURRENTLY implemented to ensure new code matches existing patterns, conventions, and architecture.

## When to Use This Skill

Use this skill when:
- Implementing new API endpoints
- Adding database access patterns
- Implementing authentication/authorization
- Adding error handling
- Writing tests for new features
- Unsure how to structure new code

**Do NOT use for:**
- Greenfield projects with no existing code
- When explicitly told to use different pattern
- Quick fixes where pattern is obvious
- One-off scripts

**If uncertain:** Always check existing patterns before implementing. It's faster to follow established patterns than to refactor later.

## Process

### Step 1: Identify Pattern Type

Determine what you're trying to implement:
- API endpoint
- Database access
- Authentication
- Error handling
- Testing
- Other

### Step 2: Search Codebase

Use appropriate search strategy for pattern type.

**For API endpoints:**
```bash
# Find existing API routes
find . -name "*.py" -type f -exec grep -l "router\|@app\|@api" {} \; | head -10
```

**For Database access:**
```bash
# Find database patterns
find . -name "*.py" -type f -exec grep -l "Session\|query\|repository" {} \; | head -10
```

**For Authentication:**
```bash
# Find auth patterns
find . -name "*.py" -type f -exec grep -l "auth\|token\|OAuth2" {} \; | head -10
```

**For Testing:**
```bash
# Find test patterns
find . -name "test_*.py" -o -name "*_test.py" | head -10
```

### Step 3: Analyze Files

For each relevant file found:

1. **Read the file** to understand structure
2. **Extract key elements:**
   - File structure (where it lives)
   - Imports (libraries used)
   - Naming conventions
   - Code patterns (how it's structured)
   - Error handling style
   - Testing approach

### Step 4: Document Pattern

Create or update pattern documentation at `docs/patterns/[area]-pattern.md`:

```markdown
# Pattern: [Area Name]

**Current Implementation:**

**Key Files:**
- `src/path/to/file.py` - [Purpose]

**Libraries Used:**
- [Library 1] - [Why]

**Structure:**
[Describe the pattern]

**Example:**
\`\`\`python
# Actual code from codebase
\`\`\`

**When to use:** [Guidelines]

**When NOT to use:** [Exceptions]
```

### Step 5: Return Recommendation

Provide clear guidance on following the discovered pattern.

**Format:**
```
Pattern: [Name]
Found in: [File paths]
Libraries: [List]
Structure: [Description]

Recommendation: STICK to this pattern unless:
- [Reason 1 to deviate]
- [Reason 2 to deviate]

If deviating:
1. Document reason in docs/decisions/XXX-[topic].md
2. Update ARCHITECTURE.md
3. Create new pattern doc
```

## Example Output

```
Pattern: API Endpoints
Found in: src/api/v1/users.py, src/api/v1/analytics.py
Libraries: FastAPI, Pydantic
Structure: Router → Service → Repository pattern

Current Pattern:
- Routes in src/api/v1/[resource].py
- Plural nouns (/users/, /analytics/)
- Pydantic models for validation
- HTTPException for errors
- pytest with TestClient for tests

Recommendation: STICK to this pattern

Files to check:
- src/api/v1/users.py (example endpoint)
- src/services/user_service.py (business logic)
- src/repositories/user_repository.py (data access)
- tests/api/test_users.py (testing pattern)
```

## Integration with Development

This skill coordinates with:
- **dev-workflow-flow**: Use during Stage 2 (Design)
- **dev-workflow-tdd**: Apply discovered patterns in tests
- **review-plan**: Validate approach matches existing patterns
- **docs-manager**: Document new patterns when established

## Common Pitfalls to Avoid

**Don't:**
- Assume you know the pattern without checking
- Ignore established patterns for "better" alternatives
- Mix multiple patterns in same codebase
- Skip documentation when deviating from pattern

**Do:**
- Always check existing code first
- Follow established patterns consistently
- Document deviations with clear reasoning
- Update pattern docs when patterns evolve
