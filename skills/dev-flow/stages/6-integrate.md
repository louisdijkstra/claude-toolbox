---
name: integrate-stage
description: Prepare code for integration by suggesting commits, documenting changes, and verifying readiness for merge
---

# Stage 6: Integrate

## Purpose

Prepare reviewed code for integration into the main branch. Suggest commits, document changes, verify readiness, and hand off to the user for final git operations. The quality gate before code reaches main.

## When to Use

**Required for:**
- All development work after Review stage
- Completing features or bug fixes
- Preparing code for merge
- Documenting work completion

**Never skip** - integration preparation ensures code is merge-ready

## Time Investment

**By mode:**
- **Deep Work Mode**: 5 minutes (verification + documentation)
- **Quick Fix Mode**: 2 minutes (quick check)
- **Collaboration Mode**: 10 minutes (coordination + handoff)
- **Debugging Mode**: 3 minutes (verify fix ready)

**Time well spent**: 5 minutes of preparation prevents hours of merge conflicts

## Objectives

At the end of integrate stage, you should have:
1. **Files identified**: Know what files should be committed
2. **Commit message ready**: Have proper conventional commit message
3. **Integration verified**: Code works and tests pass
4. **Documentation ready**: Changes documented for team
5. **User informed**: User knows exactly what to commit

## Git Operations Philosophy

**IMPORTANT: No Automatic Git Operations**

- **Never automatically commit, merge, or push** without explicit user permission
- **Always suggest** what should be committed and why
- **Always provide** the exact files and commit message
- **Always ask** before any git operation that affects the repository
- **Exception**: User explicitly authorizes automatic git operations

## Integration Preparation Process

### Step 1: Verify Code Readiness (1 minute)

**Check code is ready for integration**

**Checklist:**
```markdown
## Pre-Integration Checklist
- [ ] All tests passing
- [ ] Code reviewed (self or peer)
- [ ] No build errors
- [ ] No linting errors
- [ ] Documentation updated if needed
- [ ] No TODO/FIXME comments for critical issues
```

**Run verification:**
```bash
# Run tests
npm test  # or pytest, cargo test, etc.

# Check for build errors
npm run build  # or equivalent

# Check for linting errors
npm run lint  # or ruff check, etc.
```

**Red flags (not ready):**
- Tests failing
- Build errors
- Critical TODOs unresolved
- Missing documentation for new features

### Step 2: Identify Files for Commit (1 minute)

**Determine what should be committed**

```bash
# Check what changed
git status

# See detailed changes
git diff

# See staged changes (if any)
git diff --cached
```

**Categorize changes:**
- **Should commit**: New features, bug fixes, tests
- **Should not commit**: Debug code, temporary files, secrets
- **Need review**: Unintended changes, large refactors

**Example analysis:**
```markdown
## Files Ready to Commit

**Feature files:**
- src/components/ExportButton.tsx (new export button)
- src/services/CSVService.ts (CSV generation logic)
- src/pages/Dashboard.tsx (integrated export button)

**Test files:**
- tests/CSVService.test.ts (15 new tests)
- tests/ExportButton.test.tsx (8 new tests)

**Documentation:**
- README.md (added export feature docs)

**Should NOT commit:**
- src/debug-utils.ts (temporary debugging)
- .env.local (local configuration)
```

### Step 3: Generate Commit Message (1 minute)

**Create conventional commit message following guidelines**

**Format:**
```
<type>(<scope>): <subject>

[optional body]

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**Example commit messages:**

**Feature:**
```
feat(export): add CSV export to analytics dashboard

Users can now export analytics data as CSV files.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**Bug fix:**
```
fix(forms): disable submit button during API call

Prevents double-submission when users click submit multiple times.

Closes #456

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**Refactor:**
```
refactor(auth): simplify login validation logic

No functional changes.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**Language style:**
- Use natural, simple language
- "add CSV export" not "implement CSV export functionality"
- "fix login redirect" not "resolve authentication flow redirection issue"
- Be direct and clear

### Step 4: Suggest Commit to User (REQUIRED)

**Always inform the user what should be committed**

**Template message to user:**
```markdown
## Ready to Commit

I've completed [feature/fix name]. Here's what should be committed:

**Files to add:**
- src/components/ExportButton.tsx
- src/services/CSVService.ts
- src/pages/Dashboard.tsx
- tests/CSVService.test.ts
- tests/ExportButton.test.tsx
- README.md

**Suggested commit message:**
```
feat(export): add CSV export to analytics dashboard

Users can now export analytics data as CSV files.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**Commands to run:**
```bash
# Stage the files
git add src/components/ExportButton.tsx \
  src/services/CSVService.ts \
  src/pages/Dashboard.tsx \
  tests/CSVService.test.ts \
  tests/ExportButton.test.tsx \
  README.md

# Commit with message
git commit -m "feat(export): add CSV export to analytics dashboard

Users can now export analytics data as CSV files.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**Verification commands** (to run after commit):
```bash
# Verify commit
git log -1

# Verify tests still pass
npm test

# Check status
git status
```

Would you like me to help with anything else, or are you ready to commit?
```

**NEVER run these commands automatically - always wait for user approval**

### Step 5: Verify Integration Readiness (1 minute)

**Before suggesting commit, ensure everything works**

```bash
# Final test run
npm test

# Final build check
npm run build

# Check for uncommitted debug code
git diff | grep -i "console.log\|debugger\|TODO"

# Verify no secrets
git diff | grep -i "api_key\|password\|secret"
```

**Integration readiness checklist:**
```markdown
## Integration Readiness

- [ ] All tests passing
- [ ] Build succeeds
- [ ] No debug code in changes
- [ ] No secrets in changes
- [ ] Documentation updated
- [ ] Commit message ready
- [ ] Files identified
```

## Documentation for Handoff

**Prepare documentation for the user**

### Work Summary

```markdown
## Work Complete: [Feature/Fix Name]

**What was done:**
- [Brief description of changes]

**Files changed:**
- [List of modified files with brief description]

**Testing:**
- [Number] new tests added
- All tests passing
- [Any manual testing done]

**Next steps:**
1. Review the changes: git diff
2. Commit using the suggested message above
3. [Any additional steps like updating changelog]
```

### Known Limitations

```markdown
## Known Limitations / Follow-up

**Current limitations:**
- [Any limitations in current implementation]

**Potential follow-up work:**
- [Future improvements or related tasks]

**Dependencies:**
- [Any dependencies that need to be updated]
```

## Completion Gate

**Before marking integration stage complete, verify:**
- [ ] All tests passing
- [ ] No build errors
- [ ] Files for commit identified
- [ ] Commit message prepared
- [ ] User informed of what to commit
- [ ] Documentation ready
- [ ] No debug code or secrets

**Don't mark complete if:**
- Tests failing
- Build errors present
- User not informed of commit details
- Critical work incomplete

## Common Mistakes

### Mistake: Automatically committing without asking
**Problem**: User loses control of git operations
**Fix**: Always suggest, never execute git commands automatically

### Mistake: Not identifying specific files
**Problem**: User doesn't know what to commit
**Fix**: List specific file paths in suggestion

### Mistake: Vague commit messages
**Problem**: Commit history unclear
**Fix**: Provide specific, conventional commit messages

### Mistake: Including debug code
**Problem**: Debug code reaches production
**Fix**: Always check diffs for console.log, debugger, etc.

### Mistake: Missing Co-Authored-By
**Problem**: AI contribution not attributed
**Fix**: Always include Co-Authored-By line

### Mistake: Not verifying tests
**Problem**: Broken code suggested for commit
**Fix**: Always run tests before suggesting commit

## Integration Examples

### Example 1: Feature Complete (Deep Work Mode)

```markdown
## Ready to Commit: CSV Export Feature

I've completed the CSV export feature for the analytics dashboard.

**Summary:**
Added CSV export button to analytics dashboard. Users can now download their analytics data as a CSV file.

**Files to commit:**
- src/components/ExportButton.tsx (new component)
- src/services/CSVService.ts (CSV generation logic)
- src/pages/Dashboard.tsx (integrated button)
- tests/CSVService.test.ts (15 new tests)
- tests/ExportButton.test.tsx (8 new tests)
- README.md (documented export feature)

**Testing:**
- 23 new tests added
- All 142 tests passing
- Manual testing in Chrome, Firefox, Safari

**Suggested commit message:**
```
feat(export): add CSV export to analytics dashboard

Users can now export analytics data as CSV files.

Changes:
- Added ExportButton component with download trigger
- Added CSVService for data formatting
- Integrated into Dashboard component
- Added 23 tests with 95% coverage

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**To commit:**
```bash
git add src/components/ExportButton.tsx \
  src/services/CSVService.ts \
  src/pages/Dashboard.tsx \
  tests/CSVService.test.ts \
  tests/ExportButton.test.tsx \
  README.md

git commit -m "feat(export): add CSV export to analytics dashboard

Users can now export analytics data as CSV files.

Changes:
- Added ExportButton component with download trigger
- Added CSVService for data formatting
- Integrated into Dashboard component
- Added 23 tests with 95% coverage

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

Ready to commit?
```

### Example 2: Bug Fix (Quick Fix Mode)

```markdown
## Ready to Commit: Submit Button Fix

Fixed the double-submission bug in forms.

**Files to commit:**
- src/components/Form.tsx (added disabled state)
- tests/Form.test.tsx (added test for disabled state)

**Suggested commit message:**
```
fix(forms): disable submit button during API call

Prevents double-submission when users click multiple times.

Closes #456

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**To commit:**
```bash
git add src/components/Form.tsx tests/Form.test.tsx

git commit -m "fix(forms): disable submit button during API call

Prevents double-submission when users click multiple times.

Closes #456

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

Ready to commit?
```

### Example 3: Refactor (Collaboration Mode)

```markdown
## Ready to Commit: Auth Logic Refactor

Refactored authentication validation logic for better readability.

**Files to commit:**
- src/auth/validator.ts (simplified logic)
- src/auth/validator.test.ts (updated tests)

**Testing:**
- All existing tests still passing
- No functional changes
- Same behavior, cleaner code

**Suggested commit message:**
```
refactor(auth): simplify login validation logic

No functional changes, improved code readability.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**To commit:**
```bash
git add src/auth/validator.ts src/auth/validator.test.ts

git commit -m "refactor(auth): simplify login validation logic

No functional changes, improved code readability.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

Ready to commit?
```

## Integration with Other Stages

**Receives from:**
- **Review stage**: Reviewed, clean code ready for integration
- **Test stage**: Test results confirming quality

**Provides to:**
- **User**: Clear commit instructions and messages
- **Next work session**: Documented completion for continuity

**Does NOT do:**
- Automatic git commits
- Automatic git merges
- Automatic git pushes
- Any git operations without user approval

## Tips for Better Integration Suggestions

**Do:**
- Always list specific file paths
- Provide complete commit messages
- Include verification commands
- Check for debug code before suggesting
- Verify tests pass before suggesting
- Use natural language in commit messages
- Include Co-Authored-By line

**Don't:**
- Run git commands automatically
- Suggest committing debug code
- Use vague commit messages
- Forget to verify tests first
- Include secrets or credentials
- Assume user wants to commit
- Skip informing user of what's ready

## Advanced Integration Scenarios

### Scenario 1: Multiple Logical Changes

If work contains multiple independent changes:

```markdown
## Ready to Commit: Multiple Changes

I've completed work on several independent changes. I recommend separate commits:

**Commit 1: CSV Export Feature**
Files: [list files]
Message: "feat(export): add CSV export"

**Commit 2: Fix Login Redirect**
Files: [list files]
Message: "fix(auth): fix login redirect"

This keeps git history clean and makes review easier.
Would you like to commit these separately?
```

### Scenario 2: Large Refactor

For large refactors:

```markdown
## Ready to Commit: Auth System Refactor

This is a large refactor. I recommend:

**Option 1: Single commit (recommended for atomic changes)**
- All changes in one commit
- Easier to revert if needed
- Message: "refactor(auth): simplify authentication system"

**Option 2: Multiple commits (if review requested by pieces)**
- Split into logical chunks
- Easier to review incrementally

Which would you prefer?
```

## Integration Checklist Template

```markdown
## Integration Checklist: [Feature/Fix Name]

### Code Readiness
- [ ] All tests passing
- [ ] No build errors
- [ ] No linting errors
- [ ] Documentation updated

### Commit Preparation
- [ ] Files identified
- [ ] Commit message prepared
- [ ] No debug code included
- [ ] No secrets included
- [ ] Co-Authored-By included

### User Communication
- [ ] User informed of files to commit
- [ ] Commit message provided
- [ ] Commands to run provided
- [ ] Verification steps provided

### Quality Checks
- [ ] Changes align with requirements
- [ ] Tests cover new functionality
- [ ] No regressions detected
- [ ] Performance acceptable

**Status**: [Ready/Blocked/Needs Review]
**Blockers**: [List any blockers]
