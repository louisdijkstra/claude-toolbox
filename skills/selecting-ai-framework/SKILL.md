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

## Frameworks Available

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

Ask the user these questions systematically:

```
I'll help you select the best AI framework for your project. Let me ask a few questions:

1. **What are you building?**
   a) RAG system (document Q&A, knowledge base)
   b) Conversational agent/chatbot
   c) Multi-agent system (multiple AI agents working together)
   d) Data processing pipeline
   e) Tool-calling agent (API integrations, function calling)
   f) Other (please describe)

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

### Step 2: Decision Matrix

Based on answers, apply this decision tree:

#### Decision Path 1: RAG Systems (Question 1a)

**If complex documents, large knowledge bases, or retrieval performance critical:**
→ **Recommend: LlamaIndex**
- Industry standard for RAG in 2026
- Objectively superior retrieval performance (30ms p99 latency)
- 250+ data source integrations
- Best-in-class document processing

**Output:**
```
Recommendation: LlamaIndex + LangGraph (Hybrid)

Why:
- LlamaIndex is the industry standard for RAG systems in 2026
- Superior retrieval performance (30ms p99 latency vs. slower alternatives)
- Extensive document connector ecosystem (250+ integrations)
- Best practice is to combine LlamaIndex (retrieval) with LangGraph (orchestration)

I'll set up LlamaIndex for your RAG system. Note: We don't have a dedicated LlamaIndex skill yet, but I'll guide you through the setup following 2026 best practices.

Next steps:
1. Install: uv add llama-index llama-index-core
2. Choose vector store (Chroma, Qdrant, or Pinecone)
3. Set up document ingestion pipeline
4. Integrate with LangGraph for complex workflows (if needed)

Should I proceed with LlamaIndex setup?
```

**If simple RAG, prototype, or educational:**
→ **Recommend: LangChain**
- Quick setup for basic RAG
- Good for prototypes

**Output:**
```
Recommendation: LangChain

Why:
- Simple RAG use case suitable for LangChain
- Quick prototyping and setup
- Good for MVPs and educational purposes

I'll invoke the setting-up-langchain skill to get you started.
```
→ Invoke `setting-up-langchain` skill

#### Decision Path 2: Multi-Agent Systems (Question 1c or Question 5: c/d/e)

**If team-based collaboration with distinct roles:**
→ **Recommend: CrewAI**
- Best for team-based agent collaboration
- Role-based abstraction (researcher, writer, analyst, etc.)
- Top-down orchestration
- Production-ready with easy setup

**Output:**
```
Recommendation: CrewAI

Why:
- Multi-agent collaboration with distinct roles is CrewAI's specialty
- Team-based abstraction (crew members with specific roles)
- Easier setup than LangGraph for this specific use case
- Production-ready with strong documentation

CrewAI excels when you have clearly defined agent roles working together, while LangGraph is better for complex state machines.

I don't have a dedicated CrewAI skill yet, but I'll guide you through setup:

1. Install: uv add crewai crewai-tools
2. Define agent roles (e.g., Researcher, Writer, Reviewer)
3. Create tasks for each agent
4. Set up crew with process flow (sequential or hierarchical)
5. Add tools per agent role

Should I proceed with CrewAI setup, or would you prefer LangGraph for more control over state management?
```

**If complex state machines, loops, or sophisticated orchestration:**
→ **Recommend: LangGraph**

**Output:**
```
Recommendation: LangGraph

Why:
- Complex multi-agent orchestration with state machines
- Full control over agent flow, loops, and conditional logic
- Native state persistence and error handling
- Production-ready with PostgreSQL persistence

I'll invoke the building-langgraph-agents skill.
```
→ Invoke `building-langgraph-agents` skill

#### Decision Path 3: Type Safety Critical (Question 6c)

**If heavy validation, type safety critical, or Pydantic-native project:**
→ **Recommend: PydanticAI**

**Output:**
```
Recommendation: PydanticAI

Why:
- Type safety is critical for your use case
- Native Pydantic integration for validation
- Structured outputs with full type checking
- Best for projects already using Pydantic

PydanticAI provides compile-time type safety that LangChain/LangGraph lack.

I'll invoke the PydanticAI skill (assuming you have one).
```
→ Invoke PydanticAI skill (if available)

#### Decision Path 4: Enterprise/Regulated Industry (Question 4d/e)

**If regulated industry, on-prem deployment, or enterprise-grade requirements:**
→ **Recommend: Haystack**

**Output:**
```
Recommendation: Haystack

Why:
- Enterprise-grade production focus
- Proven at scale (Airbus, NVIDIA, Comcast)
- Strong on-premise deployment support
- Haystack Enterprise offering with SLAs
- Excellent for regulated industries (finance, healthcare)

Haystack prioritizes production readiness and reliability over rapid prototyping.

I don't have a dedicated Haystack skill yet, but I'll guide you through setup:

1. Install: uv add haystack-ai
2. Design pipeline architecture
3. Set up components (retrievers, readers, generators)
4. Configure deployment (Hayhooks for easy deployment)
5. Implement observability and monitoring

Should I proceed with Haystack setup, or would LangGraph work for your enterprise needs?
```

#### Decision Path 5: Simple Linear Workflows (Question 2a)

**If linear workflow, prototype, or < 2 weeks lifespan:**
→ **Recommend: LangChain**

**Output:**
```
Recommendation: LangChain

Why:
- Simple linear workflow fits LangChain's chain-based model
- Quick setup for prototypes
- No state management complexity needed

⚠️ Note: If this grows into production with state needs, plan to migrate to LangGraph.

I'll invoke the setting-up-langchain skill.
```
→ Invoke `setting-up-langchain` skill

#### Decision Path 6: Complex State Machines (Question 2d or Question 3c/d/e)

**If complex state, loops, conditions, or persistent state:**
→ **Recommend: LangGraph**

**Output:**
```
Recommendation: LangGraph

Why:
- Complex state management is LangGraph's core strength
- Graph-based architecture supports loops and branching
- Native persistence with PostgreSQL
- Production-ready error handling and retry logic

I'll invoke the building-langgraph-agents skill.
```
→ Invoke `building-langgraph-agents` skill

#### Decision Path 7: Conversational Agent (Question 1b)

**If needs conversation history/memory:**
→ **Recommend: LangGraph**

**Output:**
```
Recommendation: LangGraph

Why:
- Conversation history requires state management
- LangGraph's TypedDict state schema perfect for this
- PostgreSQL persistence for multi-session memory
- FastAPI streaming for real-time chat

I'll invoke the building-langgraph-agents skill.
```
→ Invoke `building-langgraph-agents` skill

**If simple chatbot without memory:**
→ **Recommend: LangChain**

**Output:**
```
Recommendation: LangChain

Why:
- Simple stateless chatbot suitable for LangChain
- Quick setup with prompt templates
- No state management overhead

I'll invoke the setting-up-langchain skill.
```
→ Invoke `setting-up-langchain` skill

### Step 3: Present Comparison Table

After recommendation, show comparison table:

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

Customize ratings based on specific use case.

### Step 4: Handle Edge Cases

**Hybrid Approaches:**

If multiple frameworks fit equally well, recommend hybrid:

```
Recommendation: Hybrid Approach

For your use case, combining frameworks provides the best results:

1. **LlamaIndex** for document retrieval and indexing
2. **LangGraph** for agent orchestration and state management

This is the 2026 industry best practice for complex RAG systems.

Implementation strategy:
1. Set up LlamaIndex for document processing and retrieval
2. Create LangGraph nodes that call LlamaIndex query engines
3. Manage conversation state in LangGraph
4. Use LangGraph for error handling and retries

Should I proceed with this hybrid setup?
```

**Unclear Requirements:**

If answers are ambiguous, ask clarifying questions:

```
I need a bit more information to make the best recommendation:

[Specific clarifying question based on ambiguous answer]

This will help me determine whether [Framework A] or [Framework B] is the better fit.
```

### Step 5: Migration Guidance

If user has existing implementation in different framework:

```
Migration Consideration:

You're currently using [Current Framework], and I'm recommending [New Framework].

Migration effort: [Low/Medium/High]

Key changes required:
1. [Change 1]
2. [Change 2]
3. [Change 3]

Estimated migration time: [X hours/days]

Alternative: You could also [workaround in current framework] to avoid migration.

Would you like to proceed with migration, or explore alternatives in your current framework?
```

## Decision Matrix Summary

Quick reference table:

| Use Case | Primary Recommendation | Alternative | When Alternative Better |
|----------|----------------------|-------------|------------------------|
| **Complex RAG** | LlamaIndex + LangGraph | LangChain | Simple prototype only |
| **Multi-agent collaboration** | CrewAI | LangGraph | Need fine-grained state control |
| **State machines** | LangGraph | - | No alternatives for this |
| **Type-safe agents** | PydanticAI | LangGraph | Type safety critical |
| **Enterprise production** | Haystack | LangGraph | Enterprise features needed |
| **Simple linear chains** | LangChain | LangGraph | Will grow complex |
| **Conversational with memory** | LangGraph | - | State persistence required |
| **Prototype/MVP** | LangChain | LangGraph | < 2 weeks, won't grow |
| **Tool-calling agent** | LangGraph | PydanticAI | Type safety critical |

## Common Patterns

### Pattern 1: Start Simple, Migrate Later
**Scenario**: Uncertain requirements, rapid prototyping needed

**Recommendation**:
```
Start with LangChain for rapid prototyping, then migrate to LangGraph when:
- Conversation history becomes necessary
- State management needs emerge
- Production scaling required
- Error handling becomes complex

Migration path: LangChain chains → LangGraph nodes
```

### Pattern 2: Hybrid RAG + Orchestration
**Scenario**: Complex document retrieval with sophisticated agent workflows

**Recommendation**:
```
Hybrid: LlamaIndex (retrieval) + LangGraph (orchestration)

Architecture:
1. LlamaIndex handles document indexing and retrieval
2. LangGraph orchestrates multi-step workflows
3. LangGraph state includes retrieved context
4. Error handling and retries in LangGraph layer

This is the 2026 industry best practice for production RAG systems.
```

### Pattern 3: Multi-Agent with Roles
**Scenario**: Team of agents with distinct responsibilities

**Recommendation**:
```
If roles are well-defined and collaborative:
→ CrewAI (easier setup, team abstraction)

If roles involve complex state sharing or dynamic routing:
→ LangGraph (more control, flexible state management)

Example: Research crew (researcher + writer + reviewer) → CrewAI
Example: Dynamic routing based on query type → LangGraph
```

### Pattern 4: Enterprise Deployment
**Scenario**: Regulated industry, on-prem, enterprise SLAs

**Recommendation**:
```
Primary: Haystack (enterprise-grade, proven at scale)
Alternative: LangGraph (if you need more flexibility)

Haystack advantages:
- Enterprise support and SLAs
- Battle-tested at Airbus, NVIDIA, Comcast
- Strong on-premise deployment
- Hayhooks for easy deployment

LangGraph advantages:
- More flexible for custom workflows
- Better for rapid iteration
```

## Anti-Patterns to Avoid

### ❌ Using LangChain for Production Stateful Agents
**Problem**: LangChain chains aren't designed for complex state management.
**Solution**: Use LangGraph for any production agent with conversation memory.

### ❌ Using LangGraph for Simple Linear Workflows
**Problem**: Overkill complexity for simple chains.
**Solution**: Use LangChain for simple, well-defined linear workflows.

### ❌ Using LangChain for RAG When LlamaIndex is Available
**Problem**: LangChain RAG is adequate but not optimal.
**Solution**: Use LlamaIndex for complex RAG, especially with large document sets.

### ❌ Using CrewAI When State Sharing is Complex
**Problem**: CrewAI's team abstraction limits state flexibility.
**Solution**: Use LangGraph when agents need complex shared state.

### ❌ Choosing Based on Popularity Alone
**Problem**: LangChain is most popular but not always best fit.
**Solution**: Match framework capabilities to actual requirements.

### ❌ Ignoring Type Safety When Critical
**Problem**: LangChain/LangGraph lack compile-time type safety.
**Solution**: Use PydanticAI when validation and type safety are critical.

### ❌ Forcing Single Framework for Everything
**Problem**: Trying to use one framework for all use cases.
**Solution**: Embrace hybrid approaches (LlamaIndex + LangGraph, etc.).

## Framework Strengths Summary

### LangGraph ✓
- Complex state machines
- Multi-agent orchestration with shared state
- Conversation memory/persistence
- Production error handling
- Loops and conditional flows
- Human-in-the-loop
- PostgreSQL state persistence

### LangChain ✓
- Rapid prototyping
- Simple linear workflows
- Basic RAG (not production-scale)
- Quick MVPs
- Educational/learning
- Pre-built chains and tools
- Largest ecosystem

### PydanticAI ✓
- Type-safe agents
- Structured output validation
- Pydantic-native projects
- Compile-time type checking
- Input/output schemas

### CrewAI ✓
- Multi-agent team collaboration
- Role-based abstractions
- Top-down orchestration
- Easy setup for defined workflows
- Task delegation
- Intra-agent coordination

### LlamaIndex ✓
- RAG systems (industry standard)
- Complex document retrieval
- 30ms p99 retrieval latency
- 250+ data connectors
- Multi-modal documents
- Query optimization
- Hybrid with LangChain/LangGraph

### Haystack ✓
- Enterprise production
- Regulated industries
- On-premise deployment
- Enterprise SLAs
- Proven at scale
- Multi-modal AI
- Production-first design

## Example Recommendations

### Example 1: Customer Support Chatbot
**Requirements**:
- Conversation history across sessions
- Integration with ticketing system
- 10K users
- Need to remember user context

**Recommendation**: **LangGraph**
- State persistence for conversation history
- PostgreSQL for cross-session memory
- FastAPI streaming for real-time chat
- Error handling for API failures

### Example 2: Document Q&A System
**Requirements**:
- 10,000+ PDFs
- Fast retrieval required
- No conversation history needed
- Production deployment

**Recommendation**: **LlamaIndex** (+ LangChain for simple orchestration)
- LlamaIndex for document indexing (30ms p99 latency)
- Vector store (Qdrant or Pinecone)
- LangChain for simple query → retrieve → answer flow

### Example 3: Research Report Generator
**Requirements**:
- Multiple agents (researcher, writer, reviewer)
- Agents collaborate on report
- Well-defined roles
- Medium scale

**Recommendation**: **CrewAI**
- Researcher agent: web search + document analysis
- Writer agent: draft generation
- Reviewer agent: quality check
- Sequential workflow with handoffs

### Example 4: Healthcare Data Pipeline
**Requirements**:
- Regulated industry (HIPAA)
- On-premise deployment
- Enterprise support needed
- Production SLAs

**Recommendation**: **Haystack**
- Enterprise-grade with SLAs
- On-premise deployment support
- Proven in regulated industries
- Haystack Enterprise offering

### Example 5: API Integration Agent
**Requirements**:
- Call multiple APIs based on user intent
- Type-safe API schemas
- Validation critical
- Structured outputs

**Recommendation**: **PydanticAI**
- Type-safe API schemas with Pydantic
- Compile-time validation
- Structured output parsing
- Error handling with typed exceptions

## References

- [LangChain vs LangGraph vs LlamaIndex comparison](https://xenoss.io/blog/langchain-langgraph-llamaindex-llm-frameworks)
- [CrewAI vs LangGraph vs AutoGen](https://www.datacamp.com/tutorial/crewai-vs-langgraph-vs-autogen)
- [LlamaIndex vs LangChain 2026](https://www.zenml.io/blog/llamaindex-vs-langchain)
- [RAG Framework Wars (2026)](https://leonstaff.com/blogs/langchain-vs-llamaindex-rag-wars/)
- [Haystack Production Guide](https://haystack.deepset.ai/)
- [Best AI Agent Frameworks 2026](https://www.shakudo.io/blog/top-9-ai-agent-frameworks)
- [Framework Comparison Guide](https://www.turing.com/resources/ai-agent-frameworks)
- Research: `docs/research/2026-02-16-ai-agent-frameworks-landscape.md`
- Research: `docs/research/2026-02-16-langchain-setup-best-practices.md`
