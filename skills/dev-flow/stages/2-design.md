---
name: design-stage
description: Sketch implementation approach, identify integration points, and plan testing strategy before writing code
---

# Stage 2: Design

## Purpose

Determine HOW to build what was planned, before writing any code. Catches architectural issues, integration problems, and design flaws early when they're cheap to fix.

## When to Use

**Required for:**
- **Deep Work Mode**: 20 minutes of comprehensive design
- **Collaboration Mode**: 10 minutes + team feedback
- **Debugging Mode**: 15 minutes (verify hypotheses before fixing)

**Skipped for:**
- **Quick Fix Mode**: Skip design, go straight to implementation

**Rule**: If implementation >30 minutes, design first

## Time Investment

**By mode:**
- **Deep Work Mode**: 20 minutes (comprehensive)
- **Collaboration Mode**: 10 minutes + feedback wait time
- **Debugging Mode**: 15 minutes (hypothesis verification)
- **Quick Fix Mode**: 0 minutes (skipped)

**Return on investment**: 20 minutes of design prevents hours of rework

## Objectives

At the end of design stage, you should have:
1. **Implementation approach**: How we'll build this
2. **Files to modify**: Exact files and what changes
3. **Integration points**: How this connects to existing code
4. **Test strategy**: What and how we'll test
5. **Potential issues**: Problems we might encounter and mitigations

## Design Process

### Step 1: Choose Implementation Approach (5 minutes)

**Decide on the overall strategy**

**Questions to answer:**
- What pattern will we follow? (existing pattern in codebase)
- What's the architecture? (components, services, utilities)
- How will data flow? (API → service → component → UI)
- What technologies will we use? (libraries, frameworks)
- Is this the simplest approach that works?

**Example (CSV Export):**
```markdown
## Implementation Approach

**Pattern**: Follow existing export pattern (PDF export)
**Architecture**:
- UI: ExportButton component (presentational)
- Service: CSVService utility (business logic)
- Data: Use existing analytics data from Redux store
- Download: Browser download with Blob

**Data flow**:
1. User clicks ExportButton
2. Component calls CSVService.export(data)
3. Service formats data → CSV string
4. Service creates Blob and triggers download
5. Browser downloads CSV file

**Why this approach**:
- Reuses existing export pattern (consistency)
- Browser download (no backend needed)
- Separation of concerns (UI vs logic)
```

**Alternative approaches considered:**
```markdown
**Alternative 1: Backend API endpoint**
- Pros: Server-side CSV generation, handles large datasets
- Cons: Requires backend change, deployment coordination, slower
- Decision: NOT chosen (current data <10k rows, frontend is sufficient)

**Alternative 2: Third-party library (e.g., PapaParse)**
- Pros: Battle-tested, handles edge cases
- Cons: Additional dependency, larger bundle size
- Decision: NOT chosen (simple CSV logic, don't need full parser)
```

**Red flags:**
- Reinventing existing solutions
- Over-engineering (complex solution for simple problem)
- Technology choice unclear
- Multiple equally viable approaches (need to pick one)

### Step 2: Identify Files to Create/Modify (5 minutes)

**List exactly which files will change and how**

**Template:**
```markdown
## Files to Create/Modify

**New files**:
- `[path/to/file.ext]`: [Purpose and key exports]
  - Example: `src/services/CSVService.ts`: CSV generation utility, exports export() function

**Modified files**:
- `[path/to/file.ext]`: [What changes]
  - Example: `src/pages/AnalyticsDashboard.tsx`: Add ExportButton component, wire to analytics data

**Test files**:
- `[path/to/test.ext]`: [What's tested]
  - Example: `tests/CSVService.test.ts`: Unit tests for CSV format, edge cases

**Documentation**:
- `[path/to/doc.md]`: [What's updated]
  - Example: `README.md`: Add CSV export to features list
```

**Detailed breakdown (for complex changes):**
```markdown
### src/services/CSVService.ts (NEW)
```typescript
// Exports:
// - export(data: AnalyticsData[]): void
// - formatRow(row: AnalyticsData): string (helper)
// - escapeCSV(value: string): string (helper)
```

### src/components/ExportButton.tsx (NEW)
```typescript
// Props: { data: AnalyticsData[], filename: string }
// Renders button, calls CSVService.export on click
```

### src/pages/AnalyticsDashboard.tsx (MODIFIED)
- Import ExportButton
- Add to toolbar: <ExportButton data={analyticsData} filename="analytics.csv" />
```

**Why be specific:**
- Catches missing files early
- Identifies scope creep
- Helps with task estimation
- Makes implementation straightforward

### Step 3: Define Integration Points (3 minutes)

**How will this connect to existing code?**

**Template:**
```markdown
## Integration Points

**Integrates with**:
- **[Component/Service]**: [How it connects]
  - Example: **AnalyticsDashboard**: Adds ExportButton to toolbar
- **[API/External service]**: [What we call]
  - Example: **Analytics API**: Uses existing GET /api/analytics (no changes)
- **[State management]**: [What state we use/update]
  - Example: **Redux store**: Reads analytics data from analyticsSlice (no changes)

**API changes** (if any):
- **New endpoints**: [List]
- **Modified endpoints**: [List with changes]
- **Breaking changes**: [None / List with migration]

**Backward compatibility**:
- [ ] No breaking changes (additive only)
- [ ] Existing functionality unchanged
```

**Example:**
```markdown
## Integration Points

**Integrates with**:
- **AnalyticsDashboard**: Adds ExportButton to toolbar section
  - No prop changes to existing components
  - Button appears next to existing FilterButton
- **Redux store (analyticsSlice)**: Reads analytics data
  - No modifications to store
  - Uses existing selector: selectAnalyticsData()
- **Existing ExportPDF feature**: Follows same pattern
  - Consistent UI placement
  - Consistent interaction model

**API changes**: None (uses existing data)

**Backward compatibility**:
- ✅ No breaking changes
- ✅ Purely additive feature
- ✅ Existing dashboard functionality unchanged
```

**Red flags:**
- Breaking changes without migration plan
- Unclear how new code fits with existing
- Modifying core functionality unnecessarily
- Creating tight coupling

### Step 4: Plan Test Strategy (5 minutes)

**What will we test and how?**

**Template:**
```markdown
## Test Strategy

### Unit Tests
**What**: Test individual functions/components in isolation
**Coverage**:
- [ ] [Function/component]: [Test scenarios]
  - Example: CSVService.export(): Empty data, single row, multiple rows, special characters

### Integration Tests
**What**: Test how components work together
**Coverage**:
- [ ] [Integration scenario]: [What's tested]
  - Example: Full export flow: Click button → CSV downloads with correct data

### Manual Verification
**What**: Human testing for UX and edge cases
**Coverage**:
- [ ] [Manual test]: [What to check]
  - Example: Download CSV, open in Excel, verify formatting

### Edge Cases
- [ ] [Edge case]: [How to test]
  - Example: Empty analytics data: Shows message "No data to export"
- [ ] [Edge case]: [How to test]
  - Example: Special characters in data: Properly escaped in CSV

### Regression Testing
- [ ] Existing tests still pass
- [ ] [Specific functionality]: Verify no breakage
  - Example: Existing dashboard filtering: Still works with new button
```

**Test coverage targets:**
- **New code**: >80% coverage
- **Modified code**: Maintain existing coverage
- **Critical paths**: 100% coverage

**Example:**
```markdown
## Test Strategy

### Unit Tests

**CSVService**:
```typescript
describe('CSVService.export', () => {
  test('formats single row correctly');
  test('formats multiple rows');
  test('escapes special characters (quotes, commas, newlines)');
  test('handles empty data array');
  test('triggers download with correct filename');
});
```

**ExportButton**:
```typescript
describe('ExportButton', () => {
  test('renders button with label');
  test('calls CSVService.export on click');
  test('disables during export');
  test('passes correct data and filename');
});
```

### Integration Tests
- **Full export flow**: Click button → CSVService called → file downloads
  - Verify: Blob created, download triggered, correct filename

### Manual Verification
- [ ] Download CSV from dashboard
- [ ] Open CSV in Excel - formats correctly
- [ ] Open CSV in Google Sheets - formats correctly
- [ ] Verify all data columns present
- [ ] Check special characters render correctly

### Edge Cases
- [ ] Empty analytics data: Button shows tooltip "No data to export"
- [ ] Large dataset (10k rows): Export completes in <5 seconds
- [ ] Special characters: "O'Brien, Inc." exports as \"O'Brien, Inc.\"

### Regression Testing
- [ ] Existing dashboard tests pass (15 tests)
- [ ] Dashboard filtering still works
- [ ] Dashboard date range selector still works
- [ ] PDF export still works
```

### Step 5: Identify Potential Issues (2 minutes)

**What could go wrong? How to avoid it?**

**Template:**
```markdown
## Potential Issues & Mitigations

1. **[Potential problem]**
   - **Impact**: [What happens if this occurs]
   - **Likelihood**: [High/Medium/Low]
   - **Mitigation**: [How to prevent/handle]

2. **[Potential problem]**
   - **Impact**: [What happens]
   - **Likelihood**: [High/Medium/Low]
   - **Mitigation**: [How to prevent/handle]
```

**Example:**
```markdown
## Potential Issues & Mitigations

1. **Large datasets crash browser**
   - Impact: Export fails, browser becomes unresponsive
   - Likelihood: Low (current max is 10k rows)
   - Mitigation:
     - Add row limit check (warn if >50k rows)
     - Stream data instead of building full string
     - Add progress indicator for large exports

2. **Special characters break CSV format**
   - Impact: CSV doesn't open correctly in Excel
   - Likelihood: Medium (user data has quotes, commas)
   - Mitigation:
     - Proper CSV escaping (quote quotes, wrap in quotes)
     - Test with real data containing edge cases
     - Add unit tests for special character scenarios

3. **Different browsers handle download differently**
   - Impact: Download doesn't work in some browsers
   - Likelihood: Low (Blob API widely supported)
   - Mitigation:
     - Test in Chrome, Firefox, Safari
     - Use standard Blob API (not browser-specific)
     - Add fallback for unsupported browsers

4. **Export button placement unclear to users**
   - Impact: Users don't discover export feature
   - Likelihood: Medium (new feature, needs discoverability)
   - Mitigation:
     - Place next to existing export (PDF) button
     - Add tooltip: "Export as CSV"
     - Consider announcement banner for new feature
```

**Common issues to consider:**
- Performance problems
- Edge case handling
- Browser compatibility
- User experience issues
- Integration conflicts
- Security concerns

## Completion Gate

**Before moving to Implementation, verify:**
- [ ] Implementation approach is clear and sensible
- [ ] All files to create/modify identified
- [ ] Integration points documented
- [ ] Test strategy covers critical paths and edge cases
- [ ] Potential issues identified with mitigations
- [ ] (If collaboration mode) Team feedback received

**Design approval:**
- Simple changes: Self-approve
- Complex changes: Get team feedback
- Architectural changes: Get tech lead approval

## When to Get Feedback

**Always get feedback for:**
- New architectural patterns
- API changes
- Breaking changes
- Cross-team dependencies
- Uncertain between approaches

**How to ask for feedback:**
```
@team: Proposed design for [feature]

Approach: [Brief summary]
Files changing: [count] files
Impact: [Low/Medium/High]

Key decisions:
1. [Decision + rationale]
2. [Decision + rationale]

Questions:
- [Specific question needing input]

Proceeding in 15 min if no concerns.
```

## Output Examples

### Example 1: Feature Addition (Deep Work)

```markdown
## Design: CSV Export Feature

### Implementation Approach
**Pattern**: Follow existing export pattern (PDF export uses similar flow)

**Architecture**:
- **UI Layer**: ExportButton component (React)
- **Service Layer**: CSVService utility (pure TS functions)
- **Data Layer**: Redux store (existing analytics data)
- **Download**: Browser Blob API

**Data flow**:
```
User clicks button
  → ExportButton.handleClick()
  → CSVService.export(analyticsData)
  → Format data to CSV string
  → Create Blob
  → Trigger download
  → Browser downloads file
```

**Why this approach**:
- Consistent with PDF export (user familiarity)
- Client-side generation (no backend needed, faster)
- Simple implementation (no external dependencies)
- Reuses existing data pipeline

### Files to Create/Modify

**New files**:
- `src/services/CSVService.ts`: CSV generation logic
  ```typescript
  export function export(data: AnalyticsData[], filename: string): void
  function formatRow(row: AnalyticsData): string
  function escapeCSV(value: string): string
  ```

- `src/components/ExportButton.tsx`: Export button UI
  ```typescript
  interface Props {
    data: AnalyticsData[];
    filename: string;
  }
  ```

- `tests/CSVService.test.ts`: Unit tests for CSVService
- `tests/ExportButton.test.tsx`: Component tests

**Modified files**:
- `src/pages/AnalyticsDashboard.tsx`:
  - Import ExportButton
  - Add to toolbar: `<ExportButton data={data} filename="analytics.csv" />`
  - ~10 lines added

**Documentation**:
- `README.md`: Add CSV export to features list

### Integration Points

**Integrates with**:
- **AnalyticsDashboard**: Adds button to toolbar, uses existing data
- **Redux (analyticsSlice)**: Reads from selectAnalyticsData() selector (no changes)
- **Existing PDF export**: Placed adjacent, consistent UX

**API changes**: None

**Backward compatibility**: ✅ Fully backward compatible, additive only

### Test Strategy

**Unit Tests** (target: 90% coverage):
- CSVService: Empty data, single/multiple rows, special characters, escaping
- ExportButton: Rendering, click handling, disabled state

**Integration Tests**:
- Full flow: Click → CSVService called → download triggered
- Verify: Correct data, correct filename, correct format

**Manual Verification**:
- Download CSV, open in Excel/Google Sheets
- Verify: All columns, all rows, special characters handled
- Test: Empty state, large dataset (10k rows)

**Edge Cases**:
- Empty data: Show message
- Special characters: Proper escaping
- Large datasets: Performance acceptable

**Regression**:
- All existing dashboard tests pass
- Existing exports (PDF) still work

### Potential Issues & Mitigations

1. **Large datasets (>50k rows) crash browser**
   - Mitigation: Add row limit warning, consider streaming for large exports

2. **Special characters break CSV format**
   - Mitigation: Proper escaping, extensive unit tests

3. **Browser compatibility (download)**
   - Mitigation: Test in Chrome/Firefox/Safari, use standard Blob API

4. **Users don't discover feature**
   - Mitigation: Place next to PDF export, add tooltip, consider announcement
```

### Example 2: Bug Fix (Debugging)

```markdown
## Design: Fix Form Submission Failure

### Implementation Approach
**Root cause**: API endpoint changed from /api/v1 to /api/v2

**Fix**: Update API_BASE constant

**Why minimal**:
- Root cause identified (confirmed with hypothesis testing)
- Single constant change addresses issue
- No architectural changes needed

### Files to Modify
- `src/api/client.ts`: Change API_BASE from '/api/v1' to '/api/v2'
- `tests/api/client.test.ts`: Add regression test for correct API version

### Integration Points
**Affects**:
- All API calls (will now use /api/v2)

**Verified**:
- ✅ Backend /api/v2 endpoints are stable (deployed 3 hours ago)
- ✅ /api/v1 is deprecated (returning 404)
- ✅ No breaking changes between v1 and v2 (verified with backend team)

### Test Strategy
**Unit test**:
```typescript
test('uses correct API version', () => {
  expect(API_BASE).toBe('/api/v2');
});
```

**Integration test**:
- Verify form submission works end-to-end

**Manual test**:
- Submit form, verify success
- Check all API calls in network tab use /api/v2

**Regression**:
- All existing API tests pass
- All existing forms work

### Potential Issues & Mitigations
1. **Other code hardcodes /api/v1**
   - Mitigation: Search codebase for '/api/v1' (already done, only in client.ts)

2. **Some endpoints not migrated to v2**
   - Mitigation: Verified with backend team, all endpoints migrated
```

## Common Design Mistakes

### Mistake: Jumping straight to code
**Problem**: Start coding without design, discover issues mid-implementation
**Fix**: Always design first (even 5 minutes helps)

### Mistake: Over-designing
**Problem**: Spend 2 hours designing elaborate solution for 30-minute task
**Fix**: Design depth should match task complexity

### Mistake: Not considering existing patterns
**Problem**: Invent new pattern when existing one works
**Fix**: Research existing patterns first, match them unless good reason not to

### Mistake: Unclear integration
**Problem**: Not sure how new code fits with existing code
**Fix**: Explicitly document integration points, verify compatibility

### Mistake: No test strategy
**Problem**: Code without tests, discover bugs later
**Fix**: Plan testing during design, implement tests with code

### Mistake: Ignoring potential issues
**Problem**: Don't think about what could go wrong
**Fix**: Explicitly identify risks and mitigations

## Integration with Other Stages

**Receives from:**
- **Plan stage**: Goal, deliverables, dependencies, success criteria

**Feeds into:**
- **Implement stage**: Guides what code to write
- **Test stage**: Informs what and how to test

**Informs:**
- **Review stage**: Check design was followed
- **Integrate stage**: Verify integrations work as designed

## Tips for Better Design

**Do:**
- Research existing patterns in codebase first
- Consider multiple approaches, pick best one
- Document integration points explicitly
- Plan testing before coding
- Identify potential issues upfront
- Get feedback for complex changes

**Don't:**
- Skip design to "save time" (causes rework)
- Design and implement simultaneously (confusing)
- Ignore existing patterns (inconsistency)
- Over-engineer simple solutions
- Forget about testing
- Design in isolation (get team input)
