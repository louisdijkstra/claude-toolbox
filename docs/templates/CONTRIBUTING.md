# Contributing Guide

> Thank you for contributing to [Project Name]! This guide will help you contribute effectively.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Review Process](#review-process)
- [Community](#community)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all.

**Expected behavior:**
- Be respectful and inclusive
- Welcome newcomers and help them learn
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy toward other community members

**Unacceptable behavior:**
- Harassment, discrimination, or trolling
- Personal attacks or insults
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

**Enforcement:**
Instances of abusive behavior may be reported to [email@example.com]. All complaints will be reviewed and investigated.

---

## Getting Started

### Prerequisites

Before contributing, make sure you:

1. **Read the documentation**
   - [README.md](../README.md) - Project overview
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
   - [SETUP.md](./SETUP.md) - Local development setup

2. **Set up your development environment**
   - Follow the [setup guide](./SETUP.md)
   - Verify tests pass: `[test command]`
   - Verify linter passes: `[lint command]`

3. **Understand the project**
   - Explore the codebase
   - Run the application locally
   - Try out key features

### First-Time Contributors

**Good first issues:**
- Look for issues labeled `good first issue` or `help wanted`
- These are beginner-friendly tasks with clear scope
- Comment on the issue to claim it

**Getting help:**
- Ask questions in [GitHub Discussions](link)
- Join our [Slack/Discord](link)
- Tag maintainers in your PR for guidance

---

## How to Contribute

### Types of Contributions

We welcome many types of contributions:

**Code contributions:**
- Bug fixes
- New features
- Performance improvements
- Refactoring
- Test coverage improvements

**Non-code contributions:**
- Documentation improvements
- Bug reports
- Feature requests
- Design suggestions
- Translations
- Community support

### Before You Start

**For bug fixes:**
1. Search existing issues to avoid duplicates
2. Create an issue describing the bug
3. Wait for maintainer confirmation
4. Implement the fix

**For new features:**
1. Create a feature request issue
2. Discuss the feature with maintainers
3. Wait for approval before starting work
4. Large features may require a design document

**For documentation:**
1. Small fixes (typos, clarity): Submit PR directly
2. Large changes: Create issue first to discuss

---

## Development Workflow

### Step 1: Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/[repo].git
cd [repo]

# Add upstream remote
git remote add upstream https://github.com/[org]/[repo].git
```

### Step 2: Create a Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
# OR
git checkout -b fix/bug-description
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/improvements

### Step 3: Make Changes

**Development cycle:**
```bash
# Make changes to code

# Run tests frequently
[test command]

# Run linter
[lint command]

# Fix linting issues
[lint fix command]
```

**Best practices:**
- Make small, focused commits
- Write tests for new functionality
- Update documentation as needed
- Follow coding standards (see below)

### Step 4: Test Your Changes

**Run full test suite:**
```bash
# Unit tests
[test command]

# Integration tests
[integration test command]

# Linter
[lint command]

# Type checker (if applicable)
[type check command]
```

**Manual testing:**
- Test the feature in the UI/API
- Test edge cases
- Test error scenarios
- Verify no regressions

### Step 5: Commit Changes

```bash
# Stage changes
git add [files]

# Commit with conventional commit message
git commit -m "feat: add user profile export feature"
```

See [Commit Guidelines](#commit-guidelines) below.

### Step 6: Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub
# Fill out the PR template
```

---

## Code Standards

### General Principles

**Write clean code:**
- Readable over clever
- Self-documenting with meaningful names
- Small, focused functions
- Clear separation of concerns
- No premature optimization

**Follow project conventions:**
- Match existing code style
- Use project's naming conventions
- Follow architectural patterns
- Respect module boundaries

### Language-Specific Standards

**[Language] (e.g., Python, TypeScript, etc.):**

**Code style:**
```[language]
// Good example
function calculateTotalPrice(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Bad example
function calc(x) {
  let s = 0;
  for (let i = 0; i < x.length; i++) {
    s = s + x[i].price;
  }
  return s;
}
```

**Naming conventions:**
- Variables: `camelCase`
- Functions: `camelCase`
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Private members: `_leadingUnderscore`

**File organization:**
```
src/
├── components/     # Reusable components
├── services/       # Business logic
├── utils/          # Helper utilities
└── types/          # Type definitions
```

### Testing Standards

**Test coverage:**
- New features: 80%+ coverage
- Bug fixes: Include regression test
- Critical paths: 100% coverage

**Test structure:**
```[language]
describe('FeatureName', () => {
  describe('methodName', () => {
    it('should handle normal case', () => {
      // Arrange
      const input = createTestData();

      // Act
      const result = methodName(input);

      // Assert
      expect(result).toBe(expectedValue);
    });

    it('should handle edge case', () => {
      // ...
    });

    it('should throw error for invalid input', () => {
      // ...
    });
  });
});
```

**Test naming:**
- Describe what the test does
- Use `should` or `when/then` format
- Make failures self-explanatory

### Documentation Standards

**Code comments:**
```[language]
/**
 * Calculate the total price including tax.
 *
 * @param items - Array of items to price
 * @param taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @returns Total price with tax applied
 * @throws {ValidationError} If items array is empty
 *
 * @example
 * ```
 * const total = calculateTotal([item1, item2], 0.08);
 * ```
 */
function calculateTotal(items: Item[], taxRate: number): number {
  // Implementation
}
```

**When to comment:**
- Complex algorithms: Explain the "why"
- Non-obvious solutions: Explain the reasoning
- Workarounds: Explain the issue and solution
- TODOs: Include ticket number and context

**When NOT to comment:**
- Self-explanatory code
- Repeating what code already says
- Outdated information

---

## Commit Guidelines

### Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Commit Types

| Type | Purpose | Example |
|------|---------|---------|
| `feat` | New feature | `feat(auth): add OAuth2 login` |
| `fix` | Bug fix | `fix(api): handle null response` |
| `docs` | Documentation | `docs(readme): update setup instructions` |
| `style` | Formatting | `style(lint): fix indentation` |
| `refactor` | Code restructuring | `refactor(services): extract helper` |
| `test` | Tests | `test(auth): add login edge cases` |
| `chore` | Maintenance | `chore(deps): update dependencies` |
| `perf` | Performance | `perf(api): cache frequent queries` |

### Commit Message Rules

**Do:**
- Use imperative mood: "add" not "added" or "adds"
- Keep subject line under 72 characters
- Explain *what* and *why*, not *how*
- Reference issues: `fixes #123` or `relates to #456`

**Don't:**
- End subject with period
- Use vague messages like "fix bug" or "update code"
- Mention AI assistance
- Include multiple unrelated changes

### Examples

**Good commits:**
```bash
feat(export): add CSV export with special character escaping

Implements CSV export feature with RFC 4180 compliance.
Handles edge cases: empty data, special characters, large datasets.

Closes #234

---

fix(auth): prevent token refresh race condition

Multiple simultaneous requests could cause token refresh conflicts.
Added mutex lock to serialize refresh operations.

Fixes #567

---

docs(api): add examples for pagination endpoints

Added request/response examples and parameter descriptions
to improve API documentation clarity.
```

**Bad commits:**
```bash
# Too vague
fix: bug fix

# Not imperative
fixed: fixed the login bug

# Multiple unrelated changes
feat: add export and fix login and update readme

# Mentions AI
feat: add feature (implemented with Claude)
```

---

## Pull Request Process

### Before Submitting

**Pre-submission checklist:**
- [ ] Code follows project standards
- [ ] All tests passing
- [ ] Linter passing
- [ ] Documentation updated
- [ ] Commit messages follow conventions
- [ ] Branch is up-to-date with main
- [ ] No merge conflicts

### PR Title and Description

**PR title:**
Follow conventional commit format:
```
feat(auth): add OAuth2 authentication
```

**PR description template:**
```markdown
## What Changed
[Clear description of what was changed]

## Why
[Business/technical reason for the change]

## How
[Brief explanation of implementation approach]

## Testing
- [x] Unit tests added/updated
- [x] Integration tests passing
- [x] Manual testing completed
- [x] No regressions detected

## Screenshots (if UI changes)
[Add screenshots or video]

## Breaking Changes
[None / List breaking changes with migration guide]

## Related Issues
Closes #[issue number]

## Checklist
- [x] Tests added/updated
- [x] Documentation updated
- [x] Follows project conventions
- [x] Self-reviewed
- [x] No breaking changes (or documented)
```

### PR Size Guidelines

**Keep PRs small:**
- Target: <300 lines changed
- Max: <500 lines changed
- Large changes: Split into multiple PRs

**If PR is large:**
- Explain why in description
- Consider splitting into smaller PRs
- Request extra review time

### Draft PRs

**Use draft PRs for:**
- Work in progress
- Getting early feedback
- Complex changes needing discussion

**Convert to ready when:**
- All checklist items complete
- Ready for full review
- CI passing

---

## Review Process

### What Reviewers Look For

**Code quality:**
- Correctness and logic
- Edge case handling
- Error handling
- Code clarity and maintainability

**Tests:**
- Coverage of new functionality
- Test quality and clarity
- Edge cases tested

**Documentation:**
- README updated if needed
- Code comments for complex logic
- API docs updated

**Architecture:**
- Follows project patterns
- No unnecessary complexity
- Proper separation of concerns

### Review Timeline

**Expected timeline:**
- Small PRs (<100 lines): 1-2 days
- Medium PRs (100-300 lines): 2-4 days
- Large PRs (>300 lines): 4-7 days

**If no response in 7 days:**
- Comment asking for review
- Tag relevant maintainers
- Join community chat for visibility

### Addressing Feedback

**Responding to reviews:**
- Be receptive to feedback
- Ask questions if unclear
- Push new commits (don't force-push during review)
- Mark conversations as resolved

**Making changes:**
```bash
# Make requested changes
git add [files]
git commit -m "refactor: address review feedback"
git push origin feature/your-feature

# Request re-review on GitHub
```

### Approval and Merge

**Merge requirements:**
- At least 1 approval from maintainer
- All CI checks passing
- All conversations resolved
- Branch up-to-date with main

**Merge process:**
- Maintainer will merge when ready
- Squash merge or merge commit (maintainer decides)
- Branch automatically deleted after merge

---

## Community

### Getting Help

**Ask questions:**
- [GitHub Discussions](link) - General questions
- [Slack/Discord](link) - Real-time chat
- [Stack Overflow](link) - Technical questions (tag: `project-name`)

**Report bugs:**
- [GitHub Issues](link)
- Include reproduction steps
- Include error messages
- Include environment details

### Staying Updated

**Follow project updates:**
- Watch the repository on GitHub
- Join mailing list: [link]
- Follow on Twitter: [@project]
- Read the changelog: [CHANGELOG.md](./CHANGELOG.md)

### Recognition

**Contributors are recognized:**
- Listed in [CONTRIBUTORS.md](./CONTRIBUTORS.md)
- Mentioned in release notes
- Invited to contributor events
- Eligible for swag/rewards

---

## License

By contributing, you agree that your contributions will be licensed under the [License Name] License.

---

**Thank you for contributing!** 🎉

Your contributions make this project better for everyone.

---

**Questions?**
- 📖 [Documentation](./docs/)
- 💬 [Discussions](https://github.com/[org]/[repo]/discussions)
- 📧 [Maintainers](mailto:maintainers@example.com)

Last Updated: YYYY-MM-DD
