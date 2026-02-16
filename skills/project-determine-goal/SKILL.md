---
name: determining-project-goal
description: Interactive brainstorming to define production-ready project goals, architecture, and constraints. Use at project start. Asks targeted questions one at a time, adapting based on answers, until all critical aspects are covered.
---

# Determining Project Goal

## Purpose

Systematically discover and document project requirements through adaptive questioning. Creates two key documents:
- `docs/PROJECT_DESCRIPTION.md` - Concise overview (read on every Claude launch)
- `docs/FULL_PROJECT_DESCRIPTION.md` - Complete detailed documentation

## When to Use This Skill

Use this skill when:
- Starting a new project from scratch
- Need to clarify vague project requirements
- Converting ideas into structured documentation
- Project lacks clear goals or constraints
- Ensuring all production aspects are considered
- Setting up project context for development team

**Do NOT use for:**
- Projects with existing comprehensive documentation (use docs-bigger-picture)
- Quick prototypes or experiments (document after validation)
- Making technical implementation decisions (use research-deep)
- Code implementation (use dev-workflow skills)
- Mid-project refinements (use docs-manager)
- When requirements are already clear and documented

**If uncertain:** Use this skill at project inception when starting from scratch or when existing documentation is incomplete. Skip when comprehensive project docs already exist.

## Process
1. Ask ONE question at a time
2. Provide sensible options when possible
3. Adapt next questions based on previous answers
4. Continue until all essential topics are covered
5. Create both PROJECT_DESCRIPTION.md (concise) and FULL_PROJECT_DESCRIPTION.md (comprehensive)

YOU decide the order and specific questions based on the conversation flow.

## Essential Topics to Cover

Before finishing, ensure you've covered ALL of these areas:

### Core Definition
- [ ] What problem does this solve?
- [ ] Who are the users?
- [ ] What's the expected scale/usage?
- [ ] What are the key features/capabilities?

### Application Architecture
- [ ] Application type (web, mobile, API, CLI, desktop, etc.)
- [ ] Technology stack requirements or constraints
- [ ] Integration requirements (external APIs, databases, services)
- [ ] Data storage needs (type, volume, persistence)
- [ ] LLM usage (if applicable)

### LLM Integration (if using LLMs)
- [ ] Which LLM providers and models
- [ ] Which modelling framework (Langchain, LangGraph, PydanticAI etc.)
- [ ] Expected usage volume and patterns
- [ ] Price control mechanisms
- [ ] Rate limiting strategy
- [ ] Fallback models or providers

### Security & Compliance
- [ ] Data sensitivity level
- [ ] Authentication/authorization requirements
- [ ] Compliance requirements (GDPR, HIPAA, etc.)
- [ ] Access control needs
- [ ] Data encryption requirements

### Deployment & Operations
- [ ] Deployment environment (cloud, on-premise, local, hybrid)
- [ ] Accessibility (internet, internal, local installation)
- [ ] Infrastructure requirements
- [ ] Deployment frequency and strategy
- [ ] Rollback and disaster recovery needs

### Performance & Reliability
- [ ] Response time requirements
- [ ] Availability requirements (uptime SLA)
- [ ] Scalability needs (current and future)
- [ ] Load expectations (concurrent users, requests/sec)
- [ ] Data backup and retention requirements

### Monitoring & Observability
- [ ] Logging requirements
- [ ] Metrics and monitoring needs
- [ ] Error tracking and alerting
- [ ] User analytics requirements
- [ ] Performance tracing needs
- [ ] LLM cost and usage tracking (if applicable)

### Development & Maintenance
- [ ] Development priorities (MVP vs production-ready vs enterprise-grade)
- [ ] Testing strategy (unit, integration, e2e)
- [ ] CI/CD requirements
- [ ] Expected maintenance model
- [ ] Documentation needs

### Business & Operations
- [ ] Budget constraints
- [ ] Cost optimization priorities
- [ ] Support and maintenance plan
- [ ] Success metrics
- [ ] Migration from existing systems (if applicable)

## Question Format

**Structure questions like this:**
```
[Clear, specific question based on what you've learned so far]

Options:
1. [Relevant option]
2. [Relevant option]
3. [Relevant option]
4. Other (please specify)

(Select one / Select multiple / Or provide your own answer)
```

**Adapt to conversation:**
- Early questions should be broad (purpose, users, type)
- Later questions get more specific based on previous answers
- Skip irrelevant questions (e.g., don't ask about mobile push notifications for a CLI tool)
- Ask follow-ups when answers are vague or incomplete
- If user mentions something important, explore it immediately
- If LLMs are involved, probe deeper on cost control and rate limiting

## Questioning Strategy

**Opening approach:**
Start with understanding what they're building:
- What's the core purpose/problem?
- Who will use it?
- What type of application is it?

**Progressive refinement:**
Based on their answers, dive deeper:
- If it's user-facing → authentication, UI/UX considerations
- If it handles sensitive data → security, compliance, encryption
- If it needs high availability → redundancy, monitoring, scaling
- If it's replacing existing system → migration, compatibility
- If it's public-facing → rate limiting, DDoS protection, CDN
- If it uses LLMs → cost controls, rate limiting, model selection, fallbacks

**Production focus:**
Always think: "What does this need to be production-ready?"
- Don't assume "we'll figure it out later" for critical aspects
- Push for concrete answers on security and deployment
- Ensure monitoring/observability is planned upfront
- Confirm backup and disaster recovery approach
- For LLM applications, ensure cost controls are in place

## LLM-Specific Questions (Ask if project uses LLMs)

### Model Selection
**Which LLM providers and models will you use?**
Options:
1. Single provider (OpenAI, Anthropic, Google, etc.)
2. Multiple providers for redundancy
3. Open-source models (Llama, Mistral, etc.)
4. Mix of proprietary and open-source
5. Not yet decided

### Usage Patterns
**What's the expected LLM usage pattern?**
Options:
1. User-initiated requests (interactive)
2. Background batch processing
3. Real-time streaming responses
4. Mixed usage patterns
5. High-volume automated processing

### Price Control
**How will you control LLM costs?**
Options:
1. Per-user spending limits
2. Global monthly budget caps
3. Request-based limits (max tokens per request)
4. Tiered access (free/paid users)
5. Multiple strategies (specify)

Follow-up: "What's your maximum acceptable monthly LLM cost?"

### Rate Limiting
**What rate limiting strategy for LLM calls?**
Options:
1. Per-user rate limits (X requests per minute/hour)
2. Per-API-key rate limits
3. Global rate limits across all users
4. Tiered rate limits by user type
5. Dynamic rate limiting based on load

### Fallback Strategy
**What happens if primary LLM fails or quota exceeded?**
Options:
1. Fall back to cheaper model
2. Fall back to different provider
3. Queue requests for later processing
4. Return error to user
5. Graceful degradation (cached/simplified responses)

## Guidelines

**DO:**
- Ask one question at a time
- Be conversational and adaptive
- Provide realistic options based on context
- Push for concrete answers on production concerns
- Acknowledge and build on previous answers
- Ask follow-ups when needed
- Keep questions concise and clear
- For LLM projects, emphasize cost and rate control

**DON'T:**
- Follow a rigid question order
- Ask multiple questions at once
- Skip essential topics without user permission
- Accept vague answers on critical production aspects
- Assume "standard" approaches without confirming
- Rush through security or deployment topics
- Ask about timelines or deadlines
- Skip LLM cost controls if project uses LLMs

**Production readiness mindset:**
- Security is not optional
- Monitoring must be planned upfront
- Deployment strategy must be concrete
- Backup/recovery must be defined
- Performance requirements must be quantified
- LLM cost controls must be in place

## Completing the Process

**Before creating documentation:**
1. Review the essential topics checklist
2. Identify any gaps
3. Ask: "Is there anything else important I should know about this project?"
4. Confirm you have enough information

**Then create BOTH documents:**

### docs/PROJECT_DESCRIPTION.md (Concise - Always Read)
```markdown
# [Project Name]

## Core Purpose
[1-2 sentences: problem and solution]

## Users & Scale
[Who uses it and expected scale]

## Application Type
[Web/mobile/API/CLI + key tech stack]

## LLM Integration (if applicable)
- **Providers**: [Which LLM providers/models]
- **Cost Control**: [Budget caps, per-user limits]
- **Rate Limiting**: [Strategy]

## Critical Constraints

### Security
[Data sensitivity + auth approach]

### Deployment
[Where it runs + how users access it]

### Performance
[Key requirements: response time, availability]

## Key Features
- [Feature 1]
- [Feature 2]
- [Feature 3]

## Production Requirements
- **Monitoring**: [Approach]
- **Testing**: [Strategy]
- **CI/CD**: [Yes/No + basic approach]

## Non-Negotiables
- [Critical constraint 1]
- [Critical constraint 2]
- [Critical constraint 3]

See `docs/FULL_PROJECT_DESCRIPTION.md` for complete details.
```

Keep this under 100 lines. This is read every time Claude launches.

### docs/FULL_PROJECT_DESCRIPTION.md (Complete Details)
```markdown
# [Project Name] - Full Project Description

## Core Purpose
[Detailed problem statement and solution]
[Target users and use cases]
[Business context and goals]

## Application Architecture

### Type & Technology
**Application Type**: [web/mobile/API/CLI/etc.]

**Technology Stack**:
- Backend: [Languages, frameworks]
- Frontend: [If applicable]
- Database: [Type and rationale]
- Infrastructure: [Key technologies]
- LLM Integration: [If applicable]

**Integration Requirements**:
- [External API 1 with purpose]
- [External API 2 with purpose]
- [Database connections]
- [Message queues/event streams]
- [LLM providers]

### Data Architecture
**Data Types**:
- [Primary data types stored]
- [Data volume expectations]

**Storage Approach**:
- [Database choice and rationale]
- [Caching strategy]
- [File storage if applicable]

**Data Retention & Backup**:
- Backup frequency: [Daily, hourly, etc.]
- Retention period: [How long backups kept]
- Recovery time objective (RTO): [Target]
- Recovery point objective (RPO): [Target]

## LLM Integration (if applicable)

### Model Selection
**Primary Provider(s)**:
[OpenAI, Anthropic, Google, Azure OpenAI, etc.]

**Models Used**:
- Primary model: [e.g., Claude Sonnet 4, GPT-4]
- Fallback model: [Cheaper or alternative model]
- Use cases: [What each model is used for]

**Model Selection Rationale**:
[Why these specific models - cost, capabilities, latency, etc.]

### Usage Patterns
**Request Types**:
- [User chat/interactions]
- [Background processing]
- [Batch operations]
- [Real-time streaming]

**Expected Volume**:
- Requests per day: [Estimate]
- Tokens per request (average): [Estimate]
- Monthly token budget: [Estimate]

**Context Management**:
- Average context window usage: [Tokens]
- Strategy for long conversations: [Summarization, pruning, etc.]

### Cost Control

**Budget Constraints**:
- Maximum monthly spend: [$X]
- Cost per user target: [$Y]
- Emergency stop threshold: [$Z]

**Cost Control Mechanisms**:
1. **Global Budget Cap**: [Monthly limit across all users]
2. **Per-User Limits**: [Max spend/requests per user per day/month]
3. **Request Limits**: [Max tokens per request]
4. **Model Cascading**: [Start with cheaper model, escalate if needed]

**Implementation**:
- Tracking: [How costs are tracked - database, provider dashboard, custom]
- Alerts: [When to alert on high usage]
- Enforcement: [How limits are enforced - reject requests, queue, downgrade model]

**Cost Optimization Strategies**:
- [Prompt caching where applicable]
- [Response caching for common queries]
- [Using cheaper models for simple tasks]
- [Batch processing where possible]
- [Context pruning strategies]

### Rate Limiting

**Rate Limit Strategy**:
- Per-user limits: [X requests per minute/hour]
- Per-API-key limits: [If applicable]
- Global limits: [Total requests across system]
- Burst allowance: [Short-term spike handling]

**Implementation**:
- Technology: [Redis, API gateway, custom middleware]
- Rate limit headers: [Expose to users via headers]
- Error handling: [429 responses with retry-after]

**Tiered Limits** (if applicable):
- Free tier: [X requests/day]
- Paid tier: [Y requests/day]
- Enterprise: [Custom limits]

### Fallback & Error Handling

**Primary Failure Scenarios**:
1. Rate limit exceeded
2. Budget cap reached
3. API downtime
4. Timeout errors

**Fallback Strategy**:
- Primary fails → [Switch to fallback model or provider]
- Budget exceeded → [Queue requests, notify user, or deny]
- All providers down → [Cached responses or graceful degradation]

**User Experience**:
- Clear error messages explaining limits
- Estimated wait times if queued
- Option to upgrade tier if applicable

### Monitoring & Optimization

**Metrics Tracked**:
- Total requests per day/hour
- Tokens consumed (input/output)
- Cost per request
- Cost per user
- Average response time
- Error rates
- Cache hit rates

**Monitoring Tools**:
- [Provider dashboards: OpenAI/Anthropic/etc.]
- [Custom tracking: database logging]
- [Cost alerting: threshold notifications]
- [Performance monitoring: response times]

**Regular Reviews**:
- Weekly cost analysis
- Monthly usage pattern review
- Quarterly model performance evaluation
- Optimize prompts to reduce token usage

## Security & Compliance

### Authentication & Authorization
**Authentication Method**:
[Email/password, OAuth, SSO, API keys, etc.]

**Authorization Model**:
[Role-based, attribute-based, etc.]
[Permission structure]

### Data Security
**Data Sensitivity Classification**:
[Public, internal, confidential, restricted]

**Encryption**:
- At rest: [Yes/No + method]
- In transit: [TLS version]
- Key management: [Approach]

**LLM Data Handling**:
- User data sent to LLM: [What data types]
- Data retention by LLM provider: [Policy]
- Opt-out options: [If users can opt-out of LLM features]
- PII handling: [How PII is protected in prompts]

**Compliance Requirements**:
- [GDPR, HIPAA, SOC2, etc.]
- [Specific requirements from each]
- [Audit logging needs]

### Access Control & Protection
**Access Control**:
[Who can access what]
[Network restrictions if applicable]

**Rate Limiting**:
[Approach to prevent abuse]

**Security Headers/Measures**:
[CORS, CSP, other security measures]

## Deployment & Infrastructure

### Environment
**Deployment Location**:
[Cloud provider (AWS/GCP/Azure), on-premise, hybrid]
[Region/geographic considerations]

**Infrastructure Requirements**:
- Compute: [Specs or scaling approach]
- Storage: [Requirements]
- Network: [Bandwidth, latency considerations]
- Third-party services: [List with purpose]

### Deployment Strategy
**Deployment Method**:
[Container orchestration, serverless, VMs, etc.]

**Deployment Frequency**:
[Continuous, daily, weekly, on-demand]

**Deployment Process**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Rollback Procedures**:
[How to rollback if deployment fails]

### Accessibility
**User Access Method**:
[Public internet, internal network, VPN, local installation]

**Geographic Distribution**:
[Single region, multi-region, CDN usage]

**Domain/URL Structure**:
[If applicable]

## Performance & Reliability

### Performance Requirements
**Response Time Targets**:
- API endpoints: [<100ms, <500ms, <1s]
- LLM responses: [<2s for simple, <10s for complex]
- Page loads: [Target time]
- Background jobs: [Acceptable duration]

**Throughput Requirements**:
- Requests per second: [Expected]
- Concurrent users: [Expected]
- LLM requests per second: [Expected]
- Data processing rate: [If applicable]

### Availability & Reliability
**Uptime SLA**:
[99%, 99.9%, 99.99%, etc.]
[Acceptable downtime: X hours/year]

**High Availability Approach**:
[Load balancing, redundancy, failover strategy]

**Maintenance Windows**:
[When and how maintenance happens]

### Scalability Strategy
**Current Scale**:
[Users, requests, data volume]

**Expected Growth**:
[Growth projections]

**Scaling Approach**:
- Horizontal scaling: [Yes/No + how]
- Vertical scaling: [Approach]
- Database scaling: [Strategy]
- Caching: [Strategy]
- LLM request queuing: [Strategy for high load]

**Load Handling**:
[How system handles traffic spikes]

## Monitoring & Operations

### Observability
**Logging**:
- What gets logged: [Events, errors, access, LLM requests, etc.]
- Log retention: [Duration]
- Log aggregation: [Tool/approach]

**Metrics & Monitoring**:
- Key metrics tracked: [List including LLM-specific]
- Monitoring tool: [Prometheus, DataDog, etc.]
- Dashboard requirements: [What needs visibility]

**LLM-Specific Monitoring**:
- Cost tracking dashboard
- Usage patterns by user/feature
- Model performance metrics
- Rate limit violations
- Failed requests analysis

**Error Tracking**:
- Error tracking tool: [Sentry, Rollbar, etc.]
- Alert thresholds: [When to alert]
- Alert channels: [Email, Slack, PagerDuty]

**Performance Tracing**:
[APM tool if applicable]
[What gets traced]

### Support & Operations
**Issue Detection**:
[How problems are discovered]

**Incident Response**:
[Process for handling incidents]
[On-call requirements if applicable]

**User Support**:
[Support channel and process]

## Development & Testing

### Development Approach
**Maturity Level**:
[MVP/prototype, production-ready, enterprise-grade]

**Priority Order**:
1. [Must-have feature/capability]
2. [Must-have feature/capability]
3. [Should-have feature/capability]

### Testing Strategy
**Unit Testing**:
- Framework: [pytest, jest, etc.]
- Coverage target: [80%+]
- When run: [On commit, PR, etc.]
- LLM mocking: [Strategy for testing without real API calls]

**Integration Testing**:
- Scope: [What's tested]
- Test environment: [Docker, staging, etc.]
- When run: [PR, before deployment]
- LLM testing: [Use cheap models or heavy mocking]

**End-to-End Testing**:
- Tool: [Playwright, Cypress, etc.]
- Critical paths tested: [List]
- When run: [Before production deployment]
- LLM test budget: [Allocated budget for E2E tests]

**Performance Testing**:
[Load testing approach if applicable]
[Tools and benchmarks]
[LLM load testing considerations]

### CI/CD
**Continuous Integration**:
- Platform: [GitHub Actions, GitLab CI, Jenkins, etc.]
- Triggers: [On push, PR, etc.]
- Pipeline steps: [Build, test, lint, etc.]

**Continuous Deployment**:
- Automated: [Yes/No]
- Deployment gates: [Tests, approvals, etc.]
- Environments: [Dev, staging, production]

**Code Quality**:
- Linters: [Tools used]
- Code review requirements: [Process]
- Quality gates: [Criteria for merge]

## Business & Operations

### Success Metrics
**Key Performance Indicators**:
- [KPI 1 with target]
- [KPI 2 with target]
- [KPI 3 with target]

**Business Metrics**:
- [Metric 1]
- [Metric 2]

**Technical Metrics**:
- [Metric 1]
- [Metric 2]

**LLM-Specific Metrics**:
- Cost per user
- Cost per conversation/request
- User satisfaction with LLM responses
- Token efficiency (tokens per task)

### Budget & Costs
**Infrastructure Costs**:
- Estimated monthly: [$X]
- Key cost drivers: [Compute, storage, bandwidth, LLM, etc.]

**LLM Costs**:
- Estimated monthly: [$X]
- Cost breakdown by model/feature
- Growth projections

**Third-party Services**:
- [Service 1: $X/month]
- [Service 2: $Y/month]
- [LLM Provider: $Z/month]

**Cost Optimization Priorities**:
[Where to focus cost savings]

### Maintenance Plan
**Ongoing Development**:
[Expected velocity and priorities]

**Long-term Maintenance**:
[Who maintains, how often updated]

**Technical Debt Management**:
[Approach to addressing technical debt]

## Key Features (Detailed)

### Feature 1: [Name]
**Description**: [What it does]
**Priority**: [Must-have/should-have/nice-to-have]
**Dependencies**: [Technical or business dependencies]
**LLM Usage**: [If applicable - which models, expected cost]
**Acceptance Criteria**: [How to know it's done]

### Feature 2: [Name]
**Description**: [What it does]
**Priority**: [Must-have/should-have/nice-to-have]
**Dependencies**: [Technical or business dependencies]
**LLM Usage**: [If applicable - which models, expected cost]
**Acceptance Criteria**: [How to know it's done]

### Feature 3: [Name]
**Description**: [What it does]
**Priority**: [Must-have/should-have/nice-to-have]
**Dependencies**: [Technical or business dependencies]
**LLM Usage**: [If applicable - which models, expected cost]
**Acceptance Criteria**: [How to know it's done]

[Continue for all key features]

## Constraints & Requirements

### Technical Constraints
- [Must use technology X]
- [Cannot use technology Y]
- [Must integrate with system Z]
- [Performance constraint]
- [LLM provider restrictions]

### Business Constraints
- [Budget constraint]
- [Resource constraint]
- [Regulatory constraint]

### Compliance Requirements
- [GDPR: Specific requirements]
- [HIPAA: Specific requirements]
- [Industry-specific: Requirements]

### Integration Requirements
**Required Integrations**:
- [System 1: Purpose and data exchanged]
- [System 2: Purpose and data exchanged]
- [LLM Provider(s): Models and usage]

**Integration Patterns**:
[REST, GraphQL, webhooks, message queues, streaming, etc.]

## Migration & Compatibility

**Existing System** (if replacing):
[Description of current system]

**Migration Approach**:
- Strategy: [Big bang, phased, parallel, etc.]
- Data migration: [Process and tools]
- User migration: [How users transition]

**Compatibility Requirements**:
- [Data format compatibility]
- [API compatibility]
- [User experience continuity]

**Transition Plan**:
1. [Phase 1]
2. [Phase 2]
3. [Phase 3]

## Open Questions & Future Considerations

### Open Questions
- [Question 1 to address later]
- [Question 2 to address later]

### Future Enhancements (Beyond Initial Scope)
- [Enhancement 1]
- [Enhancement 2]
- [Enhancement 3]
- [LLM: Fine-tuned models]
- [LLM: Advanced prompting techniques]

### Known Risks & Mitigation
**Risk 1**: [Description]
- Likelihood: [High/Medium/Low]
- Impact: [High/Medium/Low]
- Mitigation: [Strategy]

**Risk 2**: LLM Cost Overrun
- Likelihood: [Medium]
- Impact: [High - could exceed budget]
- Mitigation: [Hard budget caps, automatic rate limiting, alerts]

[Continue for all significant risks]

## Decision Log

### Key Architectural Decisions
**Decision 1**: [What was decided]
- Rationale: [Why this choice]
- Alternatives considered: [What else was evaluated]

**Decision 2**: [LLM Provider/Model Selection]
- Rationale: [Cost, capabilities, latency trade-offs]
- Alternatives considered: [Other providers/models evaluated]

[Continue for all major decisions]

## References & Resources
- [Link to relevant documentation]
- [Link to design documents]
- [Link to external resources]
- [LLM provider documentation]
- [Cost calculation spreadsheets]
```

## Final Steps

After creating both documents:

1. **Create docs directory if it doesn't exist**:
```bash
   mkdir -p docs
```

2. **Save both files**:
   - `docs/PROJECT_DESCRIPTION.md` (concise)
   - `docs/FULL_PROJECT_DESCRIPTION.md` (detailed)

3. **Confirm with user**:
```
   Created two project documentation files:
   
   1. docs/PROJECT_DESCRIPTION.md (concise overview - read on every launch)
   2. docs/FULL_PROJECT_DESCRIPTION.md (complete details)
   
   The concise version will be automatically loaded when Claude starts.
   The full version is available for deep reference when needed.
   
   Does this capture everything? Any changes needed?
```

4. **Remind about usage**:
   - PROJECT_DESCRIPTION.md is read automatically each launch
   - FULL_PROJECT_DESCRIPTION.md provides complete context when needed
   - Both files should be kept in sync as project evolves

The two-file system ensures:
- ✅ Quick context loading (concise version)
- ✅ Complete information available (full version)
- ✅ Efficient token usage (don't load everything every time)
- ✅ Clear separation between "need to know" and "nice to know"
- ✅ LLM cost controls are documented and enforced

## Integration with Development

This skill coordinates with:
- **project-inception**: Creates initial project structure and setup
- **docs-manager**: Maintains and updates project documentation
- **docs-bigger-picture**: Reads the documentation created by this skill
- **project-brainstorm**: Uses project context for feature ideation
- **review-plan**: Validates plans against documented constraints

## Common Pitfalls to Avoid

**Don't:**
- Rush through questions without understanding answers
- Accept vague responses on critical production requirements
- Skip security or deployment considerations
- Forget to probe on LLM cost controls for AI projects
- Create documentation and never update it
- Ask all questions upfront without adapting to answers
- Ignore red flags in user responses

**Do:**
- Ask one clear question at a time
- Adapt questions based on previous answers
- Push for concrete answers on production concerns
- Emphasize cost controls for LLM-heavy projects
- Ensure all essential topics are covered before finishing
- Create both concise and detailed documentation
- Follow up on vague or incomplete answers