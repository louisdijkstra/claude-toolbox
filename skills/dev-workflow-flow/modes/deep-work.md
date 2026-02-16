---
name: deep-work-mode
description: Full-cycle development with comprehensive planning, design, implementation, testing, review, and integration
---

# Deep Work Mode

## Purpose

Execute complete development cycles for major features, significant refactors, or complex fixes. Provides structure for 3+ hour focused work sessions with minimal interruptions.

## When to Use

**Best for:**
- Major feature development (new capabilities, significant UI changes)
- Significant refactoring (architectural changes, major reorganization)
- Complex bug fixes requiring design changes
- Work requiring deep concentration and flow state
- Multi-component changes spanning several files

**Don't use for:**
- Quick fixes (<30 minutes)
- Simple bug fixes
- Documentation-only changes
- Urgent hotfixes
- Interruption-heavy environment

## Time Structure

**Total duration**: 3-4 hours (125-165 minutes)

**Stage breakdown:**
```
1. Plan      (10 min)  - Clarify goal completely
2. Design    (20 min)  - Sketch full approach
3. Implement (60-120 min) - Code with TDD
4. Test      (20 min)  - Full verification
5. Review    (10 min)  - Quality check
6. Integrate (5 min)   - Commit/push
```

## Workflow

### Stage 1: Plan (10 minutes)

**Objective**: Complete clarity on what we're building and why

**Activities:**
- Write one-sentence goal
- List all concrete deliverables
- Identify dependencies (files, services, APIs)
- Define measurable success criteria
- Estimate time for each stage

**Output template:**
```markdown
# Deep Work Session: [Feature/Refactor Name]

## Goal
[One clear sentence describing what we're building]

## Deliverables
- [ ] [Concrete deliverable 1]
- [ ] [Concrete deliverable 2]
- [ ] [Concrete deliverable 3]

## Dependencies
- Files: [List files that must exist]
- Services: [External services needed]
- APIs: [API endpoints required]

## Success Criteria
- [ ] All tests passing
- [ ] No regressions in existing functionality
- [ ] [Project-specific criterion 1]
- [ ] [Project-specific criterion 2]

## Time Estimate
- Plan: 10 min
- Design: 20 min
- Implement: [X] min
- Test: 20 min
- Review: 10 min
- Integrate: 5 min
**Total: [X] minutes**
```

**Completion gate:**
- [ ] Goal is crystal clear
- [ ] Deliverables are concrete and testable
- [ ] All dependencies identified
- [ ] Success criteria measurable

### Stage 2: Design (20 minutes)

**Objective**: Full implementation approach before writing code

**Activities:**
- Sketch architectural approach
- List all files to create/modify
- Define test strategy
- Identify potential issues and mitigations
- Get feedback if complex

**Output template:**
```markdown
## Design

### Implementation Approach
[How will we build this? What patterns will we use?]

### Files to Create/Modify
- `src/components/NewComponent.tsx`: [What changes/creates]
- `src/services/ApiService.ts`: [What changes]
- `tests/NewComponent.test.tsx`: [Test coverage]

### Test Strategy
- **Unit tests**:
  - [ ] Test [component/function] with [scenarios]
  - [ ] Edge cases: [null, empty, invalid input]
- **Integration tests**:
  - [ ] Test [integration point] with [dependencies]
- **Manual verification**:
  - [ ] Check [specific UI behavior]
  - [ ] Verify [specific functionality]

### Potential Issues & Mitigations
- **Issue**: [Potential problem 1]
  - Mitigation: [How to avoid/handle it]
- **Issue**: [Potential problem 2]
  - Mitigation: [How to avoid/handle it]

### Approval Gate
- [ ] Approach is sound
- [ ] Test strategy is comprehensive
- [ ] Potential issues addressed
- [ ] (If complex) Get feedback before proceeding
```

**Completion gate:**
- [ ] Implementation approach is clear
- [ ] All files identified
- [ ] Test strategy covers critical paths
- [ ] Potential issues have mitigations

### Stage 3: Implement (60-120 minutes)

**Objective**: Write production-ready code following TDD

**Approach:**
- Use `/dev-tdd` skill for TDD rhythm
- Follow RED-GREEN-REFACTOR cycle
- Commit every 15-20 minutes
- Keep tests passing continuously
- Document code as you write

**TDD rhythm:**
```
1. RED: Write failing test (3-5 min)
2. GREEN: Make it pass minimally (5-10 min)
3. REFACTOR: Improve code (3-5 min)
4. COMMIT: Save checkpoint (1 min)
```

**Commit frequency:**
- Every 15-20 minutes
- At logical checkpoints (feature complete, tests passing)
- Before taking breaks
- When switching between components

**Key practices:**
- No interruptions (silence notifications)
- Take 5-minute break every 60 minutes
- Run tests after each change
- Document decisions in comments
- Keep scope focused (resist feature creep)

**Progress tracking:**
```markdown
## Implementation Progress

### Completed
- [x] [Component/function 1] with tests
- [x] [Component/function 2] with tests

### In Progress
- [ ] [Current work item]

### Blocked/Issues
- [Any blockers or issues discovered]
```

### Stage 4: Test (20 minutes)

**Objective**: Comprehensive verification before review

**Activities:**
1. **Run full test suite** (5 min)
   ```bash
   # Run all tests
   pytest  # or npm test

   # Check coverage
   pytest --cov=src tests/
   ```

2. **Manual verification** (10 min)
   - Test happy path manually
   - Check edge cases (empty data, large datasets, errors)
   - Verify UI/UX if applicable
   - Test integration points

3. **Regression check** (5 min)
   - Run critical path tests
   - Verify no existing functionality broken
   - Check performance (no obvious slowdowns)

**Completion gate:**
- [ ] All tests passing (100%)
- [ ] Coverage adequate (>80% for new code)
- [ ] Manual verification successful
- [ ] No regressions detected

### Stage 5: Review (10 minutes)

**Objective**: Self-review for quality and consistency

**Activities:**
1. **Code review** (5 min)
   ```bash
   # Review all changes
   git diff main...HEAD
   ```
   - Check naming (clear, consistent)
   - Verify logic (correct, efficient)
   - Review error handling (complete, appropriate)
   - Check for dead code or TODOs

2. **Quality check** (3 min)
   ```bash
   # Run linters/formatters
   npm run lint  # or ruff check
   npm run prettier  # or ruff format
   ```

3. **Documentation check** (2 min)
   - Code comments explain "why" not "what"
   - Complex logic is documented
   - API changes reflected in docs
   - CHANGELOG.md updated if needed

**Completion gate:**
- [ ] Code quality is high
- [ ] No linting errors
- [ ] Documentation is complete
- [ ] Follows project conventions (CLAUDE.md)

### Stage 6: Integrate (5 minutes)

**Objective**: Merge code into main codebase

**Activities:**
1. **Final commit** (1 min)
   ```bash
   git add .
   git commit -m "feat(component): add new feature

   Detailed description of changes.

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
   ```

2. **Create PR** (2 min)
   ```bash
   gh pr create --title "feat: add new feature" --body "$(cat <<'EOF'
   ## Summary
   - [Change 1]
   - [Change 2]

   ## Test Plan
   - [x] Unit tests passing
   - [x] Manual verification complete
   - [x] No regressions

   🤖 Generated with Claude Code
   EOF
   )"
   ```

3. **Verify CI** (2 min)
   - Push changes
   - Watch CI pipeline
   - Address any CI failures immediately

**Completion gate:**
- [ ] All commits pushed
- [ ] PR created with clear description
- [ ] CI passing
- [ ] Ready for team review/merge

## Key Practices

**Do:**
- Commit every 15-20 minutes (checkpoint progress)
- Take 5-minute breaks between stages
- Document decisions as you go
- Run tests after each code change
- Keep scope focused (resist adding features)
- Silence notifications during implementation

**Don't:**
- Skip stages to save time (creates rework)
- Code without tests (TDD rhythm)
- Commit without running tests (breaks CI)
- Let sessions run >90 min without break (diminishing returns)
- Add scope during implementation (scope creep)

## Common Pitfalls

**Pitfall**: Planning too shallow → discovers issues mid-implementation
**Fix**: Spend full 10 minutes on plan, identify all dependencies upfront

**Pitfall**: Skipping design → wrong approach chosen
**Fix**: Always design before implementing, get feedback if complex

**Pitfall**: Long implement sessions without commits → lose progress
**Fix**: Commit every 15-20 minutes at checkpoints

**Pitfall**: Testing only at end → too many issues to fix
**Fix**: TDD rhythm keeps tests passing continuously

**Pitfall**: Skipping review → merge low-quality code
**Fix**: Always self-review, run linters, check conventions

## Example Session

**Task**: Add CSV export feature to analytics dashboard

### Stage 1: Plan (10 min)
```markdown
# Deep Work Session: CSV Export Feature

## Goal
Users can export analytics data as CSV file from dashboard

## Deliverables
- [ ] Export button in analytics dashboard
- [ ] CSV generation utility
- [ ] Download functionality
- [ ] Unit tests for CSV format
- [ ] Integration test for full export

## Dependencies
- Files: AnalyticsDashboard.tsx, analytics API
- APIs: GET /api/analytics (existing)

## Success Criteria
- [ ] All tests passing
- [ ] User can download CSV with all visible data
- [ ] CSV format is valid (opens in Excel)
- [ ] No performance issues with large datasets
```

### Stage 2: Design (20 min)
```markdown
## Design

### Implementation Approach
- Add ExportButton component to dashboard
- Create CSVService utility for data → CSV conversion
- Use existing analytics data from Redux store
- Trigger browser download with blob

### Files to Create/Modify
- `src/components/ExportButton.tsx`: New button component
- `src/services/CSVService.ts`: CSV generation utility
- `src/pages/AnalyticsDashboard.tsx`: Add export button
- `tests/CSVService.test.ts`: Unit tests for CSV format
- `tests/ExportButton.test.tsx`: Component tests

### Test Strategy
- **Unit tests**: CSVService with empty, single row, multiple rows, special characters
- **Integration tests**: Full export flow with Redux store
- **Manual**: Download CSV, open in Excel, verify data

### Potential Issues & Mitigations
- **Issue**: Large datasets crash browser
  - Mitigation: Stream data, add size limit warning
- **Issue**: Special characters in data break CSV
  - Mitigation: Proper escaping in CSVService
```

### Stage 3: Implement (90 min)
```
[Follow TDD rhythm for 6 cycles]
Cycle 1: CSVService base (15 min)
Cycle 2: CSVService edge cases (15 min)
Cycle 3: ExportButton component (15 min)
Cycle 4: Integration with dashboard (15 min)
Cycle 5: Download functionality (15 min)
Cycle 6: Polish and edge cases (15 min)
```

### Stage 4: Test (20 min)
```bash
npm test  # All tests passing
npm test -- --coverage  # 85% coverage

# Manual verification
# - Click export button
# - Download CSV
# - Open in Excel - looks good!
# - Test with empty data - works
# - Test with 10k rows - works
```

### Stage 5: Review (10 min)
```bash
git diff main...HEAD  # Review all changes
npm run lint  # No errors
npm run prettier  # Formatted

# Documentation check
# - Comments explain CSV escaping logic
# - README updated with export feature
```

### Stage 6: Integrate (5 min)
```bash
git commit -m "feat(analytics): add CSV export functionality"
gh pr create --title "feat: add CSV export to analytics dashboard"
# CI passing ✅
```

**Total time**: 155 minutes (2.5 hours)

## Integration with Other Skills

- **dev-tdd**: Used during Stage 3 (Implement) for TDD rhythm
- **review-system**: Used during Stage 5 (Review) for quality check
- **systematic-debugging**: If issues found during Stage 4 (Test)
- **context-manager**: Track session state across breaks
- **docs-manager**: Update documentation during Stage 6 (Integrate)
