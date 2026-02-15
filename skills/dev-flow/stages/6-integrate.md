---
name: integrate-stage
description: Merge reviewed code into main branch, deploy if applicable, and close out the work session
---

# Stage 6: Integrate

## Purpose

Successfully merge reviewed code into the main branch, deploy to appropriate environments, verify integration works correctly, and properly close out the work session. The final quality gate before code reaches production.

## When to Use

**Required for:**
- All development work after Review stage
- Merging feature branches to main
- Deploying to staging/production
- Closing out work sessions

**Never skip** - integration is where "done" actually means done

## Time Investment

**By mode:**
- **Deep Work Mode**: 5 minutes (merge + verification)
- **Quick Fix Mode**: 2 minutes (quick merge)
- **Collaboration Mode**: 10 minutes (coordination + handoff)
- **Debugging Mode**: 3 minutes (verify fix deployed)

**Time well spent**: 5 minutes of proper integration prevents hours of debugging production issues

## Objectives

At the end of integrate stage, you should have:
1. **Code merged**: Changes integrated into main branch
2. **Deployment complete**: Code deployed to appropriate environment (if applicable)
3. **Integration verified**: Merged code works with main branch
4. **Session closed**: Work properly documented and handed off
5. **Team notified**: Stakeholders informed of completion

## Integration Process

### Step 1: Pre-Merge Verification (1 minute)

**Final checks before merging**

**Checklist:**
```markdown
## Pre-Merge Checklist
- [ ] All tests passing on feature branch
- [ ] Code reviewed and approved (if team review required)
- [ ] Branch up-to-date with main
- [ ] No merge conflicts
- [ ] CI/CD pipeline passing
- [ ] Documentation updated
- [ ] Breaking changes documented (if any)
```

**Update branch with latest main:**
```bash
# Fetch latest main
git fetch origin main

# Check if branch is behind main
git log HEAD..origin/main --oneline

# If behind, rebase or merge
git rebase origin/main  # Preferred: clean history
# OR
git merge origin/main   # Alternative: merge commit

# If conflicts, resolve and continue
git rebase --continue
# OR
git merge --continue

# Verify tests still pass after update
npm test  # or pytest, cargo test, etc.
```

**Red flags (don't merge):**
- Tests failing
- Unresolved code review comments
- Merge conflicts
- CI/CD pipeline failing
- Missing documentation updates

### Step 2: Merge to Main (varies by mode)

**Deep Work Mode: Full merge with verification (3 min)**

**Merge strategy (choose based on project):**

**Option 1: Merge commit (preserves branch history)**
```bash
# Switch to main
git checkout main

# Pull latest
git pull origin main

# Merge feature branch
git merge --no-ff feature/csv-export

# Verify merge
git log --oneline -5

# Push to origin
git push origin main
```

**Option 2: Squash merge (clean linear history)**
```bash
# Switch to main
git checkout main

# Pull latest
git pull origin main

# Squash merge feature branch
git merge --squash feature/csv-export

# Commit with comprehensive message
git commit -m "$(cat <<'EOF'
feat(export): add CSV export functionality

Adds CSV export button to analytics dashboard.
Users can now export analytics data as CSV file.

Key changes:
- CSVService utility for CSV generation
- ExportButton component with download trigger
- Integration with analytics dashboard

Tests: 15 new tests, 92% coverage
Reviewed-by: @teammate
Closes #123

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"

# Push to origin
git push origin main
```

**Option 3: Rebase merge (cleanest history)**
```bash
# On feature branch, rebase onto main
git rebase origin/main

# Switch to main
git checkout main

# Fast-forward merge
git merge feature/csv-export

# Push to origin
git push origin main
```

**Quick Fix Mode: Fast merge (2 min)**

```bash
# Quick merge for small fixes
git checkout main
git pull origin main
git merge --squash feature/fix-button
git commit -m "fix(forms): disable submit button during API call

Closes #456

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push origin main
```

**Collaboration Mode: PR merge with team notification (5 min)**

**If using pull request:**
```bash
# Push branch to origin
git push origin feature/csv-export

# Create PR (using gh CLI)
gh pr create --title "feat(export): add CSV export functionality" \
  --body "$(cat <<'EOF'
## Summary
Adds CSV export button to analytics dashboard for downloading analytics data.

## Changes
- CSVService utility for CSV generation
- ExportButton component
- Integration with AnalyticsDashboard

## Testing
- ✅ 15 new tests passing
- ✅ 92% coverage
- ✅ Manual verification in Chrome/Firefox/Safari

## Review Focus
- CSV escaping logic (CSVService.ts:45-67)
- Button placement in dashboard

Closes #123
EOF
)"

# After PR approval, merge via GitHub/GitLab UI or CLI
gh pr merge --squash --delete-branch
```

**Notify team:**
```markdown
@team: CSV export feature merged to main 🚀

What: Users can now export analytics as CSV
Deployed: Staging (auto-deployed from main)
Prod deploy: Scheduled for tomorrow 10am
Docs: README updated

Related: Closes #123
```

### Step 3: Verify Integration (varies by mode)

**Deep Work Mode: Comprehensive verification (2 min)**

**Verify merge succeeded:**
```bash
# Check main branch
git checkout main
git log --oneline -5

# Verify feature present
git show HEAD

# Run tests on main
npm test

# Verify CI/CD passed
# (Check GitHub Actions, GitLab CI, etc.)
```

**Verify in deployed environment:**
```markdown
## Integration Verification

### Staging Environment
- [ ] Feature deployed to staging
- [ ] Smoke test: Basic functionality works
- [ ] Integration test: Works with other features
- [ ] No console errors
- [ ] Performance acceptable

### Production (if deployed)
- [ ] Feature deployed to production
- [ ] Monitoring: No errors in logs
- [ ] Metrics: Normal behavior
- [ ] User feedback: No immediate issues
```

**Quick Fix Mode: Quick verification (1 min)**

```bash
# Verify merge
git log --oneline -2

# Quick smoke test
npm test -- <relevant-test>
```

**Collaboration Mode: Documented verification (3 min)**

```markdown
## Integration Verification

**Merged to**: main branch
**Commit**: abc1234
**Deployed to**: staging (auto), production (pending)
**Verified**:
- ✅ All tests passing on main
- ✅ Feature works in staging
- ✅ No regressions detected

**Monitoring**:
- Check logs in 1 hour
- Check metrics in 24 hours
```

## Deployment Process

**If deployment required (staging/production)**

### Staging Deployment

**Automatic (CI/CD):**
```markdown
## Staging Deployment (Auto)

**Trigger**: Merge to main
**Pipeline**: GitHub Actions / GitLab CI
**Status**: Check pipeline status
**Verify**: Access staging environment

URL: https://staging.example.com
Tests: Automated smoke tests run post-deploy
```

**Manual:**
```bash
# Deploy to staging
npm run deploy:staging
# OR
./scripts/deploy.sh staging

# Verify deployment
curl https://staging.example.com/health

# Run smoke tests
npm run test:staging
```

### Production Deployment

**Scheduled deployment:**
```markdown
## Production Deployment Plan

**When**: Tomorrow 10am PST
**Approver**: @tech-lead
**Rollback plan**: Revert commit abc1234
**Monitoring**: Dashboard + alerts

**Pre-deploy checklist**:
- [ ] Staging verified (24h soak time)
- [ ] Team notified
- [ ] Rollback plan ready
- [ ] Monitoring configured

**Post-deploy checklist**:
- [ ] Health check passed
- [ ] Smoke tests passed
- [ ] Metrics normal
- [ ] No error spike in logs
```

**Immediate deployment (urgent fix):**
```bash
# Deploy to production (urgent)
npm run deploy:prod

# Monitor immediately
tail -f /var/log/app/production.log

# Watch metrics dashboard
# Check error rates, response times, user activity
```

### Deployment Verification

```markdown
## Deployment Verification

### Health Check
- [ ] Service responds: `curl https://api.example.com/health`
- [ ] Database connected
- [ ] External services reachable

### Smoke Tests
- [ ] Critical path works (user login, core feature)
- [ ] New feature accessible
- [ ] No 500 errors

### Metrics Check (first 15 min)
- [ ] Error rate: Normal (<0.1%)
- [ ] Response time: Normal (<200ms p95)
- [ ] Traffic: Normal distribution
- [ ] No alert notifications

### User Impact
- [ ] No support tickets about new issues
- [ ] User feedback: Normal
- [ ] Feature usage: As expected
```

## Session Closeout

**Document work session completion**

### Closeout Checklist

```markdown
## Work Session Closeout

### Completion Status
- [x] Goal achieved: [Original goal from Plan stage]
- [x] All deliverables complete: [List from Plan stage]
- [x] Success criteria met: [Criteria from Plan stage]

### Integration Status
- [x] Code merged to main
- [x] Deployed to: [staging/production/both]
- [x] Integration verified
- [x] No regressions detected

### Documentation Status
- [x] Code documented
- [x] README updated
- [x] CHANGELOG updated
- [x] Team notified

### Handoff Items (if applicable)
- [ ] Follow-up tasks: [List any follow-up work]
- [ ] Monitoring: [What to watch for]
- [ ] Known limitations: [Any known issues]

### Session Metrics
- Time planned: [From Plan stage]
- Time actual: [Actual time spent]
- Variance: [+/- minutes]
```

### Update Issue/Ticket

**Close issue with summary:**
```markdown
## Issue #123: Add CSV Export

**Status**: ✅ Completed

**Summary**:
Implemented CSV export functionality for analytics dashboard.
Users can now download analytics data as CSV file.

**Changes**:
- Added CSVService utility
- Added ExportButton component
- Integrated with AnalyticsDashboard

**Testing**:
- 15 new tests (92% coverage)
- Manual verification: Chrome, Firefox, Safari
- Staging verification: Passed

**Deployment**:
- Merged to main: commit abc1234
- Deployed to staging: 2024-03-15 14:30
- Production deploy: Scheduled 2024-03-16 10:00

**Related PRs**: #456
**Documentation**: README updated

Closes #123
```

### Team Notification

**Notify stakeholders:**
```markdown
@product @team: CSV Export feature complete 🎉

**What**: Users can export analytics as CSV
**Status**: Merged to main, deployed to staging
**Testing**: 15 tests, manual verification complete
**Prod deploy**: Tomorrow 10am (if no staging issues)

**Try it**: https://staging.example.com/analytics
**Docs**: README updated with usage guide

Questions or issues: Reply here or DM
```

## Cleanup

**Clean up feature branch and local environment**

### Branch Cleanup

```bash
# Delete local feature branch
git branch -d feature/csv-export

# Delete remote feature branch (if not auto-deleted)
git push origin --delete feature/csv-export

# Clean up merged branches
git fetch --prune

# List branches to verify
git branch -a
```

### Local Environment Cleanup

```bash
# Clear build artifacts (if needed)
npm run clean

# Clear node_modules (if needed)
rm -rf node_modules && npm install

# Reset to clean state
git checkout main
git pull origin main
```

## Rollback Procedures

**If integration causes issues**

### Quick Rollback (Critical Issues)

```bash
# Revert last commit on main
git checkout main
git revert HEAD
git push origin main

# Immediate production deploy of revert
npm run deploy:prod

# Notify team
# @team: Rolled back CSV export due to [issue]
# Investigating root cause, will re-deploy after fix
```

### Comprehensive Rollback

```bash
# Identify problem commit
git log --oneline -10

# Revert specific commit
git revert <commit-hash>

# Or reset to previous state (careful!)
git reset --hard <previous-good-commit>
git push --force origin main  # Only if absolutely necessary

# Redeploy
npm run deploy:prod

# Document incident
# Create post-mortem issue
```

### Rollback Verification

```markdown
## Rollback Verification

- [ ] Problem commit reverted
- [ ] Previous version deployed
- [ ] Service healthy (health check passing)
- [ ] Metrics back to normal
- [ ] No errors in logs
- [ ] Users not affected
- [ ] Team notified
- [ ] Post-mortem scheduled
```

## Completion Gate

**Before closing work session, verify:**
- [ ] Code merged to main branch
- [ ] All tests passing on main
- [ ] No merge conflicts or issues
- [ ] Deployment complete (if applicable)
- [ ] Integration verified (feature works in target environment)
- [ ] No regressions detected
- [ ] Documentation updated
- [ ] Issue/ticket closed or updated
- [ ] Team notified
- [ ] Branch cleaned up

**Don't close session if:**
- Merge failed or has conflicts
- Tests failing on main
- Deployment failed
- Feature not working in target environment
- Regressions detected
- Critical bugs found

## Common Mistakes

### Mistake: Merging without updating from main first
**Problem**: Merge creates conflicts or breaks integration
**Fix**: Always pull latest main and verify tests before merging

### Mistake: Not verifying after merge
**Problem**: Integration issues discovered later by others
**Fix**: Always run tests on main after merging

### Mistake: Merging with failing tests
**Problem**: Breaks main branch for entire team
**Fix**: NEVER merge if tests are failing, fix tests first

### Mistake: Not cleaning up feature branches
**Problem**: Repository cluttered with old branches
**Fix**: Delete feature branch immediately after merge

### Mistake: Deploying without verification
**Problem**: Bugs reach production
**Fix**: Always verify in staging before production deploy

### Mistake: Not notifying team
**Problem**: Team unaware of changes, causes confusion
**Fix**: Always notify stakeholders after significant changes

### Mistake: Inadequate deployment verification
**Problem**: Issues discovered hours later
**Fix**: Monitor for 15+ minutes after production deploy

## Integration Examples

### Example 1: Deep Work Mode (Feature Merge)

```markdown
## Integration: CSV Export Feature

### Pre-Merge Verification
- [x] All 15 tests passing on feature branch
- [x] Code reviewed and approved by @teammate
- [x] Branch up-to-date with main (rebased 5 min ago)
- [x] No merge conflicts
- [x] CI/CD pipeline passing

### Merge
```bash
git checkout main
git pull origin main
git merge --squash feature/csv-export
git commit -m "feat(export): add CSV export functionality

Adds CSV export button to analytics dashboard.

Key changes:
- CSVService utility for CSV generation
- ExportButton component with download trigger
- Integration with analytics dashboard

Tests: 15 new tests, 92% coverage
Reviewed-by: @teammate
Closes #123

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push origin main
```

### Verification
- [x] Merge commit on main: abc1234
- [x] All 142 tests passing on main
- [x] CI/CD pipeline passed (5 min)
- [x] Auto-deployed to staging
- [x] Feature verified in staging
- [x] No console errors
- [x] CSV downloads correctly

### Deployment
- Staging: ✅ Deployed automatically (14:35)
- Production: Scheduled for tomorrow 10am

### Closeout
- [x] Issue #123 closed with summary
- [x] Team notified in #engineering
- [x] Branch feature/csv-export deleted
- [x] README updated with export docs
- [x] Monitoring: Set alert for export errors

**Session complete**: 2.5 hours (planned 2.5 hours) ✅
```

### Example 2: Quick Fix Mode (Bug Fix Merge)

```markdown
## Integration: Submit Button Fix

### Merge
```bash
git checkout main
git pull origin main
git merge --squash feature/fix-button
git commit -m "fix(forms): disable submit button during API call

Closes #456

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push origin main
```

### Verification
- [x] Tests passing on main
- [x] Auto-deployed to staging
- [x] Fix verified in staging

### Deployment
- Production: Deployed immediately (urgent fix)
- Verified: No 500 errors, metrics normal

### Closeout
- [x] Issue #456 closed
- [x] Branch deleted

**Session complete**: 30 minutes (planned 30 minutes) ✅
```

### Example 3: Collaboration Mode (Team Feature)

```markdown
## Integration: SSO Authentication

### Pre-Merge
- [x] PR #789 approved by @tech-lead and @security
- [x] All tests passing
- [x] Security review complete
- [x] Documentation reviewed

### Merge
```bash
# Merged via GitHub PR UI (squash merge)
# PR #789: feat(auth): add SSO authentication
# Commit: def5678
```

### Verification
- [x] Merged to main successfully
- [x] All tests passing (CI/CD passed)
- [x] Deployed to staging
- [x] SSO login verified in staging
- [x] Backward compatibility verified (email login still works)

### Deployment Plan
**Staging**: ✅ Deployed (15:00)
**Production**: Scheduled for 2024-03-16 10:00
**Approver**: @tech-lead
**Rollback plan**: Revert commit def5678

### Team Notification
@product @eng: SSO authentication merged! 🎉

Try it in staging: https://staging.example.com/login
Prod deploy: Tomorrow 10am
Docs: Updated in Wiki

### Closeout
- [x] Issue #234 closed
- [x] Wiki documentation updated
- [x] Migration guide written (email to SSO)
- [x] Support team notified
- [x] Monitoring dashboard updated

**Session complete**: 4 hours (planned 4 hours) ✅
```

## Integration with Other Stages

**Receives from:**
- **Review stage**: Reviewed, clean code ready for merge
- **Test stage**: Test results confirming quality

**Feeds into:**
- **Next work session**: Clean main branch for future work
- **Team**: Completed feature available to all

**Informs:**
- **Project tracking**: Updated issue/ticket status
- **Team communication**: Completion notifications
- **Deployment logs**: What's in production

## Tips for Better Integration

**Do:**
- Always update from main before merging
- Run tests on main after merging
- Verify integration in deployed environment
- Clean up feature branches immediately
- Notify team of significant changes
- Monitor production after deployment
- Document deployment in CHANGELOG
- Close issues with comprehensive summary

**Don't:**
- Merge with failing tests (breaks team)
- Skip post-merge verification
- Leave feature branches around
- Deploy to production without staging verification
- Forget to notify stakeholders
- Ignore deployment issues
- Skip monitoring after deploy
- Close issues without documentation

## Advanced Integration Techniques

### Technique 1: Canary Deployment

**Gradual rollout to minimize risk:**

```markdown
## Canary Deployment

**Phase 1: 5% of users (30 min)**
- Deploy to canary servers
- Monitor error rates, latency
- Check user feedback

**Phase 2: 25% of users (1 hour)**
- Expand if Phase 1 successful
- Continue monitoring
- Ready to rollback

**Phase 3: 100% of users**
- Full rollout if no issues
- Continue monitoring for 24h

**Rollback trigger**:
- Error rate >0.5%
- Latency >2x normal
- User complaints
```

### Technique 2: Feature Flags

**Deploy code without activating feature:**

```typescript
// Deploy with feature flag OFF
const FEATURE_CSV_EXPORT = process.env.FEATURE_CSV_EXPORT === 'true';

function Dashboard() {
  return (
    <div>
      {FEATURE_CSV_EXPORT && <ExportButton />}
    </div>
  );
}
```

```markdown
## Feature Flag Deployment

**Deploy to production**: Feature flag OFF
**Staging verification**: Enable flag in staging
**Production rollout**:
- Day 1: Enable for internal users
- Day 2: Enable for beta users
- Day 3: Enable for all users

**Advantage**: Deploy without risk, enable gradually
```

### Technique 3: Blue-Green Deployment

**Zero-downtime deployment:**

```markdown
## Blue-Green Deployment

**Current**: Blue environment (production traffic)
**New**: Green environment (deploy new version)

**Process**:
1. Deploy to Green environment
2. Test Green environment (no user traffic)
3. Switch traffic from Blue to Green
4. Monitor Green environment
5. Keep Blue as instant rollback option

**Rollback**: Switch traffic back to Blue (instant)
```

## Integration Checklist Template

```markdown
## Integration Checklist: [Feature Name]

**Date**: [Date]
**Branch**: [feature/branch-name]
**Commit**: [commit-hash]

### Pre-Merge
- [ ] All tests passing on feature branch
- [ ] Code reviewed and approved
- [ ] Branch up-to-date with main
- [ ] No merge conflicts
- [ ] CI/CD pipeline passing
- [ ] Documentation updated

### Merge
- [ ] Merged to main (strategy: [merge/squash/rebase])
- [ ] Merge commit: [hash]
- [ ] Branch deleted

### Verification
- [ ] Tests passing on main
- [ ] CI/CD pipeline passed
- [ ] No regressions detected

### Deployment
- [ ] Staging: [Deployed/Pending/N/A]
- [ ] Production: [Deployed/Scheduled/N/A]
- [ ] Deployment verified
- [ ] Monitoring configured

### Closeout
- [ ] Issue/ticket closed
- [ ] Team notified
- [ ] Documentation updated
- [ ] Session metrics recorded

**Status**: [Complete/Blocked/Issues]
**Notes**: [Any relevant notes]
```
