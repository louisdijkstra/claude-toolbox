---
name: test-stage
description: Verify implementation through automated tests, manual verification, and regression testing
---

# Stage 4: Test

## Purpose

Comprehensively verify that implementation works correctly through automated testing, manual verification, and regression checks. Ensure quality and prevent regressions before integration.

## When to Use

**Required for:**
- All development work after Implementation
- Before code review
- Before integration/merge

**Never skip** - testing catches issues early when they're cheap to fix

## Time Investment

**By mode:**
- **Deep Work Mode**: 20 minutes (thorough testing)
- **Quick Fix Mode**: 5 minutes (focused verification)
- **Collaboration Mode**: 10 minutes (documented results)
- **Debugging Mode**: 10 minutes (regression verification)

**Time well spent**: 20 minutes of testing prevents hours of production debugging

## Objectives

At the end of test stage, you should have:
1. **Automated tests passing**: All tests green
2. **Manual verification complete**: Functionality works as expected
3. **Edge cases tested**: Boundary conditions verified
4. **Regression checks passed**: No existing functionality broken
5. **Test results documented**: What was tested and results

## Testing Process

### Step 1: Run Automated Tests (varies by mode)

**Deep Work Mode: Comprehensive testing (10 min)**

**Run full test suite:**
```bash
# Unit tests
npm test  # or pytest, cargo test, etc.

# Integration tests
npm run test:integration

# End-to-end tests (if applicable)
npm run test:e2e

# Coverage report
npm run test:coverage
```

**Verify coverage:**
```markdown
## Test Coverage

### New code
- CSVService: 95% coverage (20/21 lines)
- ExportButton: 100% coverage (12/12 lines)
- Integration: 85% coverage (17/20 lines)

### Overall project
- Before: 82% coverage
- After: 83% coverage (+1%)

### Uncovered lines
- CSVService:45 (error handling edge case - acceptable)
```

**Check for test quality:**
```markdown
## Test Quality Checklist
- [ ] Tests are deterministic (no random failures)
- [ ] Tests are isolated (no dependencies between tests)
- [ ] Tests are fast (<1s per test)
- [ ] Test names clearly describe what's tested
- [ ] Assertions are specific and meaningful
```

**Quick Fix Mode: Focused testing (2 min)**

**Run relevant tests only:**
```bash
# Run tests for changed component
npm test -- Form.test

# Spot-check a few related tests
npm test -- SubmitButton.test
```

**Collaboration Mode: Documented testing (5 min)**

**Run tests + document results:**
```bash
npm test
```

```markdown
## Test Results

### Automated Tests
- ✅ Unit tests: 15 new tests passing
- ✅ Integration tests: 3 new tests passing
- ✅ Regression tests: All 127 existing tests passing

### Coverage
- New code: 92% coverage
- Overall: 83% (+1%)
```

**Debugging Mode: Regression verification (3 min)**

**Verify fix doesn't break anything:**
```bash
# Run full test suite
npm test

# Verify new test catches bug
# (temporarily revert fix, test should fail)
```

### Step 2: Manual Verification (varies by mode)

**Deep Work Mode: Thorough manual testing (10 min)**

**Test checklist:**
```markdown
## Manual Verification

### Happy Path
- [ ] User can click export button
- [ ] CSV file downloads
- [ ] File opens in Excel correctly
- [ ] All data columns present
- [ ] Data values correct

### Edge Cases
- [ ] Empty data: Shows "No data to export" message
- [ ] Single row: Formats correctly
- [ ] Large dataset (10k rows): Completes in <5s
- [ ] Special characters: Properly escaped ("O'Brien, Inc.")
- [ ] Unicode characters: Renders correctly (日本語)

### Error Scenarios
- [ ] Network error: Shows error message
- [ ] Invalid data: Handles gracefully
- [ ] Browser compatibility: Works in Chrome, Firefox, Safari

### User Experience
- [ ] Button shows loading state during export
- [ ] Button disabled while processing
- [ ] Success message shown after export
- [ ] Filename includes timestamp

### Integration
- [ ] Export works with filtered data
- [ ] Export works with sorted data
- [ ] Export respects date range selection
- [ ] Other dashboard features unaffected
```

**Quick Fix Mode: Basic verification (3 min)**

**Minimal checklist:**
```markdown
## Manual Verification
- [x] Submit button disables during API call
- [x] Button enables after response
- [x] No console errors
- [x] Existing form behavior unchanged
```

**Collaboration Mode: Documented verification (5 min)**

**Test + document for team:**
```markdown
## Manual Verification

### Tested Scenarios
- ✅ SSO login flow: Complete authentication successful
- ✅ Existing email login: Still works (no regression)
- ✅ Token refresh: Works correctly
- ✅ Logout: Clears session properly

### Cross-browser Testing
- ✅ Chrome 120: Works
- ✅ Firefox 121: Works
- ✅ Safari 17: Works

### Integration Points
- ✅ Auth middleware: SSO tokens validated
- ✅ Frontend: Login UI displays correctly
- ✅ Backward compatibility: No breaking changes
```

**Debugging Mode: Fix verification (2 min)**

**Verify bug is fixed:**
```markdown
## Fix Verification
- [x] Original bug no longer occurs
- [x] Reproduction steps now work correctly
- [x] No new errors introduced
- [x] Related functionality unaffected
```

## Testing Strategies

### Strategy 1: Boundary Testing

**Test at the edges of valid input**

```markdown
## Boundary Tests

### Numeric boundaries
- Minimum: 0 items
- Minimum+1: 1 item
- Maximum-1: 9,999 items
- Maximum: 10,000 items
- Over maximum: 10,001 items (should warn)

### String boundaries
- Empty string: ""
- Single character: "a"
- Very long: 10,000 characters
- Special characters: "!@#$%^&*()"

### Array boundaries
- Empty array: []
- Single element: [item]
- Large array: 10,000 elements
```

### Strategy 2: Equivalence Partitioning

**Divide inputs into groups that behave similarly**

```markdown
## Equivalence Classes

### Valid inputs (should work)
- Normal data: 1-1000 rows, standard characters
- Edge valid: 0 rows, 10,000 rows, special chars

### Invalid inputs (should handle gracefully)
- Null/undefined data
- Invalid data types
- Malformed data
```

### Strategy 3: State Testing

**Test different application states**

```markdown
## State Tests

### Initial state
- [ ] Component renders correctly
- [ ] Button is enabled
- [ ] No data loaded yet

### Loading state
- [ ] Button shows spinner
- [ ] Button is disabled
- [ ] User can't double-click

### Success state
- [ ] File downloads
- [ ] Success message shown
- [ ] Button returns to normal

### Error state
- [ ] Error message shown
- [ ] Button enabled for retry
- [ ] No file downloaded
```

### Strategy 4: Integration Testing

**Test how components work together**

```markdown
## Integration Tests

### Data flow
1. User clicks export button
2. Component calls CSVService.export()
3. Service formats data to CSV
4. Service creates Blob
5. Browser triggers download
6. User sees file in downloads

### API integration
1. Component fetches data from API
2. API returns analytics data
3. Component passes data to export
4. Export generates correct CSV
```

## Regression Testing

**Ensure existing functionality still works**

### Automated regression tests

```bash
# Run full test suite
npm test

# Verify all tests pass
# Look for:
# - Previously passing tests now failing
# - Tests with warnings
# - Flaky tests
```

### Manual regression checks

```markdown
## Regression Checklist

### Related features
- [ ] Dashboard filtering: Still works
- [ ] Date range selection: Still works
- [ ] PDF export: Still works
- [ ] Data visualization: Still works

### Core functionality
- [ ] User login: Works
- [ ] Data loading: Works
- [ ] Navigation: Works
- [ ] Settings: Work

### Performance
- [ ] Dashboard load time: <3s (unchanged)
- [ ] Data fetch time: <1s (unchanged)
- [ ] Export time: <5s (new feature)
```

## Test Documentation

**Document what was tested and results**

### Template

```markdown
## Test Results: [Feature Name]

### Automated Tests
**Unit tests**: [X] tests passing
- [Test file 1]: [description]
- [Test file 2]: [description]

**Integration tests**: [Y] tests passing
- [Test scenario 1]: [description]

**Coverage**: [Z]% of new code

### Manual Verification
**Happy path**: ✅ Verified
- [Specific behavior tested]

**Edge cases**: ✅ Verified
- [Edge case 1]: [result]
- [Edge case 2]: [result]

**Error scenarios**: ✅ Verified
- [Error scenario 1]: [result]

### Regression Testing
**Automated**: ✅ All [N] existing tests passing
**Manual**: ✅ Core features verified

### Issues Found
- [Issue 1]: [description] - [status: fixed/deferred]
- [Issue 2]: [description] - [status: fixed/deferred]

### Test Environment
- Browser: Chrome 120
- OS: macOS 14.2
- Node: 20.10.0
- Test framework: Jest 29.7.0

### Sign-off
- [ ] All tests passing
- [ ] Manual verification complete
- [ ] No regressions detected
- [ ] Ready for review
```

## Completion Gate

**Before moving to Review stage, verify:**
- [ ] All automated tests passing (100%)
- [ ] Manual verification complete
- [ ] Edge cases tested
- [ ] Regression tests passed
- [ ] No known bugs or issues (or documented/deferred)
- [ ] Test results documented
- [ ] Coverage meets project standards (typically >80%)
- [ ] No flaky tests introduced

**Red flags (don't proceed):**
- Any test failures
- Untested edge cases in critical path
- Regressions detected
- Coverage significantly decreased
- Tests are flaky or non-deterministic

## Common Mistakes

### Mistake: Skipping manual verification
**Problem**: "All tests pass" but feature doesn't actually work
**Fix**: Always manually verify in browser/app

### Mistake: Only testing happy path
**Problem**: Edge cases break in production
**Fix**: Test boundaries, errors, and edge cases

### Mistake: Ignoring test failures
**Problem**: "It's just a flaky test", then production breaks
**Fix**: Fix or delete flaky tests, never ignore failures

### Mistake: Not testing regressions
**Problem**: "I only changed X, Y can't break", but Y breaks
**Fix**: Run full test suite, manually check related features

### Mistake: Poor test coverage
**Problem**: "Tests pass" but only testing 10% of code
**Fix**: Aim for >80% coverage on new code

### Mistake: Not documenting test results
**Problem**: Team doesn't know what was tested
**Fix**: Document what was tested and results (especially Collaboration Mode)

### Mistake: Testing in only one environment
**Problem**: Works on your machine, fails in production
**Fix**: Test in multiple browsers/environments

## Testing Workflows

### Workflow 1: TDD (Tests Written During Implementation)

**Tests already exist from Implement stage:**

```markdown
## Test Stage (TDD)

### Step 1: Verify all tests passing (2 min)
npm test
✅ All 15 new tests passing

### Step 2: Manual verification (5 min)
- [x] Happy path works
- [x] Edge cases work
- [x] No console errors

### Step 3: Regression check (3 min)
- [x] Run full test suite: All 142 tests passing
- [x] Manually test related features: No issues

Total: 10 minutes
```

### Workflow 2: Test-After (Tests Written After Implementation)

**Write tests during Test stage:**

```markdown
## Test Stage (Test-After)

### Step 1: Write missing tests (10 min)
- Add unit tests for core logic
- Add integration test for full flow
- Add edge case tests

### Step 2: Run tests (2 min)
npm test
✅ All tests passing

### Step 3: Manual verification (5 min)
- [x] Happy path works
- [x] Edge cases work

### Step 4: Regression check (3 min)
- [x] All tests passing
- [x] No issues found

Total: 20 minutes
```

### Workflow 3: Quick Fix Testing

**Minimal but sufficient testing:**

```markdown
## Test Stage (Quick Fix)

### Step 1: Run relevant tests (1 min)
npm test -- Form.test
✅ 3 tests passing

### Step 2: Manual check (3 min)
- [x] Bug is fixed
- [x] No obvious issues

### Step 3: Quick regression (1 min)
npm test
✅ All tests passing

Total: 5 minutes
```

## Example Test Results

### Example 1: Deep Work Mode (CSV Export)

```markdown
## Test Results: CSV Export Feature

### Automated Tests
**Unit tests**: 12 tests passing
- CSVService.test.ts: Header generation, row formatting, escaping
- ExportButton.test.tsx: Rendering, click handling, loading state

**Integration tests**: 3 tests passing
- export.integration.test.ts: Full export flow, file download, data accuracy

**Coverage**: 92% of new code (154/168 lines)

### Manual Verification
**Happy path**: ✅ Verified
- User clicks export button → CSV downloads → Opens in Excel correctly

**Edge cases**: ✅ Verified
- Empty data: Shows "No data to export" message
- Large dataset (10k rows): Completes in 2.3s
- Special characters: "O'Brien, Inc." → "O'Brien, Inc." (properly escaped)
- Unicode: 日本語 → renders correctly

**Error scenarios**: ✅ Verified
- Network error during export: Shows error message, allows retry

**User Experience**: ✅ Verified
- Button shows spinner during export
- Button disabled while processing
- Success message: "CSV exported successfully"
- Filename: analytics-2024-03-15-143022.csv

### Regression Testing
**Automated**: ✅ All 127 existing tests passing
**Manual checks**:
- Dashboard filtering: Works
- PDF export: Works
- Data visualization: Works
- Load time: 2.1s (unchanged)

### Cross-browser Testing
- Chrome 120: ✅ Works
- Firefox 121: ✅ Works
- Safari 17: ✅ Works

### Issues Found
None

### Test Environment
- Browser: Chrome 120, Firefox 121, Safari 17
- OS: macOS 14.2
- Node: 20.10.0
- Framework: Jest 29.7.0

### Sign-off
- [x] All tests passing (100%)
- [x] Manual verification complete
- [x] Edge cases tested
- [x] No regressions
- [x] Cross-browser verified
- [x] Ready for review
```

### Example 2: Quick Fix Mode (Button Disable)

```markdown
## Test Results: Disable Submit Button During API Call

### Automated Tests
**Unit tests**: 1 test passing
- Form.test.tsx: Button disables during submit

**Coverage**: 100% of changed code (5/5 lines)

### Manual Verification
- [x] Button disables when clicked
- [x] Button enables after response
- [x] No console errors
- [x] Form still submits correctly

### Regression Testing
- [x] All 84 existing tests passing
- [x] Other forms work correctly

### Issues Found
None

### Sign-off
- [x] All tests passing
- [x] Manual verification complete
- [x] No regressions
- [x] Ready for review
```

## Integration with Other Stages

**Receives from:**
- **Implement stage**: Code to test, automated tests

**Feeds into:**
- **Review stage**: Test results, coverage report
- **Integrate stage**: Confidence that code works

**Informs:**
- **Implementation stage**: If tests reveal issues, return to implementation

## Tips for Better Testing

**Do:**
- Run full test suite before finishing
- Manually verify in real environment
- Test edge cases and error scenarios
- Check for regressions
- Document what was tested
- Test in multiple browsers/environments
- Fix flaky tests immediately
- Aim for >80% coverage on new code

**Don't:**
- Skip manual verification ("tests are enough")
- Only test happy path
- Ignore test failures ("it's flaky")
- Skip regression testing
- Test in only one environment
- Leave known bugs unfixed
- Proceed with failing tests
- Write tests that don't actually verify behavior
