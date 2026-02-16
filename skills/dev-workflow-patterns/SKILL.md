---
name: pattern-discovery
description: Discovers how features are currently implemented in the codebase to maintain consistency
---

# Pattern Discovery

## Purpose
Find how something is CURRENTLY implemented to ensure new code matches existing patterns.

## When Invoked
Before implementing:
- New API endpoints
- Database access
- Authentication/authorization
- Error handling
- Testing

## Process

### Step 1: Identify Pattern Type

What are you trying to implement?
- API endpoint
- Database access
- Authentication
- Error handling
- Testing
- Other

### Step 2: Search Codebase

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

### Step 3: Analyze Files

For each relevant file:
1. Read the file
2. Extract:
   - File structure (where it lives)
   - Imports (libraries used)
   - Naming conventions
   - Patterns (how it's structured)
   - Error handling style
   - Testing approach

### Step 4: Document Pattern

Create/update `docs/patterns/[area]-pattern.md`:

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

Format:
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
