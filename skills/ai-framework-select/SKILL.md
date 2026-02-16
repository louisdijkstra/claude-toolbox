---
name: selecting-ai-framework
description: Select the best AI/LLM framework for your specific use case. Evaluates requirements and recommends LangGraph, LangChain, PydanticAI, CrewAI, LlamaIndex, or Haystack based on workflow complexity, state needs, team collaboration, and production requirements.
---

# Selecting the Best AI Framework (2026)

## Purpose
Help you choose the optimal AI/LLM framework for your specific use case by evaluating requirements and recommending the best fit from: LangGraph, LangChain, PydanticAI, CrewAI, LlamaIndex, or Haystack.

## When to Use
- Starting a new AI/LLM project
- Migrating from one framework to another
- Unsure which framework fits your requirements
- Evaluating framework trade-offs

**Do NOT use for:**
- Already committed to a framework (use framework-specific setup skills instead)
- Non-LLM projects (regular Python applications, web apps without AI)
- Simple API calls to LLM providers (direct SDK usage sufficient)

If the user mentions a specific framework by name, ask if they want to proceed with setup for that framework or if they'd like to evaluate alternatives first.

## Quick Reference

📊 **Decision Matrix**: See DECISION-MATRIX.md for detailed decision paths
📋 **Examples**: See EXAMPLES.md for use case recommendations
📚 **Framework Details**: See REFERENCE.md for strengths and anti-patterns

## Frameworks Overview

### Your Existing Skills (Preferred)
1. **LangGraph** - Complex workflows, state machines, multi-agent orchestration
2. **LangChain** - Simple linear chains, prototypes, basic RAG
3. **PydanticAI** - Type-safe agents, validation-heavy workflows

### Alternative Frameworks (When Clear Advantage)
4. **CrewAI** - Multi-agent team collaboration, role-based workflows
5. **LlamaIndex** - RAG systems (objectively superior for complex documents)
6. **Haystack** - Enterprise production, regulated industries

## Process

### Step 1: Gather Requirements

Ask the user these questions systematically (one at a time):

```
I'll help you select the best AI framework for your project. Let me ask a few questions:

1. **What are you building?**
   a) RAG system (document Q&A, knowledge base)
   b) Conversational agent/chatbot
   c) Multi-agent system (multiple AI agents working together)
   d) Data processing pipeline
   e) Tool-calling agent (API integrations, function calling)
   f) Other (please describe)
```

After the first answer, proceed with follow-up questions:

```
2. **Workflow complexity:**
   a) Linear/simple (input → process → output)
   b) Conditional logic (if/then decisions)
   c) Loops and iterations
   d) Complex state machines with multiple paths
   e) Multi-agent coordination

3. **State management needs:**
   a) No state needed (stateless operations)
   b) Simple conversation history
   c) Complex state across multiple turns
   d) Persistent state across sessions
   e) Shared state between multiple agents

4. **Scale and production requirements:**
   a) Prototype/MVP (<2 weeks lifespan)
   b) Small production (<100 users)
   c) Medium production (100-10K users)
   d) Large production (10K+ users)
   e) Enterprise/regulated industry

5. **Team collaboration requirements:**
   a) Single agent, no collaboration
   b) Sequential agent handoffs
   c) Multiple agents with distinct roles
   d) Agents negotiating/discussing
   e) Hierarchical agent management

6. **Type safety and validation:**
   a) Not important
   b) Nice to have
   c) Critical (heavily validated inputs/outputs)

7. **Existing ecosystem:**
   a) Starting from scratch
   b) Existing Python codebase
   c) Need FastAPI integration
   d) Need cloud deployment (AWS/GCP/Azure)
   e) Enterprise infrastructure (on-prem)
```

### Step 2: Apply Decision Matrix

Based on answers, use decision paths from DECISION-MATRIX.md:

- **RAG systems** → LlamaIndex (complex) or LangChain (simple)
- **Multi-agent collaboration** → CrewAI (role-based) or LangGraph (state-heavy)
- **State machines** → LangGraph (only option)
- **Type safety critical** → PydanticAI
- **Enterprise/regulated** → Haystack
- **Simple linear** → LangChain
- **Complex state** → LangGraph
- **Conversational** → LangGraph (with memory) or LangChain (simple)

See DECISION-MATRIX.md for complete decision tree with detailed output templates.

### Step 3: Present Recommendation

Use the output template format from decision matrix:

```
Recommendation: [Framework Name]

Why:
- [Reason 1: matches requirements]
- [Reason 2: proven capability]
- [Reason 3: production readiness]

[Framework-specific explanation]

Next steps:
[Specific setup steps or skill invocation]

Should I proceed with [action]?
```

### Step 4: Show Comparison Table

Present a comparison table customized to their use case:

```markdown
## Framework Comparison for Your Use Case

| Criterion | LangGraph | LangChain | PydanticAI | CrewAI | LlamaIndex | Haystack |
|-----------|-----------|-----------|------------|--------|------------|----------|
| **Use Case Fit** | [Rate 1-5] | [Rate 1-5] | [Rate 1-5] | [Rate 1-5] | [Rate 1-5] | [Rate 1-5] |
| **Setup Speed** | [Rate 1-5] | [Rate 1-5] | [Rate 1-5] | [Rate 1-5] | [Rate 1-5] | [Rate 1-5] |
| **State Management** | [Rate 1-5] | [Rate 1-5] | [Rate 1-5] | [Rate 1-5] | [Rate 1-5] | [Rate 1-5] |
| **Production Ready** | [Rate 1-5] | [Rate 1-5] | [Rate 1-5] | [Rate 1-5] | [Rate 1-5] | [Rate 1-5] |
| **Community/Docs** | [Rate 1-5] | [Rate 1-5] | [Rate 1-5] | [Rate 1-5] | [Rate 1-5] | [Rate 1-5] |

**Legend**: 5=Excellent, 4=Good, 3=Adequate, 2=Limited, 1=Poor
```

### Step 5: Handle Edge Cases

**Hybrid Approaches:**

When multiple frameworks fit equally well, recommend hybrid:

```
Recommendation: Hybrid Approach

For your use case, combining frameworks provides the best results:

1. **LlamaIndex** for document retrieval and indexing
2. **LangGraph** for agent orchestration and state management

This is the 2026 industry best practice for complex RAG systems.

Should I proceed with this hybrid setup?
```

**Unclear Requirements:**

If answers are ambiguous, ask clarifying questions before making recommendation.

**Migration Guidance:**

If user has existing implementation:

```
Migration Consideration:

You're currently using [Current Framework], and I'm recommending [New Framework].

Migration effort: [Low/Medium/High]
Estimated migration time: [X hours/days]

Alternative: You could also [workaround in current framework] to avoid migration.

Would you like to proceed with migration, or explore alternatives?
```

### Step 6: Invoke Setup Skill

After user confirms recommendation, invoke the appropriate setup skill:

- **LangGraph** → Invoke `building-langgraph-agents` skill
- **LangChain** → Invoke `setting-up-langchain` skill
- **PydanticAI** → Invoke PydanticAI setup skill (if available)
- **CrewAI** → Provide setup guidance (no dedicated skill yet)
- **LlamaIndex** → Provide setup guidance (no dedicated skill yet)
- **Haystack** → Provide setup guidance (no dedicated skill yet)

## Quick Reference Table

| Use Case | Primary | Alternative | When Alternative |
|----------|---------|-------------|------------------|
| **Complex RAG** | LlamaIndex + LangGraph | LangChain | Simple prototype only |
| **Multi-agent** | CrewAI | LangGraph | Fine-grained state control |
| **State machines** | LangGraph | - | No alternatives |
| **Type-safe** | PydanticAI | LangGraph | Type safety critical |
| **Enterprise** | Haystack | LangGraph | Enterprise features needed |
| **Simple chains** | LangChain | LangGraph | Will grow complex |
| **Conversational** | LangGraph | - | State persistence required |
| **Prototype** | LangChain | LangGraph | < 2 weeks lifespan |
| **Tool-calling** | LangGraph | PydanticAI | Type safety critical |

## Additional Resources

- **DECISION-MATRIX.md** - Complete decision paths with output templates
- **EXAMPLES.md** - Detailed use case recommendations
- **REFERENCE.md** - Framework strengths, anti-patterns, comparison details
- Research: `docs/research/2026-02-16-ai-agent-frameworks-landscape.md`
- Research: `docs/research/2026-02-16-langchain-setup-best-practices.md`
