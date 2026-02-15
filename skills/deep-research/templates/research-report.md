# Research: [Topic]

**Date:** YYYY-MM-DD
**Researcher:** Claude Sonnet 4.5

---

## Context

**Project:** [Project name and brief description]

**Scale:**
- Users: [Expected count]
- Requests/day: [Volume]
- Data volume: [Size]

**Constraints:**
- Tech stack: [Technologies]
- Budget: [Infrastructure budget]
- Timeline: [Deadline]
- Team: [Size and expertise]

---

## Research Question

[Specific, contextualized question]

Example: "How should I implement background job processing for a FastAPI app on AWS ECS with 500K requests/day, using PostgreSQL, while ensuring reliable job execution and monitoring?"

---

## Industry Standards (2026)

1. [Standard 1]
2. [Standard 2]
3. [Standard 3]
...

---

## Options Evaluated

Add as many options as needed (typically 2-4).

### Option 1: [Name]

**Description:** [Brief overview]

**Pros:**
- [Advantage 1]
- [Advantage 2]
- [Advantage 3]

**Cons:**
- [Disadvantage 1]
- [Disadvantage 2]

**Scale:** [How well it handles expected scale]

**Fit for Project:** [Alignment with constraints]

**Sources:**
- [Documentation link]
- [Case study link]

---

### Option 2: [Name]

Repeat this structure for each option evaluated

---

## Recommended Approach

**Choice:** [Selected option]

**Rationale:**
- Aligns with [specific requirement]
- Scales to [specific metric]
- Team has expertise in [relevant technology]
- Fits within [budget/timeline constraint]

**Implementation Steps:**
1. [Step 1]
2. [Step 2]
3. [Step 3]
...

**Code Example:**
```python
# Minimal example of recommended approach
```

---

## Anti-Patterns to Avoid

- ❌ **[Anti-pattern 1]:** [Why it's bad and what to do instead]
- ❌ **[Anti-pattern 2]:** [Why it's bad and what to do instead]
- ❌ **[Anti-pattern 3]:** [Why it's bad and what to do instead]

---

## Testing Strategy

**What to test:**
- [Test scenario 1]
- [Test scenario 2]
- [Test scenario 3]

**How to test:**
- Unit tests: [e.g., Test retry logic with mock failures]
- Integration tests: [e.g., Test with actual database under load]
- Performance tests: [e.g., Measure latency at expected scale]

---

## Monitoring & Observability

**Metrics to track:**
- [Metric 1]: [e.g., Job success rate - Why: Detect processing failures]
- [Metric 2]: [e.g., Average latency - Why: Monitor performance degradation]
- [Metric 3]: [e.g., Queue depth - Why: Identify bottlenecks]

**Alerts to configure:**
- [Alert 1]: [e.g., Success rate < 95% for 5 minutes - Action: Page on-call]
- [Alert 2]: [e.g., P99 latency > 2s - Action: Create incident]

---

## Trade-offs Accepted

**[Trade-off 1]:** [Description]
- **Why acceptable:** [Rationale]

**[Trade-off 2]:** [Description]
- **Why acceptable:** [Rationale]

---

## When to Revisit

Reconsider this approach if:
- [Condition 1]
- [Condition 2]
- [Condition 3]

---

## References

### Official Documentation
- [Link 1]
- [Link 2]

### Production Case Studies
- [Link 1]
- [Link 2]

### Blog Posts & Articles
- [Link 1]
- [Link 2]

### Stack Overflow
- [Link 1 - common pitfall]
- [Link 2 - edge case]
