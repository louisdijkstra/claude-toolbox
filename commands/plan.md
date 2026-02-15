---
description: Restate requirements, assess risks, and create step-by-step implementation plan. Review with plan-review-system before implementation.
---

# Plan Command

This command creates a comprehensive implementation plan before writing any code, using the **plan-review-system** skill for validation.

## What This Command Does

1. **Restate Requirements** - Clarify what needs to be built
2. **Identify Risks** - Surface potential issues and blockers
3. **Create Step Plan** - Break down implementation into phases
4. **Review Plan** - Validate with plan-review-system skill
5. **Wait for Confirmation** - MUST receive user approval before proceeding

## When to Use

Use `/plan` when:
- Starting a new feature or major change
- Making significant architectural decisions
- Working on complex refactoring
- Multiple files/components will be affected
- Requirements are unclear or ambiguous
- Need structured approach to implementation

## How It Works

The planning process:

1. **Analyze the request** and restate requirements in clear terms
2. **Break down into phases** with specific, actionable steps
3. **Identify dependencies** between components
4. **Assess risks** and potential blockers
5. **Estimate complexity** (High/Medium/Low)
6. **Review with plan-review-system** for validation
7. **Present the plan** and WAIT for explicit confirmation

## Important Notes

**CRITICAL**: The plan will **NOT** proceed to implementation until you explicitly confirm with "yes", "proceed", or similar affirmative response.

If you want changes, respond with:
- "modify: [your changes]"
- "different approach: [alternative]"
- "add more detail to phase 2"

## Integration with Other Commands

After planning:
- Use `/tdd` to implement with test-driven development
- Use `/flow` to execute through dev-flow stages
- Use `/review` to review completed implementation
- Use `/build-fix` if build errors occur

## Related Skills

- **plan-review-system** - Multi-tier plan validation
- **dev-flow** - Development workflow stages
- **getting-the-bigger-picture** - Project context understanding
