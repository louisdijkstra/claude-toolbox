---
name: setting-up-langfuse-for-tracing-llms
description: Set up Langfuse v3 observability for all LLM calls in your application. Finds existing LLM calls, assesses current tracing, and implements or updates Langfuse tracing with proper structure, human-readable naming, metadata, and optional feedback/prompt management.
---

# Setting Up Langfuse for Tracing LLMs

## Purpose
Systematically instrument all LLM calls in your application with Langfuse v3 for observability. Uses context managers for clean, consistent tracing with human-readable names, proper input/output capture, and rich metadata.

## When to Use This Skill

Use when:
- Adding Langfuse tracing to a new or existing application
- Auditing existing tracing implementation
- Standardizing tracing patterns across codebase
- Setting up observability infrastructure
- Preparing for production deployment

## Prerequisites
```bash
uv add langfuse python-dotenv
```

## SSL certification and CA certificates

## Docker Setup with uv and Langfuse

When using uv with Langfuse on macOS, SSL certificate issues arise because uv's bundled Python lacks system CA certificates. The solution is to use Docker with the official Python image, which includes proper certificate configuration.

### Multi-stage Dockerfile

Use a multi-stage build to keep the final image small and fast. Install uv directly in the Dockerfile to avoid SSL issues with Docker daemon image pulling (including when using Colima):
```dockerfile
# syntax=docker/dockerfile:1
FROM python:3.13-slim AS build

WORKDIR /app

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

# Install uv directly instead of copying from image
RUN pip install uv

# Copy dependency files first for better Docker caching
COPY uv.lock pyproject.toml ./

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev --no-install-project

COPY . .

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

# Runtime stage
FROM python:3.13-slim

ENV PATH="/app/.venv/bin:$PATH"

WORKDIR /app

COPY --from=build /app /app

# Optional: non-root user for security
RUN useradd -m -u 1001 appuser && chown -R appuser:appuser /app
USER appuser

ENTRYPOINT ["python", "-m", "your_app_module"]
```

### Why this works

The official Python image includes Debian ca-certificates and proper OpenSSL integration. Langfuse's OpenTelemetry exporter automatically has access to system certificates without additional configuration. Installing uv via pip avoids SSL certificate issues that can occur when your Docker daemon (including Colima) pulls from external image registries.

### Build and run
```bash
docker build -t your-app .
docker run your-app
```

For development with volume mounts, add a `docker-compose.yml` file. This approach solves SSL issues entirely because Docker containers have proper certificate configuration built-in.

## SDK Version

Use Langfuse SDK v3. Do NOT use v2. Use version pining. 

## Step 1: Environment Setup

**.env file:**
```
# Required
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_HOST=https://cloud.langfuse.com  # or https://us.cloud.langfuse.com or self-hosted URL

# Environment tracking
LANGFUSE_ENVIRONMENT=dev  # or 'prod'

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

## Step 2: Find All LLM Calls

**Search patterns:**
```bash
# Anthropic
rg "client\.messages\.create|Anthropic\(\)" --type py

# OpenAI
rg "openai\.chat\.completions\.create|OpenAI\(\)" --type py

# Other LLM libraries
rg "bedrock|vertex|cohere|together" --type py -i
```

**Common locations:**
- Agent modules
- API route handlers
- Service/utility functions
- Background jobs

## Step 3: Assess Current Tracing

For each LLM call, check:
- Is it traced? (Look for `@observe`, `langfuse.start_as_current_*`, or integration wrappers)
- Is tracing properly structured? (Context managers, not manual `.end()` calls)
- Are inputs/outputs human-readable?
- Is metadata comprehensive?
- **Are trace names descriptive and human-readable?**

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
            
            with langfuse.start_as_current_generation(
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

## Step 5: Naming Convention

**Critical:** Trace names must be clear and human-readable. They appear in the Langfuse UI and should immediately convey purpose.

### Naming Guidelines

**Format:** `<action>-<object>` (kebab-case)

**Good examples:**
- `answer-user-question`
- `summarize-customer-ticket`
- `generate-product-description`
- `translate-email-to-spanish`
- `analyze-code-for-bugs`
- `retrieve-similar-documents`
- `classify-support-request`

**Bad examples:**
- `llm-call` (too generic)
- `generation_1` (not descriptive)
- `process` (unclear what it does)
- `anthropic_api` (technical, not user-focused)

**For nested spans:**
- Root: `handle-customer-query`
- Child 1: `retrieve-order-history`
- Child 2: `generate-response-with-context`
- Child 3: `format-response-for-email`

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
    
    with langfuse.start_as_current_generation(
        name="answer-user-chat-message",  # Clear, descriptive name
        input={"user_query": query},  # Human-readable
        model=model,
        metadata={
            "max_tokens": 1024,
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
            usage={
                "input": message.usage.input_tokens,
                "output": message.usage.output_tokens,
                "total": message.usage.input_tokens + message.usage.output_tokens
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
        with langfuse.start_as_current_span(
            name="resolve-customer-support-ticket",
            input={
                "ticket_id": ticket_id,
                "customer_question": question
            }
        ) as root:
            
            # Step 1: Retrieve relevant context
            with langfuse.start_as_current_span(
                name="search-knowledge-base",
                input={"search_query": question},
                metadata={"database": "qdrant", "top_k": 5}
            ) as retrieval:
                context = vector_search(question, top_k=5)
                retrieval.update(output={
                    "num_results": len(context),
                    "result_titles": [c["title"] for c in context]
                })
            
            # Step 2: Generate response
            with langfuse.start_as_current_generation(
                name="generate-support-response",
                model="claude-sonnet-4-20250514",
                input={
                    "customer_question": question,
                    "context_articles": [c["title"] for c in context]
                },
                metadata={
                    "context_length": sum(len(c["text"]) for c in context),
                    "temperature": 0.7
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

### Pattern 3: Using Decorator (Custom Utility)
```python
from .langfuse import trace_generation

@trace_generation(
    name="summarize-legal-document",  # Clear, specific name
    enabled=TRACE_CHAT,
    capture_input=lambda doc, **kw: {
        "document_length_chars": len(doc),
        "document_preview": doc[:200] + "..."
    },
    capture_output=lambda result: {
        "summary": result,
        "summary_length_chars": len(result)
    }
)
def summarize_document(document: str, model: str = "claude-sonnet-4-20250514"):
    message = client.messages.create(
        model=model,
        max_tokens=500,
        messages=[{
            "role": "user",
            "content": f"Summarize this legal document:\n\n{document}"
        }]
    )
    return message.content[0].text
```

### Pattern 4: Native OpenAI Integration
```python
# Drop-in replacement - automatic tracing
from langfuse.openai import openai

client = openai.OpenAI()

# All calls automatically traced
completion = client.chat.completions.create(
    name="answer-faq-question",  # Descriptive name
    model="gpt-4o",
    messages=[{"role": "user", "content": "What are your business hours?"}],
    metadata={
        "category": "faq",
        "user_tier": "free"
    }
)
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
- **Metadata**: Everything else (system prompts, parameters, internal context)

**Example:**
```python
with langfuse.start_as_current_generation(
    name="respond-to-premium-customer",  # Business context in name
    input={"customer_message": user_message},  # Clean, human-readable
    model="claude-sonnet-4-20250514",
    metadata={
        "system_prompt": system_prompt,  # Technical details in metadata
        "temperature": 0.7,
        "conversation_turns": len(history),
        "retrieval_results_count": len(retrieval_results),
        "customer_tier": "premium",
        "customer_language": "en"
    }
) as generation:
    # LLM call
    generation.update(
        output={"assistant_message": final_response},  # What user sees
        usage={"input": tokens_in, "output": tokens_out}
    )
```

## Step 8: Real-World Naming Examples

### E-commerce Application
```python
# Root spans
"process-checkout-request"
"handle-product-search"
"resolve-refund-inquiry"

# Nested generations
"generate-product-recommendations"
"summarize-product-reviews"
"classify-customer-intent"
"translate-product-description"
"answer-shipping-question"
```

### Healthcare Application
```python
# Root spans
"process-patient-intake"
"analyze-medical-report"
"schedule-appointment"

# Nested generations
"extract-symptoms-from-text"
"suggest-relevant-specialists"
"generate-patient-summary"
"classify-urgency-level"
```

### SaaS Analytics Tool
```python
# Root spans
"generate-monthly-report"
"answer-data-question"
"create-custom-dashboard"

# Nested generations
"query-database-for-metrics"
"generate-insights-from-data"
"explain-trend-analysis"
"suggest-optimization-actions"
```

## Step 9: Feedback Setup (Optional)

**Ask user:** "Do you want to set up user feedback collection with Langfuse?"

**If yes:**
```python
# In your API that receives feedback
from .langfuse import langfuse

def submit_feedback(trace_id: str, rating: int, comment: str = None):
    """
    Submit user feedback for a trace.
    
    Args:
        trace_id: Trace ID from the generation
        rating: 1-5 star rating
        comment: Optional text feedback
    """
    langfuse.create_score(
        trace_id=trace_id,
        name="user-satisfaction-rating",
        value=rating,
        data_type="NUMERIC",
        comment=comment
    )

# Return trace_id to frontend
with langfuse.start_as_current_generation(
    name="answer-user-question"
) as generation:
    result = llm_call()
    trace_id = generation.trace_id  # Pass to frontend
    return {"response": result, "trace_id": trace_id}
```

**Frontend integration:**
```javascript
// After user provides feedback
fetch('/api/feedback', {
    method: 'POST',
    body: JSON.stringify({
        trace_id: traceId,
        rating: 5,
        comment: "Very helpful!"
    })
});
```

## Step 10: Prompt Management (Optional)

**Ask user:** "Do you want to use Langfuse's prompt management system?"

**Note:** Only recommended if:
- Prompts change frequently
- Multiple people collaborate on prompts
- Deployment is slow/expensive
- You want version control + A/B testing

**If yes:**
```python
from .langfuse import langfuse

def get_managed_prompt(name: str, version: Optional[str] = None):
    """Fetch prompt from Langfuse."""
    return langfuse.get_prompt(name, version=version)

# Usage
with langfuse.start_as_current_generation(
    name="respond-to-customer-inquiry",
    model="claude-sonnet-4-20250514"
) as generation:
    # Fetch prompt from Langfuse
    prompt = get_managed_prompt("customer-support-agent-v2")
    
    # Link prompt to generation (for metrics)
    generation.update(prompt=prompt)
    
    # Use the prompt
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        messages=[
            {"role": "system", "content": prompt.prompt},
            {"role": "user", "content": user_query}
        ]
    )
    
    generation.update(output={"response": response.content[0].text})
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

### Error Handling
```python
with langfuse.start_as_current_generation(
    name="generate-code-explanation",
    input={"code_snippet": code}
) as generation:
    try:
        result = llm_call(code)
        generation.update(output={"explanation": result})
        return result
    except Exception as e:
        generation.update(
            metadata={
                "error_message": str(e),
                "error_type": type(e).__name__
            }
        )
        raise
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
        with langfuse.start_as_current_span(
            name="analyze-patient-symptoms"
        ):
            return _process(patient_data)
    else:
        return _process(patient_data)
```

## Verification Checklist

After implementation, verify:

- [ ] All LLM calls have tracing or explicit opt-out
- [ ] **All trace names are human-readable and descriptive**
- [ ] Inputs/outputs are human-readable (not raw API formats)
- [ ] Metadata includes model, provider, user_id
- [ ] Environment variable controls work (can disable tracing)
- [ ] Trace hierarchy is logical (nested spans make sense)
- [ ] No PII in traces (if applicable)
- [ ] `langfuse.flush()` called in short-lived processes
- [ ] Feedback endpoints set up (if needed)
- [ ] Prompts managed via Langfuse (if opted in)

## Common Patterns

| Scenario | Name Example | Key Points |
|----------|--------------|-----------|
| Chat response | `answer-user-chat-message` | Model, input, output, usage |
| Document analysis | `analyze-contract-for-risks` | Clear business purpose |
| Multi-step workflow | Root: `process-loan-application`<br>Child: `extract-applicant-info`<br>Child: `assess-creditworthiness` | Hierarchical clarity |
| Privacy-sensitive | `handle-medical-consultation` | Check `TRACING_ENABLED` flag |
| User conversations | `continue-product-support-chat` | Use session_id |
| Background jobs | `generate-daily-summary-report` | Ensure `flush()` |

## Troubleshooting

**Traces not appearing:**
- Check environment variables
- Call `langfuse.auth_check()` to verify credentials
- Ensure `flush()` called in short-lived processes

**Wrong trace hierarchy:**
- Verify context managers are properly nested
- Check that OpenTelemetry context is propagated (automatic in v3)

**Missing metadata:**
- Ensure `propagate_attributes()` wraps outer span
- Use `generation.update()` not reassignment

**Unclear trace names in UI:**
- Review naming convention
- Use `<action>-<object>` format
- Make names business-focused, not technical

## Resources

- [Langfuse v3 Docs](https://langfuse.com/docs/sdk/python/sdk-v3)
- [Context Managers Guide](https://langfuse.com/docs/sdk/python/decorators)
- [Environments](https://langfuse.com/docs/observability/features/environments)
- [Feedback/Scores](https://langfuse.com/docs/scores/custom)
- [Prompt Management](https://langfuse.com/docs/prompt-management)

## Integration Notes

**Use with other skills:**
- `getting-the-bigger-picture`: Check if observability is a project requirement
- `anthropic-sdk-setup`: Coordinate with Anthropic client setup

**Before implementing:** Understand privacy requirements and determine which operations should never be traced.
