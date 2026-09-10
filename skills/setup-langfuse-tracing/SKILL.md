---
name: setup-langfuse-tracing
description: Instrument LLM calls with Langfuse v4 tracing — client setup, a reusable tracing module, context-manager and nested-span patterns, metadata keys, flush handling. Use when a repo makes LLM calls with no Langfuse spans around them.
---

# Setup Langfuse Tracing

## SDK Version

Use Langfuse SDK v4. Do NOT use v2 or v3 patterns (`start_as_current_generation`, `start_as_current_span`, `update_current_trace` are gone). Pin the version.

## Step 1: Environment Setup

**.env file:**
```
# Required
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_BASE_URL=https://cloud.langfuse.com  # or https://us.cloud.langfuse.com or self-hosted URL

# Environment tracking
LANGFUSE_TRACING_ENVIRONMENT=dev  # or 'prod'

# Privacy controls (set to 'false' to disable tracing)
LANGFUSE_TRACING_ENABLED=true

# Optional: Fine-grained control for different LLM types
LANGFUSE_TRACE_CHAT=true
LANGFUSE_TRACE_EMBEDDINGS=true
LANGFUSE_TRACE_ANALYSIS=true
```

**Load environment:**
```python
from dotenv import load_dotenv
import os

load_dotenv()

# Global tracing controls
TRACING_ENABLED = os.getenv("LANGFUSE_TRACING_ENABLED", "true").lower() == "true"
TRACE_CHAT = os.getenv("LANGFUSE_TRACE_CHAT", "true").lower() == "true"
```

## Step 4: Create Langfuse Module

**Recommended: Create `<project_name>/langfuse.py`**
```python
"""Centralized Langfuse configuration and utilities."""

from functools import wraps
from langfuse import get_client, propagate_attributes
from typing import Optional, Dict, Any, Callable
import os

# Initialize client (reads from environment)
langfuse = get_client()

# Tracing controls
TRACING_ENABLED = os.getenv("LANGFUSE_TRACING_ENABLED", "true").lower() == "true"
TRACE_CHAT = os.getenv("LANGFUSE_TRACE_CHAT", "true").lower() == "true"
TRACE_EMBEDDINGS = os.getenv("LANGFUSE_TRACE_EMBEDDINGS", "true").lower() == "true"


def trace_generation(
    name: str,
    enabled: bool = True,
    capture_input: Callable = None,
    capture_output: Callable = None,
):
    """
    Decorator for LLM calls with optional input/output transformers.

    Args:
        name: Human-readable name for the generation (e.g., "answer-user-question")
        enabled: Whether to trace (respects TRACING_ENABLED)
        capture_input: Function to transform input for logging
        capture_output: Function to transform output for logging
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if not (TRACING_ENABLED and enabled):
                return func(*args, **kwargs)

            # Prepare input
            input_data = capture_input(*args, **kwargs) if capture_input else {
                "args": args,
                "kwargs": kwargs
            }

            with langfuse.start_as_current_observation(
                as_type="generation",
                name=name,
                input=input_data,
            ) as generation:
                result = func(*args, **kwargs)

                # Prepare output
                output_data = capture_output(result) if capture_output else result
                generation.update(output=output_data)

                return result

        return wrapper
    return decorator


def add_trace_metadata(
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    tags: Optional[list] = None,
    metadata: Optional[Dict[str, Any]] = None,
):
    """
    Context manager to propagate metadata to all child observations.

    Usage:
        with add_trace_metadata(user_id="user_123", tags=["production"]):
            # All LLM calls here get metadata
            response = call_llm(...)
    """
    kwargs = {}
    if user_id:
        kwargs["user_id"] = user_id
    if session_id:
        kwargs["session_id"] = session_id
    if tags:
        kwargs["tags"] = tags
    if metadata:
        kwargs["metadata"] = metadata

    return propagate_attributes(**kwargs)
```

**Naming convention:** span and generation names are `<verb>-<noun>` in kebab-case (e.g. `answer-user-question`), human-readable, and stable across runs — never `llm-call` or `generation_1`.

## Step 6: Tracing Patterns

### Pattern 1: Direct LLM Call with Context Manager

**Before:**
```python
def chat_completion(query: str, model: str = "claude-sonnet-4-20250514"):
    message = client.messages.create(
        model=model,
        max_tokens=1024,
        messages=[{"role": "user", "content": query}]
    )
    return message.content[0].text
```

**After:**
```python
from .langfuse import langfuse, TRACE_CHAT

def chat_completion(query: str, model: str = "claude-sonnet-4-20250514"):
    if not TRACE_CHAT:
        message = client.messages.create(
            model=model,
            max_tokens=1024,
            messages=[{"role": "user", "content": query}]
        )
        return message.content[0].text
    
    with langfuse.start_as_current_observation(
        as_type="generation",
        name="answer-user-chat-message",  # Clear, descriptive name
        input={"user_query": query},  # Human-readable
        model=model,
        metadata={
            "max_tokens": "1024",
            "provider": "anthropic"
        }
    ) as generation:
        message = client.messages.create(
            model=model,
            max_tokens=1024,
            messages=[{"role": "user", "content": query}]
        )
        response_text = message.content[0].text
        
        generation.update(
            output={"assistant_response": response_text},  # Human-readable
            usage_details={
                "input_tokens": message.usage.input_tokens,
                "output_tokens": message.usage.output_tokens
            }
        )
        
        return response_text
```

### Pattern 2: Multi-step Agent with Nested Spans
```python
from .langfuse import langfuse, add_trace_metadata

def process_customer_support_request(user_id: str, ticket_id: str, question: str):
    """Process a customer support ticket with retrieval and generation."""
    
    with add_trace_metadata(
        user_id=user_id,
        session_id=ticket_id,
        tags=["customer-support", "production"]
    ):
        # Root span with clear business context
        with langfuse.start_as_current_observation(
            as_type="span",
            name="resolve-customer-support-ticket",
            input={
                "ticket_id": ticket_id,
                "customer_question": question
            }
        ) as root:
            
            # Step 1: Retrieve relevant context
            with langfuse.start_as_current_observation(
                as_type="span",
                name="search-knowledge-base",
                input={"search_query": question},
                metadata={"database": "qdrant", "top_k": "5"}
            ) as retrieval:
                context = vector_search(question, top_k=5)
                retrieval.update(output={
                    "num_results": len(context),
                    "result_titles": [c["title"] for c in context]
                })
            
            # Step 2: Generate response
            with langfuse.start_as_current_observation(
                as_type="generation",
                name="generate-support-response",
                model="claude-sonnet-4-20250514",
                input={
                    "customer_question": question,
                    "context_articles": [c["title"] for c in context]
                },
                metadata={
                    "context_length": str(sum(len(c["text"]) for c in context)),
                    "temperature": "0.7"
                }
            ) as generation:
                response = generate_response_with_context(question, context)
                generation.update(output={"support_response": response})
            
            root.update(output={
                "response_to_customer": response,
                "articles_used": len(context)
            })
            
            return response
```

## Step 7: Metadata Strategy

**Essential metadata:**
- `model`: Model ID
- `provider`: anthropic/openai/etc
- `user_id`: For cost tracking
- `session_id`: For conversation tracking
- `environment`: dev/prod (automatic if set in env)

**Input/output guidelines:**
- **Input**: User-facing query/prompt (what user sees)
- **Output**: Final response shown to user
- **Metadata**: Everything else (system prompts, parameters, internal context) — values propagated via `propagate_attributes()` must be `dict[str, str]`; non-string values are coerced and values over 200 characters are dropped with a warning

**Example:**
```python
with langfuse.start_as_current_observation(
    as_type="generation",
    name="respond-to-premium-customer",  # Business context in name
    input={"customer_message": user_message},  # Clean, human-readable
    model="claude-sonnet-4-20250514",
    metadata={
        "system_prompt": system_prompt,  # Technical details in metadata
        "temperature": "0.7",
        "conversation_turns": str(len(history)),
        "retrieval_results_count": str(len(retrieval_results)),
        "customer_tier": "premium",
        "customer_language": "en"
    }
) as generation:
    # LLM call
    generation.update(
        output={"assistant_message": final_response},  # What user sees
        usage_details={"input_tokens": tokens_in, "output_tokens": tokens_out}
    )
```

## Step 11: Production Patterns

### Flush for Short-Lived Processes
```python
# At application shutdown
langfuse.flush()

# FastAPI example
from contextlib import asynccontextmanager
from fastapi import FastAPI

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    langfuse.flush()  # Ensure all events sent before shutdown

app = FastAPI(lifespan=lifespan)
```

### Privacy-Sensitive Data
```python
# Custom masking
from langfuse import Langfuse
import re

def mask_pii(data):
    """Mask emails, phone numbers, etc."""
    if isinstance(data, str):
        data = re.sub(r'\b[\w.-]+@[\w.-]+\.\w+\b', '[EMAIL]', data)
        data = re.sub(r'\b\d{3}-\d{3}-\d{4}\b', '[PHONE]', data)
    return data

langfuse = Langfuse(mask=mask_pii)

# Or: Don't trace sensitive operations at all
def process_sensitive_medical_data(patient_data):
    if TRACE_MEDICAL:  # Set to false for HIPAA compliance
        with langfuse.start_as_current_observation(
            as_type="span",
            name="analyze-patient-symptoms"
        ):
            return _process(patient_data)
    else:
        return _process(patient_data)
```

## SSL Certificates

SSL errors on macOS usually mean uv's bundled Python is missing system CA certificates, not a genuine connection problem. Run the app in the official `python:3.13-slim` Docker image (ships with proper CA certs) instead of debugging the Langfuse client itself.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Traces not appearing | Bad credentials or env vars | Call `langfuse.auth_check()`; verify `LANGFUSE_PUBLIC_KEY`/`SECRET_KEY`/`BASE_URL` |
| Traces cut off in short-lived scripts | Buffered events never sent | Call `langfuse.flush()` before exit |
| Wrong trace hierarchy | Context managers not properly nested | Nest `start_as_current_observation` calls; don't mix manual `.end()` calls |
| Missing metadata on child spans | `propagate_attributes()` not wrapping the outer span | Wrap the outermost span/generation and keep values as `dict[str, str]` |
