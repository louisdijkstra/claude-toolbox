---
name: building-langgraph-agents
description: Build stateful AI agents using LangGraph with uv. Reads project context, adapts to existing structure, implements streaming when needed, integrates with frontend/backend.
---

# Building LangGraph Agents

## Purpose
Create production-ready AI agents with LangGraph. Integrates with existing project structure, uses proper streaming, connects frontend/backend/AI output.

## Process

### Step 1: Understand Project Context

**ALWAYS start by reading project context**:
```bash
# Use getting-the-bigger-picture skill
cat docs/PROJECT_DESCRIPTION.md 2>/dev/null
```

Extract:
- Existing repo structure
- Database schema (what tables/collections exist)
- Frontend framework (React, Vue, etc.)
- Backend framework (FastAPI, Flask, Express)
- Whether real-time updates needed (determines streaming)
- LLM budget/rate limits

### Step 2: Brainstorm Agent Requirements

Ask user:
1. **Agent purpose**: What should it do?
2. **Streaming needed?**: User sees thinking process? Long responses?
3. **Database persistence**: Save conversations? Results? State?
4. **Frontend integration**: How does UI interact? (REST, WebSocket, SSE)
5. **Tools required**: Search, DB access, API calls?
6. **Human-in-loop**: Approval needed before actions?
7. **Multi-step**: Loops? Conditional logic?

**Streaming decision**:
- ✅ Streaming if: Long responses, show thinking, real-time feel, chat interface
- ❌ No streaming if: Batch processing, background jobs, quick responses

### Step 3: Check/Adapt Repository Structure

**If structure exists**: Adapt to it
**If creating new**: Use this structure

```bash
# Check existing structure
ls -la src/ backend/ app/

# Typical structure
project/
├── backend/              # or src/, app/
│   ├── agents/           # LangGraph agents
│   │   ├── __init__.py
│   │   ├── graph.py      # Graph definition
│   │   ├── nodes.py      # Node functions
│   │   ├── state.py      # State schema
│   │   ├── tools.py      # Agent tools
│   │   └── prompts.py    # All prompts (separate)
│   ├── api/              # API endpoints
│   │   ├── agent_routes.py
│   │   └── streaming.py  # SSE/WebSocket if needed
│   ├── models/           # DB models
│   │   └── conversation.py
│   └── main.py
├── frontend/             # React/Vue/etc
│   └── src/
│       └── components/
│           └── AgentChat.jsx  # Streaming UI
└── pyproject.toml        # uv manages this
```

### Step 4: Check Database Schema

**Read existing schema**:
```bash
# Check for DB models
cat backend/models/*.py
cat src/models/*.py

# Check migrations
ls backend/migrations/
```

**Determine what to persist**:
- Conversation history (messages table?)
- Agent state (checkpoints table?)
- Results/outputs
- User preferences

**If schema exists**: Use it
**If missing**: Propose additions

Example additions needed:
```python
# Conversations table
- id, user_id, created_at
- messages (JSON or separate table)

# Agent checkpoints (for state persistence)
- thread_id, checkpoint_ns, checkpoint
```

## Installation with uv

```bash
# Add dependencies
uv add langgraph langchain-anthropic langchain-community

# If streaming needed (SSE)
uv add sse-starlette

# If WebSocket streaming
uv add websockets

# Database (if not already present)
uv add sqlalchemy  # or asyncpg, psycopg2
```

## State Definition

```python
# backend/agents/state.py
from typing import Annotated
from typing_extensions import TypedDict
from operator import add

class AgentState(TypedDict):
    messages: Annotated[list[dict], add]  # Use add reducer
    user_id: str
    thread_id: str  # For persistence
    query: str
    results: list[str]
    done: bool
```

**Consider existing DB schema** when designing state.

## Prompts in Separate File

```python
# backend/agents/prompts.py
from datetime import datetime

SYSTEM_PROMPT = """You are a helpful AI assistant.
Current date: {date}
User context: {user_context}"""

ROUTER_PROMPT = """Analyze query and route:
- "search": Needs web search
- "database": Query internal data
- "answer": Answer directly

Query: {query}
Output JSON: {{"route": "search|database|answer"}}"""

def get_system_prompt(user_context: str = "") -> str:
    return SYSTEM_PROMPT.format(
        date=datetime.now().strftime("%Y-%m-%d"),
        user_context=user_context
    )
```

## Nodes

```python
# backend/agents/nodes.py
from agents.state import AgentState
from agents.prompts import ROUTER_PROMPT
from langchain_anthropic import ChatAnthropic

model = ChatAnthropic(model="claude-sonnet-4-20250514")

async def router_node(state: AgentState) -> dict:
    """Async for LLM I/O."""
    query = state["query"]
    response = await model.ainvoke(ROUTER_PROMPT.format(query=query))
    return {"route": parse_route(response)}

async def search_node(state: AgentState) -> dict:
    """Async I/O operation."""
    results = await search_web(state["query"])
    return {"results": results}

def process_node(state: AgentState) -> dict:
    """Sync for CPU-bound."""
    processed = process_results(state["results"])
    return {"final_result": processed}
```

## Graph with Streaming Support

```python
# backend/agents/graph.py
from langgraph.graph import StateGraph, END
from agents.state import AgentState
from agents.nodes import router_node, search_node, answer_node

graph = StateGraph(AgentState)

graph.add_node("router", router_node)
graph.add_node("search", search_node)
graph.add_node("answer", answer_node)

graph.set_entry_point("router")

# Conditional routing
def route_decision(state: AgentState) -> str:
    route = state.get("route", "answer")
    return route

graph.add_conditional_edges(
    "router",
    route_decision,
    {"search": "search", "database": "database", "answer": "answer"}
)

graph.add_edge("search", "answer")
graph.add_edge("answer", END)

# Compile with memory for state persistence
from langgraph.checkpoint.postgres import PostgresSaver

# Use existing DB connection
checkpointer = PostgresSaver.from_conn_string(DATABASE_URL)
app = graph.compile(checkpointer=checkpointer)
```

## Streaming: Three Approaches

### 1. No Streaming (Simple REST)

```python
# backend/api/agent_routes.py
from fastapi import APIRouter
from agents.graph import app

router = APIRouter()

@router.post("/agent/invoke")
async def invoke_agent(query: str, user_id: str):
    config = {"configurable": {"thread_id": f"{user_id}-{query_hash}"}}
    result = await app.ainvoke({"query": query, "user_id": user_id}, config)
    return {"answer": result["answer"]}
```

**Frontend**:
```javascript
// Simple fetch
const response = await fetch('/api/agent/invoke', {
    method: 'POST',
    body: JSON.stringify({ query, user_id })
});
const data = await response.json();
```

### 2. SSE Streaming (Recommended for Chat)

**When**: Show agent thinking, stream long responses, better UX

```python
# backend/api/streaming.py
from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse
from agents.graph import app

router = APIRouter()

@router.post("/agent/stream")
async def stream_agent(query: str, user_id: str):
    config = {"configurable": {"thread_id": f"{user_id}-thread"}}
    
    async def event_generator():
        async for chunk in app.astream(
            {"query": query, "user_id": user_id},
            config,
            stream_mode="messages"  # or "values", "updates"
        ):
            # chunk = message from LLM or node update
            yield {
                "event": "message",
                "data": json.dumps(chunk)
            }
        
        yield {
            "event": "done",
            "data": json.dumps({"status": "complete"})
        }
    
    return EventSourceResponse(event_generator())
```

**Stream modes**:
- `"messages"`: Stream LLM tokens (real-time typing)
- `"values"`: Stream full state after each node
- `"updates"`: Stream only state changes

**Frontend (React)**:
```javascript
// frontend/src/components/AgentChat.jsx
import { useEffect, useState } from 'react';

function AgentChat() {
    const [messages, setMessages] = useState([]);
    const [streaming, setStreaming] = useState(false);

    const streamQuery = async (query) => {
        setStreaming(true);
        const eventSource = new EventSource(
            `/api/agent/stream?query=${query}&user_id=${userId}`
        );

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (event.event === 'message') {
                // Append chunk to current message
                setMessages(prev => {
                    const last = prev[prev.length - 1];
                    if (last && last.role === 'assistant') {
                        return [...prev.slice(0, -1), {
                            ...last,
                            content: last.content + data.content
                        }];
                    }
                    return [...prev, { role: 'assistant', content: data.content }];
                });
            }
            
            if (event.event === 'done') {
                setStreaming(false);
                eventSource.close();
            }
        };

        eventSource.onerror = () => {
            setStreaming(false);
            eventSource.close();
        };
    };

    return (
        <div>
            {messages.map((msg, i) => (
                <div key={i} className={msg.role}>
                    {msg.content}
                </div>
            ))}
            {streaming && <div className="thinking">Thinking...</div>}
        </div>
    );
}
```

### 3. WebSocket Streaming (Bidirectional)

**When**: Real-time collaboration, human-in-loop, dynamic interactions

```python
# backend/api/websocket.py
from fastapi import WebSocket
from agents.graph import app

@router.websocket("/agent/ws")
async def websocket_agent(websocket: WebSocket):
    await websocket.accept()
    
    try:
        while True:
            # Receive from frontend
            data = await websocket.receive_json()
            query = data["query"]
            user_id = data["user_id"]
            
            config = {"configurable": {"thread_id": f"{user_id}-ws"}}
            
            # Stream back
            async for chunk in app.astream(
                {"query": query, "user_id": user_id},
                config,
                stream_mode="messages"
            ):
                await websocket.send_json({"type": "chunk", "data": chunk})
            
            await websocket.send_json({"type": "done"})
    
    except Exception as e:
        await websocket.close()
```

**Frontend**:
```javascript
const ws = new WebSocket('ws://localhost:8000/api/agent/ws');

ws.onopen = () => {
    ws.send(JSON.stringify({ query, user_id }));
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'chunk') {
        // Update UI with chunk
    }
};
```

## Database Persistence

### Save Conversations

```python
# backend/models/conversation.py
from sqlalchemy import Column, Integer, String, DateTime, JSON
from datetime import datetime

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String, index=True)
    thread_id = Column(String, unique=True)
    messages = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)

# In agent endpoint
async def save_conversation(thread_id: str, messages: list):
    conversation = Conversation(
        thread_id=thread_id,
        messages=messages
    )
    db.add(conversation)
    await db.commit()
```

### LangGraph Checkpointer (State Persistence)

```python
# Automatic state persistence
from langgraph.checkpoint.postgres import PostgresSaver

checkpointer = PostgresSaver.from_conn_string(DATABASE_URL)
app = graph.compile(checkpointer=checkpointer)

# State saved automatically after each node
# Resume from any point
config = {"configurable": {"thread_id": "user-123"}}
result = app.invoke({"query": "continue"}, config)  # Resumes from last state
```

## Complete Integration Example

```python
# backend/api/agent_routes.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sse_starlette.sse import EventSourceResponse
from agents.graph import app
from models.conversation import Conversation
from database import get_db

router = APIRouter()

@router.post("/agent/chat")
async def chat_with_agent(
    query: str,
    user_id: str,
    stream: bool = True,
    db: AsyncSession = Depends(get_db)
):
    thread_id = f"{user_id}-{datetime.now().timestamp()}"
    config = {"configurable": {"thread_id": thread_id}}
    
    if not stream:
        # Simple invoke
        result = await app.ainvoke(
            {"query": query, "user_id": user_id},
            config
        )
        
        # Save to DB
        await save_conversation(db, thread_id, result["messages"])
        
        return {"answer": result["answer"]}
    
    # Streaming
    async def event_generator():
        final_messages = []
        
        async for chunk in app.astream(
            {"query": query, "user_id": user_id},
            config,
            stream_mode="messages"
        ):
            final_messages.append(chunk)
            yield {
                "event": "message",
                "data": json.dumps({
                    "content": chunk.get("content", ""),
                    "type": chunk.get("type", "text")
                })
            }
        
        # Save after streaming complete
        await save_conversation(db, thread_id, final_messages)
        
        yield {"event": "done", "data": json.dumps({"thread_id": thread_id})}
    
    return EventSourceResponse(event_generator())
```

## Frontend Component (Full Example)

```javascript
// frontend/src/components/AgentChat.jsx
import { useState, useRef, useEffect } from 'react';

export default function AgentChat({ userId }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const eventSourceRef = useRef(null);

    const sendMessage = async () => {
        const query = input;
        setInput('');
        
        // Add user message
        setMessages(prev => [...prev, { role: 'user', content: query }]);
        setLoading(true);

        // Add empty assistant message (will be filled by stream)
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        // Start SSE stream
        eventSourceRef.current = new EventSource(
            `/api/agent/chat?query=${encodeURIComponent(query)}&user_id=${userId}&stream=true`,
            { withCredentials: true }
        );

        eventSourceRef.current.addEventListener('message', (e) => {
            const data = JSON.parse(e.data);
            
            setMessages(prev => {
                const updated = [...prev];
                const lastMsg = updated[updated.length - 1];
                
                if (lastMsg.role === 'assistant') {
                    lastMsg.content += data.content;
                }
                
                return updated;
            });
        });

        eventSourceRef.current.addEventListener('done', (e) => {
            setLoading(false);
            eventSourceRef.current?.close();
        });

        eventSourceRef.current.onerror = () => {
            setLoading(false);
            eventSourceRef.current?.close();
        };
    };

    return (
        <div className="chat-container">
            <div className="messages">
                {messages.map((msg, i) => (
                    <div key={i} className={`message ${msg.role}`}>
                        {msg.content}
                    </div>
                ))}
                {loading && <div className="thinking-indicator">●●●</div>}
            </div>
            
            <div className="input-area">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={loading}
                />
                <button onClick={sendMessage} disabled={loading}>
                    Send
                </button>
            </div>
        </div>
    );
}
```

## Workflow Summary

1. **Read project context** (getting-the-bigger-picture)
2. **Check existing structure** (adapt to it)
3. **Determine streaming needs** (chat UI = yes, batch = no)
4. **Check DB schema** (what tables exist, what to add)
5. **Design state** (minimal, matches DB)
6. **Prompts in prompts.py** (separate file)
7. **Build graph** (nodes, edges, conditional logic)
8. **Add persistence** (checkpointer for state)
9. **Implement API** (SSE/WebSocket if streaming)
10. **Connect frontend** (EventSource or WebSocket)

## Key Decisions

**Streaming**: Use SSE for chat-like interfaces with long responses
**Persistence**: Use PostgresSaver for state, separate table for conversations
**Frontend**: EventSource for one-way streaming, WebSocket for bidirectional
**Structure**: Adapt to existing, don't force new structure
**Tools**: Use uv for all package management

## Quick Commands

```bash
# Add LangGraph
uv add langgraph langchain-anthropic

# Streaming support
uv add sse-starlette  # For SSE

# Run
uv run python backend/main.py
```

## Remember

- Always read PROJECT_DESCRIPTION.md first
- Adapt to existing structure
- Ask about streaming needs upfront
- Consider existing DB schema
- Prompts in separate file
- Use uv for everything
- SSE for chat streaming
- Save conversations to DB