# AI Framework Decision Matrix

Complete decision paths with detailed output templates for each use case.

## Table of Contents

1. [RAG Systems](#rag-systems)
2. [Multi-Agent Systems](#multi-agent-systems)
3. [Type Safety Critical](#type-safety-critical)
4. [Enterprise/Regulated](#enterpriseregulated)
5. [Simple Linear Workflows](#simple-linear-workflows)
6. [Complex State Machines](#complex-state-machines)
7. [Conversational Agents](#conversational-agents)
8. [Common Patterns](#common-patterns)

## RAG Systems

**Trigger**: Question 1a (RAG system)

### Complex Documents / Large Knowledge Bases

**Recommend: LlamaIndex**

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

### Simple RAG / Prototype

**Recommend: LangChain**

```
Recommendation: LangChain

Why:
- Simple RAG use case suitable for LangChain
- Quick prototyping and setup
- Good for MVPs and educational purposes

I'll invoke the setting-up-langchain skill to get you started.
```

→ Invoke `setting-up-langchain` skill

## Multi-Agent Systems

**Trigger**: Question 1c OR Question 5 (c/d/e)

### Team-Based Collaboration with Distinct Roles

**Recommend: CrewAI**

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

### Complex State Machines / Sophisticated Orchestration

**Recommend: LangGraph**

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

## Type Safety Critical

**Trigger**: Question 6c (Type safety critical)

**Recommend: PydanticAI**

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

## Enterprise/Regulated

**Trigger**: Question 4 (d/e - enterprise or regulated industry)

**Recommend: Haystack**

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

## Simple Linear Workflows

**Trigger**: Question 2a (Linear/simple workflow)

**Recommend: LangChain**

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

## Complex State Machines

**Trigger**: Question 2d OR Question 3 (c/d/e - complex/persistent state)

**Recommend: LangGraph**

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

## Conversational Agents

**Trigger**: Question 1b (Conversational agent/chatbot)

### With Conversation History/Memory

**Recommend: LangGraph**

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

### Simple Chatbot Without Memory

**Recommend: LangChain**

```
Recommendation: LangChain

Why:
- Simple stateless chatbot suitable for LangChain
- Quick setup with prompt templates
- No state management overhead

I'll invoke the setting-up-langchain skill.
```

→ Invoke `setting-up-langchain` skill

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

Timeline:
- Start: LangChain (1-3 days setup)
- Migrate when reaching 80% of LangChain capabilities
- Migration effort: 2-5 days depending on complexity
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

Implementation approach:
1. Set up LlamaIndex vector store (Qdrant or Pinecone)
2. Create LangGraph nodes that call LlamaIndex query engine
3. Manage conversation state in LangGraph TypedDict
4. Use LangGraph checkpointer for persistence
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

Decision criteria:
- Use CrewAI if: roles are fixed, sequential/hierarchical flow, task-based coordination
- Use LangGraph if: shared state complex, dynamic routing, loops/branches needed
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
- Strong state management

Choose Haystack when: regulated industry, need SLAs, on-prem required
Choose LangGraph when: need flexibility, rapid iteration, complex state
```

## Decision Tree Summary

```
START
├─ RAG System?
│  ├─ Complex docs → LlamaIndex (+LangGraph)
│  └─ Simple → LangChain
├─ Multi-Agent?
│  ├─ Role-based → CrewAI
│  └─ State-heavy → LangGraph
├─ Type Safety Critical? → PydanticAI
├─ Enterprise/Regulated? → Haystack
├─ Simple Linear? → LangChain
├─ Complex State? → LangGraph
└─ Conversational?
   ├─ With memory → LangGraph
   └─ Without memory → LangChain
```

## When to Recommend Hybrid

Recommend hybrid approaches when:
- RAG + complex orchestration → LlamaIndex + LangGraph
- Type safety + state management → PydanticAI nodes in LangGraph
- Multiple data sources + agent coordination → LlamaIndex + CrewAI

Avoid hybrid when:
- Use case fits single framework well
- Team lacks experience with multiple frameworks
- Maintenance complexity outweighs benefits
