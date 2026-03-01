---
name: ui-design-options
description: Use this skill when the user asks to "show UI options", "design choices for", "how could this look", "give me UI alternatives", "compare UI approaches", or wants to see multiple UI designs for a feature, screen, or task before committing to implementation.
version: 1.0.0
---

# UI Design Options

Generate multiple distinct UI design alternatives for a given task or feature, presented as markdown wireframes so the user can compare approaches before implementation.

The user describes a UI task, feature, or screen. They may specify their stack (React, plain HTML, etc.) or leave it open.

## Process

1. **Understand the task**: What does the UI need to accomplish? Who uses it?
2. **Generate 3 options**: Each must be genuinely different — not visual variants but distinct interaction patterns or information architectures.
3. **Present each as an ASCII wireframe** with a short rationale.
4. **Ask the user which to implement** using `AskUserQuestion`, or offer to blend elements.

## Output Format

For each option, produce:

```
## Option N — [Name / Concept]

**Approach**: One sentence describing the core UX philosophy.

**Wireframe**:
┌─────────────────────────────┐
│  [Header / Title]           │
├─────────────────────────────┤
│  [Content area]             │
│                             │
│  [ Action ]  [ Cancel ]     │
└─────────────────────────────┘

**Pros**: What this does well.
**Cons**: Trade-offs or limitations.
**Best for**: When to choose this.
```

## Design Principles

- Options must be **meaningfully different** — avoid presenting three versions of the same layout
- Vary the interaction model: e.g. wizard vs. inline vs. modal
- Consider progressive disclosure, one-task-per-screen, and density trade-offs
- Reference the user's existing stack when known from context
- After presenting options, use `AskUserQuestion` to ask which direction to pursue

## Directions to Explore

- **Minimal/inline**: Edit in place, no modals, low chrome
- **Wizard/stepper**: Guide user through steps sequentially
- **Dashboard/overview first**: Show state, then drill down into detail
- **Card-based**: Scannable layout, one action per card
- **Command palette / search-driven**: Keyboard-first, power-user oriented
- **Side panel / drawer**: Context preserved while editing
- **Full-screen focus**: Remove distractions, one task at a time
