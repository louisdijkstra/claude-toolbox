---
name: researching-best-practices
description: Research production-ready best practices for implementing a specific feature or technical decision. Uses project context to find relevant, non-hacky solutions that align with the application's architecture, scale, and constraints.
---

# Researching Best Practices

## Purpose
Before implementing a feature or making a technical decision, research industry best practices that are appropriate for your specific project context. Focuses on production-ready, maintainable solutions rather than quick hacks or shortcuts.

## When to Use This Skill

Use when:
- Implementing a new feature or integration
- Making architectural decisions
- Choosing between technical approaches
- Evaluating trade-offs for production systems
- Unsure about the "right way" to solve a problem
- Need to justify a technical decision
- Avoiding common pitfalls or anti-patterns

**Don't use for:**
- Simple, well-understood patterns
- Quick prototypes or POCs (unless they'll become production)
- Questions with obvious answers

## How It Works

### Step 1: Get Project Context

**Always start by reading project documentation:**
```bash
# Read the project overview
cat docs/PROJECT_DESCRIPTION.md

# If you need more details
cat docs/FULL_PROJECT_DESCRIPTION.md
```

**Extract key information:**
- Application type (web app, CLI, API, agent, etc.)
- Scale expectations (users, requests/day, data volume)
- Tech stack and constraints
- Security/compliance requirements
- Deployment environment
- Team size and expertise
- Maturity level (MVP, production, enterprise)

### Step 2: Define the Research Question

**Bad research questions:**
- "How do I use Redis?"
- "What's the best way to do authentication?"
- "Should I use microservices?"

**Good research questions:**
- "How should I implement rate limiting for a FastAPI app expecting 10K requests/day with Redis already in the stack?"
- "What's the production-ready approach for JWT refresh tokens in a React/FastAPI app with 5K users?"
- "Should I use event sourcing for this analytics dashboard with 1M events/month?"

**Template:**
```
"How should I implement [FEATURE] for [PROJECT_TYPE] 
expecting [SCALE] with [CONSTRAINTS] while ensuring [REQUIREMENTS]?"
```

### Step 3: Research Strategy

**Search for:**
1. **Official documentation** (most important)
2. **Production guides** (not tutorials)
3. **Architecture decision records** (ADRs)
4. **Case studies** from companies at similar scale
5. **Stack Overflow** (for common pitfalls)
6. **GitHub issues** (real-world problems)

**Search terms pattern:**
```
"[technology] production best practices"
"[technology] at scale"
"[technology] architecture patterns"
"[feature] production deployment"
"[feature] security considerations"
"[feature] common mistakes"
```

### Step 4: Filter Results

**Prioritize sources that:**
- Come from production environments
- Match your scale (don't cargo-cult Google's solutions for a 100-user app)
- Consider security and maintainability
- Explain trade-offs, not just "how-to"
- Are recent (within 2-3 years for fast-moving tech)

**Ignore sources that:**
- Use "quick hack" or "simple trick"
- Skip error handling or edge cases
- Don't mention testing or monitoring
- Are overly complex for your scale
- Contradict official documentation

### Step 5: Evaluate Against Project Context

**Critical questions:**

1. **Does this scale appropriately?**
   - MVP: Simple, fast to implement
   - Production: Reliable, monitored, tested
   - Enterprise: Compliant, auditable, resilient

2. **Does this fit our constraints?**
   - Tech stack compatibility
   - Budget (infrastructure, development time)
   - Team expertise
   - Deployment environment

3. **What are the trade-offs in OUR context?**
   - Performance vs. complexity
   - Cost vs. features
   - Speed to ship vs. technical debt
   - Flexibility vs. opinionation

4. **Is this maintainable?**
   - Can the team understand and modify it?
   - Does it follow established patterns in the codebase?
   - Will it require ongoing maintenance?

5. **What could go wrong?**
   - Security vulnerabilities
   - Performance bottlenecks
   - Data loss scenarios
   - Failure modes

## Research Process Example

### Example 1: Implementing Background Jobs

**Step 1: Read PROJECT_DESCRIPTION.md**
```
Key findings:
- FastAPI application
- Expected scale: 50K users, 500K requests/day
- Already using PostgreSQL
- Deploying on AWS ECS
- Team: 3 backend developers
- Stage: Production (6 months old)
```

**Step 2: Define Research Question**
```
"How should I implement background job processing for a FastAPI app 
on AWS ECS with 500K requests/day, using PostgreSQL, while ensuring 
reliable job execution and monitoring?"
```

**Step 3: Search Queries**
```
1. "FastAPI background tasks production"
2. "Python task queue AWS ECS"
3. "Celery vs RQ production comparison"
4. "PostgreSQL as job queue"
5. "AWS SQS Python best practices"
```

**Step 4: Findings Summary**

**Option 1: Celery + Redis**
- Pros: Industry standard, rich features, great monitoring
- Cons: Additional infrastructure (Redis), complexity for simple use cases
- Scale: Handles millions of tasks/day
- Fit: Good for complex workflows, might be overkill

**Option 2: AWS SQS + Worker**
- Pros: Managed service, no infra, integrates with ECS
- Cons: Less flexible, vendor lock-in
- Scale: Auto-scales, perfect for the use case
- Fit: Excellent - matches AWS deployment, team doesn't manage queue

**Option 3: PostgreSQL + pg_notify**
- Pros: No additional dependencies, already have PostgreSQL
- Cons: Not designed for high-volume queuing, limited features
- Scale: OK for low volume, not for 500K/day
- Fit: Poor - below scale needs

**Step 5: Recommendation**
```
**Context from Project**: You're running on AWS ECS with 500K requests/day 
and a 3-person team. Reliability and monitoring are priorities.

**Recommendation**: AWS SQS + Python worker containers

**Why this fits**:
- Aligns with AWS deployment (no new infrastructure to manage)
- Scales automatically to handle traffic spikes
- Team of 3 doesn't need to maintain queue infrastructure
- Built-in monitoring via CloudWatch
- Dead-letter queues for failed jobs

**Implementation approach**:
1. Use SQS FIFO queues for order-dependent tasks
2. Deploy worker as separate ECS service
3. Use boto3 with exponential backoff
4. Implement idempotency for all job handlers
5. Monitor queue depth and worker errors in CloudWatch

**Trade-offs**:
- AWS vendor lock-in (but you're already on AWS)
- Less feature-rich than Celery (no chaining, complex workflows)
- Costs ~$0.40 per million requests (acceptable for your scale)

**When to revisit**: If you need complex workflow orchestration (chaining, 
callbacks) or need to move away from AWS, consider Celery + Redis.
```

### Example 2: API Authentication

**Step 1: Read PROJECT_DESCRIPTION.md**
```
Key findings:
- React SPA + FastAPI backend
- B2B SaaS, 200 organizations, 5K users
- Sensitive financial data (SOC 2 required)
- Mobile app planned in 6 months
- Team: 2 frontend, 2 backend developers
```

**Step 2: Define Research Question**
```
"How should I implement authentication for a React/FastAPI B2B SaaS 
app with 5K users, handling sensitive financial data, requiring SOC 2 
compliance, with a mobile app planned?"
```

**Step 3: Research Focus**
```
- JWT best practices for SPAs
- Refresh token security
- SOC 2 authentication requirements
- FastAPI OAuth2 patterns
- Token storage in React
- Mobile app authentication considerations
```

**Step 4: Key Findings**

**Token Strategy:**
- Access tokens: Short-lived (15 min), in memory
- Refresh tokens: Long-lived (7 days), httpOnly cookie
- Never store sensitive tokens in localStorage (XSS vulnerability)

**Security Requirements for SOC 2:**
- MFA enforcement for admin accounts
- Audit logging of authentication events
- Session timeout
- Password policies
- Token rotation

**Step 5: Recommendation**

Context from Project: B2B SaaS with SOC 2 requirements, sensitive
financial data, and mobile app coming soon.
Recommendation: JWT access tokens + httpOnly refresh tokens + OAuth2
Implementation:

Access tokens (JWT): 15-minute expiry, in-memory storage
Refresh tokens: 7-day expiry, httpOnly secure cookies
FastAPI OAuth2PasswordBearer for access tokens
Separate /auth/refresh endpoint
Redis for token blacklist (logout, password change)

Security measures (SOC 2 requirements):

MFA using TOTP (pyotp library)
Audit log all auth events to PostgreSQL
Rate limiting on auth endpoints (20 attempts/hour)
Automatic session timeout after 8 hours
Password requirements: 12+ chars, complexity rules

Mobile app considerations:

For mobile: Use same JWT access tokens
Store refresh token in secure storage (Keychain/Keystore)
Implement biometric authentication as optional MFA

Don't do (common mistakes):

❌ Store access tokens in localStorage (XSS risk)
❌ Long-lived access tokens (reduces revocation ability)
❌ Skip refresh token rotation (security risk)
❌ Use sessions with cookies (breaks mobile app)

### Code structure:

# backend/auth/tokens.py
- create_access_token() - 15 min expiry
- create_refresh_token() - 7 days, store in Redis
- verify_token() - check signature and expiry
- blacklist_token() - add to Redis on logout

# backend/auth/routes.py
- POST /auth/login - returns access + refresh
- POST /auth/refresh - rotates refresh token
- POST /auth/logout - blacklists tokens
- POST /auth/mfa/verify - TOTP verification
```

**Trade-offs**:
- More complex than simple sessions (but necessary for mobile)
- Redis dependency for blacklist (minimal cost, high value)
- Refresh token rotation adds latency (~50ms)

**Testing priorities**:
1. Token expiry and refresh flow
2. Token blacklist after logout
3. MFA enforcement for admin roles
4. Rate limiting on auth endpoints
```

## Research Documentation Template

After researching, document your findings:
```markdown
# Research: [Feature Name]

## Context
- **Project**: [Brief description]
- **Scale**: [Users, requests, data volume]
- **Constraints**: [Tech stack, budget, compliance]
- **Timeline**: [MVP/Production/Enterprise]

## Research Question
[Specific, contextualized question]

## Options Evaluated

### Option 1: [Name]
**Description**: [Brief overview]
**Pros**: 
- [Advantage 1]
- [Advantage 2]
**Cons**:
- [Disadvantage 1]
- [Disadvantage 2]
**Fit**: [How well it matches project needs]
**Sources**: [Links to docs, articles]

### Option 2: [Name]
[Same format]

### Option 3: [Name]
[Same format]

## Recommended Approach

**Choice**: [Selected option]

**Rationale**:
- Aligns with [specific requirement]
- Scales to [specific metric]
- Team has expertise in [relevant tech]
- Fits within [budget/timeline constraint]

**Implementation Plan**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Anti-patterns to Avoid**:
- ❌ [Common mistake 1]
- ❌ [Common mistake 2]

**Testing Strategy**:
- [Critical test 1]
- [Critical test 2]

**Monitoring**:
- [Metric 1 to track]
- [Metric 2 to track]

**Trade-offs Accepted**:
- [Trade-off 1]: [Why it's acceptable]
- [Trade-off 2]: [Why it's acceptable]

**When to Revisit**:
[Conditions that would make you reconsider]

## References
- [Official docs]
- [Production case studies]
- [Architecture guides]
```

## Red Flags to Avoid

**🚩 Skip these approaches:**

1. **"Quick and dirty" solutions**
   - "Just store passwords in plaintext for now"
   - "We'll add error handling later"
   - "Security isn't important for MVP"

2. **Cargo-culting big tech**
   - "Let's use Kubernetes like Netflix" (for 100 users)
   - "We need microservices like Amazon" (3-person team)
   - "Let's implement event sourcing like LinkedIn" (simple CRUD app)

3. **Over-engineering**
   - Building abstractions for future needs
   - Adding unnecessary layers
   - Premature optimization

4. **Under-engineering**
   - No error handling
   - No logging or monitoring
   - No tests
   - No security considerations

5. **Ignoring constraints**
   - Solutions requiring expertise team doesn't have
   - Exceeding budget significantly
   - Incompatible with existing stack

## Common Scenarios

### Scenario: Caching Strategy

**Research areas:**
- Cache invalidation patterns
- Redis vs. Memcached vs. in-memory
- Cache-aside vs. write-through
- TTL strategies
- Distributed cache consistency

**Key considerations:**
- Data consistency requirements
- Cache hit ratio targets
- Budget for cache infrastructure
- Complexity vs. performance gain

### Scenario: Database Choice

**Research areas:**
- SQL vs. NoSQL for your use case
- Read/write patterns
- Query complexity
- Scaling strategy
- Data consistency needs

**Key considerations:**
- Team expertise (most important for MVP)
- Query patterns
- Transaction requirements
- Cost at your scale

### Scenario: Error Handling

**Research areas:**
- Exception handling patterns
- Retry strategies (exponential backoff)
- Circuit breakers
- Error logging and alerting
- User-facing error messages

**Key considerations:**
- Failure modes
- Recovery strategies
- Debugging capability
- User experience

### Scenario: Testing Strategy

**Research areas:**
- Unit vs. integration vs. e2e testing
- Test coverage targets
- CI/CD integration
- Testing in production (feature flags, canaries)

**Key considerations:**
- Team velocity vs. test coverage
- Critical paths to test
- Test maintenance burden
- Confidence level needed

## Integration with Development

**Before coding:**
1. Read project docs (getting-the-bigger-picture)
2. Research best practices (this skill)
3. Document decision and rationale
4. Get team alignment
5. Start implementation

**During implementation:**
- Refer back to research findings
- Note any deviations and why
- Update documentation if learning new info

**After implementation:**
- Document what worked well
- Note any surprises or gotchas
- Share learnings with team

## Quick Decision Framework

**For each approach, ask:**

1. ✅ **Production-ready?**
   - Has error handling
   - Has monitoring
   - Has tests
   - Handles edge cases

2. ✅ **Maintainable?**
   - Team can understand it
   - Follows established patterns
   - Well-documented
   - Not overly clever

3. ✅ **Appropriate scale?**
   - Handles expected load
   - Doesn't over-engineer
   - Scales with growth plan
   - Cost-effective

4. ✅ **Fits constraints?**
   - Compatible with tech stack
   - Within budget
   - Meets compliance requirements
   - Deployable in target environment

5. ✅ **Secure?**
   - No obvious vulnerabilities
   - Follows security best practices
   - Handles sensitive data properly
   - Audit trail if needed

## Resources

**General best practices:**
- [12 Factor App](https://12factor.net/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Google SRE Book](https://sre.google/books/)

**Security:**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)

**Architecture:**
- [Martin Fowler's Blog](https://martinfowler.com/)
- [High Scalability Blog](http://highscalability.com/)

## Notes

- **Always start with project context** - solutions are context-dependent
- **Prefer boring technology** for most use cases
- **Consider operational burden** - who maintains this?
- **Think about the next developer** - make it understandable
- **Question assumptions** - why is everyone doing it this way?
- **Production ≠ perfect** - ship working code, iterate
- **Document decisions** - future you will thank present you