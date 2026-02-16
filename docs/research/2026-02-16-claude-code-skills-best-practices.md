# Research: Claude Code Skills Best Practices

## Context
- Project: Claude Code CLI custom skills development
- Scale: Individual developer to team usage
- Constraints: Skills must load efficiently without overwhelming context window
- Goal: Create reusable, maintainable, and effective custom skills

## Research Question
What are the best practices for writing custom skills/prompts for Claude Code CLI in 2026, including optimal structure, length, detail level, and patterns to follow?

## Industry Standards (2026)

1. **Structured Format**: Skills use SKILL.md with YAML frontmatter for metadata and markdown for instructions
2. **Explicit Instructions**: Clear, direct instructions outperform vague or clever prompts
3. **Contextual Guidance**: Providing motivation behind instructions improves output quality
4. **Modular Architecture**: Complex skills split content across multiple files to manage context
5. **Uncertainty Handling**: Explicit permission for AI to express uncertainty reduces hallucinations
6. **Iterative Development**: Test prompts scientifically and iterate based on results

## Options Evaluated

### Option 1: Single-File Skills (Simple)
**Description**: All skill content in SKILL.md with YAML frontmatter + instructions

**Structure**:
```yaml
---
name: my-skill
description: Brief description for auto-loading
---
# Instructions
[Skill content here]
```

**Pros**:
- Simple to create and maintain
- Fast to load (single file)
- Easy to understand and debug
- Suitable for most use cases

**Cons**:
- Can become unwieldy for complex skills (>500 lines)
- No separation of concerns for multi-scenario skills
- Context window usage scales linearly with content

**Scale Fit**: Ideal for focused, single-purpose skills (80% of use cases)

**Sources**:
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills)
- [How to Create Custom Skills](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills)

### Option 2: Multi-File Skills (Complex)
**Description**: SKILL.md as entry point with supplementary files (REFERENCE.md, templates, scripts)

**Structure**:
```
my-skill/
├── SKILL.md           # Core instructions
├── REFERENCE.md       # Supplemental info for specific scenarios
├── templates/         # Reusable templates
└── scripts/           # Helper scripts
```

**Pros**:
- Better organization for complex workflows
- Context loaded on-demand (only what's needed)
- Clear separation of core vs. supplementary content
- Easier to maintain and update specific sections

**Cons**:
- More files to manage
- Requires understanding of when to split content
- Slightly more complex to create initially

**Scale Fit**: Best for complex, multi-scenario skills (code review, project inception, multi-tier workflows)

**Sources**:
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills)
- [Inside Claude Code Skills: Structure, prompts, invocation](https://mikhail.io/2025/10/claude-code-skills/)

### Option 3: Fork-Context Skills (Advanced)
**Description**: Skills that spawn sub-agents for research or parallel work

**Structure**:
```yaml
---
name: research-skill
description: Performs deep research
---
# Instructions
Use context: fork to spawn Explore agent for research tasks
[Detailed instructions]
```

**Pros**:
- Protects main context from excessive results
- Enables parallel task execution
- Specialized agents for specific tasks (Explore, Plan, Bash)

**Cons**:
- More complex to design
- Requires understanding of agent types
- Can be overkill for simple tasks

**Scale Fit**: Advanced skills that need specialized capabilities or context isolation

**Sources**:
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills)
- [Skills Explained: How Skills compares to prompts, Projects, MCP, and subagents](https://claude.com/blog/skills-explained)

## Recommended Approach

**For Most Skills (80% of cases): Single-File with Structured Format**

Use this template:

```yaml
---
name: skill-name
description: Clear, specific description for auto-loading (1-2 sentences)
---

# Skill Name

## Purpose
What this skill does and why it exists (1-2 sentences)

## When Invoked
Specific triggers or scenarios (bullet list)

## Process

### Step 1: [Action Name]
Clear, explicit instructions
- Sub-step 1
- Sub-step 2

### Step 2: [Action Name]
More explicit instructions

## Output Format
Exact structure expected (use code blocks for examples)

## Examples (Optional)
Real examples showing desired behavior
```

**Key Principles:**

1. **Be Explicit**: Say exactly what you want. "Write a commit message" is better than "help with commits"
2. **Provide Context**: Explain WHY ("to maintain consistency across team") not just WHAT
3. **Structure Clearly**: Use headings, bullets, numbered steps
4. **Allow Uncertainty**: Include phrases like "If unsure, ask the user" instead of forcing guesses
5. **Show Examples**: Real examples are worth 1000 words of description
6. **Test & Iterate**: Start simple, measure results, refine based on actual usage

**Length Guidelines:**
- Simple skills: 50-200 lines
- Medium skills: 200-500 lines
- Complex skills: 500-1000 lines (consider splitting into multi-file)
- Over 1000 lines: Definitely use multi-file approach

**Detail Level:**
- Core instructions: Very detailed, step-by-step
- Background context: Moderate detail (enough to understand WHY)
- Examples: Highly detailed (show exact format)
- Edge cases: Explicit handling or "ask user if uncertain"

**Sources**:
- [Prompt Engineering Best Practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices)
- [Claude Code Best Practices](https://code.claude.com/docs/en/best-practices)

## Anti-Patterns to Avoid

- ❌ **Vague Instructions**: "Be helpful" or "do your best" - Claude needs specifics
- ❌ **Over-Engineering**: Adding complexity "just in case" - start simple, add as needed
- ❌ **Implicit Expectations**: Assuming Claude knows your preferences - state them explicitly
- ❌ **Kitchen Sink Skills**: Trying to handle too many scenarios in one skill - split it up
- ❌ **No Examples**: Pure instruction without showing desired output format
- ❌ **Forcing Guesses**: Not allowing Claude to ask questions when uncertain
- ❌ **Clever Over Clear**: Using complex language or "AI tricks" instead of plain instructions
- ❌ **No Context**: Just WHAT to do without explaining WHY it matters

**Sources**:
- [Prompt Engineering Best Practices (2026)](https://promptbuilder.cc/blog/claude-prompt-engineering-best-practices-2026)
- [Avoid Over-Engineering Best Practice](https://claude.com/blog/best-practices-for-prompt-engineering)

## Testing Strategy

### Unit Testing (Skill Components)
Test individual steps or sections of your skill:
```bash
# Test a specific instruction step
echo "Test input" | claude-code --skill=my-skill
```

### Integration Testing (Full Workflow)
Run the complete skill on real-world scenarios:
- Create test cases representing typical usage
- Document expected outputs
- Compare actual vs. expected results
- Iterate on mismatches

### A/B Testing (Optimization)
Compare skill variations:
1. Create two versions (e.g., my-skill-v1, my-skill-v2)
2. Run same tasks through both
3. Measure quality, consistency, time
4. Keep the winner, incorporate learnings

### Metrics to Track
- Success rate: Did it produce correct output?
- Consistency: Same inputs → same outputs?
- User corrections: How often do users need to intervene?
- Context efficiency: How much context does it consume?

**Sources**:
- [Prompt Engineering Overview](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview)

## Monitoring & Observability

- **Invocation Frequency**: Track how often skill is used (indicates value)
- **Auto-Load Accuracy**: Does description trigger skill at right times?
- **User Satisfaction**: Collect feedback on skill usefulness
- **Context Usage**: Monitor tokens consumed per invocation
- **Error Patterns**: Track common failure modes or user corrections
- **Version History**: Keep changelog to understand what changes improved results

**Implementation**:
```bash
# Add logging to skill directory
echo "Invoked: $(date)" >> ~/.claude/skills/my-skill/usage.log
```

**Sources**:
- [Skills Explained Blog Post](https://claude.com/blog/skills-explained)

## Trade-offs Accepted

1. **Explicit Over Concise**: Skills are verbose to reduce ambiguity (readability > brevity)
2. **Repetition Over DRY**: Repeating context in multiple places vs. assuming Claude remembers
3. **Examples Over Abstraction**: Showing concrete examples vs. abstract rules
4. **Structure Over Flexibility**: Prescribed format vs. freeform instructions
5. **Safety Over Speed**: Asking for confirmation vs. making assumptions

These trade-offs prioritize reliability and maintainability over optimization.

## When to Revisit

Revisit this research when:

1. **New Claude Models**: Major model updates may change prompt engineering best practices
2. **Claude Code Updates**: New features or changes to skill system architecture
3. **Scale Changes**: Moving from personal use to team-wide skill library
4. **Effectiveness Drops**: Skills that worked well start producing inconsistent results
5. **New Patterns Emerge**: Community discovers better approaches or templates
6. **6-Month Review**: Prompt engineering evolves rapidly; review semi-annually

## References

### Official Documentation
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills)
- [How to Create Custom Skills - Claude Help](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills)
- [Prompt Engineering Best Practices - Claude API](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices)
- [Prompt Engineering Overview - Claude API](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview)
- [Agent Skills - Claude API Docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)

### Best Practices Guides
- [Claude Code Best Practices](https://code.claude.com/docs/en/best-practices)
- [Skills Explained: How Skills compares to prompts](https://claude.com/blog/skills-explained)
- [Prompt Engineering Best Practices (2026)](https://promptbuilder.cc/blog/claude-prompt-engineering-best-practices-2026)
- [Claude 4.x Prompt Engineering: A Practical Guide](https://ai-engineering-trend.medium.com/claude-4-x-prompt-engineering-a-practical-guide-for-medium-developers-4d1068ba0100)

### Community Resources
- [Anthropic Skills Repository](https://github.com/anthropics/skills)
- [Awesome Claude Skills (travisvn)](https://github.com/travisvn/awesome-claude-skills)
- [Claude Code System Prompts](https://github.com/Piebald-AI/claude-code-system-prompts)
- [Inside Claude Code Skills: Structure, prompts, invocation](https://mikhail.io/2025/10/claude-code-skills/)

### Additional Resources
- [The Complete Guide to Building Skills for Claude (PDF)](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf?hsLang=en)
- [32 Claude Code Tips: From Basics to Advanced](https://agenticcoding.substack.com/p/32-claude-code-tips-from-basics-to)
- [How I use Claude Code (+ my best tips)](https://www.builder.io/blog/claude-code)
