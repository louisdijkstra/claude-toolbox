# LangGraph Quick Reference (2026)

## Installation

```bash
# Core
uv add langgraph langchain-core langchain-anthropic

# Production persistence
uv add langgraph-checkpoint-postgres asyncpg

# Streaming
uv add sse-starlette

# Observability
uv add langfuse
```

## State Schema

```python
from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    messages: Annotated[list[dict], add_messages]  # Auto-append
    user_id: str
    status: str
    error: str | None
```

## Node Pattern

```python
async def my_node(state: AgentState) -> dict:
    """Return partial state updates."""
    try:
        result = await operation(state["messages"])
        return {"result": result, "status": "success"}
    except Exception as e:
        logger.error(f"Node failed: {e}", exc_info=True)
        return {"status": "error", "error": str(e)}
```

## Graph Building

```python
from langgraph.graph import StateGraph, END, START

graph = StateGraph(AgentState)

# Add nodes
graph.add_node("process", process_node)
graph.add_node("error_handler", error_handler_node)

# Entry point
graph.add_edge(START, "process")

# Conditional routing
def route_fn(state):
    return "error_handler" if state["status"] == "error" else END

graph.add_conditional_edges("process", route_fn, {
    "error_handler": "error_handler",
    END: END
})

graph.add_edge("error_handler", END)
```

## Persistence

```python
# Production (PostgreSQL)
from langgraph.checkpoint.postgres import AsyncPostgresSaver
import asyncpg

pool = await asyncpg.create_pool(DATABASE_URL, min_size=5, max_size=20)
checkpointer = AsyncPostgresSaver(pool)
await checkpointer.setup()
app = graph.compile(checkpointer=checkpointer)

# Development (MemorySaver)
from langgraph.checkpoint.memory import MemorySaver

app = graph.compile(checkpointer=MemorySaver())
```

## Langfuse Observability

```python
from langfuse import Langfuse
from langfuse.langchain import CallbackHandler

# Initialize once at startup
Langfuse(
    public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
    secret_key=os.getenv("LANGFUSE_SECRET_KEY")
)

# Create handler per request
handler = CallbackHandler()

config = {
    "configurable": {"thread_id": f"{user_id}-{session_id}"},
    "callbacks": [handler],
    "metadata": {
        "langfuse_user_id": user_id,
        "langfuse_session_id": session_id,
        "langfuse_tags": ["production"]
    }
}

result = await app.ainvoke(state, config)
```

## Streaming (FastAPI + SSE)

```python
from sse_starlette.sse import EventSourceResponse
import json

@app.post("/agent/stream")
async def stream_agent(query: str, user_id: str):
    config = {
        "configurable": {"thread_id": f"{user_id}"},
        "callbacks": [CallbackHandler()]
    }

    async def event_generator():
        try:
            async for chunk in app.astream(state, config, stream_mode="messages"):
                yield {
                    "event": "message",
                    "data": json.dumps({"content": chunk.content})
                }
            yield {"event": "done", "data": json.dumps({"status": "complete"})}
        except Exception as e:
            yield {"event": "error", "data": json.dumps({"error": str(e)})}

    return EventSourceResponse(event_generator())
```

## Frontend (React EventSource)

```typescript
const eventSource = new EventSource(`/api/agent/stream?query=${query}&user_id=${userId}`);

eventSource.addEventListener('message', (e) => {
  const data = JSON.parse(e.data);
  appendToken(data.content);
});

eventSource.addEventListener('done', () => {
  eventSource.close();
  setLoading(false);
});

eventSource.addEventListener('error', (e) => {
  console.error(e);
  eventSource.close();
});
```

## Testing

```python
import pytest
from langgraph.checkpoint.memory import MemorySaver

@pytest.fixture
def test_app():
    return graph.compile(checkpointer=MemorySaver())

@pytest.mark.asyncio
async def test_node():
    state = {"messages": [{"role": "user", "content": "test"}]}
    result = await my_node(state)
    assert result["status"] == "success"

@pytest.mark.asyncio
async def test_graph(test_app):
    config = {"configurable": {"thread_id": "test"}}
    result = await test_app.ainvoke(initial_state, config)
    assert result["status"] in ["success", "recovered"]
```

## Stream Modes

| Mode | Use Case | Data Sent |
|------|----------|-----------|
| `"messages"` | Chat UIs | Token-by-token |
| `"updates"` | Progress indicators | State changes only |
| `"values"` | Debugging | Full state after each node |
| `"custom"` | Custom events | User-defined |

## Error Handling Levels

```python
# Node level
async def node(state):
    try:
        result = await operation()
        return {"result": result, "status": "success"}
    except Exception as e:
        return {"status": "error", "error": str(e)}

# Graph level (routing)
def route_on_error(state):
    return "error_handler" if state["status"] == "error" else END

# App level (FastAPI)
@app.exception_handler(Exception)
async def global_handler(request, exc):
    return JSONResponse({"error": str(exc)}, status_code=500)
```

## Common Patterns

### Retry Logic
```python
async def retry_node(state):
    try:
        return await operation(state)
    except RateLimitError:
        if state.get("retry_count", 0) < 3:
            await asyncio.sleep(2 ** state["retry_count"])
            return {"status": "retry", "retry_count": state.get("retry_count", 0) + 1}
        return {"status": "error", "error": "Max retries exceeded"}
```

### Conditional Routing
```python
def route_by_intent(state):
    intent = classify(state["messages"][-1]["content"])
    return {
        "search": "search_node",
        "calculate": "calc_node",
        "chat": "chat_node"
    }.get(intent, "default_node")
```

### Human-in-the-Loop
```python
# Compile with interrupt
app = graph.compile(checkpointer=checkpointer, interrupt_before=["approval_node"])

# First call - pauses before approval_node
result = await app.ainvoke(state, config)

# After human approval - resume
result = await app.ainvoke(None, config)  # Continues from checkpoint
```

## Environment Variables

```bash
# .env
DATABASE_URL=postgresql://user:pass@localhost/dbname
LANGFUSE_PUBLIC_KEY=pk-lf-xxx
LANGFUSE_SECRET_KEY=sk-lf-xxx
LANGFUSE_BASE_URL=https://cloud.langfuse.com
ANTHROPIC_API_KEY=sk-ant-xxx
```

## Quick Commands

```bash
# Install dependencies
uv add langgraph langchain-anthropic langgraph-checkpoint-postgres sse-starlette langfuse asyncpg

# Run tests
uv run pytest tests/ -v

# Start FastAPI server
uv run uvicorn backend.main:app --reload

# Setup database tables
uv run python -c "from agents.checkpointer import get_checkpointer; import asyncio; asyncio.run(get_checkpointer())"
```

## Production Checklist

- [ ] TypedDict state with proper reducers
- [ ] PostgresSaver with connection pooling
- [ ] Error handling in all nodes
- [ ] Graph error routing
- [ ] Langfuse observability
- [ ] SSE streaming tested
- [ ] Unit + integration tests
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Logging configured
- [ ] Monitoring/alerts set up
- [ ] Checkpoint cleanup scheduled

## Resources

- **Docs**: https://docs.langchain.com/langgraph
- **Langfuse**: https://langfuse.com/integrations/frameworks/langchain
- **Examples**: `examples/` directory
- **Anti-patterns**: `reference/anti-patterns.md`
