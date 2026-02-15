---
description: Take the previous answer and rewrite it so that it doesn't look like AI wrote it.
---

# Humanize Command

This command rewrites AI-sounding text to natural, human-written language.

## What This Command Does

1. **Identify AI Patterns** - Spot formal, corporate, or AI-sounding language
2. **Simplify Language** - Use natural, conversational words
3. **Remove Formality** - Strip out corporate speak
4. **Make It Direct** - Say things clearly and simply
5. **Sound Human** - Write like talking to a colleague

## When to Use

Use `/humanize` when:
- AI-generated text sounds too formal
- Writing for teammates or users
- Creating commit messages or PR descriptions
- Responding to tickets or comments
- Any text that will be read by people

## Automatic Application

Apply humanization automatically for:
- Review comments and responses
- Commit messages
- PR/MR descriptions
- Ticket updates and closure comments
- Documentation for end users
- Any team communication

## Writing Style Rules

**Use Simple, Natural Language:**
- Write like talking to a colleague
- Conversational and informal
- Direct and specific
- No corporate speak or formal tone

**Avoid AI Phrases:**
- ❌ "I've implemented"
- ❌ "leveraging"
- ❌ "utilize"
- ❌ "enhanced"
- ❌ "successfully validated"
- ❌ "implement corrective measures"
- ❌ Em-dashes (--)

**Avoid Unnecessary Details:**
- ❌ Specific line numbers unless really necessary
- ❌ Overly technical jargon
- ❌ Long explanations
- ✅ Keep it brief and clear

## Examples

**Commit Messages:**
- ❌ "Implement corrective measures for authentication flow redirection"
- ✅ "fix login redirect"

**Feature Descriptions:**
- ❌ "I've implemented enhancements to optimize the authentication flow"
- ✅ "Fixed the login redirect issue"

**Performance Changes:**
- ❌ "Leveraging the new caching mechanism to improve performance"
- ✅ "Added caching to make this faster"

**Testing Updates:**
- ❌ "The functionality has been successfully validated"
- ✅ "Tested and it works"

**Bug Fixes:**
- ❌ "Resolved the issue whereby users were experiencing difficulties"
- ✅ "Fixed the crash when logging out"

**Code Reviews:**
- ❌ "I would recommend implementing additional validation here"
- ✅ "Should validate the input here"

## What Makes Text Sound Like AI

**Formal/Corporate Tone:**
- "Implement", "utilize", "leverage"
- "Enhanced", "optimized", "streamlined"
- "Successfully", "effectively", "efficiently"
- "Whereby", "therefore", "furthermore"

**Over-explanation:**
- Stating obvious things
- Too much detail
- Multiple clauses
- Academic writing style

**Passive Voice:**
- "The functionality has been validated"
- "The issue was resolved"
- Use active voice: "Validated", "Fixed"

## How It Works

1. **Read previous response** or provided text
2. **Identify AI patterns** - formal language, corporate speak
3. **Simplify each sentence** - make it conversational
4. **Remove fluff** - cut unnecessary words
5. **Use active voice** - direct statements
6. **Be specific** - concrete details, not vague
7. **Read it back** - does it sound like a person wrote it?

## Quality Criteria

Humanized text should:
- **Sound natural** - Like a person talking
- **Be conversational** - Informal, friendly
- **Stay direct** - Get to the point
- **Use simple words** - No jargon or fancy terms
- **Feel authentic** - Not polished or corporate

## Integration with Other Commands

- Use `/humanize` after AI generates text
- Apply before `/commit` messages
- Use with `/mr` descriptions
- Apply to `/qa-steps` documentation
- Use for review comments

## Related Skills

- **docs-manager** - Documentation writing
- **context-manager** - Communication clarity
