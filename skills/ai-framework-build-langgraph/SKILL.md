---
name: building-langgraph-agents
description: Build production-ready stateful AI agents using LangGraph with 2026 best practices. Includes TypedDict state management, PostgreSQL persistence, FastAPI streaming, Langfuse observability, and comprehensive error handling.
---

# Building LangGraph Agents

## Purpose
Build production-ready stateful AI agents using LangGraph. Follow 2026 industry standards for state management, persistence, streaming, error handling, and observability.

## When to Use
- Building conversational AI with state persistence across sessions
- Multi-agent orchestration with shared state
- Agents requiring human-in-the-loop interactions
- Production deployments requiring scalability and observability
- Complex workflows with conditional logic and loops

**Do NOT use for:**
- Simple linear workflows (use LangChain instead)
- Stateless operations (use direct API calls)
- Rapid prototypes under 2 weeks lifespan (MemorySaver acceptable)

If unsure whether LangGraph is appropriate, ask the user about state persistence needs and workflow complexity.

## Prerequisites
Before starting, verify:
- Python 3.11+ installed
- uv for package management
- FastAPI backend exists (for streaming endpoints)
- PostgreSQL available (for production persistence)
- LLM provider credentials configured (Anthropic/OpenAI/Bedrock)

## Quick Reference

📋 **Detailed Examples**: See EXAMPLES.md for complete code
📚 **API Reference**: See REFERENCE.md for quick lookups
🔧 **Troubleshooting**: See TROUBLESHOOTING.md for common issues

## Process

Follow these steps to build a production-ready LangGraph agent:

### Step 1: Gather Context and Requirements

Read project documentation first:
```bash
cat docs/PROJECT_DESCRIPTION.md
cat docs/ARCHITECTURE.md
```

Ask the user to clarify:
1. **Agent purpose** - What problem does it solve?
2. **State requirements** - What data persists between interactions?
3. **Streaming needs** - Chat UI (yes) or batch processing (no)?
4. **Deployment environment** - Development (SQLite) or production (PostgreSQL)?
5. **External integrations** - APIs, databases, search tools?
6. **Human approval** - Does workflow require human-in-the-loop?
7. **Agent architecture** - Single agent or multi-agent orchestration?

**Decision matrix:**
- Small prototype → MemorySaver, simple REST
- Production chat → PostgresSaver, SSE streaming, Langfuse
- Multi-agent system → Supervisor pattern, PostgresSaver
- Background jobs → PostgresSaver, batch endpoints

### Step 2: Install Dependencies

```bash
# Core (always required)
uv add langgraph langchain-core langchain-anthropic

# Persistence (choose one)
uv add langgraph-checkpoint-postgres  # Production (recommended)
uv add langgraph-checkpoint-sqlite    # Small deployments only

# Optional features
uv add sse-starlette  # SSE streaming for FastAPI
uv add langfuse       # Observability
uv add asyncpg        # Async PostgreSQL driver
```

### Step 3: Define State Schema

Create TypedDict with Annotated reducers (2026 standard):
- Use `add_messages` for message history
- Use `add` for list accumulation
- No reducer for single values (replaces on update)
- Store references (URLs, IDs), not large objects (PDFs, documents)

See REFERENCE.md for complete state schema patterns.

### Step 4: Create Nodes with Error Handling

Implement nodes following these principles:
- Use `async def` for I/O operations
- Return partial state updates (only changed fields)
- Wrap risky operations in try-except
- Return error state instead of raising exceptions
- Log errors for debugging

See EXAMPLES.md for complete node implementations with error handling.

### Step 5: Build Graph with Routing

Create StateGraph:
1. Add all nodes
2. Connect START to first node
3. Add conditional edges for routing logic
4. Handle error states with error_handler node
5. Route successful completion to END

See EXAMPLES.md for graph construction patterns.

### Step 6: Configure Persistence

**Production:** Use AsyncPostgresSaver with connection pooling
- Configure pool (min_size=5, max_size=20)
- Run `await checkpointer.setup()` at startup
- Never use MemorySaver in production

**Development:** MemorySaver for testing only

See REFERENCE.md for complete checkpointer configuration.

### Step 7: Add Observability

Integrate Langfuse for tracing:
1. Initialize Langfuse at startup
2. Create CallbackHandler per request
3. Pass handler in config with metadata
4. View traces in Langfuse dashboard

See EXAMPLES.md for Langfuse integration code.

### Step 8: Create FastAPI Endpoints

**For chat UIs:** SSE streaming endpoint using sse-starlette
- Stream with `stream_mode="messages"` for tokens
- Handle connection lifecycle (open/close/error)
- Return EventSourceResponse

**For batch processing:** Standard POST endpoint
- Use `ainvoke` instead of `astream`
- Return complete response when done

See EXAMPLES.md for complete endpoint implementations.

### Step 9: Frontend Integration

For React apps using EventSource:
- Create custom hook for SSE connection
- Handle message, done, and error events
- Update UI incrementally as tokens arrive

See EXAMPLES.md for React integration code.

### Step 10: Testing

**Unit tests:** Test individual nodes with pytest
- Mock LLM calls
- Test error handling paths
- Verify state updates

**Integration tests:** Test full graph execution
- Use MemorySaver for tests
- Verify checkpoint persistence
- Test multi-turn conversations

See EXAMPLES.md for complete test patterns.

## Architecture Patterns

Choose the pattern that fits your use case:

**Single Agent** - Simple chat, Q&A, single-purpose assistants
```
START → Agent → END
```

**Supervisor** - Task delegation, specialized agents, complex workflows
```
START → Supervisor → [Worker1, Worker2, Worker3] → Supervisor → END
```

**Scatter-Gather** - Research, multi-source gathering, parallel processing
```
START → Router → [Agent1, Agent2, Agent3] (parallel) → Aggregator → END
```

**Human-in-the-Loop** - Approval workflows, sensitive operations
```
START → Agent → INTERRUPT → (wait for approval) → Resume → END
```

See EXAMPLES.md for detailed architecture pattern implementations.

## Production Checklist

Before deploying to production, verify:

**Configuration:**
- [ ] State schema uses TypedDict with proper reducers
- [ ] PostgresSaver configured with connection pooling
- [ ] Environment variables configured (.env)
- [ ] Database migrations run (`checkpointer.setup()`)

**Code Quality:**
- [ ] All nodes have error handling (try-except)
- [ ] Graph has error routing and recovery paths
- [ ] Logging configured (structured JSON logs)
- [ ] Unit tests for all nodes pass
- [ ] Integration tests for full graph pass

**Observability:**
- [ ] Langfuse tracing configured
- [ ] Monitoring/alerting set up (error rates, latency)
- [ ] Rate limiting implemented (if using external APIs)

**Performance:**
- [ ] Connection pool limits set appropriately
- [ ] Checkpoint cleanup job scheduled (TTL)
- [ ] Streaming endpoint tested with frontend

## Quick Commands

```bash
# Install all dependencies
uv add langgraph langchain-anthropic langgraph-checkpoint-postgres sse-starlette langfuse asyncpg

# Run tests
uv run pytest tests/ -v

# Start development server
uv run uvicorn backend.main:app --reload

# Initialize database tables
uv run python -c "from agents.checkpointer import get_checkpointer; import asyncio; asyncio.run(get_checkpointer())"
```

## Additional Resources

- **EXAMPLES.md** - Complete code implementations for all patterns
- **REFERENCE.md** - API reference and configuration details
- **TROUBLESHOOTING.md** - Common issues and solutions
- **Research Report** - `~/.claude/docs/research/2026-02-15-langgraph-production-best-practices.md`
- **LangGraph Docs** - https://docs.langchain.com/langgraph
- **Langfuse Integration** - https://langfuse.com/integrations/frameworks/langchain
