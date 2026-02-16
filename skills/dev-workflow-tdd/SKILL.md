---
name: dev-tdd
description: Accelerated test-driven development for rapid feature delivery. Combines planning, testing, and implementation in tight cycles. Use for focused feature work with continuous validation.
---

# Dev TDD

## Purpose

Execute rapid feature delivery through integrated test-driven development. Tight cycles of planning, test writing, implementation, and validation that ensure quality while maintaining development velocity.

## When to Use This Skill

Use this skill when:
- Delivering new features with TDD approach
- Need rapid iteration with continuous validation
- Implementing well-scoped features
- Want to minimize bugs while staying fast
- Working in short, focused sprints
- Fixing bugs that need test coverage

**Do NOT use for:**
- Exploratory prototyping (code and validate later)
- Emergency hotfixes requiring immediate fix
- Refactoring existing code without behavior changes
- Infrastructure setup or configuration
- One-off scripts or throwaway code

**If uncertain:** Use this skill for production code where quality matters. Skip for experiments or emergencies where tests can be added afterward.

## Process

### Step 1: Setup Phase (5 minutes)

Create test workspace and implementation stubs.

**Create test file:**
```bash
# Create test file structure
mkdir -p tests/features/
cat > tests/features/test_feature_name.py << 'EOF'
"""Tests for feature_name"""
import pytest


# Tests will go here
EOF

# Verify test runs (should fail with no tests)
pytest tests/features/test_feature_name.py -v
```

**Create implementation stub:**
```bash
# Create implementation file
touch src/features/feature_name.py
```

### Step 2: Development Cycle

Repeat this RED-GREEN-REFACTOR cycle for each feature component:

```
1. Write failing test (RED)
   ↓
2. Write minimal implementation (GREEN)
   ↓
3. Refactor/optimize (REFACTOR)
   ↓
4. Commit progress
   ↓
5. Repeat for next component
```

### Step 3: RED Phase - Write Failing Test

Write test using Arrange-Act-Assert pattern.

**Test structure:**
```python
def test_feature_describes_specific_behavior():
    """
    Arrange: Set up test data
    Act: Call the function
    Assert: Verify expected result
    """
    # Arrange
    input_data = {"key": "value"}

    # Act
    result = my_feature(input_data)

    # Assert
    assert result == {"expected": "output"}
```

**Guidelines:**
- One behavior per test
- Clear, specific test names
- Arrange-Act-Assert pattern
- Should fail with clear error message

**Run test:**
```bash
pytest tests/features/test_feature_name.py::test_feature_describes_specific_behavior -v
```

Confirm it FAILS with clear error about what's missing.

### Step 4: GREEN Phase - Minimal Implementation

Write **minimal code** to make test pass.

```python
def my_feature(data):
    return {"expected": "output"}
```

**Run test:**
```bash
pytest tests/features/test_feature_name.py::test_feature_describes_specific_behavior -v
```

Confirm it PASSES. Don't optimize yet.

### Step 5: REFACTOR Phase - Improve Code

Now that test passes, improve without breaking it.

```python
def my_feature(data):
    """Process feature request and return normalized output."""
    processed = process_input(data)
    return normalize_output(processed)
```

**Run test again:**
```bash
pytest tests/features/test_feature_name.py -v
```

Still passing? Commit this cycle.

### Step 6: Commit Progress

After each 3-4 test cycles (or when a meaningful mini-feature is done):

```bash
git add src/features/ tests/features/
git commit -m "feat(feature-name): add component functionality

- Added X functionality
- Covered with Y tests
- Performance: Z
"
```

### Step 7: Multi-Component Features

For complex features with multiple parts, track progress:

```markdown
# Feature: [Feature Name]

## Components
- [ ] Component A: [What it does]
- [ ] Component B: [What it does]
- [ ] Component C: [What it does]

## Integration Plan
After all components complete:
- [ ] Integration tests
- [ ] End-to-end test
- [ ] Performance verification
```

## Test Patterns

### Pattern 1: Happy Path Test

```python
def test_calculates_revenue_growth_correctly():
    # Arrange
    start_revenue = 100_000
    end_revenue = 150_000

    # Act
    growth = calculate_revenue_growth(start_revenue, end_revenue)

    # Assert
    assert growth == 50.0
```

### Pattern 2: Edge Case Tests

```python
def test_handles_zero_start_revenue():
    with pytest.raises(ValueError, match="start revenue must be positive"):
        calculate_revenue_growth(0, 150_000)

def test_handles_empty_dataset():
    result = process_data([])
    assert result == {"status": "empty", "items": []}
```

### Pattern 3: Integration Tests

```python
@pytest.mark.integration
def test_saves_and_retrieves_data():
    # Arrange
    data = {"id": "123", "value": "test"}

    # Act
    save_data(data)
    retrieved = fetch_data("123")

    # Assert
    assert retrieved == data
```

### Pattern 4: Async Tests

```python
@pytest.mark.asyncio
async def test_fetches_data_from_api():
    # Arrange
    with patch('src.api.fetch') as mock_fetch:
        mock_fetch.return_value = {"result": "data"}

    # Act
    result = await fetch_and_process()

    # Assert
    assert result == {"processed": "data"}
```

## Rhythm and Pacing

### Time-Boxing Each Cycle

- **RED phase**: 2-5 minutes (write test)
- **GREEN phase**: 2-10 minutes (minimal implementation)
- **REFACTOR phase**: 2-5 minutes (improve code)
- **Commit**: 1 minute

**Total per cycle**: 10-20 minutes

### Daily Structure

```
Morning (90 min):
- 5 min: Plan day (which components)
- 6 cycles × 15 min each = 90 min
- 1 commit per cycle minimum

Afternoon (60 min):
- 4 cycles × 15 min = 60 min
- Integration testing
- Final verification
- One big commit
```

### When to Stop Each Component

Stop when:
- [ ] Happy path works
- [ ] Edge cases covered
- [ ] Performance acceptable
- [ ] Integration points clear
- [ ] Code is clean and readable

## Response Pattern

When starting feature work:

```
**Feature**: [What are we building?]

**Components to Implement**:
1. [Component A]
2. [Component B]
3. [Component C]

**TDD Approach**:
- Component A: [Which tests first]
- Component B: [Which tests first]
- Component C: [Which tests first]

**Current Cycle**:
- RED: [Test name we're failing]
- GREEN: [Minimal implementation approach]
- REFACTOR: [How to improve]

**Tracking**:
- [ ] Component A complete
- [ ] Component B complete
- [ ] Component C complete
- [ ] Integration tests pass
- [ ] Ready to merge
```

## Example: Implementing Analytics Export

**Feature**: Export analytics data to CSV

**Component 1: CSV Generation**

```python
# RED: Write failing test
def test_generates_csv_with_headers():
    data = [
        {"date": "2024-01", "revenue": 100},
        {"date": "2024-02", "revenue": 150}
    ]
    csv_string = generate_csv(data)
    assert "date,revenue" in csv_string
    assert "2024-01,100" in csv_string

# GREEN: Minimal implementation
def generate_csv(data):
    if not data:
        return ""
    headers = ",".join(data[0].keys())
    rows = [headers]
    for row in data:
        rows.append(",".join(str(v) for v in row.values()))
    return "\n".join(rows)

# REFACTOR: Use proper CSV library
import csv
import io

def generate_csv(data):
    if not data:
        return ""
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=data[0].keys())
    writer.writeheader()
    writer.writerows(data)
    return output.getvalue()
```

**Component 2: Export Button UI**

```python
# RED: Test button renders
def test_export_button_renders():
    from src.components import ExportButton
    button = ExportButton()
    assert button.label == "Export"

# GREEN: Minimal button
def ExportButton():
    return {"label": "Export"}

# REFACTOR: Proper component with click handler
def ExportButton(on_click):
    return {
        "label": "Export Analytics",
        "onClick": on_click,
        "disabled": False
    }
```

## Integration with Development

This skill coordinates with:
- **dev-workflow-flow**: Use during Stage 3 (Implementation)
- **dev-workflow-test-driven**: Alternative TDD approach for different contexts
- **review-plan**: Validate design before starting
- **dev-workflow-debug**: Debug failing tests systematically

## Common Pitfalls to Avoid

**Don't:**
- Write tests after implementation (defeats TDD purpose)
- Write overly complex tests upfront
- Skip refactoring phase
- Commit before all tests pass
- Implement more than needed to pass test
- Forget edge case tests

**Do:**
- Keep tests focused on one behavior
- Implement minimal code to pass test
- Refactor for clarity and performance
- Commit frequently (every 3-4 test cycles)
- Test edge cases alongside happy path
- Use time-boxing to maintain rhythm
