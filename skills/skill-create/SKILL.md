---
name: skill-create
description: Create new Claude Code skills following 2026 best practices. Guides through structured skill creation with proper format, explicit instructions, and appropriate complexity.
---

# Create Custom Skills

## Purpose
Guide you through creating Claude Code skills that follow 2026 best practices: explicit instructions, structured format, contextual guidance, and appropriate complexity.

## When to Use
- Creating a new custom skill from scratch
- Converting workflow documentation into a reusable skill
- Need guidance on skill structure and best practices

## Process

### Step 1: Scope the Skill

Ask the user:

```
I'll help you create a new skill. Quick questions:

1. What task or workflow should this skill handle? (Be specific)
2. When should it be invoked? (Auto-trigger / Manual /skill-name)
3. Expected complexity? (Simple / Medium / Complex)
4. What's the output format?
```

### Step 2: Choose Architecture

Based on complexity:

**Simple (50-200 lines):** Single SKILL.md file
- Use for: Focused, single-purpose tasks
- Example: commit messages, code formatting, simple reviews

**Medium (200-500 lines):** Single SKILL.md with decision trees
- Use for: Multi-step workflows with conditionals
- Example: framework selection, ticket handling

**Complex (500-1000 lines):** Multi-file structure
- Use for: Multi-scenario workflows, reference materials
- Example: code review system, project inception
- Structure:
  ```
  skill-name/
  ├── SKILL.md       # Core instructions
  ├── REFERENCE.md   # Supplemental info
  └── templates/     # Reusable content (optional)
  ```

**Over 1000 lines:** Definitely split into multi-file

### Step 3: Generate Skill Content

Use this template:

```yaml
---
name: skill-name
description: Clear, specific description (1-2 sentences max)
---

# Skill Name

## Purpose
What this skill does and why (1-2 sentences)

## When to Use
- Trigger scenario 1
- Trigger scenario 2

## Process

### Step 1: [Action Name]
Clear, explicit instructions

**What to do:**
- Sub-step 1
- Sub-step 2

**If uncertain:** Ask user: "[exact question]"

### Step 2: [Next Action]
More instructions

**Decision logic:**
If [condition] → Do [action A]
Otherwise → Do [action B]

### Step 3: [Output]
Format the output

## Output Format

Example:
```
[Show exact output format]
```

## Examples

### Example 1: [Typical Case]
**Input:** [Show input]
**Output:** [Show output]

### Example 2: [Edge Case]
**Input:** [Show input]
**Output:** [Show output]

## Anti-Patterns to Avoid
- ❌ [Anti-pattern]: Why bad, what to do instead
- ❌ [Anti-pattern]: Why bad, what to do instead
```

### Step 4: Apply Best Practices Checklist

Verify the skill has:

**✓ Explicit Instructions**
- Every step says EXACTLY what to do (not vague)
- No assumptions about Claude's knowledge
- Clear success criteria

**✓ Contextual Guidance**
- Explains WHY steps matter (not just WHAT)
- Provides rationale for decisions

**✓ Uncertainty Handling**
- Includes "If unsure, ask user: [exact question]"
- Never forces guesses

**✓ Examples**
- At least 2 concrete examples
- Shows exact input → output
- Covers typical and edge cases

**✓ Appropriate Complexity**
- No over-engineering
- Complexity matches requirements
- Can be understood and maintained

### Step 5: Create Files

**For single-file:**
```bash
mkdir -p ~/.claude/skills/[skill-name]
# Write SKILL.md
```

**For multi-file:**
```bash
mkdir -p ~/.claude/skills/[skill-name]/{templates,scripts}
# Write SKILL.md, REFERENCE.md, etc.
```

### Step 6: Test the Skill

```
Test the skill with:
1. Typical use case: [scenario]
2. Edge case: [scenario]
3. Ambiguous input: Should ask for clarification

After 3-5 uses, track:
- Success rate (correct output %)
- Clarification rate (when it asks for help %)
- Context efficiency (tokens used)
```

## Detail Level Guide

**Core instructions:** VERY detailed
```
Bad:  "Write a commit message"
Good: "Run git diff --cached, write single-line commit using: type(scope): description"
```

**Context:** Moderate (explain WHY)
```
"Use conventional commits to enable automated changelog generation"
```

**Examples:** Highly detailed (exact format)
```
✓ feat(auth): add password reset
❌ "Added password reset" (missing type/scope)
```

**Edge cases:** Explicit handling OR ask user
```
If no staged files:
→ Ask: "No staged files. Stage all (git add .) or specific files?"
```

## Length Targets

- Simple: 50-200 lines (single purpose, 3-5 steps)
- Medium: 200-500 lines (multi-step, 5-10 steps, decision trees)
- Complex: 500-1000 lines (multi-scenario, 10+ steps)
- Over 1000: Split into multi-file

## Common Anti-Patterns

### ❌ Vague Instructions
**Bad:** "Be helpful with commits"
**Good:** "Run git diff --cached, write type(scope): description format"

### ❌ Kitchen Sink Skills
**Bad:** One skill for commits, PRs, review, docs, tests
**Good:** Separate focused skills for each

### ❌ No Examples
**Bad:** "Write commit messages following best practices"
**Good:** Show 2-3 concrete examples with ✓/❌ comparisons

### ❌ Forcing Guesses
**Bad:** "Determine the best approach and proceed"
**Good:** "If unclear, ask: 'What's your primary use case?'"

### ❌ No Context
**Bad:** "Use conventional commits"
**Good:** "Use conventional commits to enable automated changelog generation"

### ❌ Over-Engineering
**Bad:** "Create framework-agnostic abstraction with dependency injection"
**Good:** "Create single function, add error handling for specific failures"

## Example Output

For a commit message skill:

```yaml
---
name: commit
description: Write conventional commit messages for staged changes
---

# Commit Message Writer

## Purpose
Generate conventional commit messages following team standards

## When to Use
- After staging changes (git add)
- Need properly formatted commit message

## Process

### Step 1: Review Changes
Run git diff --cached and analyze:
- What files changed
- What functionality added/modified/removed
- Scope (auth, api, ui, etc.)

### Step 2: Determine Type
- feat: New feature
- fix: Bug fix
- refactor: Restructuring (no behavior change)
- docs: Documentation only

### Step 3: Write Message
Format: type(scope): description

Rules:
- Single line, under 72 characters
- Start with lowercase verb
- No period at end
- Present tense

## Output Format
```
type(scope): description
```

Example:
```
feat(auth): add password reset functionality
```

## Examples

### Example 1: Feature
**Changes:** src/auth/reset.py (new), src/api/routes.py (modified)
**Output:** `feat(auth): add password reset functionality`

### Example 2: Bug Fix
**Changes:** src/parser/tokenizer.py (modified)
**Output:** `fix(parser): handle empty string input`

## Anti-Patterns to Avoid
- ❌ Vague: "fixed stuff", "updates"
- ❌ Too long: Over 72 characters
- ❌ Multiple changes: One message for multiple features
```

## When to Revisit Skills

Update when:
- New Claude model version
- Failure rate drops below 90%
- Use case changes
- Better patterns discovered
- 6-month review cycle

## References

Based on: `docs/research/2026-02-16-claude-code-skills-best-practices.md`
