---
name: compliance-check
description: Audit AI applications for GDPR, EU AI Act, and US privacy law compliance with actionable remediation plans
---

# AI Application Compliance Checker

## Purpose
Comprehensively audit AI applications handling user data against GDPR, EU AI Act, and US state privacy laws (CCPA/CPRA, Colorado, etc.). Generate detailed reports with risk assessment and actionable remediation tasks.

## When to Use
- Before launching in new jurisdictions (EU, US states)
- Pre-deployment compliance validation
- Periodic compliance audits (quarterly/annually)
- After major feature additions involving user data or AI
- Due diligence for investors/customers
- Preparing for regulatory audits

## Process

### Step 1: Determine Audit Scope

Ask user to clarify:

```
Compliance audit scope:

1. Target jurisdictions? (Check all that apply)
   - [ ] EU/Germany (GDPR + EU AI Act)
   - [ ] California (CCPA/CPRA)
   - [ ] Colorado (SB 24-205)
   - [ ] Other US states (IN, KY, RI)
   - [ ] Global baseline

2. Audit focus? (Check all that apply)
   - [ ] Full application audit
   - [ ] Specific feature/component
   - [ ] Pre-deployment validation
   - [ ] Gap analysis from previous audit

3. AI system classification (if known):
   - [ ] High-risk (employment, credit, education, law enforcement)
   - [ ] Limited risk (chatbots, content generation)
   - [ ] Minimal risk
   - [ ] Unknown - help me determine

4. Current compliance status:
   - [ ] No compliance work started
   - [ ] Privacy policy exists
   - [ ] DPIA completed
   - [ ] Previous audit available
```

**If user unsure about AI classification:** Proceed to Step 2 to determine risk level.

**If specific feature audit:** Ask for feature description and related code files.

### Step 2: Discover Application Data Flows

Read project documentation and code to understand:

**Documentation to check:**
1. `docs/research/*compliance*.md` - Previous compliance research
2. `CLAUDE.md` or `README.md` - Project overview
3. Privacy policy / Terms of Service (if exists)
4. API documentation
5. Database schema documentation

**Code areas to examine:**
1. Authentication/authorization code
2. User data models and schemas
3. AI/LLM integration points (find LLM API calls)
4. Data storage (databases, file storage)
5. Third-party integrations (AWS, analytics, etc.)
6. Logging and monitoring
7. User consent/preferences management
8. Data deletion/export endpoints

**Use these tools:**
- `Grep` to find: "user", "personal", "email", "password", "profile", "bedrock", "openai", "llm", "ai", "model"
- `Glob` to find: privacy policies, terms files, user models, auth code
- `Read` specific files identified

**Document findings:**
```markdown
## Data Flow Analysis

### Personal Data Collected:
- [Data type]: [Purpose] - [Where stored] - [Retention period]

### AI Systems Used:
- [AI system]: [Purpose] - [Provider] - [Data processed]

### Third-Party Processors:
- [Service]: [Purpose] - [Data shared] - [DPA status]

### Data Transfers:
- Cross-border transfers: [Yes/No] - [Mechanism]
```

### Step 3: Classify AI System Risk Level

**Use EU AI Act risk classification:**

**Unacceptable Risk (PROHIBITED):**
- Social scoring by governments
- Exploiting vulnerabilities of specific groups
- Subliminal manipulation
- Real-time biometric identification (with exceptions for law enforcement)

**High-Risk Systems** (strict requirements):
- Biometric identification/categorization
- Critical infrastructure management
- Education/vocational training (admissions, assessment)
- Employment (recruitment, promotion, monitoring)
- Essential services (credit scoring, emergency dispatch)
- Law enforcement
- Migration/asylum/border control
- Justice system (search, evidence interpretation)

**Limited Risk** (transparency requirements):
- Chatbots and conversational AI
- Emotion recognition systems
- Biometric categorization
- AI-generated content (deepfakes)

**Minimal/No Risk:**
- Spam filters
- AI-enabled video games
- Inventory management

**Determine the application's classification:**
```
Based on use cases:
- If used for analytics on HR/employee data → High-risk
- If used for customer support chatbot → Limited risk
- If used for general document analysis → Minimal risk
```

**Document classification:**
```markdown
## AI Risk Classification: [Level]

Rationale: [Why this classification]

Triggers:
- [Specific use case that triggers classification]
```

### Step 4: Run Framework-Specific Checklists

For each applicable jurisdiction, run through detailed checklists in `REFERENCE.md`:

**Required frameworks based on scope:**
- EU/Germany → GDPR checklist + EU AI Act checklist
- California → CCPA/CPRA checklist
- Colorado → SB 24-205 checklist
- Global baseline → GDPR (strictest standard)

**For each checklist item:**
1. **Status**: ✅ Compliant / ⚠️ Partial / ❌ Non-compliant / ❓ Unknown
2. **Evidence**: Where compliance is implemented (code files, docs)
3. **Risk Level**: 🔴 Critical / 🟡 High / 🟢 Medium / ⚪ Low
4. **Remediation**: What needs to be done (if non-compliant)

**Scoring logic:**
- ✅ Compliant: Full implementation with evidence
- ⚠️ Partial: Started but incomplete (e.g., privacy policy exists but missing AI disclosures)
- ❌ Non-compliant: Not implemented
- ❓ Unknown: Cannot determine from code/docs (ask user or flag for manual review)

**Risk assessment:**
- 🔴 Critical: Legal requirement, high penalty risk, user rights violation
- 🟡 High: Best practice, moderate penalty risk
- 🟢 Medium: Recommended, low penalty risk
- ⚪ Low: Nice-to-have, minimal risk

### Step 5: Identify Critical Gaps

**Critical gaps** (must fix before launch):
- Missing legal basis for processing
- No DPIA for high-risk AI
- No user rights implementation (access, deletion)
- Missing data breach procedures
- No AI transparency disclosures
- Missing DPAs with third-party processors
- No consent mechanism for non-essential processing

**High-priority gaps** (fix within 30 days):
- Incomplete privacy notices
- Missing human oversight for high-risk AI
- Inadequate data retention policies
- Missing bias testing for AI
- Incomplete technical documentation

**Medium-priority gaps** (fix within 90 days):
- Optimization of consent flows
- Enhanced logging for compliance
- Staff training programs
- Vendor compliance assessments

**Low-priority gaps** (fix within 6 months):
- Advanced privacy features
- Certification pursuit
- Industry-specific compliance

### Step 6: Calculate Compliance Score

**Overall compliance score:**
```
Score = (Compliant items / Total applicable items) × 100

Breakdown by framework:
- GDPR: X% (Y/Z items compliant)
- EU AI Act: X% (Y/Z items compliant)
- CCPA/CPRA: X% (Y/Z items compliant)
```

**Risk exposure calculation:**
```
Critical gaps × 100 points
High gaps × 50 points
Medium gaps × 20 points
Low gaps × 5 points

Risk Score: [Total points]
- 0-100: Low risk
- 101-500: Moderate risk
- 501-1000: High risk
- 1000+: Critical risk (do not launch)
```

### Step 7: Generate Remediation Roadmap

Create actionable task list organized by priority and timeline.

**For each gap, specify:**
```markdown
### [Priority] - [Requirement Name]

**Status**: ❌ Non-compliant
**Risk**: 🔴 Critical
**Framework**: GDPR Article X, EU AI Act Article Y
**Penalty**: Up to €X million or Y% revenue

**What's missing:**
[Specific gap description]

**Remediation steps:**
1. [Concrete action with file/code references]
2. [Next step]
3. [Validation method]

**Estimated effort:** X hours/days
**Deadline:** [Date based on priority]
**Owner:** [Suggest: Legal/Engineering/Product]
**Dependencies:** [Any prerequisite tasks]

**Acceptance criteria:**
- [ ] [Specific criterion 1]
- [ ] [Specific criterion 2]

**Validation:**
How to verify compliance: [Test method]
```

**Timeline structure:**
```markdown
## Immediate (Before Launch)
- [ ] Critical gap 1
- [ ] Critical gap 2

## 30-Day Plan
- [ ] High-priority gap 1
- [ ] High-priority gap 2

## 90-Day Plan
- [ ] Medium-priority gap 1

## 6-Month Plan
- [ ] Low-priority gap 1
```

### Step 8: Generate Compliance Report

Use template from `templates/report-template.md` and populate with:

**Executive Summary:**
- Overall compliance score
- Risk assessment
- Critical findings
- Recommended next steps

**Detailed Findings:**
- Framework-by-framework breakdown
- Evidence collected
- Gap analysis

**Remediation Roadmap:**
- Prioritized task list
- Timeline and effort estimates
- Cost estimates (if applicable)

**Appendices:**
- Data flow diagrams
- Risk register
- Compliance checklist results

**Save report to:**
`docs/compliance/YYYY-MM-DD-compliance-audit-report.md`

### Step 9: Provide Summary to User

**Format:**
```markdown
# Compliance Audit Summary

**Overall Score**: X% compliant

**Risk Level**: [Critical/High/Moderate/Low]

**Critical Issues**: X found
🔴 [Issue 1 - one line]
🔴 [Issue 2 - one line]

**High-Priority Issues**: X found
🟡 [Issue 1 - one line]

**Recommended Next Steps**:
1. [Immediate action]
2. [30-day action]
3. [Schedule next review]

**Full Report**: docs/compliance/YYYY-MM-DD-compliance-audit-report.md
```

## Output Format

```markdown
# Compliance Audit: [Project Name]
**Date**: YYYY-MM-DD
**Auditor**: Claude Code v[version]
**Scope**: [Jurisdictions audited]

## Executive Summary

**Overall Compliance Score**: X%
**Risk Assessment**: [Level] - [Brief explanation]

### Compliance Breakdown
- GDPR: X% (Y/Z requirements met)
- EU AI Act: X% (Y/Z requirements met)
- CCPA/CPRA: X% (Y/Z requirements met)

### Critical Findings
1. 🔴 [Finding] - Risk: €XM penalty
2. 🔴 [Finding] - Risk: $XM penalty

### Recommendation
[Launch ready / Fix critical issues first / Significant work needed]

## Detailed Findings

[Full framework-by-framework analysis]

## Remediation Roadmap

### Immediate (Before Launch)
- [ ] Task 1 [Est: X hours] [Owner: Y]
- [ ] Task 2 [Est: X hours] [Owner: Y]

### 30-Day Plan
[...]

## Appendices

### Data Flow Analysis
[...]

### Risk Register
[...]

---
**Next Review**: [Date 3-6 months from now]
```

## Examples

### Example 1: Pre-Launch Audit for EU Market

**Input:**
- Project: AI-powered HR analytics tool
- Scope: EU/Germany (GDPR + EU AI Act)
- Status: No compliance work started

**Process:**
1. Scope: EU only, full audit, high-risk AI
2. Discover: Find employee data processing, AI-based candidate screening
3. Classify: High-risk (employment decisions)
4. Checklist: GDPR (50 items) + EU AI Act High-Risk (25 items)
5. Critical gaps: No DPIA, no human oversight, no bias testing
6. Score: 15% compliant, Critical risk (1200 points)
7. Roadmap: 15 immediate tasks, 3-month timeline to compliance
8. Report: Generated with €35M penalty risk highlighted

**Output:**
```
Critical Risk - Do Not Launch

Score: 15% compliant
Critical Issues: 12
- No DPIA for high-risk AI processing
- No human oversight mechanism
- No bias testing or documentation
- Missing legal basis for employee data

Recommended: Complete 12 critical items before launch (Est: 6-8 weeks)
```

### Example 2: Feature-Specific Check

**Input:**
- Project: Existing compliant app
- Scope: New AI chatbot feature
- Jurisdictions: EU + California

**Process:**
1. Scope: Feature-specific (chatbot), EU + CA
2. Discover: Chatbot uses OpenAI, stores conversation history
3. Classify: Limited risk (conversational AI)
4. Checklist: GDPR AI provisions + CCPA ADMT + EU AI Act Limited Risk
5. Gaps: Missing AI disclosure in privacy policy, no opt-out for ADMT
6. Score: 75% compliant (existing infrastructure helps), Medium risk
7. Roadmap: 3 immediate tasks, 2-week timeline
8. Report: Generated with focused scope

**Output:**
```
Moderate Risk - Fixable Before Launch

Score: 75% compliant
Critical Issues: 3
- Privacy policy missing AI chatbot disclosure
- No ADMT opt-out mechanism (California)
- No chatbot transparency notice

Recommended: Update docs + add opt-out (Est: 1 week)
```

## Decision Logic

### When to ask user for clarification:

**Ask about scope if:**
- User says "check compliance" without specifying jurisdictions
- Ambiguous about whether it's full audit or feature-specific

**Ask about AI classification if:**
- Cannot determine from code/docs
- Borderline between risk levels
- Multiple AI systems with different risk levels

**Ask about existing compliance work if:**
- Found privacy policy but unclear if DPIA exists
- Unclear if legal counsel has been involved

**Ask about timeline if:**
- Critical issues found and need to know launch date
- Need to prioritize remediation based on urgency

### When to proceed without asking:

**Can determine from code/docs:**
- Data flows (read database schemas, models)
- AI systems used (grep for API calls)
- User rights implementation (find endpoints)

**Default assumptions:**
- If EU mentioned → include both GDPR and EU AI Act
- If US mentioned without state → default to California (strictest)
- If "global" → use GDPR as baseline

## Anti-Patterns to Avoid

### ❌ False Compliance
**Bad**: Marking items compliant because privacy policy exists
**Good**: Verify privacy policy actually covers AI-specific disclosures

**Why**: Generic privacy policies often miss AI Act requirements

### ❌ Checkbox Audit
**Bad**: Run through checklist without examining actual implementation
**Good**: Read code to verify user deletion actually works

**Why**: Documentation ≠ implementation. Must verify in code.

### ❌ Ignoring Third-Party Risk
**Bad**: Only check first-party code
**Good**: Audit AWS Bedrock DPA, OpenAI terms, all processors

**Why**: GDPR holds you responsible for your processors' compliance

### ❌ Vague Remediation
**Bad**: "Improve data protection"
**Good**: "Add user deletion endpoint at /api/users/:id DELETE, implement cascade delete in users table, add audit log"

**Why**: Developers need specific, actionable tasks

### ❌ One-Size-Fits-All
**Bad**: Same checklist for minimal-risk spam filter and high-risk HR tool
**Good**: Apply appropriate scrutiny based on risk classification

**Why**: Wasting time on unnecessary requirements, or missing critical ones

### ❌ Outdated Standards
**Bad**: Check against 2024 GDPR only
**Good**: Check against GDPR + EU AI Act (August 2026 deadline)

**Why**: AI Act is now in force with significant penalties

### ❌ No Evidence Trail
**Bad**: "User rights: ✅ Compliant"
**Good**: "User rights: ✅ Compliant - Evidence: /api/users/me/data (GET), /api/users/me (DELETE) implemented"

**Why**: Need to demonstrate compliance to auditors

### ❌ Ignoring Timeline
**Bad**: Recommend 6-month roadmap when app launches in 2 weeks
**Good**: "Critical risk - launch in 2 weeks not advisable. Minimum 6 weeks for compliance."

**Why**: Honest assessment prevents legal exposure

## Integration with Other Skills

**Before compliance check:**
- `/research-deep` - Research jurisdiction-specific requirements
- `/docs-bigger-picture` - Understand project context

**During compliance check:**
- Use `Grep` and `Glob` extensively to find implementations
- Use `Read` to examine privacy policies, code implementations
- Reference `docs/research/*compliance*.md` for framework details

**After compliance check:**
- `/plan` - Create implementation plan for remediation
- `/ticket` - Convert remediation tasks to tickets
- `/review` - Review compliance-related code changes
- `/docs` - Update compliance documentation

## Maintenance

**When to re-run compliance check:**
- Every 3-6 months (ongoing monitoring)
- Before entering new jurisdiction
- After major feature additions involving user data or AI
- When regulations update (monitor EDPB, CPPA guidance)
- After data breach or near-miss incident
- Before funding rounds or acquisitions (due diligence)

**Update this skill when:**
- New regulations enacted (e.g., US federal privacy law)
- EU AI Act implementation guidelines updated
- Enforcement trends change (monitor case law)
- Framework checklists need updating

## References

- GDPR: Regulation (EU) 2016/679
- EU AI Act: Regulation (EU) 2024/1689
- CCPA/CPRA: California Civil Code §§ 1798.100-1798.199
- Colorado AI Act: SB 24-205
- CNIL AI Guidelines: https://www.cnil.fr/en/ai-system-development-cnils-recommendations-to-comply-gdpr
- Compliance research: `docs/research/2026-02-16-ai-application-global-compliance.md`
