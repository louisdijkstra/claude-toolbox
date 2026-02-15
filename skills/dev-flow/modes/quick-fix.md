---
name: quick-fix-mode
description: Fast-path development for small changes with minimal planning and quick verification
---

# Quick Fix Mode

## Purpose

Execute rapid, focused changes for bug fixes, small features, or documentation updates. Streamlined workflow for <1 hour work with minimal overhead.

## When to Use

**Best for:**
- Bug fixes (simple, well-understood)
- Small feature additions (button, field, minor UI change)
- Documentation updates
- Configuration changes
- Dependency updates
- Code formatting/linting fixes
- Trivial refactoring (rename, move file)

**Don't use for:**
- Complex features (use Deep Work Mode)
- Architectural changes (use Deep Work Mode)
- Multi-component changes (use Deep Work Mode)
- Unclear requirements (use Deep Work Mode to plan first)
- Changes affecting critical paths without tests

## Time Structure

**Total duration**: 20-45 minutes

**Stage breakdown:**
```
1. Plan      (3 min)   - One sentence goal
2. Implement (15-30 min) - Make change with basic tests
3. Test      (5 min)   - Quick verification
4. Integrate (2 min)   - Commit/push
```

**Note**: Skips Design stage for speed

## Workflow

### Stage 1: Plan (3 minutes)

**Objective**: Minimal but clear understanding of what to change

**Activities:**
- Write one-sentence goal
- Identify specific file(s) to change
- Define simple success criteria

**Output template:**
```markdown
# Quick Fix: [Issue/Feature Name]

## Goal
[One sentence: what we're fixing/adding]

## Files to Change
- [file1.py]: [Specific change]
- [file2.ts]: [Specific change]

## Success
- [ ] [Simple test: what should work]
- [ ] No regressions
```

**Example:**
```markdown
# Quick Fix: Add loading spinner to submit button

## Goal
Show spinner on submit button while form is processing

## Files to Change
- src/components/SubmitButton.tsx: Add loading state

## Success
- [ ] Spinner shows when isLoading=true
- [ ] Button disabled during loading
```

**Completion gate:**
- [ ] Goal is one sentence
- [ ] Exactly which files to change
- [ ] Clear test criteria

### Stage 2: Implement (15-30 minutes)

**Objective**: Make focused change, minimal testing

**Approach:**
- Make the change directly
- Write minimal tests (critical path only)
- Run tests to verify
- Keep change focused (no scope creep)

**Key practices:**
- One focused change only (resist adding "while I'm here" changes)
- Minimal testing (happy path + one edge case)
- Run tests after change
- Commit immediately if trivial

**Progress check:**
```markdown
## Change Made
- [x] Changed [file]: [what changed]
- [x] Added test for [critical path]
- [ ] Tests passing
```

**Example:**
```typescript
// Quick fix implementation
// src/components/SubmitButton.tsx

export function SubmitButton({ isLoading, onClick }) {
  return (
    <button
      disabled={isLoading}
      onClick={onClick}
    >
      {isLoading ? <Spinner /> : 'Submit'}
    </button>
  );
}

// Minimal test
// tests/SubmitButton.test.tsx
test('shows spinner when loading', () => {
  render(<SubmitButton isLoading={true} />);
  expect(screen.getByRole('status')).toBeInTheDocument();
});
```

### Stage 3: Test (5 minutes)

**Objective**: Quick verification that change works

**Activities:**
1. **Run tests** (2 min)
   ```bash
   npm test -- SubmitButton  # Run relevant tests only
   ```

2. **Manual check** (3 min)
   - Verify change works (happy path)
   - Check one edge case
   - Ensure no obvious regressions

**Completion gate:**
- [ ] Tests passing
- [ ] Manual verification successful
- [ ] No obvious issues

**Note**: Skip comprehensive testing (trust existing tests for regressions)

### Stage 4: Integrate (2 minutes)

**Objective**: Commit and push immediately

**Activities:**
1. **Commit** (1 min)
   ```bash
   git add [changed files]
   git commit -m "fix(component): add loading spinner to submit button

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
   ```

2. **Push** (1 min)
   ```bash
   git push
   ```

**For trivial changes**: Direct commit to main (if team allows)
**For reviewed changes**: Create quick PR
```bash
gh pr create --title "fix: add loading spinner" --body "Quick fix for #123"
```

**Completion gate:**
- [ ] Code committed
- [ ] Code pushed
- [ ] CI started (watch for failures)

## Key Practices

**Do:**
- Stay focused on one change
- Write minimal tests for change
- Run tests before committing
- Commit immediately after verification
- Keep it simple

**Don't:**
- Add scope ("while I'm here, let me also...")
- Skip testing entirely (risky)
- Spend time on comprehensive testing (overkill)
- Refactor unrelated code (scope creep)
- Design complex solutions (use Deep Work Mode)

## Common Pitfalls

**Pitfall**: "While I'm here" scope creep → takes 2 hours instead of 30 min
**Fix**: Strictly limit to planned change, create separate task for "also noticed"

**Pitfall**: No tests → breaks production
**Fix**: Always write minimal test for critical path

**Pitfall**: Over-testing → wastes time
**Fix**: One happy path test + one edge case = sufficient

**Pitfall**: Skipping manual verification → misses obvious issues
**Fix**: Always manually verify change works (3 minutes)

**Pitfall**: Treating complex changes as quick fixes → poor quality
**Fix**: If takes >30 min, abort and use Deep Work Mode

## Decision Tree: Is This a Quick Fix?

```
Is the change well-understood?
  No → Use Deep Work Mode
  Yes ↓

Does it affect <3 files?
  No → Use Deep Work Mode
  Yes ↓

Can it be done in <30 minutes?
  No → Use Deep Work Mode
  Yes ↓

Is it low-risk?
  No → Use Deep Work Mode
  Yes ↓

✅ Use Quick Fix Mode
```

## Examples

### Example 1: Bug Fix

**Issue**: Submit button doesn't disable during API call

```markdown
# Quick Fix: Disable submit button during API call

## Goal
Prevent double-submit by disabling button during API call

## Files to Change
- src/components/Form.tsx: Add disabled state

## Success
- [ ] Button disabled when submitting
- [ ] Button enabled after response
```

**Implementation** (15 min):
```typescript
// src/components/Form.tsx
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  setIsSubmitting(true);
  try {
    await api.submit(data);
  } finally {
    setIsSubmitting(false);
  }
};

return <button disabled={isSubmitting} onClick={handleSubmit}>Submit</button>;
```

**Test** (5 min):
```typescript
test('disables button during submit', async () => {
  render(<Form />);
  const button = screen.getByRole('button');

  fireEvent.click(button);
  expect(button).toBeDisabled();

  await waitFor(() => expect(button).not.toBeDisabled());
});
```

**Integrate** (2 min):
```bash
git commit -m "fix(form): disable submit button during API call"
git push
```

**Total**: 25 minutes

### Example 2: Small Feature

**Feature**: Add character counter to text input

```markdown
# Quick Fix: Add character counter to bio field

## Goal
Show "X/500 characters" below bio text area

## Files to Change
- src/components/BioField.tsx: Add counter display

## Success
- [ ] Counter shows current/max characters
- [ ] Updates as user types
```

**Implementation** (20 min):
```typescript
// src/components/BioField.tsx
export function BioField({ value, onChange }) {
  const maxLength = 500;
  const remaining = maxLength - value.length;

  return (
    <div>
      <textarea
        value={value}
        onChange={onChange}
        maxLength={maxLength}
      />
      <p>{value.length}/{maxLength} characters</p>
    </div>
  );
}
```

**Test** (5 min):
```typescript
test('shows character count', () => {
  render(<BioField value="Hello" onChange={() => {}} />);
  expect(screen.getByText('5/500 characters')).toBeInTheDocument();
});
```

**Integrate** (2 min):
```bash
git commit -m "feat(profile): add character counter to bio field"
git push
```

**Total**: 30 minutes

### Example 3: Documentation Update

**Task**: Update README with new environment variable

```markdown
# Quick Fix: Document new API_TIMEOUT variable

## Goal
Add API_TIMEOUT to README environment variables section

## Files to Change
- README.md: Add API_TIMEOUT to env vars table

## Success
- [ ] Variable documented with description and default
```

**Implementation** (10 min):
```markdown
# README.md

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| API_URL | Backend API URL | http://localhost:3000 |
| API_TIMEOUT | Request timeout in ms | 5000 |
```

**Test** (2 min):
- Read updated README
- Verify formatting is correct
- Check table renders properly

**Integrate** (2 min):
```bash
git commit -m "docs(readme): add API_TIMEOUT environment variable"
git push
```

**Total**: 15 minutes

## When to Abort Quick Fix Mode

**Stop and switch to Deep Work Mode if:**
- Implement stage takes >30 minutes
- Discover multiple files need changes
- Uncover architectural issues
- Requirements become unclear
- Change is more complex than expected

**How to abort gracefully:**
1. Commit current work as WIP
   ```bash
   git add .
   git commit -m "wip: partial fix for [issue]"
   ```

2. Document findings
   ```markdown
   # Discovered during quick fix attempt:
   - Issue is more complex than expected
   - Requires changes to [components]
   - Should use Deep Work Mode for proper solution
   ```

3. Create proper task for Deep Work Mode
4. Reset quick fix attempt if incomplete
   ```bash
   git reset --hard HEAD~1  # If work not viable
   ```

## Integration with Other Skills

- **dev-tdd**: Minimal TDD (1 test before, 1 test after)
- **systematic-debugging**: If bug is harder to find than expected (abort Quick Fix)
- **docs-manager**: For documentation-only quick fixes
- **review-system**: Skip comprehensive review (trust tests + manual check)

## Metrics

**Success indicators:**
- Completed in <45 minutes
- Single focused change
- Tests passing
- No regressions
- Committed and pushed

**Failure indicators:**
- Takes >1 hour (should have used Deep Work Mode)
- Multiple unrelated changes (scope creep)
- Breaks existing tests (insufficient testing)
- Requires design discussion (too complex for quick fix)
