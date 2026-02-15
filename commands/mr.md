---
description: Write a merge request description for the current branch's changes compared to dev.
---

# MR Command

This command generates merge request descriptions by analyzing branch changes.

## What This Command Does

1. **Compare Branches** - Run git diff against base branch
2. **Analyze Changes** - Identify what changed and why
3. **Write Description** - Create clear, conversational MR text
4. **Save Documentation** - Store in docs/ directory
5. **Use Human Style** - Write naturally, not like AI

## When to Use

Use `/mr` when:
- Ready to create a merge request
- Need to document branch changes
- Preparing for code review
- Want to explain changes to teammates
- Completing a feature or bug fix

## How It Works

1. **Run git diff dev...HEAD** (or main...HEAD)
2. **Identify key changes** from diff analysis
3. **Understand the why** - purpose and motivation
4. **Write conversationally** - like explaining to a teammate
5. **Save to docs/** in format: `docs/<branch-name>/mr_<summary>.md`

## Output Format

```
# [Feature/Fix Name]

[Opening paragraph explaining what this MR does and why.
Written conversationally, like talking to a colleague.]

## What Changed

[Mix of prose and lists explaining the changes:]

- [Change 1 with context]
- [Change 2 with reasoning]

[More detailed explanation if needed, but keep it natural.]

## Testing

[How this was tested or should be tested]

## Notes

[Any caveats, follow-up work, or things reviewers should know]
```

## Writing Style

**Language Guidelines:**
- Conversational and natural - like talking to a teammate
- Mix prose and lists naturally
- Simple, informal language - not corporate speak
- Write like a human, not AI
- Avoid phrases like "implemented enhancements"
- Be direct and specific

**Examples:**

❌ "Implemented enhancements to optimize the authentication flow"
✅ "Fixed the login redirect issue"

❌ "Leveraged new caching mechanism to improve performance"
✅ "Added caching to make this faster"

❌ "The functionality has been successfully validated"
✅ "Tested and it works"

## File Naming

Save to: `docs/<branch-name>/mr_<3-4 word summary>.md`

Examples:
- `docs/feature/auth-fix/mr_fix_login_redirect.md`
- `docs/bug/cache-issue/mr_add_redis_caching.md`
- `docs/refactor/cleanup/mr_simplify_api_handlers.md`

## Quality Criteria

MR descriptions must be:
- **Clear** - Obvious what changed and why
- **Conversational** - Natural, human tone
- **Specific** - Concrete details, not vague statements
- **Complete** - Covers changes, testing, context
- **Honest** - Acknowledge limitations or follow-up needed

## Integration with Other Commands

- Use `/qa-steps` before `/mr` to document testing
- Use `/review` before creating MR
- Use `/humanize` on AI-generated text before MR
- Reference in actual merge request

## Related Skills

- **docs-manager** - Documentation creation
- **review-system** - Pre-MR code review
- **dev-flow** - Part of integration stage
