---
name: deep-research
description: Validates technical decisions against 2026 industry standards using MCP servers and web search
---

# Deep Research

## Purpose
Validate ALL technical decisions against current industry standards (2026) to avoid outdated approaches.

## When Invoked
At four critical stages:
1. **Brainstorming:** "What's the standard way to build [feature]?"
2. **Planning:** "Does this architecture align with best practices?"
3. **Review (Tier 2):** "Is this flagged issue real per 2026 standards?"
4. **Refactoring:** "What's the current best practice for [optimization]?"

## Process

### Step 1: Formulate Research Question

Make it specific and contextualized:

**Bad:** "How do I use Redis?"
**Good:** "Best practices for Redis connection pooling in FastAPI with 10K requests/day?"

Template:
```
"How should I implement [FEATURE] for [PROJECT_TYPE]
expecting [SCALE] with [CONSTRAINTS] while ensuring [REQUIREMENTS]?"
```

### Step 2: Multi-Source Search

Use available MCP servers (examples below - check which are installed):

**1. Package Registry MCP** (if available)
```
Query: "redis python packages"
Purpose: Find current, maintained packages
```

**2. Context7 MCP** (if available)
```
Query: "[Library] latest documentation"
Purpose: Get current API docs (not outdated training data)
```

**3. Augments MCP** (if available)
```
Query: "[Framework] best practices 2026"
Purpose: Cross-reference multiple framework docs
```

**4. MDN Lookup MCP** (if available, for frontend)
```
Query: "[Web API] documentation"
Purpose: Web standards and browser compatibility
```

**5. WebSearch** (always available)
```
Query: "[Technology] production best practices 2026"
Purpose: Recent blog posts, case studies
```

**Note:** If an MCP server isn't available, use WebSearch as fallback.

### Step 3: Filter & Synthesize

**Prioritize:**
1. Official documentation (most important)
2. Production case studies from companies at similar scale
3. Recent blog posts (within 6 months)
4. Stack Overflow for common pitfalls

**Ignore:**
- "Quick hacks" or "simple tricks"
- Tutorials that skip error handling
- Posts older than 2-3 years (for fast-moving tech)
- Solutions for different scale (don't cargo-cult Google for 100 users)

### Step 4: Structure Findings

Use the research report template with these 12 sections:

```markdown
# Research: [Topic]

## Context
- Project: [Brief description]
- Scale: [Users, requests, data]
- Constraints: [Tech stack, budget, timeline]

## Research Question
[Specific question]

## Industry Standards (2026)
1. [Standard 1]
2. [Standard 2]
...

## Options Evaluated
Add as many options as needed (typically 2-4).

### Option 1: [Name]
[Description, pros, cons, scale fit, sources]

### Option 2: [Name]
[Repeat this structure for each option evaluated]

## Recommended Approach
[Detailed recommendation with rationale]

## Anti-Patterns to Avoid
- ❌ [Anti-pattern 1]: [Why bad]
- ❌ [Anti-pattern 2]: [Why bad]

## Testing Strategy
- Unit tests: [Approach and examples]
- Integration tests: [Approach]
- Performance tests: [Approach]

## Monitoring & Observability
- [Metric 1]: [Why important]
- [Metric 2]: [Why important]

## Trade-offs Accepted
- [Trade-off 1]: [Why acceptable]
- [Trade-off 2]: [Why acceptable]

## When to Revisit
[Conditions that would require revisiting this decision]

## References
- [Link 1]
- [Link 2]
```

### Step 5: Save Report

Save to: `docs/research/YYYY-MM-DD-[topic].md` (create docs/research/ directory if it doesn't exist)

### Step 6: Return Summary

Note: Step 6 returns a SUMMARY to the user. The FULL REPORT is saved in Step 5. Users get the summary immediately, detailed report is saved for reference.

Format:
```
Research: [Topic]

Industry Standard (2026):
[1-2 sentence summary]

Recommended Approach:
[2-3 sentence description]

Key Points:
- [Point 1]
- [Point 2]
- [Point 3]

Avoid:
- [Anti-pattern 1]
- [Anti-pattern 2]

Full report: docs/research/[filename].md
```

## Example

**Query:** "Password reset security best practices 2026"

**Research Process:**
1. Context7: "password reset implementation python"
2. WebSearch: "password reset security 2026 best practices"
3. Augments: "FastAPI authentication patterns"

**Output:**
```
Research: Password Reset Security

Industry Standard (2026):
Time-limited single-use tokens (15-30 min), email verification, rate limiting (5 attempts/hour), no password hints.

Recommended Approach:
Store tokens in Redis with expiry, send magic link via email, invalidate after first use, implement CSRF protection.

Key Points:
- Token expiry: 15-30 minutes maximum
- Single-use only (invalidate after first use)
- Rate limiting per user (max 5 requests/hour)
- Email verification required

Avoid:
- Long-lived reset links (> 1 hour)
- Password hints (security vulnerability)
- SMS-only reset (SIM swap attacks)

Full report: docs/research/2026-02-15-password-reset.md
```
