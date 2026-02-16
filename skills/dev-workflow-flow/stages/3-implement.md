---
name: implement-stage
description: Execute implementation using TDD rhythm, frequent commits, and focused incremental progress
---

# Stage 3: Implement

## Purpose

Build the planned and designed solution through test-driven development, frequent commits, and focused incremental progress. Transform design into working code with quality built in from the start.

## When to Use

**Required for:**
- All development work after Design stage
- Following approved design approach
- Building planned deliverables

**Skipped only if:**
- Work is pure research/documentation (no code changes)

## Time Investment

**By mode:**
- **Deep Work Mode**: 60-120 minutes (focused implementation)
- **Quick Fix Mode**: 15-30 minutes (minimal change)
- **Collaboration Mode**: 30-60 minutes (with team updates)
- **Debugging Mode**: 20-30 minutes (minimal fix after root cause found)

**Key practice**: Commit every 15-20 minutes to save progress

## Objectives

At the end of implement stage, you should have:
1. **Working code**: All deliverables implemented
2. **Tests passing**: Code verified with automated tests
3. **Commits made**: Frequent commits with clear messages
4. **Progress tracked**: Regular checkpoints documented
5. **Quality maintained**: Code follows project conventions

## Implementation Process

### TDD Rhythm (Recommended)

**Red → Green → Refactor cycle**

```
1. RED: Write failing test
   - Write test for next small feature
   - Run test → should fail
   - Commit: "test: add test for [feature]"

2. GREEN: Make it pass
   - Write minimal code to pass test
   - Run test → should pass
   - Commit: "feat: implement [feature]"

3. REFACTOR: Clean up
   - Improve code quality
   - Keep tests passing
   - Commit: "refactor: improve [aspect]"

Repeat for each small feature
```

**Example TDD session:**
```bash
# Cycle 1: CSV header generation
git commit -m "test: add test for CSV header generation"
# Write test → fails
git commit -m "feat: implement CSV header generation"
# Code passes test

# Cycle 2: CSV row formatting
git commit -m "test: add test for CSV row formatting"
# Write test → fails
git commit -m "feat: implement CSV row formatting"
# Code passes test

# Cycle 3: Special character escaping
git commit -m "test: add test for special character escaping"
# Write test → fails
git commit -m "feat: implement CSV escaping"
# Code passes test

# Refactor
git commit -m "refactor: extract CSV formatting helpers"
# Tests still pass
```

**Why TDD:**
- Catches bugs immediately
- Documents expected behavior
- Enables confident refactoring
- Builds quality in from start
- Provides progress milestones

### Non-TDD Approach (Alternative)

**For cases where TDD is impractical:**
- Prototyping/exploration
- UI implementation
- Integration code
- Configuration changes

**Process:**
1. Implement feature incrementally
2. Test manually as you go
3. Write tests after implementation
4. Refactor with test coverage

**Commit rhythm:**
```bash
# Every 15-20 minutes or logical checkpoint
git commit -m "feat: add [component] implementation (WIP)"
git commit -m "feat: complete [component] core logic"
git commit -m "test: add tests for [component]"
git commit -m "refactor: improve [component] structure"
```

## Implementation Workflow

### Step 1: Set Up (5 minutes)

**Before coding:**

1. **Review design** (2 min)
   - Re-read design from Stage 2
   - Understand approach and files to change
   - Check integration points

2. **Prepare workspace** (2 min)
   ```bash
   # Create feature branch if needed
   git checkout -b feature/csv-export

   # Ensure clean working directory
   git status

   # Run tests to verify baseline
   npm test  # or pytest
   ```

3. **Create first test file** (1 min)
   ```bash
   # Create test file from design
   touch tests/CSVService.test.ts
   ```

**Completion gate:**
- [ ] Design reviewed
- [ ] Workspace clean
- [ ] Tests passing (baseline)
- [ ] Ready to code

### Step 2: Implement Incrementally (varies by mode)

**Deep Work Mode: 60-120 minutes**

**Approach**: Build feature piece-by-piece with TDD

**Progress tracking:**
```markdown
## Implementation Progress

### Iteration 1: Core functionality (30 min)
- [x] CSV header generation
- [x] Single row formatting
- [x] Basic file download
- Commit: 3 commits (test, implementation, refactor)

### Iteration 2: Edge cases (30 min)
- [x] Empty data handling
- [x] Special character escaping
- [x] Large dataset optimization
- Commit: 3 commits

### Iteration 3: Integration (30 min)
- [x] Button component
- [x] Dashboard integration
- [x] Error handling
- Commit: 4 commits

### Iteration 4: Polish (20 min)
- [x] Loading states
- [x] User feedback
- [x] Documentation
- Commit: 2 commits

Total: ~110 minutes, 12 commits
```

**Key practices:**
- Start with core happy path
- Add edge cases incrementally
- Integrate last
- Commit every small win (15-20 min)
- Take 5-minute break every hour
- Run tests frequently

**Quick Fix Mode: 15-30 minutes**

**Approach**: Make focused change, minimal tests

```markdown
## Implementation Progress

### Single change (15 min)
- [x] Modify [component]
- [x] Add basic test
- [x] Verify works
- Commit: 1-2 commits
```

**Key practices:**
- One focused change only
- Resist scope creep
- Commit immediately after verification
- Keep it simple

**Collaboration Mode: 30-60 minutes**

**Approach**: Independent work with team updates

```markdown
## Implementation Progress

30-minute mark:
- [x] Core logic implemented
- [x] 5 tests passing
- Update team: "50% done, on track"

60-minute mark:
- [x] Integration complete
- [x] All tests passing
- Update team: "Complete, ready for review"
```

**Key practices:**
- Update team every 30 minutes
- Push to shared branch regularly
- Clear commit messages (team will read)
- Document decisions inline

**Debugging Mode: 20-30 minutes**

**Approach**: Minimal fix after root cause identified

```markdown
## Implementation Progress

### Single fix (20 min)
- [x] Change [specific line/file]
- [x] Add regression test
- [x] Verify fix works
- Commit: 2 commits (fix + test)
```

**Key practices:**
- Minimal change only (resist refactoring)
- Add regression test
- Document why in code comment
- Keep fix isolated

### Step 3: Maintain Quality (continuous)

**Code quality checklist:**
```markdown
## Quality Gates (check continuously)

### Code conventions
- [ ] Follows project style guide
- [ ] Consistent naming
- [ ] Proper indentation/formatting
- [ ] No magic numbers

### Documentation
- [ ] Complex logic has comments explaining "why"
- [ ] Public APIs documented
- [ ] README updated if needed
- [ ] No misleading comments

### Error handling
- [ ] Edge cases handled
- [ ] Errors logged appropriately
- [ ] User-friendly error messages
- [ ] No silent failures

### Testing
- [ ] Tests cover critical paths
- [ ] Tests cover edge cases
- [ ] All tests passing
- [ ] No flaky tests

### Security
- [ ] Input validation at boundaries
- [ ] No hardcoded secrets
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Proper authentication/authorization
```

**Run linter frequently:**
```bash
# Every few commits
npm run lint  # or ruff check, or cargo clippy

# Auto-fix when possible
npm run lint:fix  # or ruff format
```

**Run tests frequently:**
```bash
# After each TDD cycle
npm test -- [test file]

# Before committing
npm test

# Watch mode for continuous feedback
npm run test:watch
```

### Step 4: Commit Frequently (every 15-20 min)

**Commit strategy:**

**Good commit frequency:**
```bash
# Commit small, complete changes
git commit -m "test: add CSV header generation test"
# 5 minutes later
git commit -m "feat: implement CSV header generation"
# 10 minutes later
git commit -m "test: add CSV row formatting test"
# 5 minutes later
git commit -m "feat: implement CSV row formatting"
```

**Too infrequent (risky):**
```bash
# One huge commit after 2 hours
git commit -m "feat: implement entire CSV export feature"
# Risk: lose progress if something goes wrong
```

**Commit message format:**
```
<type>(<scope>): <subject>

[optional body]

[optional footer]

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `test`: Add/modify tests
- `refactor`: Code restructuring
- `docs`: Documentation
- `style`: Formatting
- `chore`: Maintenance

**Examples:**
```bash
# Feature implementation
git commit -m "feat(export): add CSV header generation

Implements CSV header row with all column names.
Handles empty column list edge case.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Test addition
git commit -m "test(export): add CSV escaping tests

Tests special characters: quotes, commas, newlines.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Refactoring
git commit -m "refactor(export): extract CSV formatting helpers

Improves readability and testability.
No functional changes.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**WIP commits (when pausing mid-feature):**
```bash
# Mark incomplete work clearly
git commit -m "wip(export): partial CSV escaping implementation

TODO: Handle newlines in data
TODO: Add tests for edge cases

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

## Completion Gate

**Before moving to Test stage, verify:**
- [ ] All planned deliverables implemented
- [ ] Tests written and passing
- [ ] Code committed (no uncommitted changes)
- [ ] Code follows project conventions
- [ ] No obvious bugs or issues
- [ ] Documentation updated (inline comments, README)
- [ ] Linter passing
- [ ] No TODO comments for critical functionality

**Self-check:**
- Can I explain what each commit does?
- Would I be comfortable if teammate reviewed this now?
- Are there any shortcuts I took that need cleanup?
- Did I skip any edge cases?

## Common Mistakes

### Mistake: Implementing everything before testing
**Problem**: Write all code, then discover bugs during testing
**Fix**: Use TDD rhythm, test as you go

### Mistake: Committing once at the end
**Problem**: Lose progress if something goes wrong, hard to review
**Fix**: Commit every 15-20 minutes or logical checkpoint

### Mistake: Scope creep ("while I'm here...")
**Problem**: "While implementing X, also added Y and Z"
**Fix**: Strictly follow design, create separate tasks for extras

### Mistake: Skipping tests to "move faster"
**Problem**: Bugs discovered later, hard to fix, rework needed
**Fix**: Write tests with implementation (TDD or immediately after)

### Mistake: Unclear commit messages
**Problem**: "fix stuff", "update code", "changes"
**Fix**: Descriptive messages: what changed, why it changed

### Mistake: Not running tests before committing
**Problem**: Commit breaks build, discovered in CI
**Fix**: Always run tests before committing

### Mistake: Implementing without understanding design
**Problem**: Code doesn't match plan, integration issues
**Fix**: Review design first, ask questions before coding

### Mistake: Working in isolation for hours (Collaboration Mode)
**Problem**: Team doesn't know progress, duplicate work
**Fix**: Update team every 30 minutes

## Implementation Patterns

### Pattern 1: Outside-In (UI to Logic)

**Start with UI, work toward business logic**

```markdown
1. Create UI component (button/form)
2. Create event handlers (stub logic)
3. Implement service/API layer
4. Implement business logic
5. Connect all layers
```

**Example:**
```typescript
// Step 1: UI component
function ExportButton() {
  return <button onClick={handleClick}>Export</button>;
}

// Step 2: Event handler (stub)
function handleClick() {
  CSVService.export(data);
}

// Step 3: Service layer
class CSVService {
  static export(data) {
    const csv = this.generateCSV(data);
    this.download(csv);
  }
}

// Step 4: Business logic
function generateCSV(data) {
  // Implementation
}
```

**Best for:**
- User-facing features
- When UX is clear
- Frontend development

### Pattern 2: Inside-Out (Logic to UI)

**Start with core logic, build UI on top**

```markdown
1. Implement core business logic
2. Create API/service layer
3. Create event handlers
4. Create UI components
5. Wire everything together
```

**Example:**
```typescript
// Step 1: Core logic
function formatCSV(data: Data[]): string {
  // Pure business logic
}

// Step 2: Service layer
class CSVService {
  export(data: Data[]) {
    const csv = formatCSV(data);
    this.download(csv);
  }
}

// Step 3: Event handler
function handleExport() {
  CSVService.export(analyticsData);
}

// Step 4: UI
function ExportButton() {
  return <button onClick={handleExport}>Export</button>;
}
```

**Best for:**
- Complex algorithms
- When logic is core value
- Backend development

### Pattern 3: Walking Skeleton (End-to-End)

**Minimal end-to-end first, then flesh out**

```markdown
1. Simplest possible end-to-end flow
2. Verify integration works
3. Add real logic incrementally
4. Expand edge cases
5. Polish and optimize
```

**Example:**
```typescript
// Step 1: Minimal end-to-end (hardcoded)
function exportCSV() {
  download("name,email\nJohn,john@example.com");
}

// Step 2: Real data
function exportCSV() {
  const csv = formatData(analyticsData);
  download(csv);
}

// Step 3: Edge cases
function exportCSV() {
  if (analyticsData.length === 0) {
    showMessage("No data to export");
    return;
  }
  const csv = formatData(analyticsData);
  download(csv);
}

// Step 4: Polish
function exportCSV() {
  setLoading(true);
  try {
    if (analyticsData.length === 0) {
      showMessage("No data to export");
      return;
    }
    const csv = formatData(analyticsData);
    download(csv, `analytics-${Date.now()}.csv`);
    showSuccess("CSV exported successfully");
  } catch (error) {
    showError("Export failed");
  } finally {
    setLoading(false);
  }
}
```

**Best for:**
- Unclear integration points
- Testing deployment/infrastructure
- Microservices architecture

## Examples

### Example 1: Deep Work Mode Implementation

**Task**: CSV export feature

**Iteration 1: Core functionality (30 min)**

```typescript
// tests/CSVService.test.ts
describe('CSVService', () => {
  test('generates CSV header', () => {
    const columns = ['name', 'email'];
    expect(CSVService.generateHeader(columns)).toBe('name,email');
  });
});
```

```bash
git commit -m "test: add CSV header generation test"
```

```typescript
// src/services/CSVService.ts
export class CSVService {
  static generateHeader(columns: string[]): string {
    return columns.join(',');
  }
}
```

```bash
git commit -m "feat(export): implement CSV header generation"
```

```typescript
// tests/CSVService.test.ts
test('formats single data row', () => {
  const row = { name: 'John', email: 'john@example.com' };
  expect(CSVService.formatRow(row)).toBe('John,john@example.com');
});
```

```bash
git commit -m "test: add CSV row formatting test"
```

```typescript
// src/services/CSVService.ts
static formatRow(row: Record<string, any>): string {
  return Object.values(row).join(',');
}
```

```bash
git commit -m "feat(export): implement CSV row formatting"
```

**Iteration 2: Edge cases (30 min)**

```typescript
test('escapes special characters', () => {
  const row = { name: 'O\'Brien', company: 'Acme, Inc.' };
  expect(CSVService.formatRow(row)).toBe('"O\'Brien","Acme, Inc."');
});
```

```bash
git commit -m "test: add CSV escaping test"
```

```typescript
static formatRow(row: Record<string, any>): string {
  return Object.values(row)
    .map(val => this.escapeCSV(String(val)))
    .join(',');
}

static escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
```

```bash
git commit -m "feat(export): add CSV special character escaping"
```

**Iteration 3: Integration (30 min)**

```typescript
// src/components/ExportButton.tsx
export function ExportButton({ data }: { data: Data[] }) {
  const handleClick = () => {
    CSVService.export(data, 'analytics.csv');
  };

  return <button onClick={handleClick}>Export CSV</button>;
}
```

```bash
git commit -m "feat(export): add export button component"
```

**Total**: 90 minutes, 9 commits, all tests passing

### Example 2: Quick Fix Mode Implementation

**Task**: Disable submit button during API call

**Implementation (15 min):**

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

return <button disabled={isSubmitting}>Submit</button>;
```

```bash
git commit -m "fix(form): disable submit button during API call"
```

```typescript
// tests/Form.test.tsx
test('disables button during submit', async () => {
  render(<Form />);
  const button = screen.getByRole('button');

  fireEvent.click(button);
  expect(button).toBeDisabled();

  await waitFor(() => expect(button).not.toBeDisabled());
});
```

```bash
git commit -m "test(form): add submit button disable test"
```

**Total**: 15 minutes, 2 commits

## Integration with Other Stages

**Receives from:**
- **Plan stage**: Deliverables list, success criteria
- **Design stage**: Implementation approach, files to modify, test strategy

**Feeds into:**
- **Test stage**: Code to test, tests already written
- **Review stage**: Code to review, commit history

**Informs:**
- **Integrate stage**: What was built, how it works

## Tips for Better Implementation

**Do:**
- Use TDD rhythm (or write tests immediately after)
- Commit every 15-20 minutes
- Run tests frequently
- Follow design plan
- Take breaks (5 min per hour in Deep Work)
- Update team regularly (Collaboration Mode)
- Document complex logic inline
- Keep changes focused and incremental

**Don't:**
- Implement everything before testing
- Commit once at the end
- Skip tests to "move faster"
- Add scope beyond design
- Work for hours without committing
- Ignore linter warnings
- Write code without understanding design
- Leave TODO comments for critical functionality
