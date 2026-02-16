---
name: collaboration-mode
description: Team-coordinated development with enhanced communication, synchronization, and shared understanding
---

# Collaboration Mode

## Purpose

Execute development work that requires coordination with team members. Emphasizes clear communication, explicit synchronization points, and shared understanding across the team.

## When to Use

**Best for:**
- Shared codebase work (multiple people editing same areas)
- Cross-team dependencies (waiting on/providing to other teams)
- Architectural changes affecting others
- Feature work requiring design/product input
- Code reviews requiring discussion
- Knowledge transfer/pairing sessions
- Work in high-communication environments

**Don't use for:**
- Solo work in isolated codebase area (use Deep Work Mode)
- Quick independent fixes (use Quick Fix Mode)
- Work with no team dependencies (use Deep Work Mode)

## Time Structure

**Total duration**: 60-90 minutes

**Stage breakdown:**
```
1. Plan      (10 min)  - Define scope clearly
2. Design    (10 min)  - Get feedback on approach
3. Implement (30-60 min) - Code independently
4. Test      (10 min)  - Thorough verification
5. Review    (5 min)   - Self review
6. Integrate (10 min)  - Coordinate with team
```

**Synchronization points:**
- After Plan: Share scope with team
- After Design: Get design feedback
- After Test: Notify team of completion
- Before Integrate: Coordinate merge timing

## Workflow

### Stage 1: Plan (10 minutes)

**Objective**: Crystal-clear scope that team understands

**Activities:**
- Define what we're building (extra clarity)
- Identify team dependencies explicitly
- List assumptions that need validation
- Share plan with affected team members

**Output template:**
```markdown
# Collaboration Session: [Feature/Task Name]

## Goal
[Clear description of what we're building]

## Team Context
**Who's affected**: [List team members/teams]
**Dependencies on others**: [What we need from whom]
**Impact on others**: [Who depends on this]

## Deliverables
- [ ] [Concrete deliverable 1]
- [ ] [Concrete deliverable 2]

## Assumptions to Validate
- [ ] [Assumption 1] (confirm with [person])
- [ ] [Assumption 2] (confirm with [person])

## Coordination Points
- After Design: Get feedback from [person]
- After Test: Notify [person]
- Before Merge: Coordinate with [person]

## Success Criteria
- [ ] Tests passing
- [ ] Team reviewed and approved
- [ ] [Project-specific criterion]
```

**Communication:**
```
@team: Working on [feature]. Will affect [areas].
Need: [dependencies].
Timeline: [estimate].
Questions: [any blockers?]
```

**Completion gate:**
- [ ] Scope is clear and documented
- [ ] Team dependencies identified
- [ ] Assumptions documented
- [ ] Team notified of work starting

### Stage 2: Design (10 minutes)

**Objective**: Get team buy-in on approach before coding

**Activities:**
- Sketch implementation approach
- Document integration points
- Identify potential conflicts
- **Get feedback early** (key difference from other modes)

**Output template:**
```markdown
## Design

### Implementation Approach
[How we'll build this - more detail than solo work]

### Integration Points
- **With [component/service]**: [How we'll integrate]
- **With [team's work]**: [How we'll coordinate]

### API Changes
**New endpoints/functions**:
- `[API signature]`: [Purpose]

**Modified endpoints/functions**:
- `[API signature]`: [What's changing, why]

**Breaking changes**: [None / List with migration]

### Files to Create/Modify
- `[file1]`: [Changes - detailed for team context]
- `[file2]`: [Changes - detailed for team context]

### Open Questions
1. [Question 1] - need input from [person]
2. [Question 2] - need input from [person]

### Test Strategy
[Test approach - how team can verify]
```

**Get feedback:**
```
@team: Proposed approach for [feature]:
[Brief summary]
Key decisions:
- [Decision 1]
- [Decision 2]
Questions before I start coding?
```

**Wait for feedback** (5-15 min):
- Critical changes: Wait for explicit approval
- Non-critical changes: Proceed if no objections in 15 min
- Urgent changes: Quick sync call

**Completion gate:**
- [ ] Approach documented clearly
- [ ] Integration points explicit
- [ ] Feedback requested
- [ ] Approval received (or timer expired)

### Stage 3: Implement (30-60 minutes)

**Objective**: Code independently with visibility to team

**Approach:**
- Use TDD rhythm
- Commit frequently with clear messages
- Document decisions inline
- **Update team on progress**

**Progress updates:**
```
30 min mark:
@team: [Feature] 50% done. Implemented [x], working on [y]. On track.

If blocked:
@team: [Feature] blocked on [issue]. Need [help/resource]. Switching to [alternative].
```

**Commit messages with context:**
```bash
git commit -m "feat(api): add user export endpoint

- Implements CSV export as discussed in design
- Integrates with existing auth middleware
- Breaks: none
- Testing: unit tests for export logic

Related: #123
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**Key practices:**
- Extra clear commit messages (team will read)
- Document "why" not just "what" in code
- Mark WIP commits clearly
- Push to shared branch regularly
- Update shared docs as you go

**Completion gate:**
- [ ] Code complete
- [ ] Tests written and passing
- [ ] Committed with clear messages
- [ ] Pushed to shared branch

### Stage 4: Test (10 minutes)

**Objective**: Thorough verification + document test results for team

**Activities:**
1. **Run full test suite** (5 min)
   ```bash
   npm test  # or pytest
   npm run test:integration
   ```

2. **Manual verification** (5 min)
   - Test happy path
   - Test edge cases
   - Verify integration points
   - Check backward compatibility

**Document test results:**
```markdown
## Test Results

### Automated Tests
- ✅ Unit tests: 15 tests passing
- ✅ Integration tests: 3 tests passing
- ✅ Coverage: 87%

### Manual Verification
- ✅ Happy path: User can export CSV
- ✅ Edge case: Empty data handled
- ✅ Edge case: Large dataset (10k rows) works
- ✅ Integration: Works with existing auth

### Backward Compatibility
- ✅ No breaking changes
- ✅ Existing endpoints unchanged
- ✅ No regressions detected
```

**Completion gate:**
- [ ] All tests passing
- [ ] Manual verification complete
- [ ] Test results documented
- [ ] Ready for team review

### Stage 5: Review (5 minutes)

**Objective**: Self-review + prepare for team review

**Activities:**
1. **Self-review** (3 min)
   ```bash
   git diff main...HEAD
   ```
   - Check code quality
   - Verify conventions
   - Remove debug code
   - Check for TODOs

2. **Prepare for team review** (2 min)
   - Write clear PR description
   - Document decisions
   - List testing done
   - Note anything unusual

**PR description template:**
```markdown
## What Changed
[Clear description of changes]

## Why
[Business/technical reason for change]

## Key Decisions
- [Decision 1]: [Why we chose this]
- [Decision 2]: [Why we chose this]

## Testing Done
- [x] Unit tests: [coverage]
- [x] Integration tests: [what tested]
- [x] Manual verification: [what checked]

## Review Focus
Please review:
- [ ] [Specific area of concern]
- [ ] [Architectural decision]

## Deployment Notes
[Any special deployment steps / None]

🤖 Generated with Claude Code
```

**Completion gate:**
- [ ] Code quality checked
- [ ] PR description complete
- [ ] Review points identified
- [ ] Ready for team eyes

### Stage 6: Integrate (10 minutes)

**Objective**: Coordinate merge with team

**Activities:**
1. **Create PR** (3 min)
   ```bash
   gh pr create --title "feat: add CSV export" --body "$(cat pr_template.md)"
   ```

2. **Request reviews** (2 min)
   ```
   @reviewer1: Could you review the API design?
   @reviewer2: Could you review the integration with auth?
   ```

3. **Coordinate timing** (5 min)
   - Check if anyone else is merging
   - Coordinate with dependent work
   - Schedule merge time if needed
   - Notify affected teams

**Coordination message:**
```
@team: PR #123 ready for review.
Adds: CSV export feature
Affects: Analytics dashboard
No breaking changes
Will merge after approval, ideally before [deadline]
```

**Completion gate:**
- [ ] PR created with full context
- [ ] Reviewers requested
- [ ] Team notified
- [ ] Merge timing coordinated

## Key Practices

**Do:**
- Communicate at every stage boundary
- Document assumptions explicitly
- Get feedback early (Design stage)
- Write extra-clear commit messages
- Update team on progress (30-min intervals)
- Coordinate merge timing
- Document decisions for team context

**Don't:**
- Go silent during implementation (update team)
- Skip design feedback (costly later)
- Merge without coordination (conflicts)
- Assume understanding (be explicit)
- Skip documenting "why" (team needs context)

## Communication Patterns

### Status Updates

**Progress update** (every 30 min during Implement):
```
[Feature] progress: [X]% done
Completed: [what's done]
Working on: [current task]
Blockers: [none / list]
ETA: [time]
```

**Blocked update** (immediately when blocked):
```
[Feature] BLOCKED: [issue]
Need: [help/resource/decision]
Impact: [timeline impact]
Options: [alternative approaches]
```

**Completion update** (after Test):
```
[Feature] COMPLETE
Changes: [summary]
Testing: [what was tested]
Ready for: [review/merge]
```

### Asking for Feedback

**Design feedback** (Stage 2):
```
Need design feedback on [feature]

Approach: [brief summary]
Trade-offs:
- Option A: [pros/cons]
- Option B: [pros/cons]

Leaning toward: [option + why]
Concerns: [what worries you]

Feedback by: [time] (will proceed if no concerns)
```

**Code review request** (Stage 6):
```
PR #123 ready for review

Focus areas:
1. [Area needing careful review]
2. [Architectural decision to validate]

Size: [LOC changed]
Risk: [low/medium/high]
Priority: [low/medium/high]

Please review by: [date]
```

## Common Pitfalls

**Pitfall**: Designing in isolation → team disagrees with approach later
**Fix**: Always get design feedback before coding (Stage 2)

**Pitfall**: Going silent during work → team doesn't know progress
**Fix**: Update team every 30 minutes during Implement

**Pitfall**: Surprise merge → conflicts with other's work
**Fix**: Coordinate merge timing, check with team first

**Pitfall**: Unclear commit messages → team can't understand changes
**Fix**: Write detailed messages explaining "why" and context

**Pitfall**: Merging without coordination → breaks someone's workflow
**Fix**: Ask "anyone working in this area?" before merge

**Pitfall**: Assumptions not validated → rework needed
**Fix**: Document and validate assumptions in Stage 1

## Examples

### Example 1: Cross-Team Feature

**Task**: Add SSO authentication (affects multiple teams)

**Stage 1: Plan** (10 min)
```markdown
# Collaboration Session: SSO Authentication

## Goal
Add SSO login option alongside existing email/password auth

## Team Context
**Who's affected**:
- Frontend team: UI changes
- Backend team: API changes
- DevOps: Config changes
- Security team: Review required

**Dependencies on others**:
- Security team: SSO provider approval
- DevOps: SSO credentials in production

**Impact on others**:
- Frontend: New login flow to integrate
- Backend: Auth middleware changes

## Coordination Points
- After Design: Security team review
- After Test: Frontend team notification
- Before Merge: DevOps production config ready
```

**Communication:**
```
@frontend @backend @devops @security:
Starting SSO authentication work.
- Frontend: New login UI component
- Backend: Auth middleware changes
- DevOps: Need SSO creds in prod
- Security: Need design review

Timeline: 2-3 days
Questions?
```

**Stage 2: Design** (10 min + feedback)
```markdown
## Design

### Integration Points
- **With existing auth**: SSO as alternative, doesn't replace email/password
- **With frontend**: New `<SSOLoginButton>` component
- **With DevOps**: Environment variables for SSO config

### API Changes
**New**:
- `POST /auth/sso/callback`: Handle SSO redirect

**Modified**:
- `GET /auth/me`: Include SSO user info

**Breaking changes**: None (additive only)
```

**Get feedback:**
```
@security: Proposed SSO approach:
- Use OAuth2 with PKCE
- Store SSO tokens encrypted
- Fallback to email if SSO fails

Security concerns?

@frontend: New API endpoint `/auth/sso/callback`
Returns JWT like existing auth.
Works with existing auth flow?
```

**Wait for responses** (got approval from security, frontend has questions)

**Stage 3: Implement** (60 min)
```
30 min update:
@team: SSO 50% done. Backend complete, working on frontend integration. On track.

60 min update:
@team: SSO 90% done. Frontend integration complete, writing tests. Ready for testing soon.
```

**Stage 4: Test** (10 min)
```markdown
## Test Results

### Automated Tests
- ✅ SSO flow tests: 8 passing
- ✅ Existing auth tests: Still passing
- ✅ Integration tests: 4 passing

### Manual Verification
- ✅ SSO login works
- ✅ Existing email login still works
- ✅ Token refresh works
- ✅ Logout works

### Backward Compatibility
- ✅ No breaking changes
- ✅ Existing users unaffected
```

**Stage 5: Review** (5 min)

**PR Description:**
```markdown
## What Changed
Add SSO authentication as alternative login method

## Why
Requested by enterprise customers for centralized auth

## Key Decisions
- Additive only (no breaking changes to existing auth)
- OAuth2 with PKCE for security
- Encrypted token storage
- Graceful fallback to email auth

## Testing Done
- [x] Unit tests: 8 tests covering SSO flow
- [x] Integration: Works with existing auth
- [x] Manual: Tested SSO login/logout/refresh

## Review Focus
- [ ] @security: OAuth2 implementation
- [ ] @frontend: Integration with existing login flow

## Deployment Notes
Requires SSO credentials in production environment variables
```

**Stage 6: Integrate** (10 min)
```
@team: PR #234 ready for review

Adds: SSO authentication
Affects: Login flow, auth middleware
Security: @security please review
Frontend: @frontend please verify integration

Will merge after approvals + DevOps confirms prod config ready
Target: End of week
```

### Example 2: Shared Codebase Work

**Task**: Refactor API client (others actively using)

**Coordination approach:**
1. **Plan**: Announce refactor plan to team
2. **Design**: Get feedback on migration path
3. **Implement**: Work in feature branch, update team on progress
4. **Test**: Verify all existing usages still work
5. **Review**: Get team review of changes
6. **Integrate**: Coordinate merge timing (when others not merging)

**Key communication:**
```
Before starting:
@team: Planning to refactor API client.
Will maintain backward compatibility.
Working in `feature/api-client-refactor` branch.
ETA: 2 days. Conflicts?

During work:
Day 1: Refactor 50% done. No breaking changes. On track.
Day 2: Refactor complete. All tests passing. Ready for review.

Before merge:
@team: API client refactor ready to merge.
All existing code still works.
Anyone merging in next hour? Prefer to merge now.
```

## Integration with Other Skills

- **plan-review-system**: Get design reviewed before Stage 3
- **dev-tdd**: Use during Stage 3 for implementation
- **review-system**: Team uses for Stage 5-6 review
- **context-manager**: Share context across team members
- **docs-manager**: Update shared docs during Stage 6

## Success Metrics

**Good collaboration session:**
- Team aware at every stage
- No surprise changes
- Feedback incorporated early
- Smooth merge with no conflicts
- Team understands changes

**Poor collaboration session:**
- Team surprised by changes
- Conflicts discovered at merge
- Rework needed after coding
- Unclear what changed or why
- Team confused by implementation
