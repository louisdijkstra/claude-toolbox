# PydanticAI Setup Examples

Complete code examples for all components referenced in SKILL.md.

## Table of Contents

1. [Installation](#installation)
2. [Observability Setup](#observability-setup)
3. [Base Infrastructure](#base-infrastructure)
4. [Example Agent](#example-agent)
5. [Error Handling](#error-handling)
6. [FastAPI Integration](#fastapi-integration)
7. [Testing Infrastructure](#testing-infrastructure)
8. [Environment Configuration](#environment-configuration)
9. [Documentation Template](#documentation-template)
10. [CLAUDE.md Update](#claudemd-update)

## Installation

### Base Installation

```bash
cd <project-directory>
uv add pydantic-ai
```

### With Provider-Specific Extras

```bash
# AWS Bedrock
uv add "pydantic-ai-slim[bedrock]"

# Anthropic
uv add "pydantic-ai-slim[anthropic]"

# OpenAI
uv add "pydantic-ai-slim[openai]"

# Google Gemini
uv add "pydantic-ai-slim[google]"

# Multiple providers
uv add "pydantic-ai-slim[bedrock,anthropic,openai]"
```

### Observability Extras

```bash
# Pydantic Logfire (recommended for new projects)
uv add "pydantic-ai-slim[logfire]"

# Or install logfire separately for OpenTelemetry
uv add logfire
```

### Testing Dependencies

```bash
uv add --dev inline-snapshot dirty-equals pytest-asyncio
```

### Optional: Durable Execution

```bash
# For long-running workflows with state persistence
uv add "pydantic-ai-slim[temporal]"  # or [dbos] or [prefect]
```

## Observability Setup

### Option A: Langfuse (via OpenTelemetry)

**File**: `<agents-directory>/observability.py`

```python
"""Observability setup for PydanticAI with Langfuse."""
import os
import logfire
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from langfuse.opentelemetry import LangfuseSpanExporter

def configure_observability():
    """Configure PydanticAI to send traces to Langfuse via OpenTelemetry."""
    # Check if Langfuse credentials are set
    if not os.getenv("LANGFUSE_PUBLIC_KEY") or not os.getenv("LANGFUSE_SECRET_KEY"):
        raise ValueError(
            "Langfuse credentials not found. Set LANGFUSE_PUBLIC_KEY and "
            "LANGFUSE_SECRET_KEY environment variables."
        )

    # Configure logfire to send to Langfuse
    logfire.configure(
        service_name=os.getenv("SERVICE_NAME", "pydantic-ai-agents"),
        processors=[
            BatchSpanProcessor(LangfuseSpanExporter())
        ],
    )

    # Instrument PydanticAI to automatically trace agent runs
    logfire.instrument_pydantic_ai()

    print("✓ Observability configured: PydanticAI → OpenTelemetry → Langfuse")

# Call at application startup
configure_observability()
```

### Option B: Pydantic Logfire

**File**: `<agents-directory>/observability.py`

```python
"""Observability setup for PydanticAI with Pydantic Logfire."""
import logfire

def configure_observability():
    """Configure PydanticAI to send traces to Pydantic Logfire."""
    logfire.configure()  # Uses LOGFIRE_TOKEN from environment
    logfire.instrument_pydantic_ai()

    print("✓ Observability configured: PydanticAI → Pydantic Logfire")

configure_observability()
```

**Environment Variables**:
- `LANGFUSE_PUBLIC_KEY` (if using Langfuse)
- `LANGFUSE_SECRET_KEY` (if using Langfuse)
- `LANGFUSE_HOST` (optional, defaults to https://cloud.langfuse.com)
- `LOGFIRE_TOKEN` (if using Pydantic Logfire)
- `SERVICE_NAME` (optional, for service identification)

## Base Infrastructure

### Base Context and Output Models

**File**: `<agents-directory>/base.py`

```python
"""Base agent configuration and shared dependencies."""
from dataclasses import dataclass
from typing import Any
from pydantic import BaseModel


@dataclass
class AgentContext:
    """
    Base dependency context for agents.

    Customize this based on your application needs.
    All agents can access these dependencies via RunContext[AgentContext].
    """
    # Database or data access
    db: Any  # Replace with your database connection type

    # User/session context
    user_id: str | None = None
    session_id: str | None = None

    # Optional: add more as needed
    # cache: Redis
    # config: AppConfig
    # logger: Logger


class BaseAgentOutput(BaseModel):
    """Base output model that all agent outputs should extend."""
    confidence: float | None = None
    metadata: dict[str, Any] | None = None
```

### Model Configuration

**File**: `<agents-directory>/config.py`

```python
"""Agent configuration and model settings."""
import os
from enum import Enum


class ModelProvider(str, Enum):
    """Supported LLM providers."""
    BEDROCK = "bedrock"
    ANTHROPIC = "anthropic"
    OPENAI = "openai"
    GEMINI = "google"


def get_model_name() -> str:
    """
    Get the configured model name.

    Customize based on your provider and preferences.
    """
    provider = os.getenv("LLM_PROVIDER", "bedrock")

    if provider == ModelProvider.BEDROCK:
        # AWS Bedrock model IDs
        return os.getenv(
            "BEDROCK_MODEL_ID",
            "anthropic.claude-3-5-sonnet-20241022-v2:0"
        )
    elif provider == ModelProvider.ANTHROPIC:
        return os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-5")
    elif provider == ModelProvider.OPENAI:
        return os.getenv("OPENAI_MODEL", "gpt-4")
    elif provider == ModelProvider.GEMINI:
        return os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp")

    return "anthropic:claude-sonnet-4-5"  # Default fallback


# Environment variables to set
# LLM_PROVIDER: bedrock|anthropic|openai|google
# For Bedrock: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
# For Anthropic: ANTHROPIC_API_KEY
# For OpenAI: OPENAI_API_KEY
# For Gemini: GOOGLE_API_KEY or GOOGLE_APPLICATION_CREDENTIALS
```

## Example Agent

**File**: `<agents-directory>/examples/analysis_agent.py`

```python
"""Example: Analysis agent with tools, dynamic instructions, and structured output."""
from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext, ModelRetry

from ..base import AgentContext, BaseAgentOutput
from ..config import get_model_name


# Define structured output
class AnalysisOutput(BaseAgentOutput):
    """Structured output for analysis results."""
    summary: str = Field(description="Brief summary of analysis")
    insights: list[str] = Field(description="Key insights discovered")
    recommendations: list[str] = Field(description="Actionable recommendations")
    confidence: float = Field(description="Confidence score 0-1", ge=0, le=1)


# Create agent with dependency injection
analysis_agent = Agent(
    get_model_name(),
    deps_type=AgentContext,
    output_type=AnalysisOutput,
    instructions=(
        "You are an expert data analyst. Analyze the provided data and "
        "return structured insights with high-confidence recommendations."
    ),
)


# Dynamic instructions using dependency injection
@analysis_agent.instructions
async def add_user_context(ctx: RunContext[AgentContext]) -> str:
    """Add user-specific context to instructions."""
    if ctx.deps.user_id:
        # Could fetch user preferences from database
        return f"User ID: {ctx.deps.user_id}. Tailor analysis to their needs."
    return ""


# Tool with dependency injection and error handling
@analysis_agent.tool
async def query_data(
    ctx: RunContext[AgentContext],
    query: str,
    limit: int = 100
) -> dict:
    """
    Query the database for analysis data.

    Args:
        query: SQL query or search terms
        limit: Maximum results to return

    Returns:
        Query results as dictionary
    """
    try:
        # Access database via dependency injection
        results = await ctx.deps.db.execute(query, limit=limit)
        return {"success": True, "data": results, "count": len(results)}
    except Exception as e:
        # Ask model to retry with different approach
        raise ModelRetry(
            f"Query failed: {str(e)}. Try a simpler query or different approach."
        )


@analysis_agent.tool
async def calculate_statistics(data: list[float]) -> dict:
    """
    Calculate statistical measures for numerical data.

    Args:
        data: List of numerical values

    Returns:
        Dictionary with mean, median, std dev, etc.
    """
    if not data:
        raise ModelRetry("No data provided. Request data first using query_data.")

    import statistics

    return {
        "mean": statistics.mean(data),
        "median": statistics.median(data),
        "stdev": statistics.stdev(data) if len(data) > 1 else 0,
        "min": min(data),
        "max": max(data),
        "count": len(data),
    }


# Usage example
async def example_usage():
    """Example of how to use the analysis agent."""
    from ..base import AgentContext

    # Create context with dependencies
    ctx = AgentContext(
        db=...,  # Your database connection
        user_id="user-123",
        session_id="session-456",
    )

    # Run agent
    result = await analysis_agent.run(
        "Analyze sales trends for Q4 2025",
        deps=ctx
    )

    # Access structured output
    print(f"Summary: {result.output.summary}")
    print(f"Insights: {result.output.insights}")
    print(f"Confidence: {result.output.confidence}")

    # Access usage/cost information
    print(f"Tokens used: {result.usage()}")
```

## Error Handling

**File**: `<agents-directory>/retries.py`

```python
"""Retry configuration for HTTP requests to LLM providers."""
import httpx
from pydantic_ai.retries import AsyncTenacityTransport


def create_http_client() -> httpx.AsyncClient:
    """
    Create HTTP client with retry logic for transient failures.

    Retries on:
    - 429 (rate limit)
    - 502, 503, 504 (temporary server errors)

    Returns:
        Configured async HTTP client
    """
    transport = AsyncTenacityTransport(
        retry_on_status={429, 502, 503, 504},
        max_attempts=3,
    )

    return httpx.AsyncClient(
        transport=transport,
        timeout=60.0,  # 60 second timeout
    )


# Environment configuration
# Set these for production:
# - HTTP_TIMEOUT: Request timeout in seconds (default: 60)
# - MAX_RETRY_ATTEMPTS: Maximum retry attempts (default: 3)
```

**Update config.py to use retry client**:

```python
# Add to config.py
from .retries import create_http_client

# Use in agent initialization if needed
# agent = Agent(model, http_client=create_http_client())
```

## FastAPI Integration

**File**: `<backend-directory>/routers/agents.py`

```python
"""FastAPI endpoints for PydanticAI agents."""
from fastapi import APIRouter, Request, Depends
from fastapi.responses import StreamingResponse

from pydantic_ai.ui import UIAdapter
from agents.examples.analysis_agent import analysis_agent
from agents.base import AgentContext

router = APIRouter(prefix="/agents", tags=["agents"])


async def get_agent_context(
    # Add your auth/dependency logic here
    user_id: str | None = None,
) -> AgentContext:
    """Build agent context from request."""
    return AgentContext(
        db=...,  # Your database connection
        user_id=user_id,
        session_id=...,  # Generate or get from session
    )


@router.post("/analysis/stream")
async def stream_analysis(
    request: Request,
    ctx: AgentContext = Depends(get_agent_context),
):
    """
    Stream analysis results via Server-Sent Events.

    The request body should conform to the UI protocol format.
    """
    # Create adapter from request
    adapter = await UIAdapter.from_request(request)

    # Run agent and get event stream
    stream = adapter.run_stream(analysis_agent, deps=ctx)

    # Encode stream as SSE and return
    return StreamingResponse(
        adapter.encode_stream(stream),
        media_type="text/event-stream",
    )


@router.post("/analysis")
async def run_analysis(
    prompt: str,
    ctx: AgentContext = Depends(get_agent_context),
):
    """
    Run analysis synchronously (non-streaming).

    Use streaming endpoint for better UX in production.
    """
    result = await analysis_agent.run(prompt, deps=ctx)

    return {
        "output": result.output.model_dump(),
        "usage": result.usage(),
    }
```

**Register router in main FastAPI app**:

```python
# In main.py or app.py
from .routers import agents

app.include_router(agents.router)
```

## Testing Infrastructure

### Pytest Configuration and Fixtures

**File**: `<agents-directory>/tests/conftest.py`

```python
"""Pytest configuration and fixtures for agent testing."""
import pytest
from pydantic_ai.models.test import TestModel

from ..base import AgentContext


@pytest.fixture
def test_model():
    """Provide TestModel for unit tests."""
    return TestModel()


@pytest.fixture
def mock_agent_context():
    """Provide mock agent context for testing."""

    class MockDB:
        async def execute(self, query: str, limit: int = 100):
            # Return mock data
            return [{"id": 1, "value": 100}, {"id": 2, "value": 200}]

    return AgentContext(
        db=MockDB(),
        user_id="test-user",
        session_id="test-session",
    )


@pytest.fixture(autouse=True)
def prevent_real_model_calls(monkeypatch):
    """Prevent accidental calls to real LLM APIs in tests."""
    monkeypatch.setenv("ALLOW_MODEL_REQUESTS", "False")
```

### Agent Test Suite

**File**: `<agents-directory>/tests/test_analysis_agent.py`

```python
"""Tests for analysis agent."""
import pytest
from inline_snapshot import snapshot

from ..examples.analysis_agent import analysis_agent, AnalysisOutput


@pytest.mark.asyncio
async def test_analysis_agent_with_mock(test_model, mock_agent_context):
    """Test agent with TestModel (no real LLM calls)."""
    # Override agent's model with test model
    with analysis_agent.override(model=test_model):
        result = await analysis_agent.run(
            "Analyze Q4 sales data",
            deps=mock_agent_context
        )

        # Verify output structure
        assert isinstance(result.output, AnalysisOutput)
        assert result.output.confidence >= 0
        assert result.output.confidence <= 1
        assert len(result.output.insights) > 0


@pytest.mark.asyncio
async def test_agent_tools_called(test_model, mock_agent_context):
    """Verify agent calls tools during execution."""
    # TestModel calls all tools by default
    with analysis_agent.override(model=test_model):
        result = await analysis_agent.run(
            "Get data and calculate statistics",
            deps=mock_agent_context
        )

        # Verify tools were called by checking result
        assert result.all_messages()  # Should include tool calls


@pytest.mark.asyncio
async def test_structured_output_validation(test_model, mock_agent_context):
    """Test that output matches expected structure."""
    custom_model = TestModel(
        custom_result_args={
            "summary": "Sales increased 25% in Q4",
            "insights": ["Strong holiday season", "New product launch"],
            "recommendations": ["Increase inventory", "Expand marketing"],
            "confidence": 0.85,
        }
    )

    with analysis_agent.override(model=custom_model):
        result = await analysis_agent.run(
            "Analyze trends",
            deps=mock_agent_context
        )

        # Use inline_snapshot for assertion
        assert result.output.model_dump() == snapshot({
            "summary": "Sales increased 25% in Q4",
            "insights": ["Strong holiday season", "New product launch"],
            "recommendations": ["Increase inventory", "Expand marketing"],
            "confidence": 0.85,
            "metadata": None,
        })


# Integration test (requires real model - skip in CI/CD)
@pytest.mark.integration
@pytest.mark.asyncio
async def test_agent_with_real_model(mock_agent_context, monkeypatch):
    """Integration test with actual LLM (skipped by default)."""
    monkeypatch.setenv("ALLOW_MODEL_REQUESTS", "True")

    # This will make actual API calls - use sparingly
    result = await analysis_agent.run(
        "Provide a brief analysis of test data",
        deps=mock_agent_context
    )

    assert isinstance(result.output, AnalysisOutput)
    assert result.output.confidence > 0
```

### Pytest Configuration

**File**: `pytest.ini` (in project root)

```ini
[pytest]
asyncio_mode = auto
markers =
    integration: Integration tests that call real LLM APIs (deselect with '-m "not integration"')

# Don't run integration tests by default
addopts = -m "not integration"
```

## Environment Configuration

**File**: `.env.example`

```bash
# LLM Provider Configuration
LLM_PROVIDER=bedrock  # bedrock|anthropic|openai|google

# AWS Bedrock (if using)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0

# Anthropic (if using)
ANTHROPIC_API_KEY=your-api-key

# OpenAI (if using)
OPENAI_API_KEY=your-api-key

# Google Gemini (if using)
GOOGLE_API_KEY=your-api-key

# Observability: Langfuse
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_HOST=https://cloud.langfuse.com  # or your self-hosted URL

# Observability: Pydantic Logfire (alternative)
# LOGFIRE_TOKEN=your-logfire-token

# Service Configuration
SERVICE_NAME=my-pydantic-ai-service

# HTTP Client Configuration
HTTP_TIMEOUT=60
MAX_RETRY_ATTEMPTS=3

# Testing
ALLOW_MODEL_REQUESTS=False  # Set to True only for integration tests
```

**Update .gitignore**:

```gitignore
# Add if not already present
.env
.env.local
```

## Documentation Template

**File**: `<agents-directory>/README.md`

```markdown
# PydanticAI Agents

Production-ready AI agents built with PydanticAI.

## Features

- ✓ Type-safe agent development with full IDE support
- ✓ Dependency injection via RunContext
- ✓ Structured output validation with Pydantic models
- ✓ OpenTelemetry observability (Langfuse integration)
- ✓ Automatic retry logic for transient failures
- ✓ FastAPI streaming endpoints via Server-Sent Events
- ✓ Comprehensive testing with TestModel

## Setup

1. **Install dependencies**:
   \`\`\`bash
   uv sync
   \`\`\`

2. **Configure environment**:
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your credentials
   \`\`\`

3. **Run tests**:
   \`\`\`bash
   uv run pytest
   \`\`\`

4. **Run integration tests** (makes real API calls):
   \`\`\`bash
   uv run pytest -m integration
   \`\`\`

## Project Structure

\`\`\`
agents/
├── base.py                 # Base context and output models
├── config.py              # Model configuration
├── observability.py       # Langfuse/Logfire setup
├── retries.py            # HTTP retry logic
├── examples/
│   └── analysis_agent.py # Example agent
└── tests/
    ├── conftest.py       # Pytest fixtures
    └── test_*.py         # Test files
\`\`\`

## Creating a New Agent

\`\`\`python
from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext
from .base import AgentContext, BaseAgentOutput
from .config import get_model_name

# Define output structure
class MyOutput(BaseAgentOutput):
    result: str = Field(description="Agent result")

# Create agent
my_agent = Agent(
    get_model_name(),
    deps_type=AgentContext,
    output_type=MyOutput,
    instructions="Your agent instructions here",
)

# Add tools
@my_agent.tool
async def my_tool(ctx: RunContext[AgentContext], param: str) -> str:
    """Tool description for LLM."""
    # Access dependencies via ctx.deps
    return await ctx.deps.db.query(param)

# Use agent
async def main():
    ctx = AgentContext(db=..., user_id="...")
    result = await my_agent.run("Your prompt", deps=ctx)
    print(result.output.result)
\`\`\`

## Testing

Use \`TestModel\` for unit tests (no real API calls):

\`\`\`python
from pydantic_ai.models.test import TestModel

async def test_my_agent(test_model, mock_agent_context):
    with my_agent.override(model=test_model):
        result = await my_agent.run("test prompt", deps=mock_agent_context)
        assert result.output is not None
\`\`\`

## Observability

All agent runs are automatically traced to Langfuse/Logfire. View:
- Individual traces per request
- Cost tracking across sessions
- Performance metrics (latency, token usage)
- Error rates and validation failures

Access dashboard at configured LANGFUSE_HOST or Logfire console.

## Environment Variables

See \`.env.example\` for all required configuration.

## Best Practices

1. **Always use type hints** - PydanticAI's power comes from type safety
2. **Use dependency injection** - Never use global state, pass via RunContext
3. **Test with TestModel** - Never use real LLMs in unit tests
4. **Set ALLOW_MODEL_REQUESTS=False** - Prevent accidental API calls in tests
5. **Stream when possible** - Better UX with FastAPI streaming endpoints
6. **Monitor via Langfuse** - Track costs, performance, and errors

## References

- [PydanticAI Documentation](https://ai.pydantic.dev/)
```

## CLAUDE.md Update

Add this section to your project's CLAUDE.md:

```markdown
## PydanticAI Agents

### Structure
- Agent code: `<agents-directory>/`
- Base infrastructure: `base.py`, `config.py`, `observability.py`
- Example agents: `examples/`
- Tests: `tests/`

### Development Commands
- Run tests: `cd <agents-directory> && uv run pytest`
- Integration tests: `uv run pytest -m integration`

### Best Practices
- Use dependency injection via RunContext (never global state)
- Always type hint agents: `Agent[DepsType, OutputType]`
- Test with TestModel (no real LLM calls in unit tests)
- Set ALLOW_MODEL_REQUESTS=False in test environments
- Use FastAPI streaming endpoints for better UX
- Monitor all runs via Langfuse/Logfire

### Creating New Agents
1. Define Pydantic model for structured output
2. Create Agent with deps_type and output_type
3. Add tools with @agent.tool decorator
4. Write tests using TestModel
5. Integrate with FastAPI if needed

See `<agents-directory>/README.md` for detailed examples.
```
