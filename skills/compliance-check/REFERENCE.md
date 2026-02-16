# Compliance Framework Reference

This document contains detailed checklists for each compliance framework. Use these during Step 4 of the compliance audit process.

## Table of Contents
1. [GDPR Checklist](#gdpr-checklist)
2. [EU AI Act Checklist](#eu-ai-act-checklist)
3. [CCPA/CPRA Checklist](#ccpacpra-checklist)
4. [Colorado SB 24-205 Checklist](#colorado-sb-24-205-checklist)
5. [Risk Level Definitions](#risk-level-definitions)

---

## GDPR Checklist

### Lawful Basis (Article 6)

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| GDPR-1 | Valid legal basis identified for all processing | 🔴 Critical | Legal basis documented in privacy policy, DPA |
| GDPR-2 | Consent obtained where relied upon (freely given, specific, informed, unambiguous) | 🔴 Critical | Consent management code, UI flows |
| GDPR-3 | Legitimate interests assessment (LIFA) documented if relied upon | 🟡 High | LIFA documentation, balancing test |
| GDPR-4 | Special category data (health, biometric, etc.) has Article 9 legal basis | 🔴 Critical | Data classification, explicit consent |

### Data Minimization (Article 5)

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| GDPR-5 | Only necessary data collected | 🟡 High | Database schemas, API endpoints, forms |
| GDPR-6 | Data not kept longer than necessary | 🟡 High | Retention policies, deletion jobs |
| GDPR-7 | Purpose limitation respected (data not repurposed) | 🟡 High | Code analysis, privacy policy |

### Transparency (Articles 13-14)

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| GDPR-8 | Privacy notice provided at collection | 🔴 Critical | Privacy policy link on forms/signup |
| GDPR-9 | Privacy notice includes all required information (identity, purposes, legal basis, recipients, retention, rights) | 🔴 Critical | Privacy policy content |
| GDPR-10 | Information about automated decision-making disclosed | 🔴 Critical | Privacy policy AI section |
| GDPR-11 | Information about third-party processors disclosed | 🟡 High | Privacy policy processor list |

### Data Subject Rights (Articles 15-22)

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| GDPR-12 | Right of access implemented (users can download their data) | 🔴 Critical | `/api/users/me/data` endpoint or equivalent |
| GDPR-13 | Right to rectification implemented (users can correct data) | 🟡 High | Profile edit functionality |
| GDPR-14 | Right to erasure implemented (users can delete account) | 🔴 Critical | Account deletion endpoint, cascade deletes |
| GDPR-15 | Right to data portability implemented (structured, machine-readable format) | 🟡 High | Export in JSON/CSV format |
| GDPR-16 | Right to object implemented (stop processing) | 🟡 High | Opt-out mechanisms |
| GDPR-17 | Right to restrict processing implemented | 🟢 Medium | Processing freeze functionality |
| GDPR-18 | Rights requests responded within 30 days | 🔴 Critical | Request tracking system, SLA monitoring |
| GDPR-19 | Article 22 rights for automated decisions (right to human review) | 🔴 Critical | Human-in-the-loop for significant decisions |

### Security (Article 32)

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| GDPR-20 | Appropriate technical measures (encryption, access control) | 🔴 Critical | Encryption at rest/transit, auth code |
| GDPR-21 | Appropriate organizational measures (policies, training) | 🟡 High | Security policies, training records |
| GDPR-22 | Regular testing and evaluation of security | 🟡 High | Penetration tests, security audits |
| GDPR-23 | Pseudonymization/anonymization where applicable | 🟢 Medium | Data anonymization in analytics |

### Data Breach (Articles 33-34)

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| GDPR-24 | Breach notification to supervisory authority within 72 hours | 🔴 Critical | Incident response plan |
| GDPR-25 | Breach notification to data subjects if high risk | 🔴 Critical | User notification procedures |
| GDPR-26 | Breach documentation and register | 🟡 High | Incident log, breach register |

### Data Protection by Design and Default (Article 25)

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| GDPR-27 | Privacy by design implemented | 🟡 High | Architecture review, design docs |
| GDPR-28 | Privacy by default (minimal data processing by default) | 🟡 High | Default settings analysis |

### Records of Processing Activities (Article 30)

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| GDPR-29 | ROPA maintained (if >250 employees or high-risk processing) | 🟡 High | ROPA documentation |

### Data Protection Impact Assessment (Article 35)

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| GDPR-30 | DPIA conducted for high-risk processing | 🔴 Critical | DPIA document |
| GDPR-31 | DPIA includes necessity/proportionality assessment | 🔴 Critical | DPIA content quality |
| GDPR-32 | DPIA includes risks to data subjects | 🔴 Critical | Risk analysis in DPIA |
| GDPR-33 | DPIA includes mitigation measures | 🔴 Critical | Mitigation plan in DPIA |

### Data Protection Officer (Article 37)

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| GDPR-34 | DPO appointed if required (public authority, large-scale monitoring, special category data) | 🔴 Critical | DPO designation, contact info |
| GDPR-35 | DPO contact details published | 🟡 High | Privacy policy, website |

### International Transfers (Chapter V)

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| GDPR-36 | Adequacy decision, SCCs, or BCRs for non-EU transfers | 🔴 Critical | AWS region configuration, DPAs |
| GDPR-37 | Transfer Impact Assessment for non-adequate countries | 🔴 Critical | TIA documentation |

### Third-Party Processors (Article 28)

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| GDPR-38 | Data Processing Agreements (DPAs) with all processors | 🔴 Critical | AWS DPA, OpenAI DPA, etc. |
| GDPR-39 | Processors only act on documented instructions | 🟡 High | DPA terms, processor agreements |
| GDPR-40 | Sub-processors authorized | 🟡 High | Sub-processor lists, approvals |

---

## EU AI Act Checklist

### Risk Classification (Article 6)

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| AI-1 | AI system risk level determined (Unacceptable/High/Limited/Minimal) | 🔴 Critical | Risk assessment documentation |
| AI-2 | Prohibited AI practices avoided | 🔴 Critical | Code review for social scoring, manipulation |

### High-Risk AI Systems (Chapter III, Section 2)

Only applicable if AI system is classified as high-risk.

#### Risk Management (Article 9)

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| AI-3 | Risk management system established | 🔴 Critical | Risk management framework doc |
| AI-4 | Risks identified and analyzed | 🔴 Critical | Risk register |
| AI-5 | Risk mitigation measures implemented | 🔴 Critical | Mitigation controls in code |
| AI-6 | Risk management ongoing (lifecycle) | 🟡 High | Review cadence, update logs |

#### Data Governance (Article 10)

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| AI-7 | Training data relevant, representative, free of errors | 🔴 Critical | Data quality documentation |
| AI-8 | Training data provenance documented | 🔴 Critical | Data sources, licensing |
| AI-9 | Bias detection and mitigation | 🔴 Critical | Bias testing results |
| AI-10 | Data governance practices documented | 🟡 High | Data governance policy |

#### Technical Documentation (Article 11, Annex IV)

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| AI-11 | General description of AI system | 🔴 Critical | System documentation |
| AI-12 | Detailed description of elements and development | 🔴 Critical | Architecture docs, model cards |
| AI-13 | Information on monitoring, functioning, control | 🔴 Critical | Operational documentation |
| AI-14 | Description of AI system capabilities and limitations | 🔴 Critical | Model limitations documented |
| AI-15 | Description of changes made to system over time | 🟡 High | Version control, change log |

#### Record-Keeping (Article 12)

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| AI-16 | Automatic logging of events during operation | 🔴 Critical | Logging implementation (check code) |
| AI-17 | Logs enable traceability throughout lifecycle | 🔴 Critical | Log retention, audit trail |

#### Transparency and Information to Users (Article 13)

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| AI-18 | Instructions for use provided | 🔴 Critical | User documentation, help docs |
| AI-19 | Identity and contact details of provider | 🟡 High | About page, privacy policy |
| AI-20 | AI system characteristics, capabilities, limitations disclosed | 🔴 Critical | Transparency notice |
| AI-21 | Expected level of accuracy disclosed | 🟡 High | Performance metrics published |
| AI-22 | Known or foreseeable circumstances of inaccuracy disclosed | 🟡 High | Limitation warnings |

#### Human Oversight (Article 14)

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| AI-23 | Human oversight measures implemented | 🔴 Critical | Human-in-the-loop code, workflows |
| AI-24 | Humans can intervene in AI system operation | 🔴 Critical | Override mechanisms |
| AI-25 | Humans can disregard, override, reverse AI output | 🔴 Critical | Manual review capability |

#### Accuracy, Robustness, Cybersecurity (Article 15)

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| AI-26 | Appropriate level of accuracy achieved | 🔴 Critical | Model evaluation results |
| AI-27 | Robustness demonstrated (errors, faults, inconsistencies) | 🟡 High | Testing results, error handling |
| AI-28 | Cybersecurity measures implemented | 🔴 Critical | Security controls, pen test results |

#### Quality Management System (Article 17)

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| AI-29 | Quality management system established | 🔴 Critical | QMS documentation |
| AI-30 | Compliance with AI Act ensured | 🔴 Critical | Compliance checklist, audits |
| AI-31 | Post-market monitoring system in place | 🟡 High | Monitoring plan, incident tracking |

#### Conformity Assessment (Article 43)

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| AI-32 | Conformity assessment completed | 🔴 Critical | Assessment report |
| AI-33 | EU declaration of conformity drafted | 🔴 Critical | Declaration document |
| AI-34 | CE marking affixed (if applicable) | 🟡 High | Product marking |

#### Registration (Article 49)

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| AI-35 | High-risk AI system registered in EU database | 🔴 Critical | Registration confirmation |

### Limited Risk AI Systems (Article 50)

Only applicable if AI system is classified as limited risk.

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| AI-36 | Users informed they are interacting with AI | 🔴 Critical | Chatbot disclosure, UI notices |
| AI-37 | AI-generated content labeled as such | 🔴 Critical | Content watermarking, disclaimers |

### General-Purpose AI Models (Article 53)

Only applicable if providing foundation models.

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| AI-38 | Technical documentation provided | 🔴 Critical | Model documentation |
| AI-39 | Copyright compliance policy | 🔴 Critical | Training data licensing |
| AI-40 | Summary of training data published | 🟡 High | Data sources disclosure |

---

## CCPA/CPRA Checklist

### Consumer Rights

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| CCPA-1 | Right to know (categories of data collected) | 🔴 Critical | Privacy policy, data inventory |
| CCPA-2 | Right to know (specific pieces of data) | 🔴 Critical | Data access endpoint |
| CCPA-3 | Right to delete | 🔴 Critical | Deletion endpoint, cascade logic |
| CCPA-4 | Right to correct inaccurate data | 🔴 Critical | Data correction functionality |
| CCPA-5 | Right to opt-out of sale/sharing | 🔴 Critical | Opt-out mechanism, "Do Not Sell" link |
| CCPA-6 | Right to limit use of sensitive personal information | 🔴 Critical | Sensitive data opt-out |
| CCPA-7 | Rights requests responded within 45 days (extendable to 90) | 🔴 Critical | Request tracking, SLA |

### Notice Requirements

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| CCPA-8 | Notice at collection provided | 🔴 Critical | Privacy notice at data collection points |
| CCPA-9 | Privacy policy comprehensive and accessible | 🔴 Critical | Privacy policy completeness |
| CCPA-10 | Notice of right to opt-out displayed | 🔴 Critical | "Do Not Sell My Personal Information" link |
| CCPA-11 | Notice of financial incentive (if applicable) | 🟡 High | Incentive program disclosures |

### Automated Decision-Making Technology (ADMT) - New 2026

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| CCPA-12 | ADMT identified (AI that substantially replaces human decisions) | 🔴 Critical | AI system inventory |
| CCPA-13 | Opt-out of ADMT provided | 🔴 Critical | ADMT opt-out mechanism in UI |
| CCPA-14 | ADMT disclosures in privacy policy | 🔴 Critical | Privacy policy ADMT section |
| CCPA-15 | ADMT logic explanation available upon request | 🟡 High | Explainability documentation |

### Risk Assessments - New 2026

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| CCPA-16 | Risk assessment conducted for high-risk activities | 🔴 Critical | Risk assessment document |
| CCPA-17 | Risk assessment identifies significant privacy/security risks | 🔴 Critical | Risk identification |
| CCPA-18 | Risk assessment includes safeguards | 🔴 Critical | Mitigation measures |
| CCPA-19 | Risk assessment submitted to CPPA (annual attestation) | 🟡 High | Submission confirmation |

### Cybersecurity Audits - New 2026

Only applicable if annual revenue >$100M in 2026.

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| CCPA-20 | Annual cybersecurity audit completed | 🔴 Critical | Audit report |
| CCPA-21 | Audit covers safeguards for personal information | 🔴 Critical | Audit scope |
| CCPA-22 | Audit attestation submitted to CPPA | 🔴 Critical | Submission confirmation |

### Service Providers and Contractors

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| CCPA-23 | Written contracts with service providers | 🔴 Critical | Service provider agreements |
| CCPA-24 | Contracts prohibit sale/sharing/retention | 🔴 Critical | Contract terms review |
| CCPA-25 | Contracts allow consumer rights fulfillment | 🟡 High | Rights fulfillment clauses |

### Sensitive Personal Information

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| CCPA-26 | Sensitive data identified (SSN, health, precise geolocation, etc.) | 🔴 Critical | Data classification |
| CCPA-27 | Right to limit use of sensitive data implemented | 🔴 Critical | Opt-out for sensitive data use |

### Data Broker Registration

Only applicable if meeting data broker definition.

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| CCPA-28 | Data broker registered with California AG | 🔴 Critical | Registration confirmation |
| CCPA-29 | Annual registration renewal | 🟡 High | Renewal tracking |

---

## Colorado SB 24-205 Checklist

### High-Risk AI System Requirements

Only applicable if AI system is high-risk (employment, education, finance, healthcare, housing, legal).

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| CO-1 | High-risk AI system classification determined | 🔴 Critical | Risk classification documentation |
| CO-2 | Impact assessment conducted annually | 🔴 Critical | Impact assessment document |
| CO-3 | Reasonable care to protect consumers from algorithmic discrimination | 🔴 Critical | Bias testing, fairness metrics |
| CO-4 | Known or foreseeable risks of algorithmic discrimination disclosed | 🔴 Critical | Risk disclosure in privacy policy |
| CO-5 | Notice provided to consumers interacting with high-risk AI | 🔴 Critical | AI interaction notices |
| CO-6 | Right to appeal adverse decision from AI | 🟡 High | Appeal process documentation |
| CO-7 | Right to human review of AI decision | 🔴 Critical | Human review mechanism |

### Developer Obligations

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| CO-8 | Documentation provided to deployers | 🟡 High | System documentation |
| CO-9 | Public statement on system's intended uses | 🟡 High | Use case documentation |
| CO-10 | Impact assessment conducted before deployment | 🔴 Critical | Pre-deployment assessment |

### Deployer Obligations

| ID | Requirement | Risk | Evidence to Check |
|----|-------------|------|-------------------|
| CO-11 | Impact assessment completed within 90 days of deployment | 🔴 Critical | Deployment impact assessment |
| CO-12 | Deployer implements risk management program | 🟡 High | Risk management documentation |

---

## Risk Level Definitions

### 🔴 Critical
- **Definition**: Legal requirement with high penalty risk or fundamental user rights violation
- **Penalty Examples**:
  - GDPR: Up to €20M or 4% global revenue
  - EU AI Act: Up to €35M or 7% global revenue
  - CCPA: $2,500-$7,500 per violation
- **Impact**: Fines, regulatory action, user harm, reputational damage
- **Timeline**: Must fix before launch or immediately

### 🟡 High
- **Definition**: Best practice or moderate penalty risk
- **Penalty Examples**: Lower tier fines, warning notices
- **Impact**: Compliance gaps, audit findings, competitive disadvantage
- **Timeline**: Fix within 30 days

### 🟢 Medium
- **Definition**: Recommended practice with low penalty risk
- **Impact**: Optimization opportunity, minor compliance gaps
- **Timeline**: Fix within 90 days

### ⚪ Low
- **Definition**: Nice-to-have with minimal compliance impact
- **Impact**: Marginal improvement
- **Timeline**: Fix within 6 months or backlog

---

## Using These Checklists

### Step-by-Step Process

1. **Determine applicable frameworks** based on user's jurisdiction selection
2. **For each checklist item:**
   - Mark status: ✅ Compliant / ⚠️ Partial / ❌ Non-compliant / ❓ Unknown
   - Document evidence: File paths, code snippets, documentation references
   - Assign risk level (already provided in tables)
3. **Calculate scores** by framework
4. **Identify gaps** and prioritize by risk level
5. **Generate remediation tasks** for non-compliant items

### Evidence Collection Tips

**Code evidence:**
- Use `Grep` to find: user data models, API endpoints, deletion logic
- Use `Read` to examine: privacy policies, terms, consent flows
- Use `Glob` to find: auth code, data processing files

**Documentation evidence:**
- Look for: DPIA, ROPA, risk assessments, DPAs, security policies
- Check: `docs/`, `docs/compliance/`, `docs/legal/`

**Third-party evidence:**
- AWS Bedrock DPA: Check AWS account agreements
- OpenAI DPA: Check OpenAI Enterprise terms
- Other processors: Verify agreements exist

### Scoring Formula

```
Framework Compliance Score = (Compliant items / Total applicable items) × 100

Overall Compliance Score = Average of all framework scores

Risk Score = (Critical gaps × 100) + (High gaps × 50) + (Medium gaps × 20) + (Low gaps × 5)
```

### Common Patterns

**High compliance (75-100%):**
- Existing privacy infrastructure
- Previous compliance work
- Feature addition to compliant app

**Medium compliance (40-75%):**
- Privacy basics exist but AI-specific gaps
- Missing some user rights
- No formal assessments

**Low compliance (0-40%):**
- No privacy work started
- No DPIA or risk assessments
- No user rights implementation

---

**Last Updated**: 2026-02-16
**Next Review**: 2026-08-16 (6 months)
**Source**: docs/research/2026-02-16-ai-application-global-compliance.md
