---
name: review-tier1
description: Tier 1 code review - critical security and quality issues
---

# Code Review - Tier 1: Critical Issues

## Purpose

First-tier code review focused on blocking issues: security vulnerabilities, critical bugs, and architectural violations. Catches problems that would break production or compromise security.

## Review Focus

### Security Review (15-20 minutes)

**Critical security checklist:**
- [ ] No hardcoded secrets, credentials, API keys, or tokens
- [ ] Input validation on all user/external inputs
- [ ] SQL injection prevention (parameterized queries, ORM)
- [ ] Command injection prevention (no shell=True with user input)
- [ ] Authentication required on protected endpoints
- [ ] Authorization checks in place (user can only access their data)
- [ ] XSS prevention (output encoding, CSP headers)
- [ ] CSRF protection for state-changing operations
- [ ] Error messages don't leak sensitive information
- [ ] Cryptography uses standard algorithms (no custom crypto)
- [ ] Dependencies checked for known CVEs

**Security red flags:**
```python
# ❌ Hardcoded credentials
API_KEY = "sk_live_abc123..."

# ❌ SQL injection vulnerability
query = f"SELECT * FROM users WHERE id = {user_id}"

# ❌ Command injection
os.system(f"ping {user_input}")

# ❌ No authentication
@app.get("/admin/users")
def get_users():  # Anyone can call this

# ❌ Information leakage
except Exception as e:
    return {"error": str(e)}  # Leaks stack trace
```

### Code Quality Review (10-15 minutes)

**Critical quality checklist:**
- [ ] Follows project code conventions
- [ ] Error handling exists and is complete
- [ ] All edge cases are considered (null, empty, invalid input)
- [ ] No obvious performance issues (N+1 queries, infinite loops)
- [ ] Resource cleanup (files closed, connections released)
- [ ] Logging is appropriate (no PII in logs)
- [ ] Comments explain "why" not "what"
- [ ] Test coverage exists for critical paths

**Quality red flags:**
```python
# ❌ No error handling
def process_data(data):
    result = api.fetch(data["id"])  # What if data has no "id"?
    return result.parse()  # What if api.fetch fails?

# ❌ Resource leak
file = open("data.txt")
process(file)  # File never closed

# ❌ Performance issue
for user in users:  # N+1 query problem
    user.orders = db.query(f"SELECT * FROM orders WHERE user_id = {user.id}")

# ❌ PII in logs
logger.info(f"Processing user {user.email} with SSN {user.ssn}")
```

### Architectural Fit Review (5-10 minutes)

**Architecture checklist:**
- [ ] Follows existing patterns in codebase
- [ ] Doesn't violate architectural principles
- [ ] Proper separation of concerns (UI, business logic, data separate)
- [ ] Dependencies are appropriate (no circular dependencies)
- [ ] API contracts are clear and consistent
- [ ] Integration points match existing style

**Architecture red flags:**
```python
# ❌ Violates layering
@app.get("/users")
def get_users():
    result = db.execute("SELECT * FROM users")  # Controller talks to DB directly

# ❌ Circular dependency
# file_a.py imports file_b.py
# file_b.py imports file_a.py

# ❌ Inconsistent API
@app.get("/users")  # Returns list of users
@app.get("/products")  # Returns {"items": [...]} # Inconsistent structure
```

## Output Format

```markdown
## Tier 1 Review: Critical Issues

### 🔴 Blocking Issues (MUST FIX)
- **[file.py:123]** [Security/Quality/Architecture]: [Description]
  - **Impact**: [What could go wrong]
  - **Fix**: [How to address]

- **[file.py:456]** [Category]: [Description]
  - **Impact**: [What could go wrong]
  - **Fix**: [How to address]

### 🟠 High Priority Issues (SHOULD FIX)
- **[file.py:789]** [Category]: [Description]
  - **Impact**: [What could happen]
  - **Fix**: [How to address]

### Summary
- **Blocking issues**: [count]
- **High priority**: [count]
- **Total files reviewed**: [count]
- **Lines reviewed**: ~[count]

### Security Assessment
✅ **PASS**: No security vulnerabilities found
⚠️ **ISSUES FOUND**: [Count] security issues need fixing
❌ **CRITICAL**: [Count] critical security vulnerabilities

**Details:**
- Authentication/Authorization: ✅/⚠️/❌
- Input validation: ✅/⚠️/❌
- Injection prevention: ✅/⚠️/❌
- Secrets management: ✅/⚠️/❌
- Error handling: ✅/⚠️/❌

### Code Quality Assessment
✅ **PASS**: Code quality is acceptable
⚠️ **ISSUES FOUND**: [Count] quality issues
❌ **CRITICAL**: [Count] critical quality problems

**Details:**
- Error handling: ✅/⚠️/❌
- Resource management: ✅/⚠️/❌
- Performance: ✅/⚠️/❌
- Test coverage: ✅/⚠️/❌
- Logging: ✅/⚠️/❌

### Architectural Fit Assessment
✅ **PASS**: Follows project patterns
⚠️ **ISSUES FOUND**: [Count] architectural concerns
❌ **CRITICAL**: Violates core architecture

**Details:**
- Pattern consistency: ✅/⚠️/❌
- Layer separation: ✅/⚠️/❌
- Dependencies: ✅/⚠️/❌
- API consistency: ✅/⚠️/❌

### Recommendation
- ✅ **PASS TO TIER 2**: No blocking issues, safe to continue review
- ⚠️ **CONDITIONAL**: Fix high-priority issues, then proceed to Tier 2
- ❌ **CHANGES REQUIRED**: Fix all blocking issues before further review

**If issues found, required actions:**
1. [Fix blocking issue 1]
2. [Fix blocking issue 2]
```

## Common Critical Issues

### Security Issue Examples

**Issue**: Hardcoded API key
```python
# ❌ Bad
API_KEY = "sk_live_abc123..."

# ✅ Good
API_KEY = os.environ["API_KEY"]
```

**Issue**: SQL injection vulnerability
```python
# ❌ Bad
query = f"SELECT * FROM users WHERE email = '{email}'"

# ✅ Good
query = "SELECT * FROM users WHERE email = ?"
db.execute(query, (email,))
```

**Issue**: Missing authentication
```python
# ❌ Bad
@app.delete("/users/{id}")
def delete_user(id: int):
    db.delete(id)

# ✅ Good
@app.delete("/users/{id}")
@requires_auth
def delete_user(id: int, current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(403, "Not authorized")
    db.delete(id)
```

### Quality Issue Examples

**Issue**: No error handling
```python
# ❌ Bad
def fetch_user(id):
    return api.get(f"/users/{id}")  # What if network fails?

# ✅ Good
def fetch_user(id):
    try:
        return api.get(f"/users/{id}")
    except APIError as e:
        logger.error(f"Failed to fetch user {id}: {e}")
        raise UserNotFoundError(f"User {id} not found")
```

**Issue**: Resource leak
```python
# ❌ Bad
file = open("data.txt")
process(file)

# ✅ Good
with open("data.txt") as file:
    process(file)
```

### Architecture Issue Examples

**Issue**: Layer violation
```python
# ❌ Bad (controller directly accesses database)
@app.get("/users")
def get_users():
    return db.execute("SELECT * FROM users")

# ✅ Good (proper layering)
@app.get("/users")
def get_users():
    return user_service.get_all()
```

## Integration

**Feeds into:**
- review-tier2 (if passed)
- code-refiner (if issues found)

**Uses:**
- review-critically skill (for security-focused review)
- pattern-discovery (for architectural patterns)

**Approval flow:**
```
Code submitted → Tier 1 review
                      ↓
                 ✅ PASS → Tier 2 review
                      ↓
                 ⚠️/❌ → Fix issues → Re-review Tier 1
```
