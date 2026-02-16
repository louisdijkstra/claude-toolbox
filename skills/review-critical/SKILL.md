---
name: review-critically
description: Perform rigorous security-focused code review that catches production issues before deployment. Generates concise reports for automated remediation.
---

# Review Critically

## Purpose
Execute thorough, security-first code reviews matching production standards. Flag all issues without sugar-coating. Generate machine-readable reports for automated fixes.

## When to Use This Skill

Use this skill when:
- Code ready for production deployment
- Security-sensitive features added (auth, data handling, external APIs)
- User requests thorough review or security audit
- Database queries or cryptographic operations implemented
- Before merging to main/production branches

**Do NOT use for:**
- Early drafts or proof-of-concept code
- Documentation-only changes
- When user explicitly requests quick feedback only

## How It Works

### 1. Scan for Obvious Issues
````bash
# Quick security scan
grep -rn "password\s*=\s*['\"]" . 2>/dev/null
grep -rn "api[_-]key\s*=\s*['\"]" . 2>/dev/null
grep -rn "eval\(" . 2>/dev/null
grep -rn "exec\(" . 2>/dev/null
````

### 2. Review Security Checklist

**Critical Security Areas:**
- Input validation (all user inputs)
- SQL/NoSQL injection prevention (parameterized queries only)
- Authentication on protected endpoints
- Authorization checks at access points
- XSS prevention (output encoding)
- CSRF protection
- Secrets management (no hardcoded credentials)
- Error messages (no info leakage)
- Cryptography (standard algorithms, secure RNG)
- Rate limiting on APIs
- Dependency vulnerabilities

**Production Readiness:**
- Error handling (all edge cases)
- Resource cleanup (connections, files, memory)
- Timeouts on external calls
- N+1 query issues
- Logging (no sensitive data)
- Performance at scale

### 3. Generate Report
````bash
# Create review directory
mkdir -p docs/code-review

# Generate filename: YYYY-MM-DD-component-type.md
# Examples:
#   2024-03-15-auth-security.md
#   2024-03-15-api-endpoints-full.md
#   2024-03-15-payment-critical.md
````

## Report Structure
````markdown
# Code Review: <Component>

Date: YYYY-MM-DD
Files: <list>
Recommendation: APPROVED | APPROVED_WITH_CONDITIONS | CHANGES_REQUIRED

## Critical 🔴
### <Issue>
File: path/to/file:line
Risk: <exploitation scenario>
Fix: <code block with solution>

## High 🟠
[Same structure]

## Medium 🟡
[Same structure]

## Low 🟢
[Same structure]

## Security Checklist
- [ ] Input validation
- [ ] Parameterized queries
- [ ] Authentication required
- [ ] Authorization checks
- [ ] Output encoding
- [ ] CSRF protection
- [ ] Secrets secured
- [ ] Error handling safe
- [ ] Crypto standard
- [ ] Rate limiting
- [ ] Dependencies current

## Tests Required
- [ ] <specific test>
- [ ] <edge case>
````

## Severity Levels

**🔴 Critical** - Blocks deployment
- Remote code execution
- SQL/Command injection
- Auth bypass
- Hardcoded secrets
- Data loss risk

**🟠 High** - Must fix before production
- XSS vulnerabilities
- Missing authorization
- Weak crypto
- Resource exhaustion
- Critical error handling missing

**🟡 Medium** - Fix in next sprint
- Input validation gaps (low-risk)
- Performance issues
- Missing logs
- Test coverage gaps

**🟢 Low** - Nice to have
- Code style
- Minor optimizations
- Documentation

## Response Pattern

1. **Acknowledge**
````
   Conducting security-focused review. Will flag all production-blocking issues.
````

2. **Execute review** (use checklist above)

3. **Generate report**
````bash
   DATE=$(date +%Y-%m-%d)
   cat > docs/code-review/${DATE}-<component>-<type>.md << 'EOF'
   [report content]
   EOF
````

4. **Summarize findings**
````
   Review complete: X critical, Y high, Z medium issues found.
   
   BLOCKS DEPLOYMENT:
   - <critical issue>
   - <critical issue>
   
   Report: docs/code-review/<filename>.md
````

## Example Report
````markdown
# Code Review: Authentication Endpoints

Date: 2024-03-15
Files: api/auth.py, models/user.py
Recommendation: CHANGES_REQUIRED

## Critical 🔴

### SQL Injection in User Search
File: models/user.py:78
Risk: Full database compromise via crafted input
Current:
```python
sql = f"SELECT * FROM users WHERE name LIKE '%{query}%'"
```
Fix:
```python
sql = "SELECT * FROM users WHERE name LIKE :pattern"
db.execute(text(sql), {"pattern": f"%{query}%"})
```

### No Rate Limiting on Login
File: api/auth.py:45
Risk: Brute force attack, credential stuffing
Fix:
```python
@limiter.limit("5 per minute")
@app.route('/login', methods=['POST'])
def login():
    # existing code
```

## High 🟠

### Timing Attack in Password Check
File: api/auth.py:52
Risk: Username enumeration via response timing
Fix: Use constant-time comparison for password validation

## Medium 🟡

### Missing Input Validation
File: api/auth.py:46
Risk: DoS via oversized inputs
Fix: Add length checks (username<255, password<255)

## Security Checklist
- [ ] Input validation - MISSING length checks
- [x] Parameterized queries - FAILED in user.py:78
- [x] Authentication required
- [x] Authorization checks
- [x] Output encoding
- [ ] CSRF protection - NOT IMPLEMENTED
- [x] Secrets secured
- [ ] Error handling safe - Reveals username existence
- [x] Crypto standard
- [ ] Rate limiting - MISSING
- [x] Dependencies current

## Tests Required
- [ ] Test SQL injection attempts
- [ ] Test brute force protection
- [ ] Test timing attack resistance
- [ ] Test oversized input handling
````

## Quick Reference

Before completing review:

- [ ] All OWASP Top 10 categories checked
- [ ] Input validation verified on all inputs
- [ ] Auth/authz on protected resources
- [ ] No hardcoded secrets
- [ ] Error handling doesn't leak info
- [ ] Crypto uses standard libraries
- [ ] Dependencies checked for CVEs
- [ ] Report generated at docs/code-review/
- [ ] All issues have concrete fixes
- [ ] Severity correctly assigned

## Notes

- Be thorough, not diplomatic - flag everything
- Every issue needs actionable fix with code
- Reports are machine-readable - no fluff
- Critical issues block all deployments
- Provide specific line numbers and exact code fixes
- Another agent must be able to auto-fix from report alone