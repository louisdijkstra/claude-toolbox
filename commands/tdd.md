---
description: Enforce test-driven development workflow. Write tests FIRST, then implement minimal code to pass. Ensure proper coverage.
---

# TDD Command

This command enforces test-driven development methodology using the **test-driven-development** and **dev-tdd** skills.

## What This Command Does

1. **Define Interfaces** - Scaffold types/interfaces first
2. **Write Tests First** - Create failing tests (RED)
3. **Implement Minimal** - Write just enough to pass (GREEN)
4. **Refactor** - Improve code while keeping tests green (REFACTOR)
5. **Verify Coverage** - Ensure adequate test coverage

## When to Use

Use `/tdd` when:
- Implementing new features
- Adding new functions/components
- Fixing bugs (write test that reproduces bug first)
- Refactoring existing code
- Building critical business logic

## TDD Cycle

```
RED → GREEN → REFACTOR → REPEAT

RED:      Write a failing test
GREEN:    Write minimal code to pass
REFACTOR: Improve code, keep tests passing
REPEAT:   Next feature/scenario
```

## How It Works

1. **Define interfaces** for inputs/outputs
2. **Write tests that will FAIL** (because code doesn't exist yet)
3. **Run tests** and verify they fail for the right reason
4. **Write minimal implementation** to make tests pass
5. **Run tests** and verify they pass
6. **Refactor** code while keeping tests green
7. **Check coverage** and add more tests if needed

## TDD Best Practices

**DO:**
- Write the test FIRST, before any implementation
- Run tests and verify they FAIL before implementing
- Write minimal code to make tests pass
- Refactor only after tests are green
- Add edge cases and error scenarios
- Aim for appropriate coverage

**DON'T:**
- Write implementation before tests
- Skip running tests after each change
- Write too much code at once
- Ignore failing tests
- Test implementation details (test behavior)
- Mock everything (prefer integration tests when appropriate)

## Test Types to Include

**Unit Tests** (Function-level):
- Happy path scenarios
- Edge cases (empty, null, max values)
- Error conditions
- Boundary values

**Integration Tests** (Component-level):
- API endpoints
- Database operations
- External service calls
- React components with hooks

## Important Notes

**MANDATORY**: Tests must be written BEFORE implementation. The TDD cycle is:

1. **RED** - Write failing test
2. **GREEN** - Implement to pass
3. **REFACTOR** - Improve code

Never skip the RED phase. Never write code before tests.

## Integration with Other Commands

- Use `/plan` first to understand what to build
- Use `/tdd` to implement with tests
- Use `/build-fix` if build errors occur
- Use `/review` to review implementation

## Related Skills

- **test-driven-development** - Complete TDD workflow
- **dev-tdd** - Accelerated TDD for rapid delivery
- **dev-flow** - Integration with development stages
