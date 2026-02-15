---
description: Write a commit message for the staged changes (`git diff --cached`).
---

# Commit Command

This command generates commit messages for staged changes following conventional commit format.

## What This Command Does

1. **Review Staged Changes** - Check git diff --cached
2. **Determine Type** - Classify commit (feat/fix/docs/etc.)
3. **Write Subject** - Concise summary under 50 characters
4. **Add Body** - Optional explanation if needed
5. **Use Natural Language** - Human-written style

## When to Use

Use `/commit` when:
- Ready to commit staged changes
- Need to write a commit message
- Want conventional commit format
- Following project git standards
- Creating atomic commits

## Commit Types

Choose the appropriate type:

- **feat** - New feature or functionality
- **fix** - Bug fix
- **docs** - Documentation changes
- **refactor** - Code restructuring without behavior change
- **chore** - Build, dependencies, tooling
- **test** - Adding or updating tests
- **perf** - Performance improvements
- **style** - Code formatting, whitespace

## Format

```
type(scope): subject line under 50 chars

Optional body explaining what and why (not how).
Wrap at 72 characters.

Can have multiple paragraphs.
```

## How It Works

1. **Run git diff --cached** to see staged changes
2. **Analyze changes** to understand what changed
3. **Choose commit type** based on change nature
4. **Write subject line** - imperative mood, under 50 chars
5. **Add body if needed** - explain why, not how
6. **Keep it human** - natural language, not AI-sounding

## Subject Line Rules

**Format:** `type(scope): brief description`

**Guidelines:**
- Use imperative mood: "add" not "added" or "adds"
- Lowercase first letter
- No period at the end
- Under 50 characters
- Be specific but concise

**Examples:**
- ✅ `feat(auth): add password reset flow`
- ✅ `fix(api): handle null response from service`
- ✅ `docs(readme): update installation steps`
- ❌ `feat(auth): Implemented password reset functionality` (too long, formal)
- ❌ `fixed bug` (missing type format, vague)

## Body Guidelines

**When to Add a Body:**
- Change needs context or explanation
- Non-obvious reasoning
- Breaking changes
- Complex refactoring

**When to Skip the Body:**
- Self-explanatory changes
- Obvious fixes
- Simple additions

**Body Content:**
- Explain WHY, not HOW
- Provide context
- Reference issues if relevant
- Keep lines under 72 characters

## Writing Style

**Language Guidelines:**
- Natural, simple, informal language
- Write like a human teammate, not AI
- Avoid overly formal or corporate tone
- Keep it conversational and direct

**Examples:**

❌ "Implement corrective measures for authentication flow redirection"
✅ "fix(auth): redirect to home after login"

❌ "Enhance the caching mechanism to optimize performance"
✅ "perf(cache): add Redis for session storage"

❌ "Successfully validate all user inputs"
✅ "feat(validation): add input sanitization"

## Examples

**Simple commit (no body):**
```
fix(login): handle empty username
```

**Commit with body:**
```
feat(api): add rate limiting middleware

Prevents abuse by limiting requests to 100/minute per IP.
Uses Redis to track request counts with 1-minute TTL.
```

**Bug fix with context:**
```
fix(parser): handle malformed JSON responses

The parser crashed when the API returned invalid JSON.
Now catches the error and returns a user-friendly message.
```

**Documentation update:**
```
docs(readme): update Python version requirement

Changed from 3.11 to 3.13 to match pyproject.toml.
```

## Quality Criteria

Commit messages should:
- **Follow format** - Conventional commits structure
- **Be concise** - Subject under 50 chars
- **Be specific** - Clear what changed
- **Sound human** - Natural language
- **Explain why** - If body included

## Integration with Other Commands

- Use `/tdd` to create code, then `/commit` when tests pass
- Use `/review` before committing
- Use `/humanize` if message sounds too formal
- Part of `/flow` integration stage

## Related Skills

- **dev-flow** - Part of integration workflow
- **review-system** - Review before commit
