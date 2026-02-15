---
name: docs-manager
description: Create, maintain, and update project documentation for clarity and consistency. Ensure docs stay synchronized with codebase. Use when creating new docs, updating existing docs, or managing documentation structure.
---

# Docs Manager

## Purpose

Maintain high-quality project documentation that stays synchronized with the codebase. Ensure documentation is discoverable, clear, and immediately useful to users and developers.

## When to Use This Skill

Use this skill when:
- Creating new documentation
- Updating existing docs
- Documentation is out of sync with code
- Need consistent documentation structure
- Organizing or restructuring docs directory
- Ensuring docs are discoverable

**Do NOT use for:**
- Quick inline code comments (use code comments)
- Commit messages (use git commit skill)
- PR descriptions (use MR skill)

## How It Works

### 1. Assess Current Documentation State

```bash
# See what documentation exists
ls -la docs/
find docs -type f -name "*.md" | sort

# Check for outdated documentation
grep -r "TODO\|FIXME\|outdated\|deprecated" docs/ 2>/dev/null

# Verify documentation is discoverable
cat docs/README.md 2>/dev/null || echo "No main README"
```

### 2. Plan Documentation Structure

Standard documentation structure:

```
docs/
├── README.md              # Entry point - what docs exist
├── PROJECT_DESCRIPTION.md # Project overview
├── ARCHITECTURE.md        # System design
├── API.md                 # API reference
├── CONTRIBUTING.md        # How to contribute
├── SETUP.md              # Installation/setup
├── GUIDES/               # How-to guides
│   ├── feature-1.md
│   └── feature-2.md
├── DECISIONS/            # Architecture decision log
│   ├── 2024-01-15-use-x.md
│   └── 2024-02-01-do-y.md
└── research/             # Research findings
    └── topic-slug.md
```

### 3. Create/Update Documentation

#### Main README (docs/README.md)

```markdown
# [Project Name] Documentation

## Quick Links
- [Setup Guide](./SETUP.md)
- [Project Overview](./PROJECT_DESCRIPTION.md)
- [Architecture](./ARCHITECTURE.md)
- [API Reference](./API.md)

## For Developers
- [Architecture Decisions](./DECISIONS/)
- [Contributing Guide](./CONTRIBUTING.md)
- [How-To Guides](./GUIDES/)

## For Users
- [Getting Started](./SETUP.md)
- [Feature Guides](./GUIDES/)
- [FAQ](./FAQ.md)

## Latest Updates
- [Date]: [What changed]
- [Date]: [What changed]
```

#### Architecture Document (docs/ARCHITECTURE.md)

```markdown
# Architecture Overview

## System Components
- [Component 1]: [Purpose and responsibilities]
- [Component 2]: [Purpose and responsibilities]

## Data Flow
[Diagram or description of how data flows through system]

## Integration Points
- [Integration 1]: [How it works]
- [Integration 2]: [How it works]

## Technology Stack
- [Technology]: [Why we chose it]
- [Technology]: [Why we chose it]

## Scalability Considerations
[How system scales as load increases]

## Security Considerations
[How we handle security]

## Known Limitations
- [Limitation 1]
- [Limitation 2]
```

#### Decision Log (docs/DECISIONS/YYYY-MM-DD-decision-slug.md)

```markdown
# Decision: [Decision Title]

Date: YYYY-MM-DD
Status: Accepted / Pending / Rejected

## Problem
[What problem does this solve?]

## Alternatives Considered
1. [Alternative 1]
   - Pros: [...]
   - Cons: [...]

2. [Alternative 2]
   - Pros: [...]
   - Cons: [...]

## Chosen Approach
[Which alternative and why?]

## Implementation Details
[How was it implemented?]

## Impact
- [Who is affected?]
- [What changes as a result?]
- [What monitoring is needed?]

## References
- [Link to related code]
- [Link to related docs]
```

#### How-To Guide (docs/GUIDES/feature-name.md)

```markdown
# How To: [Feature Name]

## Overview
[What is this feature and when would you use it?]

## Prerequisites
- [Requirement 1]
- [Requirement 2]

## Step-by-Step
1. [Step 1 with example]
   ```bash
   command here
   ```

2. [Step 2 with example]
   ```bash
   command here
   ```

3. [Step 3 with example]

## Expected Output
[What should you see when successful?]

## Troubleshooting

### Problem 1: [What goes wrong]
**Solution**: [How to fix it]

### Problem 2: [What goes wrong]
**Solution**: [How to fix it]

## See Also
- [Related feature]
- [Related guide]
```

### 4. Keep Documentation Synchronized

After code changes:

```bash
# Find documentation that might need updates
grep -r "function_name\|module_name" docs/

# Update affected documentation
# Check: Is the example still valid?
# Check: Is the description still accurate?
# Check: Are links still correct?

# Add note about what changed
cat >> docs/README.md << 'EOF'
- [Date]: Updated [what] because [reason]
EOF
```

### 5. Verify Documentation Quality

Before considering documentation complete:

```bash
# Check markdown syntax
# (Use online markdown validator or local tool)

# Verify all links work
grep -r "](\./" docs/ | while read line; do
  url=$(echo "$line" | grep -oE '\]\([^)]+\)' | tr -d ']([)')
  if [ ! -f "docs/$url" ]; then
    echo "Broken link: $url"
  fi
done

# Ensure examples are current
# (Run code examples to verify they work)

# Check for outdated information
grep -r "old\|deprecated\|TODO" docs/
```

## Documentation Checklist

For each documentation file:

- [ ] Title is clear and descriptive
- [ ] Purpose is stated upfront
- [ ] Examples are current and tested
- [ ] All code samples are correct
- [ ] Links are relative and working
- [ ] Formatted consistently with other docs
- [ ] Version/date information is clear
- [ ] Discoverable from README.md
- [ ] No TODO or FIXME comments

## Response Pattern

When managing documentation:

```
**Documentation Task**: [What needs to be documented?]

**Current State**:
- [What documentation exists]
- [What's missing]
- [What's outdated]

**Plan**:
1. [File to create/update]
2. [File to create/update]
3. [Verification steps]

**Changes**:
- Created: [file]
- Updated: [file]
- Verified: [file]

**Results**:
- All documentation synchronized
- Discoverable from README.md
- Examples tested and current
```

## Examples

### Example: Documenting New Feature

**Feature**: Implemented CSV export for analytics

**Documentation needed**:
1. Add to ARCHITECTURE.md (new component)
2. Create GUIDES/export-analytics.md (how-to guide)
3. Update API.md (new endpoint)
4. Add decision log (why CSV format)

**Process**:
1. Write decision: Why CSV over JSON/Parquet?
2. Update architecture: Where export component fits
3. Create how-to guide: How users export data
4. Update API docs: /export endpoint parameters
5. Verify examples work
6. Add to README.md "Latest Updates"

### Example: Synchronizing Outdated Docs

**Found**: API.md shows old endpoint parameters

**Process**:
1. Check current code for actual parameters
2. Compare to documentation
3. Identify what changed
4. Update documentation
5. Add to decision log: "API v2 parameter changes"
6. Add note in README: "Updated API.md 2024-02-15"
7. Verify examples still work

## Integration with Development

This skill pairs well with:
- **Getting the Bigger Picture**: Read docs to understand project
- **Brainstorm Feature**: Document feature ideas
- **Dev Flow**: Document decisions as development happens
- **Review Critically**: Ensure API docs match implementation

## Common Pitfalls to Avoid

**Don't:**
- Write documentation without code (inconsistency)
- Leave TODO comments in finished docs
- Create documentation nobody can find
- Copy outdated docs instead of creating new
- Write unclear technical jargon without explanation
- Forget to keep docs in sync with code changes

**Do:**
- Write documentation alongside code
- Verify examples by running them
- Keep docs in version control with code
- Link docs from README for discoverability
- Update docs when code changes
- Review docs for clarity like you review code
- Make docs searchable and well-indexed
