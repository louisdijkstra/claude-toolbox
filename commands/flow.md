---
description: Execute efficient daily development workflow with clear stages and operational modes. Maintains momentum through planning to integration.
---

# Flow Command

This command structures work sessions using the **dev-flow** skill with defined stages and operational modes.

## What This Command Does

1. **Select Mode** - Choose operational mode (deep-work, quick-fix, etc.)
2. **Execute Stages** - Progress through development stages
3. **Maintain Momentum** - Keep moving forward systematically
4. **Track Progress** - Monitor current stage and next steps

## Development Stages

1. **Plan** - Define scope and approach
2. **Design** - Architecture and structure
3. **Implement** - Write the code
4. **Test** - Validate functionality
5. **Review** - Quality and security checks
6. **Integrate** - Merge and deploy

## Operational Modes

**deep-work** - Focused, uninterrupted development
- Long coding sessions
- Complex features
- Architectural work

**quick-fix** - Rapid bug fixes and minor changes
- Time-boxed fixes
- Low-risk changes
- Hotfixes

**collaboration** - Team coordination and code review
- Pair programming
- Code reviews
- Knowledge sharing

**debugging** - Systematic problem investigation
- Bug investigation
- Performance analysis
- Root cause discovery

## When to Use

Use `/flow` when:
- Starting a new work session
- Need structured approach to development
- Working on multi-stage features
- Want to maintain consistent momentum
- Coordinating complex changes

## How It Works

1. **Assess current state** - Where are we in the workflow?
2. **Select appropriate mode** - Which mode fits the task?
3. **Execute current stage** - What needs to happen now?
4. **Validate completion** - Is this stage done?
5. **Progress to next stage** - Move forward systematically

## Stage Transitions

Each stage has clear entry/exit criteria:
- **Plan → Design**: Requirements clear, scope defined
- **Design → Implement**: Architecture decided, interfaces defined
- **Implement → Test**: Code written, ready for validation
- **Test → Review**: Tests passing, coverage adequate
- **Review → Integrate**: Quality checks passed, approval received

## Integration with Other Commands

- Use `/plan` for detailed planning in Plan stage
- Use `/tdd` for test-driven implementation
- Use `/review` for comprehensive review stage
- Use `/debug` when in debugging mode
- Use `/build-fix` to resolve build issues

## Related Skills

- **dev-flow** - Complete development workflow system
- **dev-tdd** - Accelerated TDD workflow
- **systematic-debugging** - Debugging mode support
