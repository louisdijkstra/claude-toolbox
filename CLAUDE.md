## Communication Preferences
- Concise, technical responses
- Use GitHub-flavored markdown for formatting
- Reference code with file_path:line_number format
- No emojis unless explicitly requested
- No colon before tool calls

## Development Philosophy
- Clarity over cleverness
- No premature abstraction or speculative features
- Replace, don't deprecate
- Prefer boring, proven technology
- Ship working code, then iterate
- Avoid over-engineering

## Code Quality Principles (Language-Agnostic)
- Write self-documenting code with meaningful names
- Keep functions small and single-purpose
- Comments explain "why", not "what"
- Avoid unnecessary complexity
- Follow consistent naming conventions within each project
- Prioritize readability and maintainability

## Git Workflow
- Use conventional commit format: type(scope): description
- Keep commit messages to a single line
- Make commits atomic and focused
- Branch naming: feature/*, bug/*, refactor/*
- Never mention AI assistance in commits or pull requests

## Testing Philosophy
- Test critical paths and edge cases
- Prefer simple, maintainable tests over comprehensive coverage
- Don't over-test trivial code
- Tests should document expected behavior
- Keep testing proportional to risk

## Security Mindset
- Validate input at system boundaries
- Never commit secrets, credentials, or sensitive data
- Consider OWASP Top 10 vulnerabilities
- Implement proper error handling without leaking implementation details
- Use secure defaults

## Code Review Standards
- Review for correctness, clarity, and security first
- Challenge unnecessary complexity
- Verify tests cover new functionality
- Check for performance implications
- Ensure changes align with project goals

## Custom Abbreviations
- DCAC = "Don't change any code"
