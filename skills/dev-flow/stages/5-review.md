---
name: review-stage
description: Self-review code quality, verify design adherence, and prepare for team review or integration
---

# Stage 5: Review

## Purpose

Perform thorough self-review of implementation before team review or integration. Verify code quality, design adherence, and readiness for production. Catch issues while they're still easy to fix.

## When to Use

**Required for:**
- All development work after Test stage
- Before requesting team code review
- Before merging to main branch
- Before creating pull request

**Never skip** - self-review catches majority of issues before team review

## Time Investment

**By mode:**
- **Deep Work Mode**: 10 minutes (comprehensive self-review)
- **Quick Fix Mode**: 2 minutes (quick quality check)
- **Collaboration Mode**: 5 minutes (prepare for team review)
- **Debugging Mode**: 3 minutes (verify fix quality)

**Time well spent**: 10 minutes of self-review saves hours of back-and-forth in team review

## Objectives

At the end of review stage, you should have:
1. **Quality verified**: Code meets project standards
2. **Design validated**: Implementation matches design
3. **Documentation updated**: README, comments, changelog current
4. **Clean commits**: Commit history is clear and logical
5. **Review notes**: Key points documented for team review

## Review Process

### Step 1: Review Your Own Changes (varies by mode)

**Deep Work Mode: Comprehensive review (7 min)**

**Review all changes:**
```bash
# See all changes since branch started
git diff main...HEAD

# Review commit by commit
git log --oneline main..HEAD
git show <commit-hash>

# Check file-by-file
git diff main...HEAD -- src/services/CSVService.ts
```

**Self-review checklist:**
```markdown
## Self-Review Checklist

### Code Quality
- [ ] Code is readable and self-documenting
- [ ] Variable/function names are clear and descriptive
- [ ] Functions are small and single-purpose (<50 lines)
- [ ] No unnecessary complexity
- [ ] No duplicated code
- [ ] No magic numbers (use named constants)
- [ ] Consistent formatting (linter passing)
- [ ] No commented-out code
- [ ] No debug logging left in

### Logic & Correctness
- [ ] Implementation matches design
- [ ] Edge cases handled
- [ ] Error handling is appropriate
- [ ] No off-by-one errors
- [ ] No race conditions
- [ ] No memory leaks
- [ ] Null/undefined handled safely

### Testing
- [ ] All tests passing
- [ ] Tests cover critical paths
- [ ] Tests cover edge cases
- [ ] No flaky tests
- [ ] Test names are descriptive
- [ ] Coverage meets standards (>80%)

### Security
- [ ] No hardcoded secrets/credentials
- [ ] Input validation at boundaries
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Proper authentication/authorization
- [ ] Sensitive data not logged

### Performance
- [ ] No obvious performance issues
- [ ] Database queries optimized (no N+1)
- [ ] Large datasets handled efficiently
- [ ] No unnecessary re-renders (React)
- [ ] No memory leaks

### Documentation
- [ ] Complex logic has explanatory comments
- [ ] Public APIs documented
- [ ] README updated if needed
- [ ] Breaking changes documented
- [ ] Migration guide if needed

### Dependencies
- [ ] No unnecessary dependencies added
- [ ] Dependencies are up-to-date and maintained
- [ ] License compatibility checked
- [ ] Security vulnerabilities checked

### Git Hygiene
- [ ] Commit messages are clear
- [ ] Commits are atomic and focused
- [ ] No "fix typo" commits (should be squashed)
- [ ] No merge commits in feature branch
- [ ] Branch is up-to-date with main
```

**Quick Fix Mode: Quick quality check (2 min)**

**Minimal checklist:**
```markdown
## Quick Review
- [ ] Code works (tested)
- [ ] No obvious issues
- [ ] Commit message is clear
- [ ] Follows project conventions
```

**Collaboration Mode: Prepare for team review (5 min)**

**Review + prepare review notes:**
```markdown
## Self-Review + Team Prep

### Changes Made
- Added SSO authentication
- Modified auth middleware
- Updated login UI

### Key Decisions
1. Used OAuth2 with PKCE (security best practice)
2. Stored tokens encrypted (compliance requirement)
3. Fallback to email auth (backward compatibility)

### Review Focus
Please review:
- OAuth2 implementation (src/auth/SSOProvider.ts)
- Token encryption (src/auth/TokenStore.ts)

### Testing Done
- Unit: 8 tests for SSO flow
- Integration: Works with existing auth
- Manual: Tested in Chrome/Firefox/Safari

### Migration Notes
- No breaking changes
- Backward compatible
- Requires env vars (documented in README)
```

**Debugging Mode: Verify fix quality (3 min)**

**Check fix is minimal and correct:**
```markdown
## Fix Review
- [ ] Fix is minimal (only changed what's necessary)
- [ ] Root cause addressed (not just symptom)
- [ ] Regression test added
- [ ] No unrelated changes
- [ ] Documentation updated
```

### Step 2: Check Design Adherence (2 minutes)

**Verify implementation matches design:**

```markdown
## Design Adherence Check

### Planned Approach
[What was designed in Stage 2]

### Actual Implementation
[What was actually built]

### Deviations
- [Deviation 1]: [Why it changed]
- [Deviation 2]: [Why it changed]

### Files Changed
**Planned**:
- src/services/CSVService.ts
- src/components/ExportButton.tsx

**Actual**:
- src/services/CSVService.ts ✓
- src/components/ExportButton.tsx ✓
- src/utils/download.ts (new - extracted download logic)

**Reason for deviation**: Extracted download logic into reusable utility
```

**Red flags (deviations that need explanation):**
- Significantly more files changed than planned
- Different approach than designed
- Missing planned features
- Added unplanned features
- Breaking changes not in design

### Step 3: Clean Up (varies by mode)

**Deep Work Mode: Thorough cleanup (3 min)**

**Remove debug code:**
```typescript
// Before cleanup
export function processData(data) {
  console.log('Processing data:', data);  // ❌ Debug log
  // TODO: optimize this later  // ❌ TODO comment
  const result = transform(data);
  // const oldImplementation = ...  // ❌ Commented code
  return result;
}

// After cleanup
export function processData(data) {
  return transform(data);
}
```

**Remove unused code:**
```bash
# Find unused exports (example with TypeScript)
npm run check-unused-exports

# Remove dead code
git diff  # Review and remove
```

**Format code:**
```bash
# Auto-format
npm run prettier  # or ruff format, or cargo fmt

# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

**Squash fixup commits (if applicable):**
```bash
# If you have commits like:
# - feat: add CSV export
# - fix typo
# - fix linting

# Squash into clean commits
git rebase -i main

# In editor, mark "fix typo" and "fix linting" as "fixup"
# Results in single clean commit: "feat: add CSV export"
```

**Quick Fix Mode: Minimal cleanup (skip)**

Quick fixes typically don't need cleanup - just verify no debug code left.

**Collaboration Mode: Cleanup for team (3 min)**

Same as Deep Work Mode - team will review so code should be clean.

## Review Patterns

### Pattern 1: Diff Review

**Review changes like a code reviewer would:**

```bash
# Open diff in your editor
git diff main...HEAD

# Look for:
# - Unnecessary changes
# - Debug code
# - Commented code
# - TODOs
# - Large functions
# - Complex logic without comments
# - Inconsistent formatting
```

**Questions to ask:**
- Would I approve this if someone else wrote it?
- Is anything confusing that needs a comment?
- Is there duplicated code?
- Are there simpler approaches?
- Would this be easy to maintain?

### Pattern 2: Commit-by-Commit Review

**Review each commit individually:**

```bash
# List commits
git log --oneline main..HEAD

# Review each commit
git show <commit-hash>

# Check:
# - Is commit message clear?
# - Is commit focused on one thing?
# - Is commit too large?
# - Should commits be squashed?
```

### Pattern 3: Fresh Eyes Review

**Take a 5-minute break, then review as if seeing for the first time:**

```markdown
## Fresh Eyes Checklist
- [ ] Would I understand this code in 6 months?
- [ ] Would a new team member understand this?
- [ ] Is the happy path obvious?
- [ ] Are edge cases handled clearly?
- [ ] Would this be easy to debug?
- [ ] Would this be easy to test?
- [ ] Would this be easy to modify?
```

## Preparing for Team Review

**Create comprehensive PR description:**

```markdown
## Pull Request: [Feature Name]

### What Changed
[Clear description of changes - be specific]

**Files changed**: [count] files
**Lines changed**: +[additions] -[deletions]
**Complexity**: [Low/Medium/High]

### Why
[Business/technical reason for change]

### How
[Brief explanation of implementation approach]

### Key Decisions
1. [Decision 1]: [Why we chose this approach]
   - Alternatives considered: [list]
   - Trade-offs: [list]

2. [Decision 2]: [Why we chose this approach]

### Testing Done
- [x] Unit tests: [X] tests, [Y]% coverage
- [x] Integration tests: [scenarios tested]
- [x] Manual verification: [what was tested]
- [x] Regression testing: All existing tests pass
- [x] Cross-browser: Chrome, Firefox, Safari

### Review Focus
Please pay special attention to:
- [ ] [Specific area of concern 1]
- [ ] [Architectural decision to validate]
- [ ] [Security consideration]

### Screenshots/Demo
[If UI changes, include screenshots or video]

### Migration/Deployment Notes
[Any special steps required for deployment]
- Requires: [new env vars, database migration, etc.]
- Breaking changes: [None / list with migration guide]
- Rollback plan: [how to rollback if needed]

### Related Issues
Closes #[issue number]
Related to #[issue number]

### Checklist
- [x] Tests added/updated
- [x] Documentation updated
- [x] No breaking changes (or documented)
- [x] Follows project conventions
- [x] Self-reviewed
- [x] Linter passing
- [x] All tests passing

🤖 Generated with Claude Code
```

## Completion Gate

**Before moving to Integrate stage, verify:**
- [ ] Self-review complete (used checklist)
- [ ] All code quality checks passing
- [ ] Design adherence verified (or deviations documented)
- [ ] Code cleaned up (no debug code, TODOs, commented code)
- [ ] Commit history is clean
- [ ] Documentation updated
- [ ] PR description prepared (if team review)
- [ ] Ready for team eyes (or ready to merge if solo)

**Don't proceed if:**
- Quality issues found but not fixed
- Design significantly deviated without reason
- Debug code still present
- Tests not passing
- Documentation out of date
- Commit history is messy and should be cleaned

## Common Mistakes

### Mistake: Skipping self-review
**Problem**: "Tests pass, ship it" → team finds many issues
**Fix**: Always self-review before team review

### Mistake: Not viewing changes as a diff
**Problem**: Miss small issues scattered across files
**Fix**: Always run `git diff` and review systematically

### Mistake: Leaving debug code
**Problem**: console.log, print statements in production
**Fix**: Search for console.log, print, debugger before committing

### Mistake: Not explaining decisions
**Problem**: Team review asks "why did you do X?"
**Fix**: Document key decisions in PR description

### Mistake: Ignoring linter warnings
**Problem**: "It's just a warning" → inconsistent code quality
**Fix**: Fix all linter warnings or explicitly suppress with reason

### Mistake: Not checking design adherence
**Problem**: Built something different than designed
**Fix**: Compare implementation to design, document deviations

### Mistake: Messy commit history
**Problem**: 20 commits including "fix typo", "oops", "wip"
**Fix**: Squash commits into logical units

## Self-Review Examples

### Example 1: Deep Work Mode Review

```markdown
## Self-Review: CSV Export Feature

### Changes Overview
- 3 new files created
- 1 existing file modified
- 238 lines added
- 12 commits (will squash to 3)

### Code Quality Check
- [x] Readable and well-named
- [x] Functions <50 lines
- [x] No magic numbers
- [x] Linter passing
- [x] No debug code

### Logic Check
- [x] Matches design (CSVService + ExportButton)
- [x] Edge cases handled (empty data, special chars)
- [x] Error handling appropriate

### Testing Check
- [x] 15 tests passing
- [x] 92% coverage
- [x] Critical paths covered
- [x] Edge cases tested

### Security Check
- [x] No hardcoded secrets
- [x] Input validation (data sanitization)
- [x] No XSS vulnerabilities (CSV escaping)

### Documentation Check
- [x] Complex escaping logic explained
- [x] README updated (new export feature)
- [x] API documented (CSVService.export)

### Issues Found & Fixed
1. Missing error handling for file download failure
   - Added try/catch with user-friendly error message
2. Magic number (max rows: 10000)
   - Extracted to named constant MAX_EXPORT_ROWS
3. Complex escaping logic without comment
   - Added comment explaining CSV RFC 4180 compliance

### Commit Cleanup Plan
Before: 12 commits
After: 3 commits
- feat(export): add CSV service with export functionality
- feat(export): add export button component
- test(export): add comprehensive test suite

### Design Adherence
✅ Matches design exactly
- CSVService implements planned API
- ExportButton follows design mockup
- Integration as planned

### Ready for Team Review
- [x] All quality checks pass
- [x] Design followed
- [x] Issues fixed
- [x] Commits cleaned up
- [x] PR description prepared
```

### Example 2: Quick Fix Mode Review

```markdown
## Self-Review: Disable Submit Button Fix

### Changes Overview
- 1 file modified (Form.tsx)
- 8 lines added
- 1 test file modified
- 2 commits (good as-is)

### Quick Quality Check
- [x] Code works (manually tested)
- [x] Follows React hooks conventions
- [x] No debug code
- [x] Test added

### Design Adherence
✅ Minimal fix as planned (just button disable logic)

### Ready to Merge
- [x] Quality good
- [x] Tests pass
- [x] Minimal change
```

## Integration with Other Stages

**Receives from:**
- **Test stage**: Test results, coverage report
- **Implement stage**: Code commits

**Feeds into:**
- **Integrate stage**: Clean, reviewed code ready for merge
- **Back to Implement**: If significant issues found

**Informs:**
- Team code review (if applicable)

## Tips for Better Self-Review

**Do:**
- Review changes as a diff (git diff)
- Use a checklist (don't rely on memory)
- Take a break before reviewing (fresh eyes)
- Review commit-by-commit
- Document key decisions
- Clean up debug code and TODOs
- Squash messy commits
- Prepare clear PR description
- Verify design adherence

**Don't:**
- Skip self-review ("tests pass, good enough")
- Review only in your head (view actual diff)
- Leave debug code ("I'll remove it later")
- Ignore linter warnings
- Ship code you wouldn't approve
- Assume team knows context (document it)
- Leave commit history messy
- Proceed with known issues

## Advanced Review Techniques

### Technique 1: Rubber Duck Review

**Explain code out loud (or in writing) to find issues:**

```markdown
## Code Explanation (to rubber duck)

This function exports analytics data as CSV:
1. Takes array of data objects
2. Generates header row from first object keys
3. Maps each object to CSV row
4. Escapes special characters (quotes, commas)
5. Joins rows with newlines
6. Creates Blob and triggers download

Wait... what if array is empty? (Step 2 would fail)
→ Need to add empty array check!
```

### Technique 2: Security Review

**Think like an attacker:**

```markdown
## Security Review

**Input vectors:**
- User-provided analytics data
- User-provided filename

**Potential vulnerabilities:**
1. XSS via CSV injection
   - Mitigation: Escape formulas (=, +, -, @)
2. Path traversal via filename
   - Mitigation: Sanitize filename, remove path separators
3. Large data DoS
   - Mitigation: Row limit, warn on large exports

**Actions taken:**
- Added CSV formula escaping
- Added filename sanitization
- Added row limit (10k rows)
```

### Technique 3: Performance Review

**Look for performance issues:**

```markdown
## Performance Review

**Potential bottlenecks:**
1. Building full CSV string in memory
   - Current: 10k rows = ~1MB string
   - Risk: 100k rows = ~10MB (might crash browser)
   - Mitigation: Add streaming for large exports (future)

2. Blocking UI during export
   - Current: Synchronous processing
   - Impact: UI freezes for large datasets
   - Mitigation: Use Web Worker (future optimization)

**Current decision:**
- Acceptable for MVP (max 10k rows)
- Document as future optimization
- Add TODO with issue number
```

