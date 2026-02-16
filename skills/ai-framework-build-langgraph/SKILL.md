---
name: building-langgraph-agents
description: Build production-ready stateful AI agents using LangGraph with 2026 best practices. Includes TypedDict state management, PostgreSQL persistence, FastAPI streaming, Langfuse observability, and comprehensive error handling.
---

# Building LangGraph Agents (2026)

## Purpose
Build production-grade LangGraph agents following industry standards: TypedDict state schemas, PostgresSaver persistence, SSE streaming, multi-level error handling, and Langfuse observability.

## When to Use
- Building conversational AI agents with state persistence
- Multi-agent orchestration systems
- Agents requiring human-in-the-loop interactions
- Production deployments requiring scalability and observability

## Prerequisites
- Python 3.11+
- uv for package management
- FastAPI backend (for streaming endpoints)
- PostgreSQL (for production persistence)

## Quick Reference

📋 **Examples**: See `examples/` directory for complete implementations
📚 **Reference**: See `reference/` directory for quick lookups

## Process

### Step 1: Gather Context

**Read project documentation first:**
```bash
cat docs/PROJECT_DESCRIPTION.md
cat docs/ARCHITECTURE.md
```

**Determine requirements:**
1. **Agent purpose**: What problem does it solve?
2. **State needs**: What data persists between interactions?
3. **Streaming required**: Chat UI (yes), batch processing (no)?
4. **Persistence level**: Development (SQLite), production (PostgreSQL)?
5. **Tools/integrations**: External APIs, databases, search?
6. **Human-in-loop**: Approval steps, interrupts?
7. **Multi-agent**: Single agent or orchestration?

**Decision matrix:**
- **Small prototype/demo** → MemorySaver, no streaming, simple REST
- **Production chat app** → PostgresSaver, SSE streaming, Langfuse observability
- **Multi-agent system** → Supervisor pattern, PostgresSaver, comprehensive error handling
- **Background processing** → PostgresSaver, no streaming, batch endpoints

### Step 2: Install Dependencies

```bash
# Core LangGraph + LangChain
uv add langgraph langchain-core langchain-anthropic

# Production persistence (choose one)
uv add langgraph-checkpoint-postgres  # PostgreSQL (recommended)
uv add langgraph-checkpoint-sqlite    # SQLite (small deployments)

# Streaming support (if needed)
uv add sse-starlette  # For SSE with FastAPI

# Observability (recommended)
uv add langfuse

# Async database driver (for PostgreSQL)
uv add asyncpg
```

### Step 3: Define State Schema

**Use TypedDict with Annotated reducers (2026 standard):**

```python
# backend/agents/state.py
from typing import Annotated
from typing_extensions import TypedDict
from operator import add
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    """
    Agent state schema with typed fields and reducers.

    Reducers:
    - add_messages: Appends new messages to existing list
    - add: Concatenates lists
    - No reducer: Replaces value
    """
    # Messages with automatic appending
    messages: Annotated[list[dict], add_messages]

    # User context (single values, no reducer)
    user_id: str
    session_id: str

    # Results accumulation
    results: Annotated[list[str], add]

    # Status tracking (replaces on update)
    status: str  # "processing" | "success" | "error"
    error: str | None

    # Agent-specific data
    current_step: str
    metadata: dict
```

**Anti-pattern: Don't store large objects**
```python
# ❌ BAD - Causes database bloat
class BadState(TypedDict):
    pdf_content: bytes  # 50MB PDF → 500MB after 10 checkpoints
    full_documents: list[dict]  # Grows indefinitely

# ✅ GOOD - Store references
class GoodState(TypedDict):
    pdf_url: str  # Reference to S3/storage
    document_ids: list[str]  # Query from DB when needed
```

### Step 4: Create Nodes with Error Handling

**Node structure (2026 pattern):**

```python
# backend/agents/nodes.py
from agents.state import AgentState
from langchain_anthropic import ChatAnthropic
import asyncio

# Initialize LLM (reuse across invocations)
llm = ChatAnthropic(model="claude-sonnet-4-5-20250929", temperature=0.7)

async def research_node(state: AgentState) -> dict:
    """
    Research node with error handling and retry logic.

    Returns partial state updates (not full state).
    """
    try:
        query = state["messages"][-1]["content"]

        # Async LLM call
        response = await llm.ainvoke([
            {"role": "system", "content": "You are a research assistant."},
            *state["messages"]
        ])

        return {
            "messages": [{"role": "assistant", "content": response.content}],
            "results": [response.content],
            "status": "success",
            "current_step": "research_complete"
        }

    except RateLimitError as e:
        # Retry with exponential backoff
        await asyncio.sleep(2 ** state.get("retry_count", 0))
        return {
            "status": "retry",
            "error": f"Rate limited: {str(e)}",
            "retry_count": state.get("retry_count", 0) + 1
        }

    except Exception as e:
        # Log error and return error state
        logger.error(f"Research node failed: {e}", exc_info=True)
        return {
            "status": "error",
            "error": str(e),
            "current_step": "research_failed"
        }

def error_handler_node(state: AgentState) -> dict:
    """Handle errors gracefully."""
    return {
        "messages": [{
            "role": "assistant",
            "content": f"I encountered an error: {state.get('error', 'Unknown error')}. Please try again."
        }],
        "status": "recovered",
        "current_step": "error_handled"
    }
```

**Key principles:**
- ✅ Use `async def` for I/O operations (LLM calls, API requests)
- ✅ Return partial state updates (only changed fields)
- ✅ Wrap risky operations in try-except
- ✅ Return error state instead of raising exceptions
- ✅ Log errors for debugging

### Step 5: Build Graph with Routing

```python
# backend/agents/graph.py
from langgraph.graph import StateGraph, END, START
from agents.state import AgentState
from agents.nodes import research_node, error_handler_node

# Create graph
graph = StateGraph(AgentState)

# Add nodes
graph.add_node("research", research_node)
graph.add_node("error_handler", error_handler_node)

# Entry point
graph.add_edge(START, "research")

# Conditional routing based on status
def route_on_status(state: AgentState) -> str:
    """Route to error handler or end based on status."""
    if state["status"] == "error":
        return "error_handler"
    elif state["status"] == "retry" and state.get("retry_count", 0) < 3:
        return "research"  # Retry
    return END

graph.add_conditional_edges(
    "research",
    route_on_status,
    {
        "error_handler": "error_handler",
        "research": "research",
        END: END
    }
)

# Error handler always goes to END
graph.add_edge("error_handler", END)
```

### Step 6: Configure Persistence

**Production (PostgreSQL):**

```python
# backend/agents/checkpointer.py
from langgraph.checkpoint.postgres import AsyncPostgresSaver
import asyncpg
import os

async def get_checkpointer():
    """
    Initialize PostgreSQL checkpointer with proper configuration.

    CRITICAL: Must include autocommit=True and dict row factory.
    """
    DATABASE_URL = os.getenv("DATABASE_URL")

    # Create connection pool
    pool = await asyncpg.create_pool(
        DATABASE_URL,
        min_size=5,
        max_size=20,
        command_timeout=60,
        server_settings={
            'jit': 'off'  # Disable JIT for faster queries
        }
    )

    # Initialize checkpointer
    checkpointer = AsyncPostgresSaver(pool)

    # Setup tables (run once at startup)
    await checkpointer.setup()

    return checkpointer

# In your app initialization
checkpointer = await get_checkpointer()
app = graph.compile(checkpointer=checkpointer)
```

**Development (MemorySaver):**

```python
from langgraph.checkpoint.memory import MemorySaver

# Only for local development and testing
checkpointer = MemorySaver()
app = graph.compile(checkpointer=checkpointer)
```

**Important notes:**
- ✅ Use `AsyncPostgresSaver` for async FastAPI apps
- ✅ Configure connection pooling (prevents resource exhaustion)
- ✅ Run `.setup()` once at startup (creates checkpoint tables)
- ❌ Never use `MemorySaver` in production (data loss on restart)
- ❌ Don't skip `autocommit=True` (setup will fail silently)

### Step 7: Add Observability (Langfuse)

```python
# backend/main.py
from langfuse import get_client, Langfuse
from langfuse.langchain import CallbackHandler

# Initialize Langfuse (once at startup)
Langfuse(
    public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
    secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
    host=os.getenv("LANGFUSE_BASE_URL", "https://cloud.langfuse.com")
)

langfuse = get_client()

# Create handler for each request
def get_langfuse_handler(user_id: str, session_id: str):
    """Create Langfuse handler with metadata."""
    return CallbackHandler()

# In agent invocation
async def invoke_agent(query: str, user_id: str, session_id: str):
    handler = get_langfuse_handler(user_id, session_id)

    config = {
        "configurable": {"thread_id": f"{user_id}-{session_id}"},
        "callbacks": [handler],
        "metadata": {
            "langfuse_user_id": user_id,
            "langfuse_session_id": session_id,
            "langfuse_tags": ["production", "agent-v2"]
        }
    }

    result = await app.ainvoke(initial_state, config)
    return result
```

**View traces:** Navigate to Langfuse dashboard to see execution traces, token usage, latency, and costs.

### Step 8: Create FastAPI Endpoint with Streaming

**For chat UIs (SSE streaming):**

```python
# backend/api/agent_routes.py
from fastapi import FastAPI, HTTPException
from sse_starlette.sse import EventSourceResponse
import json

app = FastAPI()

@app.post("/agent/stream")
async def stream_agent(
    query: str,
    user_id: str,
    session_id: str
):
    """
    Stream agent responses using Server-Sent Events.

    Frontend connects with EventSource API.
    """
    config = {
        "configurable": {"thread_id": f"{user_id}-{session_id}"},
        "callbacks": [get_langfuse_handler(user_id, session_id)],
        "metadata": {
            "langfuse_user_id": user_id,
            "langfuse_session_id": session_id
        }
    }

    initial_state = {
        "messages": [{"role": "user", "content": query}],
        "user_id": user_id,
        "session_id": session_id,
        "status": "processing",
        "results": [],
        "current_step": "started"
    }

    async def event_generator():
        """Generate SSE events."""
        try:
            # Stream with "messages" mode for token-level streaming
            async for chunk in agent_app.astream(
                initial_state,
                config,
                stream_mode="messages"  # Token-by-token
            ):
                # Send message chunk
                yield {
                    "event": "message",
                    "data": json.dumps({
                        "content": chunk.content if hasattr(chunk, 'content') else str(chunk),
                        "type": "token"
                    })
                }

            # Send completion event
            yield {
                "event": "done",
                "data": json.dumps({"status": "complete"})
            }

        except Exception as e:
            # Send error event
            logger.error(f"Stream error: {e}", exc_info=True)
            yield {
                "event": "error",
                "data": json.dumps({"error": str(e)})
            }

    return EventSourceResponse(event_generator())

@app.post("/agent/invoke")
async def invoke_agent_sync(
    query: str,
    user_id: str,
    session_id: str
):
    """
    Non-streaming endpoint (for batch processing).

    Returns complete response after execution finishes.
    """
    config = {
        "configurable": {"thread_id": f"{user_id}-{session_id}"},
        "callbacks": [get_langfuse_handler(user_id, session_id)]
    }

    initial_state = {
        "messages": [{"role": "user", "content": query}],
        "user_id": user_id,
        "session_id": session_id,
        "status": "processing"
    }

    try:
        result = await agent_app.ainvoke(initial_state, config)
        return {
            "answer": result["messages"][-1]["content"],
            "status": result["status"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

**Stream mode options:**
- `"messages"` - Token-by-token streaming (best for chat UIs)
- `"updates"` - State changes after each node (progress indicators)
- `"values"` - Full state after each node (debugging)
- `"custom"` - Custom events from nodes

### Step 9: Frontend Integration (React)

```typescript
// frontend/src/hooks/useAgentStream.ts
import { useState, useCallback } from 'react';

export function useAgentStream() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const streamQuery = useCallback(async (
    query: string,
    userId: string,
    sessionId: string
  ) => {
    setLoading(true);
    setError(null);

    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', content: query }]);

    // Initialize empty assistant message
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    const eventSource = new EventSource(
      `/api/agent/stream?query=${encodeURIComponent(query)}&user_id=${userId}&session_id=${sessionId}`
    );

    eventSource.addEventListener('message', (e) => {
      const data = JSON.parse(e.data);

      // Append token to last assistant message
      setMessages(prev => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];

        if (lastMsg.role === 'assistant') {
          lastMsg.content += data.content;
        }

        return updated;
      });
    });

    eventSource.addEventListener('done', () => {
      setLoading(false);
      eventSource.close();
    });

    eventSource.addEventListener('error', (e) => {
      const data = e.data ? JSON.parse(e.data) : {};
      setError(data.error || 'Stream error');
      setLoading(false);
      eventSource.close();
    });

    return () => eventSource.close();
  }, []);

  return { messages, loading, error, streamQuery };
}
```

### Step 10: Testing Strategy

**Unit test individual nodes:**

```python
# tests/test_nodes.py
import pytest
from agents.nodes import research_node
from agents.state import AgentState

@pytest.mark.asyncio
async def test_research_node_success():
    """Test successful research node execution."""
    state: AgentState = {
        "messages": [{"role": "user", "content": "What is LangGraph?"}],
        "user_id": "test_user",
        "session_id": "test_session",
        "status": "processing",
        "results": [],
        "current_step": "started"
    }

    result = await research_node(state)

    assert result["status"] == "success"
    assert len(result["results"]) > 0
    assert "messages" in result

@pytest.mark.asyncio
async def test_research_node_error_handling():
    """Test error handling in research node."""
    # Test with invalid state to trigger error
    state: AgentState = {
        "messages": [],  # Empty messages should cause error
        "user_id": "test_user",
        "status": "processing"
    }

    result = await research_node(state)

    assert result["status"] == "error"
    assert "error" in result
```

**Integration test full graph:**

```python
# tests/test_graph.py
import pytest
from langgraph.checkpoint.memory import MemorySaver
from agents.graph import graph

@pytest.fixture
def test_app():
    """Create test graph with MemorySaver."""
    return graph.compile(checkpointer=MemorySaver())

@pytest.mark.asyncio
async def test_full_graph_execution(test_app):
    """Test end-to-end graph execution."""
    config = {"configurable": {"thread_id": "test-thread"}}

    initial_state = {
        "messages": [{"role": "user", "content": "Test query"}],
        "user_id": "test_user",
        "session_id": "test_session",
        "status": "processing",
        "results": []
    }

    result = await test_app.ainvoke(initial_state, config)

    assert result["status"] in ["success", "recovered"]
    assert len(result["messages"]) > 1

@pytest.mark.asyncio
async def test_checkpoint_persistence(test_app):
    """Test state persistence with checkpoints."""
    config = {"configurable": {"thread_id": "checkpoint-test"}}

    # First invocation
    state1 = {
        "messages": [{"role": "user", "content": "First message"}],
        "user_id": "test_user",
        "status": "processing"
    }

    await test_app.ainvoke(state1, config)

    # Second invocation with same thread_id should have history
    state2 = {
        "messages": [{"role": "user", "content": "Second message"}],
        "user_id": "test_user",
        "status": "processing"
    }

    result = await test_app.ainvoke(state2, config)

    # Should have both messages in history
    assert len(result["messages"]) >= 3  # User1, Assistant1, User2
```

## Architecture Patterns

### Single Agent (Simple)
```
START → Agent → END
```
Best for: Simple chat, Q&A, single-purpose assistants

### Supervisor Pattern (Multi-Agent)
```
START → Supervisor → [Worker1, Worker2, Worker3] → Supervisor → END
```
Best for: Task delegation, specialized agents, complex workflows

See: `examples/supervisor-pattern.py`

### Scatter-Gather (Parallel)
```
START → Router → [Agent1, Agent2, Agent3] (parallel) → Aggregator → END
```
Best for: Research, multi-source data gathering, parallel processing

### Human-in-the-Loop
```
START → Agent → INTERRUPT → (wait for approval) → Resume → END
```
Best for: Approval workflows, sensitive operations, verification

See: `examples/human-in-loop.py`

## Common Patterns

### Retry Logic
```python
def route_on_retry(state):
    if state["status"] == "retry" and state.get("retry_count", 0) < 3:
        return "retry_node"
    return "error_handler"
```

### Conditional Branching
```python
def route_by_intent(state):
    """Route based on user intent."""
    intent = classify_intent(state["messages"][-1]["content"])

    if intent == "search":
        return "search_node"
    elif intent == "calculate":
        return "calculator_node"
    else:
        return "chat_node"
```

### State Cleanup
```python
def cleanup_node(state):
    """Remove temporary data before END."""
    return {
        "metadata": {},  # Clear metadata
        "error": None,   # Clear error
        "status": "complete"
    }
```

## Production Checklist

Before deploying to production:

- [ ] State schema uses TypedDict with proper reducers
- [ ] PostgresSaver configured with connection pooling
- [ ] All nodes have error handling (try-except)
- [ ] Graph has error routing and recovery paths
- [ ] Langfuse observability configured
- [ ] Streaming endpoint tested with frontend
- [ ] Unit tests for all nodes
- [ ] Integration tests for full graph
- [ ] Environment variables configured (.env)
- [ ] Database migrations run (checkpointer.setup())
- [ ] Connection pool limits set appropriately
- [ ] Logging configured (structured JSON logs)
- [ ] Rate limiting implemented (if using external APIs)
- [ ] Monitoring/alerting set up (error rates, latency)
- [ ] Checkpoint cleanup job scheduled (TTL)

## Quick Commands

```bash
# Install all dependencies
uv add langgraph langchain-anthropic langgraph-checkpoint-postgres sse-starlette langfuse asyncpg

# Run tests
uv run pytest tests/ -v

# Start development server
uv run uvicorn backend.main:app --reload

# Run database migrations
uv run python -c "from agents.checkpointer import get_checkpointer; import asyncio; asyncio.run(get_checkpointer())"
```

## Troubleshooting

**Checkpoint tables not created:**
- Ensure `autocommit=True` in PostgreSQL connection
- Run `await checkpointer.setup()` at startup
- Check database permissions

**Streaming not working:**
- Verify `sse-starlette` installed
- Check CORS configuration in FastAPI
- Test EventSource connection in browser console

**State not persisting:**
- Verify `thread_id` passed in config
- Check checkpointer initialized before graph compilation
- Ensure database connection successful

**High database storage:**
- Implement checkpoint TTL/cleanup
- Avoid storing large objects in state
- Use references (URLs, IDs) instead of full data

## Resources

- **Research Report**: `~/.claude/docs/research/2026-02-15-langgraph-production-best-practices.md`
- **Examples**: `examples/` directory
- **Reference**: `reference/` directory
- **LangGraph Docs**: https://docs.langchain.com/langgraph
- **Langfuse Integration**: https://langfuse.com/integrations/frameworks/langchain
