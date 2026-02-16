# LangChain Setup Reference

Quick reference for anti-patterns, use cases, production guidance, and migration paths.

## Table of Contents

1. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
2. [Common Use Cases](#common-use-cases)
3. [Production Checklist](#production-checklist)
4. [Migration Path to LangGraph](#migration-path-to-langgraph)

## Anti-Patterns to Avoid

### ❌ No Observability

**Problem**: Can't debug production issues, no visibility into costs/performance.

**Why Bad**:
- No trace of what went wrong in production
- Can't identify slow chains or expensive calls
- No cost monitoring leads to unexpected bills

**Solution**: Set up Langfuse from day one. Single environment variable.

### ❌ Hardcoded API Keys

**Problem**: Security vulnerability, can't change keys per environment.

**Why Bad**:
- Keys exposed in source control
- Can't rotate keys without code changes
- Different environments share same keys

**Solution**: Always use environment variables, never commit .env files.

### ❌ No Input Validation

**Problem**: Prompt injection attacks, excessive token usage.

**Why Bad**:
- Malicious users can manipulate prompts
- Unbounded input leads to high costs
- Security vulnerability in production

**Solution**: Validate inputs at API boundaries, implement length limits.

### ❌ Synchronous-Only Code

**Problem**: Poor performance, can't handle concurrent requests.

**Why Bad**:
- Blocks thread during LLM calls (seconds)
- Can't serve multiple users concurrently
- Poor user experience with high latency

**Solution**: Use async patterns if building API (FastAPI with async def).

### ❌ No Error Handling

**Problem**: Transient API failures cause user-facing errors.

**Why Bad**:
- Network glitches fail entire request
- Rate limits cause complete failures
- Poor user experience

**Solution**: Implement retry logic with exponential backoff.

### ❌ Building Complex Workflows in LangChain

**Problem**: Chains become unmaintainable with nested logic.

**Why Bad**:
- Implicit control flow hard to debug
- No state management for multi-step workflows
- Difficult to add error recovery

**Solution**: Use LangGraph for any complex workflows from the start.

### ❌ No Testing

**Problem**: Production bugs, regression when updating.

**Why Bad**:
- Changes break existing functionality
- No confidence in refactoring
- Issues only caught in production

**Solution**: Write tests with fake LLMs, test core logic.

### ❌ Ignoring Cost Monitoring

**Problem**: Unexpected high bills from LLM usage.

**Why Bad**:
- No visibility into per-request costs
- Usage spikes go unnoticed
- Budget exceeded without warning

**Solution**: Monitor costs in Langfuse, set budget alerts.

## Common Use Cases

### Use Case 1: Simple RAG System

**Appropriate for LangChain**: Yes (linear workflow)

**Setup**: Follow EXAMPLES.md → "RAG Chain"

**Key components**:
- Document loader
- Vector store (Chroma or Qdrant)
- Retriever (k=3 documents)
- LLM for generation

**When to migrate**: If adding conversation history or complex retrieval logic.

### Use Case 2: Chatbot with Memory

**Appropriate for LangChain**: NO - Use LangGraph

**Reason**: Needs state persistence across conversations

**Action**: Invoke `ai-framework-build-langgraph` skill

**Why LangGraph**:
- TypedDict state for conversation history
- PostgreSQL persistence for multi-session memory
- Better error handling for chat flows

### Use Case 3: Multi-Agent System

**Appropriate for LangChain**: NO - Use LangGraph

**Reason**: Multi-agent coordination requires graph architecture

**Action**: Invoke `ai-framework-build-langgraph` skill

**Why LangGraph**:
- Graph nodes for each agent
- Shared state management
- Explicit routing between agents

### Use Case 4: Data Processing Pipeline

**Appropriate for LangChain**: Yes (if one-off/batch)

**Setup**: Simple chain with document processing

**Note**: If ongoing processing with error recovery needed, use LangGraph

**Example**: Batch document summarization, one-time data extraction

### Use Case 5: Quick Prototype/Demo

**Appropriate for LangChain**: Yes (< 2 week lifespan)

**Setup**: Minimal setup, focus on core functionality

**Note**: Plan migration to LangGraph if becoming production app

**Example**: Hackathon project, proof of concept, demo for stakeholders

## Production Checklist

Before deploying, ensure:

- [ ] **Observability configured**: Langfuse or LangSmith set up
- [ ] **Environment variables**: Never commit secrets, use .env
- [ ] **Input validation**: Validate all user inputs, add length limits
- [ ] **Error handling**: Retry logic on API calls, graceful error messages
- [ ] **Rate limiting**: Protect against abuse (if public API)
- [ ] **Caching**: Consider Redis cache for repeated queries
- [ ] **Testing**: Unit and integration tests passing
- [ ] **Documentation**: README with setup and usage instructions
- [ ] **Monitoring**: Set up alerts for errors and high costs
- [ ] **Security**: Input sanitization, output validation

## Migration Path to LangGraph

### When to Migrate

Migrate from LangChain to LangGraph when:
- Users request conversation history
- Need for complex decision logic emerges
- Multi-step workflows with error recovery required
- State management becomes critical
- Production scaling needs arise

### Migration Effort

**Timeline**: Medium (2-5 days)

**Complexity**: Moderate - requires rethinking control flow

### Migration Strategy

**Step 1: Read Existing Implementation**
- Understand current chain structure
- Identify state requirements
- Map dependencies between steps

**Step 2: Invoke LangGraph Skill**
```
Invoke: ai-framework-build-langgraph
```

**Step 3: Map Chains to Graph Nodes**

Before (LangChain):
```python
chain = prompt | llm | parser
```

After (LangGraph):
```python
def agent_node(state: State) -> dict:
    response = llm.invoke(state["messages"])
    return {"messages": [response]}

graph.add_node("agent", agent_node)
```

**Step 4: Add State Schema**
```python
from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages

class State(TypedDict):
    messages: Annotated[list[dict], add_messages]
    # Add other state fields as needed
```

**Step 5: Implement Persistence**
- Set up PostgreSQL checkpointer
- Configure thread-based conversation tracking
- Test state persistence across sessions

**Step 6: Test Thoroughly**
- Unit tests for each node
- Integration tests for full graph
- Load testing for production scale
- Verify state persistence works correctly

### Migration Checklist

- [ ] Map all chains to graph nodes
- [ ] Define TypedDict state schema
- [ ] Implement PostgreSQL checkpointer
- [ ] Update API endpoints for streaming
- [ ] Migrate observability (Langfuse still works)
- [ ] Update tests for graph structure
- [ ] Update documentation
- [ ] Deploy to staging environment
- [ ] Run load tests
- [ ] Deploy to production

### Backward Compatibility

If maintaining both versions during migration:
- Keep LangChain code in `src/chains/legacy/`
- New LangGraph code in `src/graphs/`
- Feature flag to switch between implementations
- Gradual rollout to users
