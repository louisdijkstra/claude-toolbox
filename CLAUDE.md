## Philosophy
- Clarity over cleverness
- No premature abstraction or speculative features
- Replace, don't deprecate
- Prefer boring, proven technology
- Ship working code, then iterate
- Avoid over-engineering

## Communication
- Concise, technical responses
- GitHub-flavored markdown
- Reference code with file_path:line_number
- No emojis unless explicitly requested
- No colon before tool calls

## Code
- Self-documenting code with meaningful names
- Small, single-purpose functions
- Comments explain "why", not "what"
- Avoid unnecessary complexity
- Consistent naming within each project
- Prioritize readability and maintainability
- Imports at top of file (except lazy loading for infrequent modules)
- Comments/docstrings describe current logic, not change history

## Git
- Conventional commits: type(scope): description
- Single-line commit messages, atomic commits
- Branch naming: feature/*, bug/*, refactor/*
- Never mention AI assistance in commits or PRs
- Human-sounding messages (commit, MR, Teams)
- Don't mention tests passing in MRs (assumed)
- Don't suggest commits (user decides)
- Don't add TDD/best-practice comments
- No cost estimates; careful with time estimates

## Testing
- Default to TDD: write a failing test first, then implement (applies to new features and bug fixes)
- Use `setup-testing` skill to bootstrap test infrastructure; use `tdd` / `dev-workflow-tdd` for day-to-day TDD cycles
- Test critical paths and edge cases
- Simple, maintainable tests over high coverage
- Don't over-test trivial code
- Tests document expected behavior
- Testing proportional to risk

## Security
- Validate input at boundaries
- Never commit secrets or credentials
- Consider OWASP Top 10
- Error handling without leaking implementation details
- Secure defaults

## Code Review
- Correctness, clarity, security first
- Challenge unnecessary complexity
- Verify tests cover new functionality
- Check performance impact
- Align with project goals

## Abbreviations
- DCAC = "Don't change any code"
