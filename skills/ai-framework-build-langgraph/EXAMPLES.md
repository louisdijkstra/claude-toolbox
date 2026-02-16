# LangGraph Examples

Complete code implementations for building production-ready LangGraph agents.

## Table of Contents

1. [State Schema](#state-schema)
2. [Node Implementations](#node-implementations)
3. [Graph Construction](#graph-construction)
4. [Checkpointer Configuration](#checkpointer-configuration)
5. [Langfuse Integration](#langfuse-integration)
6. [FastAPI Endpoints](#fastapi-endpoints)
7. [Frontend Integration](#frontend-integration)
8. [Testing Patterns](#testing-patterns)
9. [Architecture Patterns](#architecture-patterns)
10. [Common Patterns](#common-patterns)

## State Schema

### Basic State with Reducers

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

### Anti-Pattern: Large Objects

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

## Node Implementations

### Research Node with Error Handling

```python
# backend/agents/nodes.py
from agents.state import AgentState
from langchain_anthropic import ChatAnthropic
import asyncio
import logging

logger = logging.getLogger(__name__)

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

### Key Node Principles

- ✅ Use `async def` for I/O operations (LLM calls, API requests)
- ✅ Return partial state updates (only changed fields)
- ✅ Wrap risky operations in try-except
- ✅ Return error state instead of raising exceptions
- ✅ Log errors for debugging

## Graph Construction

### Basic Graph with Error Routing

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

## Checkpointer Configuration

### Production PostgreSQL

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

### Development MemorySaver

```python
from langgraph.checkpoint.memory import MemorySaver

# Only for local development and testing
checkpointer = MemorySaver()
app = graph.compile(checkpointer=checkpointer)
```

### Important Notes

- ✅ Use `AsyncPostgresSaver` for async FastAPI apps
- ✅ Configure connection pooling (prevents resource exhaustion)
- ✅ Run `.setup()` once at startup (creates checkpoint tables)
- ❌ Never use `MemorySaver` in production (data loss on restart)

## Langfuse Integration

### Setup and Configuration

```python
# backend/main.py
from langfuse import get_client, Langfuse
from langfuse.langchain import CallbackHandler
import os

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

View traces in Langfuse dashboard to see execution traces, token usage, latency, and costs.

## FastAPI Endpoints

### SSE Streaming Endpoint

```python
# backend/api/agent_routes.py
from fastapi import FastAPI, HTTPException
from sse_starlette.sse import EventSourceResponse
import json
import logging

logger = logging.getLogger(__name__)
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
```

### Batch Processing Endpoint

```python
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

## Frontend Integration

### React Hook for SSE Streaming

```typescript
// frontend/src/hooks/useAgentStream.ts
import { useState, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

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

### Using the Hook

```typescript
// frontend/src/components/ChatInterface.tsx
import { useAgentStream } from '../hooks/useAgentStream';

function ChatInterface() {
  const { messages, loading, error, streamQuery } = useAgentStream();
  const [input, setInput] = useState('');

  const handleSubmit = async () => {
    await streamQuery(input, 'user-123', 'session-456');
    setInput('');
  };

  return (
    <div>
      {messages.map((msg, idx) => (
        <div key={idx} className={msg.role}>
          {msg.content}
        </div>
      ))}
      {loading && <div>Thinking...</div>}
      {error && <div>Error: {error}</div>}
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={handleSubmit} disabled={loading}>Send</button>
    </div>
  );
}
```

## Testing Patterns

### Unit Tests for Nodes

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

### Integration Tests for Full Graph

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

### Supervisor Pattern (Multi-Agent)

```python
# backend/agents/supervisor.py
from langgraph.graph import StateGraph, START, END
from typing import Literal

class SupervisorState(TypedDict):
    messages: Annotated[list[dict], add_messages]
    next_worker: str
    task_results: dict

def supervisor_node(state: SupervisorState) -> dict:
    """Supervisor decides which worker to route to."""
    last_message = state["messages"][-1]["content"]

    # Classify task
    if "search" in last_message.lower():
        return {"next_worker": "search_worker"}
    elif "calculate" in last_message.lower():
        return {"next_worker": "calc_worker"}
    else:
        return {"next_worker": "chat_worker"}

def router(state: SupervisorState) -> Literal["search_worker", "calc_worker", "chat_worker", END]:
    """Route to next worker or END."""
    if state.get("next_worker"):
        return state["next_worker"]
    return END

# Build supervisor graph
graph = StateGraph(SupervisorState)
graph.add_node("supervisor", supervisor_node)
graph.add_node("search_worker", search_worker_node)
graph.add_node("calc_worker", calc_worker_node)
graph.add_node("chat_worker", chat_worker_node)

graph.add_edge(START, "supervisor")
graph.add_conditional_edges(
    "supervisor",
    router,
    {
        "search_worker": "search_worker",
        "calc_worker": "calc_worker",
        "chat_worker": "chat_worker",
        END: END
    }
)

# Workers route back to supervisor
graph.add_edge("search_worker", "supervisor")
graph.add_edge("calc_worker", "supervisor")
graph.add_edge("chat_worker", END)
```

### Human-in-the-Loop Pattern

```python
# backend/agents/human_in_loop.py
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.postgres import AsyncPostgresSaver

class ApprovalState(TypedDict):
    messages: Annotated[list[dict], add_messages]
    approval_needed: bool
    approved: bool | None

def action_node(state: ApprovalState) -> dict:
    """Perform action that requires approval."""
    return {
        "messages": [{"role": "assistant", "content": "I want to delete the database. Approve?"}],
        "approval_needed": True
    }

def execute_node(state: ApprovalState) -> dict:
    """Execute after approval."""
    if state["approved"]:
        return {"messages": [{"role": "assistant", "content": "Database deleted."}]}
    else:
        return {"messages": [{"role": "assistant", "content": "Action cancelled."}]}

# Build graph with interrupt
graph = StateGraph(ApprovalState)
graph.add_node("action", action_node)
graph.add_node("execute", execute_node)

graph.add_edge(START, "action")
graph.add_edge("action", "execute")
graph.add_edge("execute", END)

# Compile with interrupt before execute
app = graph.compile(
    checkpointer=checkpointer,
    interrupt_before=["execute"]  # Pause before execute
)

# Usage
config = {"configurable": {"thread_id": "user-123"}}

# Initial invocation (stops at interrupt)
result = await app.ainvoke(initial_state, config)
# Agent asks for approval, waits

# User approves
approval_state = {"approved": True}
result = await app.ainvoke(approval_state, config)
# Agent executes action
```

## Common Patterns

### Retry Logic

```python
def route_on_retry(state: AgentState) -> str:
    """Retry failed operations with limit."""
    if state["status"] == "retry" and state.get("retry_count", 0) < 3:
        return "retry_node"
    return "error_handler"
```

### Conditional Branching

```python
def route_by_intent(state: AgentState) -> str:
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
def cleanup_node(state: AgentState) -> dict:
    """Remove temporary data before END."""
    return {
        "metadata": {},  # Clear metadata
        "error": None,   # Clear error
        "status": "complete"
    }
```
