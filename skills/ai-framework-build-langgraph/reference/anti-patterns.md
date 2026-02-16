# LangGraph Anti-Patterns (2026)

Quick reference of common mistakes and anti-patterns to avoid.

## State Management

### ❌ State Bloat
```python
# DON'T: Store large binaries in state
class BadState(TypedDict):
    pdf_content: bytes  # 50MB × 10 checkpoints = 500MB in DB
    image_data: bytes
    full_documents: list[dict]  # Grows indefinitely
```

```python
# DO: Store references
class GoodState(TypedDict):
    pdf_url: str  # Reference to S3
    image_id: str  # Reference to storage
    document_ids: list[str]  # Query from DB when needed
```

### ❌ Missing Reducers
```python
# DON'T: Forget reducers for lists
class BadState(TypedDict):
    messages: list  # Will be replaced, not appended!
```

```python
# DO: Use annotated reducers
from langgraph.graph.message import add_messages

class GoodState(TypedDict):
    messages: Annotated[list[dict], add_messages]  # Auto-append
```

### ❌ Overusing Reducers
```python
# DON'T: Complex reducer logic
def complex_reducer(current, new):
    # 50 lines of logic
    # Makes debugging impossible
    ...

class BadState(TypedDict):
    data: Annotated[dict, complex_reducer]
```

```python
# DO: Keep reducers simple, complex logic in nodes
class GoodState(TypedDict):
    data: dict  # No reducer, replace on update

# Complex transformations in nodes instead
def transform_node(state):
    transformed = complex_transformation(state["data"])
    return {"data": transformed}
```

## Persistence

### ❌ MemorySaver in Production
```python
# DON'T: Use MemorySaver in production
from langgraph.checkpoint.memory import MemorySaver

checkpointer = MemorySaver()  # Data lost on restart!
app = graph.compile(checkpointer=checkpointer)
```

```python
# DO: Use PostgresSaver
from langgraph.checkpoint.postgres import AsyncPostgresSaver

pool = await asyncpg.create_pool(DATABASE_URL)
checkpointer = AsyncPostgresSaver(pool)
await checkpointer.setup()
app = graph.compile(checkpointer=checkpointer)
```

### ❌ Missing PostgreSQL Configuration
```python
# DON'T: Forget critical settings
pool = await asyncpg.create_pool(DATABASE_URL)
# Missing autocommit=True!
# Missing row_factory=dict_row!
```

```python
# DO: Include required configuration
# Note: AsyncPostgresSaver handles this internally,
# but if creating custom connections:
conn = await asyncpg.connect(
    DATABASE_URL,
    server_settings={'jit': 'off'}
)
# AsyncPostgresSaver wraps with proper settings
```

### ❌ No Checkpoint Cleanup
```python
# DON'T: Let checkpoints accumulate
# Old checkpoints grow forever, bloating database
```

```python
# DO: Implement TTL/cleanup job
async def cleanup_old_checkpoints():
    """Delete checkpoints older than 30 days."""
    await db.execute("""
        DELETE FROM checkpoints
        WHERE created_at < NOW() - INTERVAL '30 days'
    """)

# Run as scheduled job
```

## Error Handling

### ❌ No Error Boundaries
```python
# DON'T: Let errors crash the graph
async def risky_node(state):
    result = await external_api_call()  # Can fail!
    return {"result": result}
```

```python
# DO: Wrap in try-except
async def safe_node(state):
    try:
        result = await external_api_call()
        return {"result": result, "status": "success"}
    except APIError as e:
        return {"status": "error", "error": str(e)}
```

### ❌ Silent Failures
```python
# DON'T: Catch and ignore errors
async def bad_node(state):
    try:
        result = await operation()
        return {"result": result}
    except Exception:
        pass  # Silent failure!
```

```python
# DO: Log and return error state
async def good_node(state):
    try:
        result = await operation()
        return {"result": result, "status": "success"}
    except Exception as e:
        logger.error(f"Node failed: {e}", exc_info=True)
        return {"status": "error", "error": str(e)}
```

### ❌ No Retry Logic
```python
# DON'T: Fail immediately on transient errors
async def no_retry_node(state):
    result = await rate_limited_api()  # Fails on rate limit
    return {"result": result}
```

```python
# DO: Implement retry with backoff
async def retry_node(state):
    try:
        result = await rate_limited_api()
        return {"result": result, "status": "success"}
    except RateLimitError as e:
        retry_count = state.get("retry_count", 0)
        if retry_count < 3:
            await asyncio.sleep(2 ** retry_count)
            return {
                "status": "retry",
                "retry_count": retry_count + 1
            }
        return {"status": "error", "error": str(e)}
```

## Streaming

### ❌ Streaming Without Error Handling
```python
# DON'T: Let stream errors go unhandled
async def bad_stream():
    async for chunk in app.astream(state, config):
        yield {"data": chunk}  # No error handling!
```

```python
# DO: Send error events in stream
async def good_stream():
    try:
        async for chunk in app.astream(state, config):
            yield {"event": "message", "data": chunk}
        yield {"event": "done", "data": {"status": "complete"}}
    except Exception as e:
        logger.error(f"Stream error: {e}", exc_info=True)
        yield {"event": "error", "data": {"error": str(e)}}
```

### ❌ Wrong Stream Mode
```python
# DON'T: Use "values" for chat UIs (high bandwidth)
async for chunk in app.astream(state, stream_mode="values"):
    # Sends entire state after each node
    # Too much data for token streaming
```

```python
# DO: Use "messages" for chat UIs
async for chunk in app.astream(state, stream_mode="messages"):
    # Token-by-token streaming
    # Optimal UX for chat
```

## Performance

### ❌ Synchronous Blocking
```python
# DON'T: Use sync calls in async nodes
async def blocking_node(state):
    result = requests.get(url)  # Blocks event loop!
    return {"result": result}
```

```python
# DO: Use async clients
import httpx

async def async_node(state):
    async with httpx.AsyncClient() as client:
        result = await client.get(url)
    return {"result": result}
```

### ❌ No Connection Pooling
```python
# DON'T: Create new connections per request
async def bad_node(state):
    conn = await asyncpg.connect(DATABASE_URL)  # New connection!
    result = await conn.fetch("SELECT * FROM table")
    await conn.close()
    return {"result": result}
```

```python
# DO: Use connection pool
# At startup:
pool = await asyncpg.create_pool(DATABASE_URL, min_size=5, max_size=20)

# In nodes:
async def good_node(state):
    async with pool.acquire() as conn:
        result = await conn.fetch("SELECT * FROM table")
    return {"result": result}
```

## Testing

### ❌ Testing with Production Checkpointer
```python
# DON'T: Use production DB for tests
from agents.checkpointer import production_checkpointer

@pytest.fixture
def test_app():
    return graph.compile(checkpointer=production_checkpointer)  # BAD!
```

```python
# DO: Use MemorySaver or separate test DB
from langgraph.checkpoint.memory import MemorySaver

@pytest.fixture
def test_app():
    return graph.compile(checkpointer=MemorySaver())  # Isolated tests
```

### ❌ No Mocking
```python
# DON'T: Call real APIs in tests
async def test_node():
    state = {"query": "test"}
    result = await research_node(state)  # Calls real LLM!
```

```python
# DO: Mock external dependencies
from unittest.mock import AsyncMock, patch

async def test_node():
    with patch('agents.nodes.llm.ainvoke', new_callable=AsyncMock) as mock:
        mock.return_value = MockResponse("Test response")
        state = {"query": "test"}
        result = await research_node(state)
        assert result["status"] == "success"
```

## Observability

### ❌ No Tracing
```python
# DON'T: Run without observability
result = await app.ainvoke(state, config={})  # No visibility!
```

```python
# DO: Add Langfuse tracing
from langfuse.langchain import CallbackHandler

handler = CallbackHandler()
config = {
    "callbacks": [handler],
    "metadata": {
        "langfuse_user_id": user_id,
        "langfuse_session_id": session_id
    }
}
result = await app.ainvoke(state, config)
```

### ❌ Missing Metadata
```python
# DON'T: Skip trace metadata
config = {"callbacks": [langfuse_handler]}  # No context!
```

```python
# DO: Add rich metadata
config = {
    "callbacks": [langfuse_handler],
    "metadata": {
        "langfuse_user_id": user_id,
        "langfuse_session_id": session_id,
        "langfuse_tags": ["production", "v2"],
        "feature_flag": "new_routing",
        "user_tier": "premium"
    }
}
```

## Architecture

### ❌ God Node (Do Everything)
```python
# DON'T: One node that does everything
async def god_node(state):
    # 200 lines of code
    # Routing, processing, error handling, formatting
    # Impossible to test, debug, or maintain
```

```python
# DO: Single-responsibility nodes
async def router_node(state):
    intent = classify_intent(state["messages"][-1])
    return {"intent": intent}

async def process_node(state):
    result = await process(state["intent"])
    return {"result": result}

async def format_node(state):
    formatted = format_response(state["result"])
    return {"messages": [formatted]}
```

### ❌ Circular Dependencies
```python
# DON'T: Create infinite loops
graph.add_edge("node_a", "node_b")
graph.add_edge("node_b", "node_a")  # Infinite loop!
```

```python
# DO: Add exit conditions
graph.add_conditional_edges("node_a", route_fn, {
    "continue": "node_b",
    "done": END
})

def route_fn(state):
    if state["iterations"] > 3:
        return "done"
    return "continue"
```

## Deployment

### ❌ Hardcoded Configuration
```python
# DON'T: Hardcode sensitive values
DATABASE_URL = "postgresql://user:pass@localhost/db"
LANGFUSE_KEY = "sk-lf-abc123"
```

```python
# DO: Use environment variables
import os

DATABASE_URL = os.getenv("DATABASE_URL")
LANGFUSE_KEY = os.getenv("LANGFUSE_SECRET_KEY")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL not set")
```

### ❌ No Health Checks
```python
# DON'T: Deploy without health endpoints
# No way to know if app is healthy
```

```python
# DO: Add health check endpoint
from fastapi import FastAPI

@app.get("/health")
async def health_check():
    # Check database connection
    try:
        await pool.fetchval("SELECT 1")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}, 503
```

## Summary

Top 10 anti-patterns to avoid:

1. **State Bloat**: Store references, not large objects
2. **MemorySaver in Production**: Use PostgresSaver
3. **No Error Boundaries**: Wrap risky operations in try-except
4. **Synchronous Blocking**: Use async/await throughout
5. **No Connection Pooling**: Initialize pools at startup
6. **Missing Checkpoint Cleanup**: Implement TTL jobs
7. **No Observability**: Always use Langfuse/LangSmith
8. **Wrong Stream Mode**: Use "messages" for chat UIs
9. **Testing with Production Data**: Use MemorySaver for tests
10. **Hardcoded Configuration**: Use environment variables
