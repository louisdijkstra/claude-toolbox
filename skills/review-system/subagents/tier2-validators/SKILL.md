---
name: review-tier2
description: Tier 2 code review - design, architecture, and completeness validation
---

# Code Review - Tier 2: Design & Completeness

## Purpose

Second-tier code review focused on design quality, architectural alignment, and completeness. Assumes Tier 1 passed (no critical security/quality issues).

## Review Focus

### Design Review (10-15 minutes)

**Design quality checklist:**
- [ ] Approach matches requirements (solves the right problem)
- [ ] Solution is minimal and focused (no over-engineering)
- [ ] Interfaces are clean and intuitive
- [ ] Error cases are handled appropriately
- [ ] Code is readable and self-documenting
- [ ] Complexity is justified

**Design questions:**
- Does this solve the problem well?
- Is this the simplest approach that works?
- Will others understand this code in 6 months?
- Are edge cases handled?

### Architecture & Performance Review (10-15 minutes)

**Architecture alignment:**
- [ ] Consistent with existing patterns
- [ ] Proper layering (UI → Service → Repository)
- [ ] Dependencies flow correctly (no circular refs)
- [ ] Integration points are clear
- [ ] Future maintenance is reasonable

**Performance considerations:**
- [ ] No obvious bottlenecks (N+1 queries, nested loops)
- [ ] Database queries are efficient (indexed fields, proper joins)
- [ ] Network calls are minimized and batched
- [ ] Resource usage is reasonable (memory, CPU)
- [ ] Caching is appropriate

**Performance red flags:**
```python
# ❌ N+1 query problem
for user in users:
    user.orders = db.query(f"SELECT * FROM orders WHERE user_id = {user.id}")

# ❌ Inefficient query
db.query("SELECT * FROM large_table")  # Fetches millions of rows

# ❌ Excessive network calls
for item in items:
    api.fetch(item.id)  # Should batch
```

### Completeness Review (10-15 minutes)

**Testing completeness:**
- [ ] Unit tests for core logic
- [ ] Integration tests for dependencies
- [ ] Edge case coverage (null, empty, invalid)
- [ ] Error scenario tests
- [ ] Coverage >80% for new code

**Documentation completeness:**
- [ ] Code comments explain "why" not "what"
- [ ] API documentation updated (if public API)
- [ ] Architecture notes updated (if architectural change)
- [ ] Breaking changes documented

**Deployment readiness:**
- [ ] No breaking changes to public APIs (or documented)
- [ ] Database migrations included (if schema change)
- [ ] Configuration managed properly (no hardcoded values)
- [ ] Rollback plan considered

## Output Format

```markdown
## Tier 2 Review: Design & Completeness

### Design Assessment
✅ **PASS**: Well-designed, appropriate solution
⚠️ **CONCERNS**: [List design concerns]
❌ **ISSUES**: [Design problems requiring changes]

**Design strengths:**
- [What's done well]
- [Good design choices]

**Design concerns:**
- [Area for improvement]
- [Potential simplification]

**Design quality:**
- Solves problem: ✅ Yes / ⚠️ Partially / ❌ No
- Simplicity: ✅ Simple / ⚠️ Complex / ❌ Over-engineered
- Readability: ✅ Clear / ⚠️ Complex / ❌ Unclear
- Maintainability: ✅ Easy / ⚠️ Moderate / ❌ Difficult

### Architecture & Performance Assessment
✅ **PASS**: Fits architecture, no performance issues
⚠️ **CONCERNS**: [List concerns]
❌ **ISSUES**: [Problems requiring changes]

**Architectural fit:**
- Pattern consistency: ✅/⚠️/❌ [Comment]
- Layering: ✅/⚠️/❌ [Comment]
- Dependencies: ✅/⚠️/❌ [Comment]
- Integration: ✅/⚠️/❌ [Comment]

**Performance analysis:**
- Database queries: ✅ Efficient / ⚠️ Could improve / ❌ Problematic
- Network calls: ✅ Optimized / ⚠️ Could batch / ❌ Excessive
- Resource usage: ✅ Reasonable / ⚠️ High / ❌ Excessive
- Caching: ✅ Appropriate / ⚠️ Could use / ❌ Missing where needed

**Concerns:**
- [Performance concern 1 with suggestion]
- [Architecture concern with suggestion]

### Completeness Assessment
✅ **PASS**: Complete with adequate tests/docs
⚠️ **CONCERNS**: [List gaps]
❌ **INCOMPLETE**: [Missing critical elements]

**Testing completeness:**
- Unit tests: ✅ Comprehensive / ⚠️ Partial / ❌ Missing
- Integration tests: ✅ Adequate / ⚠️ Gaps / ❌ None
- Edge cases: ✅ Covered / ⚠️ Partial / ❌ Missing
- Coverage: [X]% (✅ >80% / ⚠️ 60-80% / ❌ <60%)

**Documentation completeness:**
- Code comments: ✅ Clear / ⚠️ Sparse / ❌ Missing
- API docs: ✅ Updated / ⚠️ Needs update / ❌ Not updated / N/A
- Architecture docs: ✅ Updated / ⚠️ Needs update / ❌ Not updated / N/A
- Breaking changes: ✅ Documented / ❌ Not documented / N/A

**Deployment readiness:**
- Backward compatibility: ✅ Maintained / ⚠️ Breaking (documented) / ❌ Breaking (undocumented)
- Migrations: ✅ Included / ❌ Missing / N/A
- Configuration: ✅ Proper / ⚠️ Some hardcoded / ❌ Hardcoded values
- Rollback: ✅ Considered / ⚠️ Unclear / ❌ Not considered

### Summary
- **Design**: ✅/⚠️/❌
- **Architecture**: ✅/⚠️/❌
- **Performance**: ✅/⚠️/❌
- **Testing**: ✅/⚠️/❌
- **Documentation**: ✅/⚠️/❌
- **Deployment**: ✅/⚠️/❌

### Recommendations
**Must address:**
1. [Critical item to fix]
2. [Critical item to fix]

**Should consider:**
1. [Suggested improvement]
2. [Suggested improvement]

**Nice to have:**
1. [Optional enhancement]

### Overall Recommendation
- ✅ **APPROVED**: Ready for merge
- ⚠️ **APPROVED WITH CONDITIONS**: Address must-fix items
- ❌ **CHANGES REQUIRED**: Needs significant changes

**Next steps:**
[What needs to happen before merge]
```

## Common Issues & Suggestions

### Design Issues

**Issue**: Over-engineered solution
```python
# ❌ Over-engineered for simple feature
class AbstractUserFactoryStrategyBuilder:
    def create_user_with_strategy(self, ...): pass

# ✅ Simple solution
def create_user(name, email):
    return User(name=name, email=email)
```

**Issue**: Unclear naming
```python
# ❌ Unclear
def proc(d):
    r = calc(d)
    return r

# ✅ Clear
def process_order(order_data):
    total = calculate_total(order_data)
    return total
```

### Architecture Issues

**Issue**: Layer violation
```python
# ❌ Controller accesses database directly
@app.get("/users")
def get_users():
    return db.query("SELECT * FROM users")

# ✅ Proper layering
@app.get("/users")
def get_users():
    return user_service.get_all_users()
```

### Performance Issues

**Issue**: N+1 query
```python
# ❌ N+1 queries
users = User.query.all()
for user in users:
    user.orders = Order.query.filter_by(user_id=user.id).all()

# ✅ Single query with join
users = User.query.options(joinedload(User.orders)).all()
```

### Completeness Issues

**Issue**: Missing edge case tests
```python
# ❌ Only tests happy path
def test_divide():
    assert divide(10, 2) == 5

# ✅ Tests edge cases
def test_divide():
    assert divide(10, 2) == 5
    assert divide(10, 3) == pytest.approx(3.33)
    with pytest.raises(ZeroDivisionError):
        divide(10, 0)
```

**Issue**: Missing documentation for breaking change
```python
# ❌ Breaking change, no docs
# Changed API from /api/users to /api/v2/users
# No migration guide, no deprecation notice

# ✅ Document breaking change
"""
BREAKING CHANGE: API endpoints moved to /api/v2/

Migration guide:
- Old: GET /api/users → New: GET /api/v2/users
- Old endpoints will be deprecated 2024-06-01
- See docs/migration/v2-api.md for full guide
"""
```

## Integration

**Requires:**
- review-tier1 must pass first (no critical issues)

**Feeds into:**
- Approval for merge (if passed)
- code-refiner (if conditional/changes required)

**Uses:**
- pattern-discovery (for architectural patterns)
- getting-the-bigger-picture (for context)

**Approval flow:**
```
Tier 1 ✅ → Tier 2 review
                ↓
           ✅ APPROVED → Merge
                ↓
           ⚠️/❌ → Fix → Re-review Tier 2
```
