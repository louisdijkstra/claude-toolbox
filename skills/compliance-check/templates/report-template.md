# Compliance Audit Report: [Project Name]

**Audit Date**: YYYY-MM-DD
**Auditor**: Claude Code Compliance Checker
**Report Version**: 1.0
**Scope**: [Jurisdictions audited]

---

## Executive Summary

### Overall Assessment

**Compliance Score**: X%
**Risk Level**: [Critical / High / Moderate / Low]
**Launch Readiness**: [Ready / Fix critical issues first / Significant work needed / Not ready]

### Quick Stats

| Framework | Score | Status |
|-----------|-------|--------|
| GDPR | X% (Y/Z) | [Status] |
| EU AI Act | X% (Y/Z) | [Status] |
| CCPA/CPRA | X% (Y/Z) | [Status] |
| Colorado SB 24-205 | X% (Y/Z) | [Status] |

**Risk Breakdown**:
- 🔴 Critical Issues: X
- 🟡 High-Priority Issues: X
- 🟢 Medium-Priority Issues: X
- ⚪ Low-Priority Issues: X

**Total Risk Score**: X points
- 0-100: Low risk
- 101-500: Moderate risk
- 501-1000: High risk
- 1000+: Critical risk

### Critical Findings

1. 🔴 **[Finding Title]**
   - Framework: [GDPR Article X / AI Act Article Y]
   - Penalty Risk: Up to €XM or Y% revenue
   - Impact: [Brief description]

2. 🔴 **[Finding Title]**
   - Framework: [Framework]
   - Penalty Risk: [Amount]
   - Impact: [Brief description]

[List all critical findings]

### Recommendation

[Overall recommendation: Ready to launch / Must address critical issues before launch / Significant compliance work required]

**Estimated Effort to Compliance**: [X weeks/months]
**Estimated Cost**: $[Range]
**Next Review Date**: [YYYY-MM-DD]

---

## Project Context

### Application Overview

**Name**: [Project name]
**Type**: [AI-powered analytics / Chatbot / Document processing / etc.]
**Target Users**: [Who uses this]
**Geographic Reach**: [Markets served]

### Technology Stack

**AI/LLM Integration**:
- [LLM provider]: [Model used] - [Purpose]
- [Vector DB]: [Provider] - [Purpose]

**Data Storage**:
- [Database]: [Type] - [Data stored]
- [File storage]: [Provider] - [Data stored]

**Third-Party Services**:
- [Service]: [Provider] - [Data shared]

### AI System Classification

**Risk Level**: [Unacceptable / High / Limited / Minimal]
**Rationale**: [Why this classification]

**Applicable Regulations**:
- [ ] GDPR (all EU processing)
- [ ] EU AI Act High-Risk Requirements
- [ ] EU AI Act Limited Risk Requirements
- [ ] CCPA/CPRA
- [ ] CCPA ADMT Regulations
- [ ] Colorado SB 24-205

---

## Data Flow Analysis

### Personal Data Collected

| Data Type | Purpose | Legal Basis | Storage Location | Retention Period | Third Parties |
|-----------|---------|-------------|------------------|------------------|---------------|
| Email, name | Account creation | Consent | PostgreSQL (AWS eu-central-1) | Account lifetime + 30 days | None |
| [Data type] | [Purpose] | [Basis] | [Location] | [Period] | [Parties] |

### AI Data Processing

| AI System | Purpose | Input Data | Output Data | Human Oversight | Risk Level |
|-----------|---------|------------|-------------|-----------------|------------|
| [System] | [Purpose] | [Input] | [Output] | [Yes/No] | [Level] |

### Cross-Border Data Transfers

| From | To | Data Type | Legal Mechanism | Status |
|------|-----|-----------|----------------|--------|
| EU | US (AWS) | User analytics | AWS DPA + SCCs | ✅ Compliant |
| [From] | [To] | [Data] | [Mechanism] | [Status] |

### Third-Party Processors

| Processor | Service | Data Shared | DPA Status | Sub-processors |
|-----------|---------|-------------|------------|----------------|
| AWS | Bedrock, S3 | User data, analytics | ✅ Signed | [List] |
| [Processor] | [Service] | [Data] | [Status] | [Subs] |

---

## Detailed Findings by Framework

### GDPR Compliance

**Score**: X% (Y of Z requirements met)
**Status**: [Compliant / Partial / Non-compliant]

#### Compliant Items ✅

| ID | Requirement | Evidence |
|----|-------------|----------|
| GDPR-X | [Requirement] | [File/doc reference] |

#### Partial Compliance ⚠️

| ID | Requirement | Current State | Gap | Remediation |
|----|-------------|---------------|-----|-------------|
| GDPR-X | [Requirement] | [What exists] | [What's missing] | [What to do] |

#### Non-Compliant Items ❌

| ID | Requirement | Risk | Penalty | Remediation Priority |
|----|-------------|------|---------|----------------------|
| GDPR-X | [Requirement] | 🔴 Critical | €20M or 4% revenue | Immediate |

#### Unknown Status ❓

| ID | Requirement | Reason Unknown | Suggested Action |
|----|-------------|----------------|------------------|
| GDPR-X | [Requirement] | [Why can't determine] | [How to verify] |

### EU AI Act Compliance

**Score**: X% (Y of Z requirements met)
**Status**: [Compliant / Partial / Non-compliant]
**Applicable Tier**: [High-Risk / Limited Risk / Minimal Risk]

[Same structure as GDPR section]

### CCPA/CPRA Compliance

**Score**: X% (Y of Z requirements met)
**Status**: [Compliant / Partial / Non-compliant]

[Same structure as GDPR section]

### Colorado SB 24-205 Compliance

**Score**: X% (Y of Z requirements met)
**Status**: [Compliant / Partial / Non-compliant]

[Same structure as GDPR section]

---

## Risk Assessment

### Critical Risks (Must Fix Before Launch)

#### Risk 1: [Risk Title]

**Framework**: GDPR Article X
**Finding**: [Specific non-compliance]
**Penalty**: Up to €20M or 4% global revenue
**Likelihood**: High
**Impact**: High

**Consequences**:
- Regulatory fines
- User rights violations
- Reputational damage
- Potential service suspension

**Affected Users**: [Number/percentage]

**Mitigation**: See Remediation Roadmap Task #X

---

[Repeat for each critical risk]

### High Risks (Fix Within 30 Days)

[Same structure, less detail]

### Medium Risks (Fix Within 90 Days)

[Same structure, less detail]

### Low Risks (Fix Within 6 Months)

[Same structure, less detail]

---

## Remediation Roadmap

### Immediate Actions (Before Launch)

#### Task 1: [Task Title]

**Requirement**: [GDPR-X, AI-Y, etc.]
**Status**: ❌ Non-compliant
**Risk**: 🔴 Critical
**Priority**: P0

**Current State**:
[What exists now]

**Required State**:
[What compliance requires]

**Implementation Steps**:
1. [Step 1 with file/code references]
2. [Step 2]
3. [Step 3]

**Estimated Effort**: [X hours/days]
**Assigned To**: [Suggested owner: Legal/Engineering/Product]
**Deadline**: [Date - typically before launch]
**Dependencies**: [Prerequisite tasks, if any]

**Technical Details**:
```
[Code snippets, API endpoints, database changes, etc.]
```

**Acceptance Criteria**:
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

**Validation Method**:
[How to verify compliance after implementation]

**Estimated Cost**: $[Range or N/A]

---

[Repeat for each immediate task]

### 30-Day Plan

[Same task structure, less urgent items]

### 90-Day Plan

[Same task structure, medium-priority items]

### 6-Month Plan

[Same task structure, low-priority items]

### Timeline Summary

```
Week 1-2: [Tasks]
Week 3-4: [Tasks]
Month 2: [Tasks]
Month 3: [Tasks]
Quarter 2: [Tasks]
```

---

## Implementation Guidance

### Quick Wins (High Impact, Low Effort)

1. **[Quick Win 1]**
   - Effort: [X hours]
   - Impact: Fixes [Y] compliance gaps
   - How: [Brief description]

2. **[Quick Win 2]**
   - Effort: [X hours]
   - Impact: Fixes [Y] compliance gaps
   - How: [Brief description]

### Foundational Work (High Impact, High Effort)

1. **[Foundation 1]**
   - Effort: [X weeks]
   - Impact: Enables [Y] downstream requirements
   - Why critical: [Explanation]

### Resource Requirements

**Legal**:
- Privacy counsel review: [X hours]
- DPA negotiations: [Y hours]
- Policy drafting: [Z hours]

**Engineering**:
- Backend development: [X hours]
- Frontend development: [Y hours]
- Testing: [Z hours]

**Product/Design**:
- UX design for consent flows: [X hours]
- Privacy notice updates: [Y hours]

**Total Estimated Effort**: [X person-weeks]
**Estimated Timeline**: [Y weeks to full compliance]
**Estimated Cost**: $[Range]

### Third-Party Services Needed

- [ ] Legal counsel (privacy law specialist)
- [ ] DPO (if required) or DPO-as-a-Service
- [ ] Privacy compliance platform (optional)
- [ ] Penetration testing / security audit
- [ ] DPIA template or consultant

---

## Monitoring & Ongoing Compliance

### Quarterly Reviews

**Checklist**:
- [ ] Review new data processing activities
- [ ] Update ROPA
- [ ] Check for regulatory updates
- [ ] Review user rights requests (volume, response times)
- [ ] Review data breach log
- [ ] Test user deletion workflow
- [ ] Review third-party processor compliance

### Annual Reviews

**Checklist**:
- [ ] Full compliance audit (re-run this tool)
- [ ] Update DPIA
- [ ] Renew DPAs with processors
- [ ] Staff training refresh
- [ ] Review and update privacy policy
- [ ] Risk assessment update (CCPA/CPRA)
- [ ] Cybersecurity audit (if required)

### Metrics to Track

**User Rights Requests**:
- Volume per month
- Response time (target: <30 days for GDPR, <45 days for CCPA)
- Request type breakdown

**Data Incidents**:
- Near-miss incidents
- Actual breaches
- Time to detection
- Time to notification

**AI Performance**:
- Accuracy metrics
- Bias metrics (if high-risk AI)
- Human override rates

**Compliance Deadlines**:
- CPPA risk assessment submission (April 1)
- CPPA cybersecurity audit submission (April 1)
- DPA renewals
- Policy update cycles

---

## Appendices

### Appendix A: Compliance Checklist Results

[Full checklist with all items marked]

### Appendix B: Evidence Inventory

| Evidence Type | Location | Last Updated |
|---------------|----------|--------------|
| Privacy Policy | /legal/privacy-policy.md | YYYY-MM-DD |
| DPIA | /docs/compliance/dpia-YYYY.md | YYYY-MM-DD |
| ROPA | /docs/compliance/ropa.xlsx | YYYY-MM-DD |

### Appendix C: Relevant Regulations

**GDPR**: Regulation (EU) 2016/679
**EU AI Act**: Regulation (EU) 2024/1689
**CCPA**: California Civil Code §§ 1798.100-1798.199
**CPRA**: California Proposition 24 (2020)
**Colorado AI Act**: SB 24-205

### Appendix D: Useful Resources

- CNIL AI Guidelines: https://www.cnil.fr/en/ai-system-development-cnils-recommendations-to-comply-gdpr
- EDPB Guidelines: https://edpb.europa.eu/
- CPPA Regulations: https://cppa.ca.gov/
- EU AI Act Portal: https://artificialintelligenceact.eu/

### Appendix E: Contact Information

**Data Protection Officer** (if applicable):
- Name: [Name]
- Email: [Email]
- Phone: [Phone]

**Legal Counsel**:
- Firm: [Firm name]
- Contact: [Name, email]

**Compliance Lead**:
- Name: [Name]
- Email: [Email]

---

## Document Control

**Version History**:
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | YYYY-MM-DD | Claude Code | Initial audit |

**Review Schedule**:
- Next Review: [YYYY-MM-DD] (3-6 months)
- Quarterly Check: [YYYY-MM-DD]
- Annual Audit: [YYYY-MM-DD]

**Distribution**:
- [ ] Executive team
- [ ] Legal counsel
- [ ] Engineering leads
- [ ] Product management
- [ ] DPO (if applicable)

**Confidentiality**: Internal use only - contains sensitive compliance information

---

**End of Report**
