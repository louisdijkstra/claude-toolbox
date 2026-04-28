---
description: Generate QA testing steps for changes made in the current branch. Documents what was implemented and how to test it.
---

# QA Steps Command

This command analyzes branch changes and generates human-readable QA documentation.

## What This Command Does

1. **Analyze Changes** - Review git diff since branch diverged from main/dev
2. **Summarize Features** - Describe what was implemented
3. **Generate Test Steps** - Create actionable testing instructions
4. **Identify UI/Services** - Determine where to test (web UI, observability tools, orchestrators, etc.)
5. **Format Document** - Output concise, human-written style

## When to Use

Use `/qa-steps` when:
- Ready to hand off feature for testing
- Need QA documentation for a branch
- Want to document testing procedures
- Preparing for code review or merge
- Documenting feature completion

## How It Works

1. **Run git diff** against base branch (usually dev or main)
2. **Identify changed features** from code analysis
3. **Determine applicable UIs** (web UI, observability dashboards, orchestrators, etc.)
4. **Write feature summary** - high-level, minimal code references
5. **Create test steps** - specific actions to verify functionality
6. **Note limitations** - if feature can't be easily tested, say so
7. **Format naturally** - write like a human, not AI

## Output Format

```
## What was implemented

[Brief description of the feature/change in 2-4 lines.
Focus on user-facing impact, not implementation details.]

## Testing

[Step-by-step testing instructions:]

1. [Action to take]
2. [Expected result]
3. [How to verify it worked]

[If applicable:]
- Test in [web UI]: [specific steps]
- Check [observability dashboard]: [what to look for]
- Verify in [orchestrator]: [expected behavior]

[If not testable:]
This change can't be easily tested through the UI because [reason].
Verify by [alternative approach, e.g., code review, unit tests].
```

## Quality Criteria

QA steps must be:
- **Concise** - Brief feature description, focused test steps
- **Actionable** - Clear steps anyone can follow
- **Human-written** - Natural language, not AI-sounding
- **Specific** - Reference actual UIs and features
- **Honest** - Acknowledge if testing is difficult/impossible

## Writing Style

**DO:**
- Write like talking to a teammate
- Use simple, direct language
- Be specific about what to test
- List concrete steps
- Reference actual UI elements

**DON'T:**
- Use AI phrases like "implemented enhancements"
- Include excessive code references
- Write long technical explanations
- Use corporate/formal language
- Make vague statements

## Integration with Other Commands

- Use `/qa-steps` after completing a feature
- Use before `/mr` to document testing approach
- Use with `/review` to validate test coverage
- Reference in merge request descriptions

## Related Skills

- **docs-manager** - Documentation creation and maintenance
- **review-system** - Code review before QA
- **dev-flow** - Part of integration stage
