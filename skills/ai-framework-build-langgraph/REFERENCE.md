# LangGraph Reference

Quick reference for common configurations, APIs, and patterns.

## Table of Contents

1. [State Schema Types](#state-schema-types)
2. [Reducer Functions](#reducer-functions)
3. [Stream Modes](#stream-modes)
4. [Checkpointer Options](#checkpointer-options)
5. [Graph Methods](#graph-methods)
6. [Configuration Options](#configuration-options)
7. [Error Types](#error-types)

## State Schema Types

### TypedDict with Reducers

```python
from typing import Annotated
from typing_extensions import TypedDict
from operator import add
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    # Append messages (reducer: add_messages)
    messages: Annotated[list[dict], add_messages]

    # Concatenate lists (reducer: add)
    results: Annotated[list[str], add]

    # Replace value (no reducer)
    status: str
    user_id: str
```

### Field Types

| Type | Reducer | Behavior | Use Case |
|------|---------|----------|----------|
| `Annotated[list[dict], add_messages]` | `add_messages` | Appends new messages | Chat history |
| `Annotated[list[T], add]` | `add` | Concatenates lists | Accumulating results |
| `str`, `int`, `bool` | None | Replaces value | Status flags, IDs |
| `dict` | None | Replaces dict | Metadata |

## Reducer Functions

### Built-in Reducers

```python
from langgraph.graph.message import add_messages
from operator import add

# Message reducer (handles duplicates, ordering)
add_messages

# List concatenation
add

# Custom reducer
def merge_dicts(left: dict, right: dict) -> dict:
    """Merge two dictionaries."""
    return {**left, **right}
```

### Using Custom Reducers

```python
from typing import Annotated

class State(TypedDict):
    metadata: Annotated[dict, merge_dicts]
```

## Stream Modes

| Mode | Output | Use Case |
|------|--------|----------|
| `"messages"` | Individual tokens | Real-time chat UIs |
| `"updates"` | State changes per node | Progress indicators |
| `"values"` | Full state per node | Debugging |
| `"custom"` | Custom events | Advanced workflows |

### Usage

```python
# Token-by-token streaming
async for chunk in app.astream(state, config, stream_mode="messages"):
    print(chunk.content)

# State updates per node
async for update in app.astream(state, config, stream_mode="updates"):
    print(update)  # {"node_name": {...updated_fields...}}

# Full state per node
async for value in app.astream(state, config, stream_mode="values"):
    print(value)  # Complete state after each node
```

## Checkpointer Options

### PostgreSQL (Production)

```python
from langgraph.checkpoint.postgres import AsyncPostgresSaver
import asyncpg

# Create connection pool
pool = await asyncpg.create_pool(
    dsn="postgresql://user:pass@host:5432/db",
    min_size=5,
    max_size=20,
    command_timeout=60,
    server_settings={'jit': 'off'}
)

checkpointer = AsyncPostgresSaver(pool)
await checkpointer.setup()
```

### SQLite (Small Deployments)

```python
from langgraph.checkpoint.sqlite import AsyncSqliteSaver
import aiosqlite

# Create SQLite checkpointer
conn = await aiosqlite.connect("checkpoints.db")
checkpointer = AsyncSqliteSaver(conn)
await checkpointer.setup()
```

### Memory (Development Only)

```python
from langgraph.checkpoint.memory import MemorySaver

# Only for testing - data lost on restart
checkpointer = MemorySaver()
```

## Graph Methods

### StateGraph API

```python
from langgraph.graph import StateGraph, START, END

graph = StateGraph(StateType)

# Add nodes
graph.add_node("node_name", node_function)

# Add edges
graph.add_edge(START, "first_node")
graph.add_edge("node_a", "node_b")
graph.add_edge("last_node", END)

# Add conditional edges
graph.add_conditional_edges(
    "source_node",
    routing_function,
    {
        "path_a": "target_a",
        "path_b": "target_b",
        END: END
    }
)

# Compile graph
app = graph.compile(
    checkpointer=checkpointer,
    interrupt_before=["approval_node"],
    interrupt_after=["action_node"]
)
```

### Graph Invocation

```python
# Async invoke (wait for completion)
result = await app.ainvoke(initial_state, config)

# Async stream (iterate over updates)
async for chunk in app.astream(initial_state, config, stream_mode="messages"):
    process(chunk)

# Get state snapshot
state = await app.aget_state(config)

# Update state (human-in-the-loop)
await app.aupdate_state(config, {"approved": True})
```

## Configuration Options

### Config Dictionary

```python
config = {
    # Thread ID for checkpoint persistence
    "configurable": {
        "thread_id": "user-123-session-456"
    },

    # Callbacks (Langfuse, logging)
    "callbacks": [langfuse_handler],

    # Metadata for observability
    "metadata": {
        "user_id": "user-123",
        "session_id": "session-456",
        "tags": ["production", "v2"]
    },

    # Recursion limit (default: 25)
    "recursion_limit": 50,

    # Run name for tracing
    "run_name": "research-query"
}
```

### Thread ID Patterns

```python
# User-session pattern
thread_id = f"{user_id}-{session_id}"

# Date-based pattern
from datetime import date
thread_id = f"{user_id}-{date.today().isoformat()}"

# UUID pattern
import uuid
thread_id = str(uuid.uuid4())
```

## Error Types

### Common Exceptions

```python
from langchain_core.exceptions import RateLimitError
from asyncpg.exceptions import PostgresError

try:
    result = await app.ainvoke(state, config)
except RateLimitError as e:
    # Handle rate limiting
    await asyncio.sleep(retry_delay)
except PostgresError as e:
    # Handle database errors
    logger.error(f"Database error: {e}")
except Exception as e:
    # Catch-all
    logger.error(f"Unexpected error: {e}")
```

### Error State Pattern

```python
def node_with_error_handling(state: State) -> dict:
    try:
        result = perform_operation()
        return {"status": "success", "result": result}
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "error_type": type(e).__name__
        }
```

## Node Return Types

### Partial State Updates

```python
# ✅ GOOD - Only return changed fields
def node(state: State) -> dict:
    return {
        "status": "complete",
        "results": ["new_item"]
    }

# ❌ BAD - Don't return full state
def node(state: State) -> State:
    return {
        "messages": state["messages"],  # Unnecessary
        "user_id": state["user_id"],    # Unnecessary
        "status": "complete",            # Only this needed
        "results": ["new_item"]
    }
```

### Multiple Updates

```python
# Return multiple field updates
def node(state: State) -> dict:
    return {
        "status": "processing",
        "current_step": "analyzing",
        "metadata": {"progress": 0.5}
    }
```

## Connection Pool Settings

### PostgreSQL Pool Configuration

```python
import asyncpg

# Production settings
pool = await asyncpg.create_pool(
    dsn=DATABASE_URL,
    min_size=5,          # Minimum connections
    max_size=20,         # Maximum connections
    max_queries=50000,   # Recycle connection after N queries
    max_inactive_connection_lifetime=300,  # 5 minutes
    command_timeout=60,  # Query timeout
    server_settings={
        'jit': 'off',     # Disable JIT compilation
        'application_name': 'langgraph-agent'
    }
)
```

### Pool Lifecycle

```python
# Startup
pool = await asyncpg.create_pool(...)
checkpointer = AsyncPostgresSaver(pool)
await checkpointer.setup()

# Shutdown
await pool.close()
```

## Langfuse Configuration

### Handler Creation

```python
from langfuse.langchain import CallbackHandler

def get_langfuse_handler(user_id: str, session_id: str):
    """Create handler with metadata."""
    return CallbackHandler(
        user_id=user_id,
        session_id=session_id,
        tags=["production", "agent-v2"],
        metadata={
            "environment": "prod",
            "version": "2.0"
        }
    )
```

### Config Integration

```python
config = {
    "configurable": {"thread_id": thread_id},
    "callbacks": [get_langfuse_handler(user_id, session_id)],
    "metadata": {
        "langfuse_user_id": user_id,
        "langfuse_session_id": session_id
    }
}
```

## Environment Variables

### Required Variables

```bash
# LLM Provider
ANTHROPIC_API_KEY=sk-ant-...

# Database (Production)
DATABASE_URL=postgresql://user:pass@host:5432/db

# Langfuse (Observability)
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_BASE_URL=https://cloud.langfuse.com
```

### Loading Variables

```python
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
```

## Performance Tips

### Connection Pooling

- Set `min_size` to expected concurrent connections
- Set `max_size` to 2-3x `min_size`
- Monitor connection usage in production
- Adjust based on load patterns

### State Size Management

- Store references (URLs, IDs) instead of large objects
- Use external storage (S3, DB) for documents
- Clean up temporary state fields
- Implement checkpoint TTL

### Streaming Optimization

- Use `stream_mode="messages"` for chat UIs
- Use `stream_mode="updates"` for progress tracking
- Avoid `stream_mode="values"` in production (too verbose)

### Caching

- Cache LLM responses where appropriate
- Reuse connection pools across requests
- Cache expensive computations in state
