# AI Framework Reference

Quick reference for framework strengths, anti-patterns, and comparison details.

## Table of Contents

1. [Framework Strengths](#framework-strengths)
2. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
3. [Quick Comparison Table](#quick-comparison-table)
4. [When to Use Each Framework](#when-to-use-each-framework)
5. [Migration Paths](#migration-paths)

## Framework Strengths

### LangGraph ✓

**Core Strengths:**
- Complex state machines with loops and branching
- Multi-agent orchestration with shared state
- Conversation memory and persistence (PostgreSQL)
- Production error handling and retry logic
- Human-in-the-loop workflows
- Graph-based architecture for complex flows
- Native streaming support (SSE)

**Best For:**
- Production chatbots with memory
- Multi-agent systems requiring state coordination
- Workflows with conditional logic and loops
- Long-running processes with checkpoints

**Avoid When:**
- Simple linear workflows (overkill)
- Rapid prototypes (< 2 weeks lifespan)
- No state management needed

### LangChain ✓

**Core Strengths:**
- Rapid prototyping and quick setup
- Simple linear workflows (chains)
- Basic RAG implementations
- Quick MVPs and demos
- Largest ecosystem (chains, tools, integrations)
- Pre-built components and templates
- Good for educational purposes

**Best For:**
- Prototypes and MVPs
- Simple API → LLM → output flows
- Educational projects
- Rapid experimentation

**Avoid When:**
- Need state persistence
- Production at scale
- Complex workflows with branching

### PydanticAI ✓

**Core Strengths:**
- Type-safe agents with Pydantic models
- Structured output validation
- Compile-time type checking
- Native Pydantic integration
- Input/output schema validation
- IDE autocomplete and type hints

**Best For:**
- Type safety critical projects
- Pydantic-native codebases
- Heavily validated inputs/outputs
- Payment processing or sensitive operations

**Avoid When:**
- Type safety not important
- Rapid prototyping (adds overhead)
- Simple use cases

### CrewAI ✓

**Core Strengths:**
- Multi-agent team collaboration
- Role-based abstractions (roles, tasks, crews)
- Top-down orchestration
- Easy setup for defined workflows
- Task delegation between agents
- Intra-agent coordination
- Production-ready documentation

**Best For:**
- Multi-agent collaboration with clear roles
- Team-based workflows (researcher + writer + reviewer)
- Sequential or hierarchical agent coordination
- Well-defined agent responsibilities

**Avoid When:**
- Complex shared state needed
- Dynamic routing logic
- Single agent sufficient

### LlamaIndex ✓

**Core Strengths:**
- RAG systems (industry standard)
- Complex document retrieval
- 30ms p99 retrieval latency
- 250+ data source connectors
- Multi-modal document support (PDFs, images, audio)
- Query optimization and routing
- Hybrid search capabilities
- Best-in-class document processing

**Best For:**
- Production RAG systems
- Large document collections (1K+ documents)
- Fast retrieval required
- Multi-modal data sources
- Hybrid with LangGraph for orchestration

**Avoid When:**
- Simple Q&A (LangChain sufficient)
- Small document sets (< 100 docs)
- Rapid prototyping only

### Haystack ✓

**Core Strengths:**
- Enterprise production focus
- Regulated industries (finance, healthcare)
- On-premise deployment support
- Enterprise SLAs (Haystack Enterprise)
- Proven at scale (Airbus, NVIDIA, Comcast)
- Multi-modal AI pipelines
- Production-first design
- Hayhooks for easy deployment

**Best For:**
- Enterprise deployments
- Regulated industries requiring compliance
- On-premise infrastructure
- Need for SLAs and support
- Production reliability critical

**Avoid When:**
- Rapid prototyping
- Small scale projects
- Need maximum flexibility

## Anti-Patterns to Avoid

### ❌ Using LangChain for Production Stateful Agents

**Problem**: LangChain chains aren't designed for complex state management.

**Why Bad**:
- No native state persistence
- Workarounds lead to brittle code
- Poor error handling for stateful flows

**Solution**: Use LangGraph for any production agent with conversation memory.

### ❌ Using LangGraph for Simple Linear Workflows

**Problem**: Overkill complexity for simple chains.

**Why Bad**:
- Adds unnecessary boilerplate
- Slower development time
- Harder to maintain for simple use cases

**Solution**: Use LangChain for simple, well-defined linear workflows.

### ❌ Using LangChain for RAG When LlamaIndex is Available

**Problem**: LangChain RAG is adequate but not optimal.

**Why Bad**:
- Slower retrieval (100-200ms vs. 30ms)
- Fewer document connectors
- Less optimized for large document sets

**Solution**: Use LlamaIndex for complex RAG, especially with large document sets.

### ❌ Using CrewAI When State Sharing is Complex

**Problem**: CrewAI's team abstraction limits state flexibility.

**Why Bad**:
- Shared state between agents is harder
- Dynamic routing more difficult
- Limited control over state updates

**Solution**: Use LangGraph when agents need complex shared state or dynamic routing.

### ❌ Choosing Based on Popularity Alone

**Problem**: LangChain is most popular but not always best fit.

**Why Bad**:
- Popularity ≠ suitability for use case
- Missing out on specialized tools
- Suboptimal architecture decisions

**Solution**: Match framework capabilities to actual requirements using decision matrix.

### ❌ Ignoring Type Safety When Critical

**Problem**: LangChain/LangGraph lack compile-time type safety.

**Why Bad**:
- Runtime errors in production
- No IDE autocomplete for tool schemas
- Validation happens at runtime

**Solution**: Use PydanticAI when validation and type safety are critical.

### ❌ Forcing Single Framework for Everything

**Problem**: Trying to use one framework for all use cases.

**Why Bad**:
- Suboptimal for some tasks
- Missing specialized capabilities
- Fighting framework limitations

**Solution**: Embrace hybrid approaches (LlamaIndex + LangGraph, PydanticAI + LangGraph, etc.).

## Quick Comparison Table

| Feature | LangGraph | LangChain | PydanticAI | CrewAI | LlamaIndex | Haystack |
|---------|-----------|-----------|------------|--------|------------|----------|
| **State Management** | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐ | ⭐⭐⭐ |
| **Setup Speed** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Production Ready** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **RAG Performance** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Multi-Agent** | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐ |
| **Type Safety** | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **Community/Docs** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Flexibility** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Enterprise** | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**Legend**: ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Good | ⭐⭐⭐ Adequate | ⭐⭐ Limited | ⭐ Poor

## When to Use Each Framework

### Use LangGraph When:
- ✓ Need conversation memory across sessions
- ✓ Complex state machines with loops/branching
- ✓ Multi-agent systems with shared state
- ✓ Production deployment at scale
- ✓ Human-in-the-loop workflows
- ✓ Error handling and retry logic critical
- ✓ Long-running processes with checkpoints

### Use LangChain When:
- ✓ Rapid prototyping (< 2 weeks)
- ✓ Simple linear workflows
- ✓ Educational projects
- ✓ Quick MVPs and demos
- ✓ Basic RAG (< 100 documents)
- ✓ Need largest ecosystem

### Use PydanticAI When:
- ✓ Type safety is critical
- ✓ Pydantic-native codebase
- ✓ Payment processing or sensitive operations
- ✓ Heavily validated inputs/outputs
- ✓ Compile-time type checking needed
- ✓ IDE autocomplete important

### Use CrewAI When:
- ✓ Multi-agent collaboration with clear roles
- ✓ Team-based workflows (researcher + writer + reviewer)
- ✓ Sequential or hierarchical coordination
- ✓ Well-defined agent responsibilities
- ✓ Task delegation patterns
- ✓ Don't need complex shared state

### Use LlamaIndex When:
- ✓ RAG system with large document sets
- ✓ Fast retrieval required (< 100ms)
- ✓ 250+ data connectors needed
- ✓ Multi-modal documents (PDFs, images, audio)
- ✓ Query optimization important
- ✓ Production RAG at scale

### Use Haystack When:
- ✓ Enterprise deployment with SLAs
- ✓ Regulated industry (finance, healthcare)
- ✓ On-premise infrastructure required
- ✓ Need enterprise support
- ✓ Production reliability critical
- ✓ Proven at scale needed

## Migration Paths

### LangChain → LangGraph

**When to Migrate**:
- Conversation history becomes necessary
- State management needs emerge
- Production scaling required
- Error handling becomes complex

**Migration Effort**: Medium (2-5 days)

**Key Changes**:
1. Convert chains to nodes (functions)
2. Define TypedDict state schema
3. Build StateGraph with routing logic
4. Add checkpointer for persistence
5. Update API endpoints for streaming

**Migration Example**:
```python
# Before (LangChain)
chain = prompt | llm | parser

# After (LangGraph)
def agent_node(state: State) -> dict:
    response = llm.invoke(state["messages"])
    return {"messages": [response]}

graph.add_node("agent", agent_node)
```

### LangChain → LlamaIndex (RAG Only)

**When to Migrate**:
- Document set grows (> 1K documents)
- Retrieval performance becomes critical
- Need advanced query optimization
- Multi-modal documents required

**Migration Effort**: Medium (3-7 days)

**Key Changes**:
1. Replace LangChain document loaders with LlamaIndex
2. Set up vector store (Qdrant, Pinecone)
3. Create LlamaIndex query engine
4. Integrate with existing LangChain chains

### Standalone → Hybrid (LlamaIndex + LangGraph)

**When to Use**:
- Complex RAG + sophisticated orchestration
- Multi-step workflows with retrieval
- State persistence + document retrieval

**Implementation Effort**: Medium-High (5-10 days)

**Architecture**:
1. LlamaIndex handles indexing and retrieval
2. LangGraph orchestrates multi-step workflows
3. LangGraph state includes retrieved context
4. Error handling in LangGraph layer

## Additional Resources

- **Official Documentation**:
  - [LangGraph Docs](https://docs.langchain.com/langgraph)
  - [LangChain Docs](https://docs.langchain.com/)
  - [PydanticAI Docs](https://ai.pydantic.dev/)
  - [CrewAI Docs](https://docs.crewai.com/)
  - [LlamaIndex Docs](https://docs.llamaindex.ai/)
  - [Haystack Docs](https://haystack.deepset.ai/)

- **Comparison Articles**:
  - [LangChain vs LangGraph vs LlamaIndex](https://xenoss.io/blog/langchain-langgraph-llamaindex-llm-frameworks)
  - [CrewAI vs LangGraph vs AutoGen](https://www.datacamp.com/tutorial/crewai-vs-langgraph-vs-autogen)
  - [LlamaIndex vs LangChain 2026](https://www.zenml.io/blog/llamaindex-vs-langchain)
  - [RAG Framework Wars](https://leonstaff.com/blogs/langchain-vs-llamaindex-rag-wars/)
  - [Best AI Agent Frameworks 2026](https://www.shakudo.io/blog/top-9-ai-agent-frameworks)

- **Research Reports**:
  - `docs/research/2026-02-16-ai-agent-frameworks-landscape.md`
  - `docs/research/2026-02-16-langchain-setup-best-practices.md`
