"""
Simple Chat Agent Example (2026)

Production-ready chat agent with:
- TypedDict state management
- PostgreSQL persistence
- Error handling
- Langfuse observability
- SSE streaming support

Run: uv run python examples/simple-chat-agent.py
"""

import asyncio
import os
from typing import Annotated
from typing_extensions import TypedDict

from langgraph.graph import StateGraph, END, START
from langgraph.graph.message import add_messages
from langgraph.checkpoint.postgres import AsyncPostgresSaver
from langchain_anthropic import ChatAnthropic
import asyncpg

from fastapi import FastAPI
from sse_starlette.sse import EventSourceResponse
from langfuse import Langfuse
from langfuse.langchain import CallbackHandler
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# 1. State Definition
# ============================================================================

class ChatState(TypedDict):
    """Chat agent state with typed fields."""
    messages: Annotated[list[dict], add_messages]  # Auto-append messages
    user_id: str
    session_id: str
    status: str  # "processing" | "success" | "error"
    error: str | None


# ============================================================================
# 2. Nodes
# ============================================================================

# Initialize LLM (reuse across invocations)
llm = ChatAnthropic(
    model="claude-sonnet-4-5-20250929",
    temperature=0.7
)

async def chat_node(state: ChatState) -> dict:
    """
    Main chat node with error handling.

    Returns partial state updates.
    """
    try:
        # Extract user message
        user_message = state["messages"][-1]["content"]
        logger.info(f"Processing message: {user_message[:50]}...")

        # Call LLM
        response = await llm.ainvoke(state["messages"])

        return {
            "messages": [{"role": "assistant", "content": response.content}],
            "status": "success",
            "error": None
        }

    except Exception as e:
        logger.error(f"Chat node failed: {e}", exc_info=True)
        return {
            "status": "error",
            "error": str(e)
        }


def error_handler_node(state: ChatState) -> dict:
    """Handle errors gracefully."""
    error_message = f"I encountered an error: {state.get('error', 'Unknown error')}. Please try again."

    return {
        "messages": [{"role": "assistant", "content": error_message}],
        "status": "recovered",
        "error": None
    }


# ============================================================================
# 3. Graph Definition
# ============================================================================

# Create graph
graph = StateGraph(ChatState)

# Add nodes
graph.add_node("chat", chat_node)
graph.add_node("error_handler", error_handler_node)

# Set entry point
graph.add_edge(START, "chat")

# Conditional routing based on status
def route_on_status(state: ChatState) -> str:
    """Route to error handler or end based on status."""
    if state["status"] == "error":
        return "error_handler"
    return END

graph.add_conditional_edges(
    "chat",
    route_on_status,
    {
        "error_handler": "error_handler",
        END: END
    }
)

# Error handler goes to END
graph.add_edge("error_handler", END)


# ============================================================================
# 4. Persistence Setup
# ============================================================================

async def get_checkpointer():
    """Initialize PostgreSQL checkpointer."""
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://localhost/langgraph_dev")

    # Create connection pool
    pool = await asyncpg.create_pool(
        DATABASE_URL,
        min_size=5,
        max_size=20,
        command_timeout=60,
        server_settings={'jit': 'off'}
    )

    # Initialize checkpointer
    checkpointer = AsyncPostgresSaver(pool)
    await checkpointer.setup()

    logger.info("PostgreSQL checkpointer initialized")
    return checkpointer


# ============================================================================
# 5. Observability Setup
# ============================================================================

# Initialize Langfuse (once at startup)
Langfuse(
    public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
    secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
    host=os.getenv("LANGFUSE_BASE_URL", "https://cloud.langfuse.com")
)


def get_langfuse_handler(user_id: str, session_id: str) -> CallbackHandler:
    """Create Langfuse handler with metadata."""
    return CallbackHandler()


# ============================================================================
# 6. FastAPI Application
# ============================================================================

app_fastapi = FastAPI(title="Chat Agent API")

# Global variable for compiled graph
agent_app = None


@app_fastapi.on_event("startup")
async def startup():
    """Initialize graph on startup."""
    global agent_app
    checkpointer = await get_checkpointer()
    agent_app = graph.compile(checkpointer=checkpointer)
    logger.info("Agent app initialized")


@app_fastapi.post("/chat/stream")
async def stream_chat(
    query: str,
    user_id: str = "default_user",
    session_id: str = "default_session"
):
    """
    Stream chat responses using Server-Sent Events.

    Frontend connects with EventSource API.
    """
    config = {
        "configurable": {"thread_id": f"{user_id}-{session_id}"},
        "callbacks": [get_langfuse_handler(user_id, session_id)],
        "metadata": {
            "langfuse_user_id": user_id,
            "langfuse_session_id": session_id,
            "langfuse_tags": ["chat", "example"]
        }
    }

    initial_state: ChatState = {
        "messages": [{"role": "user", "content": query}],
        "user_id": user_id,
        "session_id": session_id,
        "status": "processing",
        "error": None
    }

    async def event_generator():
        """Generate SSE events."""
        try:
            # Stream with "messages" mode for token-level streaming
            async for chunk in agent_app.astream(
                initial_state,
                config,
                stream_mode="messages"
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
            logger.error(f"Stream error: {e}", exc_info=True)
            yield {
                "event": "error",
                "data": json.dumps({"error": str(e)})
            }

    return EventSourceResponse(event_generator())


@app_fastapi.post("/chat/invoke")
async def invoke_chat(
    query: str,
    user_id: str = "default_user",
    session_id: str = "default_session"
):
    """Non-streaming endpoint (returns complete response)."""
    config = {
        "configurable": {"thread_id": f"{user_id}-{session_id}"},
        "callbacks": [get_langfuse_handler(user_id, session_id)],
        "metadata": {
            "langfuse_user_id": user_id,
            "langfuse_session_id": session_id
        }
    }

    initial_state: ChatState = {
        "messages": [{"role": "user", "content": query}],
        "user_id": user_id,
        "session_id": session_id,
        "status": "processing",
        "error": None
    }

    try:
        result = await agent_app.ainvoke(initial_state, config)
        return {
            "answer": result["messages"][-1]["content"],
            "status": result["status"]
        }
    except Exception as e:
        logger.error(f"Invocation error: {e}", exc_info=True)
        return {"error": str(e)}, 500


@app_fastapi.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


# ============================================================================
# 7. Main (for testing)
# ============================================================================

async def main():
    """Test the agent locally."""
    # For local testing without FastAPI
    from langgraph.checkpoint.memory import MemorySaver

    # Use MemorySaver for local testing
    test_app = graph.compile(checkpointer=MemorySaver())

    config = {"configurable": {"thread_id": "test-thread"}}

    initial_state: ChatState = {
        "messages": [{"role": "user", "content": "What is LangGraph?"}],
        "user_id": "test_user",
        "session_id": "test_session",
        "status": "processing",
        "error": None
    }

    print("Testing chat agent...")
    result = await test_app.ainvoke(initial_state, config)

    print(f"\nStatus: {result['status']}")
    print(f"Response: {result['messages'][-1]['content']}")


if __name__ == "__main__":
    # Run local test
    asyncio.run(main())

    # To run FastAPI server:
    # uv run uvicorn examples.simple-chat-agent:app_fastapi --reload
