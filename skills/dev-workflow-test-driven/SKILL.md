---
name: test-driven-development
description: Complete TDD workflow with patterns for unit, integration, and end-to-end tests. Use when implementing new features or fixing bugs following test-first approach.
---

# Test-Driven Development

## Purpose

Implement features and fix bugs using complete test-driven development workflow. Ensures code quality through test-first approach with patterns for unit, integration, and end-to-end tests.

## When to Use This Skill

Use this skill when:
- Implementing new features with test coverage
- Fixing bugs (write failing test that reproduces bug first)
- Refactoring existing code safely
- Adding functionality to existing modules
- Need comprehensive test patterns (unit, integration, e2e)
- Building production code requiring quality assurance

**Do NOT use for:**
- Quick prototypes or experiments (add tests afterward)
- One-off scripts or throwaway code
- Emergency hotfixes requiring immediate fix (add tests after)
- When explicitly told to skip tests
- Exploratory coding where requirements are unclear

**If uncertain:** Use this skill for production code. Skip for experiments or emergencies, but add tests immediately afterward.

## Process

### Step 1: Write Failing Test
```python
def test_calculate_revenue_growth_returns_percentage():
    # Arrange
    start_revenue = 100_000
    end_revenue = 150_000
    
    # Act
    growth = calculate_revenue_growth(start_revenue, end_revenue)
    
    # Assert
    assert growth == 50.0  # 50% growth
```

Run test: `pytest tests/test_analytics.py::test_calculate_revenue_growth_returns_percentage`

Confirm it FAILS with clear error message.

### Step 2: Write Minimal Implementation
```python
def calculate_revenue_growth(start: float, end: float) -> float:
    return ((end - start) / start) * 100
```

### Step 3: Run Tests Until Green
```bash
pytest tests/test_analytics.py::test_calculate_revenue_growth_returns_percentage
```

### Step 4: Refactor if Needed
Improve code quality while keeping tests passing.

### Step 5: Commit
```bash
git add tests/test_analytics.py src/analytics.py
git commit -m "Add revenue growth calculation with tests"
```

## Test Organization

### Test Structure
```
tests/
├── unit/           # Fast, isolated tests
├── integration/    # Tests with database/external services
└── e2e/            # Full workflow tests
```

### Test Naming Convention
`test_<function_name>_<scenario>_<expected_result>`

Examples:
- `test_exclude_test_accounts_filters_correctly`
- `test_fetch_user_data_raises_error_when_not_found`
- `test_analytics_agent_handles_empty_dataset`

## Testing Patterns

### Arrange-Act-Assert (AAA)
Always structure tests this way:
```python
def test_example():
    # Arrange: Set up test data
    user = create_test_user(email="test@example.com")
    
    # Act: Execute the function
    result = authenticate_user(user.email, "password123")
    
    # Assert: Verify expectations
    assert result.is_authenticated is True
```

### Test Fixtures (pytest)
For shared setup:
```python
@pytest.fixture
def sample_analytics_data():
    return {
        "revenue": [100, 150, 200],
        "dates": ["2024-01", "2024-02", "2024-03"]
    }

def test_calculate_trend(sample_analytics_data):
    trend = calculate_trend(sample_analytics_data)
    assert trend == "increasing"
```

## Testing External Services

### APIs and LLMs: When to Mock vs Real Calls

**Use real API/LLM calls when:**
- Cost is minimal (few tokens, cheap endpoint)
- Request is fast (<1 second)
- Doesn't impact rate limits significantly
- Provides significantly better test coverage

**Use mocks when:**
- Expensive API calls (large context, expensive models)
- Slow endpoints (>2 seconds)
- Rate limits are a concern
- Testing error handling or edge cases

**Example - Real LLM call (cheap, fast):**
```python
def test_simple_classification_with_real_llm():
    # Small prompt, minimal tokens - use real call
    result = classify_sentiment("This is great!")
    assert result in ["positive", "negative", "neutral"]
```

**Example - Mocked LLM call (expensive):**
```python
from unittest.mock import patch

@patch('src.llm.generate_completion')
def test_complex_analysis_with_mock(mock_generate):
    # Large context, expensive model - use mock
    mock_generate.return_value = "Analysis: Revenue increased 50%"
    
    result = analyze_financial_report(large_document)
    
    assert "Revenue increased" in result
    mock_generate.assert_called_once()
```

**Balance cost vs confidence:**
- For critical paths, prefer real calls even if slightly more expensive
- For comprehensive test suites run frequently, prefer mocks
- Monitor test costs and adjust strategy accordingly

### Mocking External Services
```python
from unittest.mock import patch

@patch('src.integrations.external_api.fetch_data')
def test_process_external_data(mock_fetch):
    mock_fetch.return_value = {"sales": [100, 200]}
    
    result = process_data()
    
    assert result.total == 300
```

### Database Tests
Integration tests require running services:
```python
@pytest.mark.integration
def test_save_data_to_database():
    # Requires: docker-compose up -d or running database
    result = save_data({"metric": "revenue"})
    assert result.acknowledged is True
```

Run only unit tests: `pytest -m "not integration"`
Run all tests: `pytest`

### Testing Async Code
```python
@pytest.mark.asyncio
async def test_async_fetch_data():
    data = await fetch_data_async("item123")
    assert data.value is not None
```

## Edge Cases to Test

Always test:
- Empty inputs: `[]`, `""`, `None`
- Boundary conditions: `0`, `-1`, very large numbers
- Invalid inputs: wrong types, malformed data
- Error conditions: network failures, missing data

## Test Coverage

After implementing feature:
```bash
pytest --cov=src tests/
```

Aim for >80% coverage, but don't sacrifice test quality for coverage %.

## When NOT to Write Tests First

Only skip TDD if explicitly instructed, or for:
- Exploratory prototyping (still add tests afterward)
- One-off scripts
- Quick fixes in emergency (add tests immediately after)

## Debugging Failed Tests

1. Read error message carefully
2. Add print statements or use debugger: `pytest --pdb`
3. Run single test: `pytest tests/test_file.py::test_specific_test`
4. Check test setup (fixtures, mocks)

## Integration with Development

This skill coordinates with:
- **dev-workflow-flow**: Use during Stage 3 (Implement)
- **dev-workflow-tdd**: Alternative TDD approach for accelerated delivery
- **dev-workflow-debug**: Debug failing tests systematically
- **review-critical**: Verify test coverage before production
- **docs-manager**: Document testing patterns and conventions

## Common Pitfalls to Avoid

**Don't:**
- Write implementation before tests (defeats TDD purpose)
- Test implementation details instead of behavior
- Create overly complex test setups
- Skip testing edge cases and error conditions
- Sacrifice test readability for brevity
- Mock everything (balance real calls vs mocks)

**Do:**
- Write test first, then minimal implementation
- Test behavior, not implementation
- Keep tests simple and focused
- Test happy path, edge cases, and errors
- Write clear, maintainable tests
- Balance cost and confidence in mocking decisions