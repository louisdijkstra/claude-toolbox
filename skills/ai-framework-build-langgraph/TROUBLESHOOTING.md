# LangGraph Troubleshooting

Common issues and solutions when building LangGraph agents.

## Table of Contents

1. [Checkpoint Issues](#checkpoint-issues)
2. [Streaming Problems](#streaming-problems)
3. [State Persistence](#state-persistence)
4. [Performance Issues](#performance-issues)
5. [Error Handling](#error-handling)
6. [Integration Issues](#integration-issues)

## Checkpoint Issues

### Problem: Checkpoint Tables Not Created

**Symptoms:**
- `Table "checkpoints" does not exist` error
- State not persisting between requests
- Fresh state on every invocation

**Solutions:**

1. **Verify `setup()` was called:**
```python
checkpointer = AsyncPostgresSaver(pool)
await checkpointer.setup()  # MUST call this at startup
```

2. **Check database permissions:**
```sql
-- User needs CREATE TABLE permission
GRANT CREATE ON DATABASE your_db TO your_user;
```

3. **Verify connection string:**
```python
# ✅ GOOD
DATABASE_URL = "postgresql://user:pass@host:5432/db"

# ❌ BAD - Missing credentials
DATABASE_URL = "postgresql://host:5432/db"
```

4. **Check autocommit (if using psycopg2):**
```python
# For psycopg2 connections (not asyncpg)
conn.autocommit = True
```

### Problem: `setup()` Fails Silently

**Cause:** Connection pool not properly configured

**Solution:**
```python
# Verify pool creation succeeded
try:
    pool = await asyncpg.create_pool(DATABASE_URL)
    print(f"Pool created: {pool}")
except Exception as e:
    print(f"Pool creation failed: {e}")

# Then setup checkpointer
checkpointer = AsyncPostgresSaver(pool)
await checkpointer.setup()
```

### Problem: Connection Pool Exhaustion

**Symptoms:**
- `asyncpg.exceptions.TooManyConnectionsError`
- Requests hang indefinitely
- Timeouts in production

**Solutions:**

1. **Increase pool size:**
```python
pool = await asyncpg.create_pool(
    DATABASE_URL,
    min_size=10,   # Increase from 5
    max_size=40    # Increase from 20
)
```

2. **Add connection timeouts:**
```python
pool = await asyncpg.create_pool(
    DATABASE_URL,
    min_size=5,
    max_size=20,
    command_timeout=60,          # Query timeout
    timeout=10,                   # Connection acquisition timeout
    max_inactive_connection_lifetime=300
)
```

3. **Monitor pool usage:**
```python
print(f"Pool size: {pool.get_size()}")
print(f"Free connections: {pool.get_idle_size()}")
```

## Streaming Problems

### Problem: Streaming Not Working

**Symptoms:**
- Frontend receives no events
- EventSource connection closes immediately
- No tokens appear in UI

**Solutions:**

1. **Verify `sse-starlette` installed:**
```bash
uv add sse-starlette
```

2. **Check CORS configuration:**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
```

3. **Test EventSource in browser console:**
```javascript
const es = new EventSource('/api/agent/stream?query=test&user_id=123&session_id=456');
es.onmessage = (e) => console.log(e.data);
es.onerror = (e) => console.error(e);
```

4. **Verify stream mode:**
```python
# ✅ GOOD - Token-by-token
async for chunk in app.astream(state, config, stream_mode="messages"):
    ...

# ❌ BAD - Wrong mode for chat
async for chunk in app.astream(state, config, stream_mode="values"):
    ...  # Too much data per chunk
```

### Problem: Streaming Stops Mid-Response

**Cause:** Unhandled exception in generator

**Solution:**
```python
async def event_generator():
    try:
        async for chunk in app.astream(state, config, stream_mode="messages"):
            yield {"event": "message", "data": json.dumps({"content": chunk.content})}

        yield {"event": "done", "data": json.dumps({"status": "complete"})}

    except Exception as e:
        # CRITICAL: Catch exceptions to prevent abrupt closure
        logger.error(f"Stream error: {e}", exc_info=True)
        yield {"event": "error", "data": json.dumps({"error": str(e)})}
```

### Problem: Frontend Not Receiving Tokens

**Symptoms:**
- EventSource connection established
- No message events received
- Backend logs show chunks being sent

**Solutions:**

1. **Check event names match:**
```python
# Backend
yield {"event": "message", "data": ...}

# Frontend
eventSource.addEventListener('message', (e) => {...})
```

2. **Verify JSON serialization:**
```python
# ✅ GOOD
yield {"event": "message", "data": json.dumps({"content": str(chunk.content)})}

# ❌ BAD - Not JSON serializable
yield {"event": "message", "data": chunk}
```

3. **Check for buffering issues:**
```python
# Disable response buffering in nginx/reverse proxy
# Add to nginx config:
proxy_buffering off;
```

## State Persistence

### Problem: State Not Persisting Across Requests

**Symptoms:**
- Every request starts fresh
- No conversation history
- Previous messages lost

**Solutions:**

1. **Verify thread_id is consistent:**
```python
# ✅ GOOD - Same thread_id for same conversation
thread_id = f"{user_id}-{session_id}"
config = {"configurable": {"thread_id": thread_id}}

# ❌ BAD - New thread_id each request
thread_id = str(uuid.uuid4())  # Different every time!
```

2. **Check checkpointer passed to compile:**
```python
# ✅ GOOD
app = graph.compile(checkpointer=checkpointer)

# ❌ BAD - No checkpointer
app = graph.compile()
```

3. **Verify database connection:**
```python
# Test checkpoint write
from langgraph.checkpoint.postgres import AsyncPostgresSaver

checkpointer = AsyncPostgresSaver(pool)
await checkpointer.aput(
    config={"configurable": {"thread_id": "test"}},
    checkpoint={"messages": ["test"]},
    metadata={}
)
```

### Problem: High Database Storage Usage

**Symptoms:**
- Database size growing rapidly
- Query performance degrading
- Storage costs increasing

**Solutions:**

1. **Avoid storing large objects in state:**
```python
# ❌ BAD
class State(TypedDict):
    pdf_content: bytes  # 50MB × 10 checkpoints = 500MB!

# ✅ GOOD
class State(TypedDict):
    pdf_url: str  # Just reference the PDF
```

2. **Implement checkpoint cleanup:**
```python
# Delete old checkpoints (run as scheduled job)
async def cleanup_old_checkpoints(days=30):
    query = """
    DELETE FROM checkpoints
    WHERE created_at < NOW() - INTERVAL '%s days'
    """
    await pool.execute(query, days)
```

3. **Use checkpoint TTL:**
```python
# Set TTL when creating checkpoint
metadata = {"ttl": 86400}  # 1 day in seconds
```

## Performance Issues

### Problem: Slow Response Times

**Causes and Solutions:**

1. **Too many checkpoint writes:**
```python
# Reduce checkpoint frequency for intermediate nodes
graph.add_node("fast_node", node_func, checkpoint=False)
```

2. **Database query optimization:**
```sql
-- Add indexes to checkpoint table
CREATE INDEX idx_checkpoints_thread_id ON checkpoints(thread_id);
CREATE INDEX idx_checkpoints_created_at ON checkpoints(created_at);
```

3. **Connection pool too small:**
```python
# Increase pool size for high-traffic apps
pool = await asyncpg.create_pool(
    DATABASE_URL,
    min_size=20,   # Increase
    max_size=50    # Increase
)
```

### Problem: Memory Leaks

**Symptoms:**
- Memory usage grows over time
- Eventually out of memory
- Restart required

**Solutions:**

1. **Close EventSource connections:**
```javascript
// Frontend
useEffect(() => {
  const es = new EventSource(...);

  return () => {
    es.close();  // CRITICAL: Clean up on unmount
  };
}, []);
```

2. **Clean up state in nodes:**
```python
def cleanup_node(state: State) -> dict:
    """Remove large temporary data."""
    return {
        "temp_data": [],      # Clear temporary lists
        "cache": {},          # Clear caches
        "status": "complete"
    }
```

3. **Use connection pooling properly:**
```python
# ✅ GOOD - Reuse pool
pool = await asyncpg.create_pool(...)  # Create once at startup

# ❌ BAD - Creates new pool per request
async def handler():
    pool = await asyncpg.create_pool(...)  # Memory leak!
```

## Error Handling

### Problem: Errors Not Caught in Nodes

**Symptoms:**
- Agent crashes on errors
- No graceful error messages
- Poor user experience

**Solution:**
```python
async def node(state: State) -> dict:
    try:
        # Risky operation
        result = await api_call()
        return {"status": "success", "result": result}

    except RateLimitError as e:
        # Handle rate limiting specifically
        return {
            "status": "retry",
            "error": f"Rate limited: {str(e)}",
            "retry_count": state.get("retry_count", 0) + 1
        }

    except Exception as e:
        # Catch-all for unexpected errors
        logger.error(f"Node failed: {e}", exc_info=True)
        return {
            "status": "error",
            "error": str(e),
            "error_type": type(e).__name__
        }
```

### Problem: No Error Routing

**Symptoms:**
- Errors propagate to END without handling
- No recovery attempts
- User sees generic error

**Solution:**
```python
def route_on_status(state: State) -> str:
    """Route based on status."""
    if state["status"] == "error":
        return "error_handler"
    elif state["status"] == "retry" and state.get("retry_count", 0) < 3:
        return "retry_node"
    elif state["status"] == "success":
        return END
    return "error_handler"  # Default to error handler

graph.add_conditional_edges(
    "risky_node",
    route_on_status,
    {
        "error_handler": "error_handler",
        "retry_node": "risky_node",
        END: END
    }
)
```

## Integration Issues

### Problem: Langfuse Not Showing Traces

**Symptoms:**
- No traces appear in Langfuse dashboard
- Callbacks seem ignored
- Token usage not tracked

**Solutions:**

1. **Verify Langfuse initialized:**
```python
from langfuse import Langfuse

# Initialize at startup (BEFORE creating handlers)
Langfuse(
    public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
    secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
    host=os.getenv("LANGFUSE_BASE_URL", "https://cloud.langfuse.com")
)
```

2. **Check handler passed in config:**
```python
from langfuse.langchain import CallbackHandler

handler = CallbackHandler()
config = {
    "configurable": {"thread_id": thread_id},
    "callbacks": [handler],  # MUST include handler
}
```

3. **Verify environment variables:**
```bash
# .env
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_BASE_URL=https://cloud.langfuse.com
```

4. **Check network connectivity:**
```python
# Test Langfuse connection
try:
    from langfuse import get_client
    langfuse = get_client()
    langfuse.flush()  # Force send pending events
except Exception as e:
    print(f"Langfuse error: {e}")
```

### Problem: Frontend/Backend Version Mismatch

**Symptoms:**
- EventSource format errors
- Unexpected payload structure
- Type errors in frontend

**Solution:**
```typescript
// Define shared types
interface StreamMessage {
  event: 'message' | 'done' | 'error';
  data: {
    content?: string;
    status?: string;
    error?: string;
  };
}

// Backend must match
yield {
    "event": "message",
    "data": json.dumps({"content": content})
}
```

## Debug Tips

### Enable Verbose Logging

```python
import logging

# Enable LangGraph logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("langgraph")
logger.setLevel(logging.DEBUG)
```

### Inspect State at Each Node

```python
async for chunk in app.astream(state, config, stream_mode="values"):
    print(f"State after node: {chunk}")
```

### Test Graph Compilation

```python
# Verify graph compiles without errors
try:
    app = graph.compile(checkpointer=checkpointer)
    print("Graph compiled successfully")
except Exception as e:
    print(f"Compilation error: {e}")
```

### Monitor Connection Pool

```python
# Check pool health periodically
async def monitor_pool():
    while True:
        print(f"Pool size: {pool.get_size()}")
        print(f"Idle: {pool.get_idle_size()}")
        await asyncio.sleep(60)
```

## Getting Help

If you're still stuck after trying these solutions:

1. **Check LangGraph docs:** https://docs.langchain.com/langgraph
2. **Review examples:** See EXAMPLES.md for working code
3. **Enable debug logging:** Capture full stack traces
4. **Simplify:** Strip down to minimal reproduction case
5. **Check versions:** Ensure all packages are up-to-date
