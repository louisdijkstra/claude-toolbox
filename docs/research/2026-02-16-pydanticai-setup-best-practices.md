# Research: PydanticAI Setup and Industry Standards

## Context
- Project: Project - AI-powered analytics and document processing platform
- Scale: Production-ready AI agent framework
- Constraints: Python 3.13+, AWS Bedrock integration, existing FastAPI backend
- Current Stack: LlamaIndex with AWS Bedrock, FastAPI, Langfuse tracing

## Research Question
How should I set up PydanticAI for production LLM applications in 2026, including best practices for integration, error handling, observability, testing, and deployment, considering our existing Project infrastructure with FastAPI, AWS Bedrock, and Langfuse?

## Industry Standards (2026)

1. **Type-Safe Agent Development**: PydanticAI leads the industry in bringing FastAPI-style developer experience to AI agents with full type safety and IDE support
2. **Model-Agnostic Architecture**: Support for all major LLM providers (OpenAI, Anthropic, Bedrock, Gemini, etc.) without vendor lock-in
3. **Production-Grade Features**: Durable execution, structured outputs with validation, streaming responses, and human-in-the-loop workflows
4. **OpenTelemetry-First Observability**: Native support for OpenTelemetry alongside Pydantic Logfire, enabling integration with any observability platform including Langfuse
5. **Dependency Injection Patterns**: Type-safe dependency injection through RunContext for testable, maintainable code
6. **API Stability Commitment**: V1 guarantees no breaking changes for 6+ months, security fixes for 12+ months total

## Options Evaluated

### Option 1: PydanticAI (Recommended)

**Description**: Modern agent framework built by the Pydantic team, designed to bring FastAPI developer experience to GenAI applications.

**Pros**:
- **Type Safety**: Full static type checking catches errors at write-time, not runtime
- **FastAPI Integration**: Natural integration with existing FastAPI backends, shared validation philosophy
- **Observability Flexibility**: Native OpenTelemetry support works with Langfuse (our existing tool) or Pydantic Logfire
- **Model Provider Compatibility**: Direct AWS Bedrock support alongside 20+ other providers
- **Structured Outputs**: Automatic validation and retry on validation failures using Pydantic models
- **Dependency Injection**: Type-safe RunContext system makes testing and production deployment straightforward
- **Production Features**: Durable execution, streaming, human-in-the-loop, graph support out of the box
- **Active Development**: Latest release v1.59.0 (current), rapidly evolving with production focus
- **API Stability**: V1 commitment means safe for production use

**Cons**:
- Newer framework (v1.0 released recently) compared to LangChain/LlamaIndex
- Smaller ecosystem of third-party tools and integrations
- Less community content (tutorials, Stack Overflow answers)
- May require learning new patterns if coming from LangChain/LlamaIndex

**Scale Fit**: Excellent for production applications requiring reliability, type safety, and maintainability. Scales from simple agents to complex multi-agent systems.

**Sources**:
- [Pydantic AI Official Docs](https://ai.pydantic.dev/)
- [PyPI Package](https://pypi.org/project/pydantic-ai/)
- [Pydantic AI v1 Announcement](https://pydantic.dev/articles/pydantic-ai-v1)

### Option 2: LangChain/LangGraph

**Description**: Mature, feature-rich framework with extensive tooling and integrations.

**Pros**:
- Largest ecosystem of integrations (vector stores, evaluators, connectors)
- Extensive community resources and examples
- Proven at scale in production environments
- LangGraph provides stateful orchestration for complex workflows

**Cons**:
- **Legacy Content**: Many different ways to do the same thing creates confusion
- **Less Type Safety**: Weaker type checking compared to PydanticAI
- **Complexity**: More boilerplate code, steeper learning curve
- **Verbosity**: Creating basic agents requires more code than PydanticAI

**Scale Fit**: Good for complex, stateful orchestration workflows where ecosystem tooling is critical.

**Sources**:
- [LangChain vs PydanticAI Comparison](https://medium.com/@finndersen/langchain-vs-pydanticai-for-building-an-ai-agent-e0a059435e9d)
- [AI Agent Frameworks Comparison](https://softcery.com/lab/top-14-ai-agent-frameworks-of-2025-a-founders-guide-to-building-smarter-systems)

### Option 3: LlamaIndex

**Description**: Originally a RAG-focused framework, evolved to include agent capabilities.

**Pros**:
- Excellent for data-heavy retrieval workflows
- Best-in-class tooling for indexing, chunking, and knowledge base integration
- Strong support for local and external data stores

**Cons**:
- Agent functionality is secondary to RAG capabilities
- Less mature agent orchestration compared to PydanticAI/LangChain
- Not optimized for type-safe development

**Scale Fit**: Best when primary use case is retrieval from large document collections rather than agentic workflows.

**Sources**:
- [Understanding PydanticAI as Alternative](https://tech.appunite.com/posts/understanding-pydantic-ai-a-powerful-alternative-to-lang-chain-and-llama-index)

### Option 4: Keep Current LlamaIndex Setup

**Description**: Continue using existing LlamaIndex with AWS Bedrock integration.

**Pros**:
- No migration effort required
- Team already familiar with patterns
- Proven working in current Project stack

**Cons**:
- Missing modern type safety features
- Less ergonomic for agent development
- Observability integration requires more manual setup
- Not aligned with 2026 best practices for agent development

**Scale Fit**: Suitable for maintaining status quo but limits adoption of modern agent patterns.

## Recommended Approach

**Adopt PydanticAI as the primary agent framework for Project**, following this implementation strategy:

### Phase 1: Setup & Integration (Week 1)

1. **Installation**:
   ```bash
   cd libs/agents
   uv add pydantic-ai
   uv add pydantic-ai-slim[bedrock,logfire]  # AWS Bedrock + observability
   ```

2. **Configure Observability with Langfuse**:
   ```python
   import logfire
   from opentelemetry.sdk.trace.export import BatchSpanProcessor
   from langfuse.opentelemetry import LangfuseSpanExporter

   # Configure OpenTelemetry to send to Langfuse
   logfire.configure(
       processors=[
           BatchSpanProcessor(LangfuseSpanExporter())
       ]
   )
   logfire.instrument_pydantic_ai()
   ```

3. **Create Base Agent Structure**:
   ```python
   from dataclasses import dataclass
   from pydantic_ai import Agent, RunContext
   from pydantic import BaseModel

   @dataclass
   class AppContext:
       """Dependency injection context for Project agents"""
       db: DatabaseConn
       user_id: str
       session_id: str

   class AnalysisOutput(BaseModel):
       """Structured output with validation"""
       insights: list[str]
       confidence: float
       next_steps: list[str]

   analytics_agent = Agent(
       'bedrock:anthropic.claude-3-5-sonnet-20241022-v2:0',
       deps_type=AppContext,
       output_type=AnalysisOutput,
       instructions="You are an analytics agent for Project..."
   )
   ```

4. **Integrate with FastAPI**:
   ```python
   from fastapi import FastAPI
   from fastapi.responses import StreamingResponse
   from pydantic_ai.ui import UIAdapter

   app = FastAPI()

   @app.post("/agent/stream")
   async def stream_agent(request: Request):
       adapter = await UIAdapter.from_request(request)
       ctx = AppContext(db=db_conn, user_id=user.id, ...)
       stream = adapter.run_stream(analytics_agent, deps=ctx)
       return StreamingResponse(
           adapter.encode_stream(stream),
           media_type="text/event-stream"
       )
   ```

### Phase 2: Testing Setup

1. **Use TestModel for Unit Tests**:
   ```python
   import pytest
   from pydantic_ai.models.test import TestModel

   @pytest.fixture
   def test_model():
       return TestModel()

   async def test_analytics_agent(test_model):
       with analytics_agent.override(model=test_model):
           ctx = AppContext(db=mock_db, user_id="test")
           result = await analytics_agent.run("Analyze Q4 revenue", deps=ctx)
           assert isinstance(result.output, AnalysisOutput)
   ```

2. **Set Environment Variable**:
   ```bash
   export ALLOW_MODEL_REQUESTS=False  # Prevent accidental real LLM calls in tests
   ```

3. **Use inline-snapshot for Assertions**:
   ```bash
   uv add --dev inline-snapshot dirty-equals
   ```

### Phase 3: Error Handling & Retries

1. **Configure HTTP Retries**:
   ```python
   from pydantic_ai.retries import AsyncTenacityTransport
   import httpx

   # Retry on rate limits and transient failures
   transport = AsyncTenacityTransport(
       retry_on_status={429, 502, 503, 504},
       max_attempts=3
   )
   client = httpx.AsyncClient(transport=transport)
   ```

2. **Tool-Level Retries**:
   ```python
   from pydantic_ai import ModelRetry

   @analytics_agent.tool
   async def query_database(ctx: RunContext[AppContext], sql: str) -> str:
       try:
           return await ctx.deps.db.execute(sql)
       except TransientError as e:
           # Ask model to retry with different approach
           raise ModelRetry(f"Query failed: {e}. Try simpler query.")
   ```

### Phase 4: Production Deployment

1. **Enable Durable Execution** (for long-running workflows):
   ```bash
   uv add pydantic-ai-slim[temporal]  # or [dbos] or [prefect]
   ```

2. **Add Monitoring**:
   - Use Langfuse dashboards for cost tracking
   - Monitor retry rates and failures
   - Set up alerts for validation errors

3. **Deploy with FastAPI**:
   - Use existing Project FastAPI backend structure
   - Deploy to AWS with existing infrastructure
   - Serverless option: Vercel/AWS Lambda for simplified devops

### Migration Strategy from LlamaIndex

1. **Start with New Features**: Build new agent functionality using PydanticAI
2. **Gradual Migration**: Port existing agents one at a time during refactoring
3. **Parallel Running**: Run both frameworks during transition period
4. **Shared Infrastructure**: Use same Langfuse, AWS Bedrock, FastAPI stack

## Anti-Patterns to Avoid

- ❌ **Skipping Type Hints**: PydanticAI's power comes from type safety—use type hints everywhere
- ❌ **Using Pydantic Logfire Exclusively**: Leverage OpenTelemetry for flexibility (we already use Langfuse)
- ❌ **Bypassing Dependency Injection**: Don't use global state—use RunContext for testability
- ❌ **Ignoring Validation Failures**: Let PydanticAI retry on validation errors—don't catch and suppress
- ❌ **Manual Streaming Implementation**: Use UIAdapter instead of rolling your own SSE streaming
- ❌ **Testing with Real LLMs**: Always use TestModel/FunctionModel in tests to avoid flaky tests and costs
- ❌ **Not Setting ALLOW_MODEL_REQUESTS=False**: Prevent accidental production API calls in test environments
- ❌ **Over-Engineering Retries**: Use built-in retry mechanisms—don't implement custom retry logic
- ❌ **Mixing Multiple Frameworks**: Avoid combining PydanticAI + LangChain + LlamaIndex—pick one primary framework
- ❌ **Ignoring Rate Limits**: Always configure retry strategies for 429 errors

## Testing Strategy

### Unit Tests
```python
# Test with mock model responses
from pydantic_ai.models.test import TestModel

async def test_agent_with_mock():
    model = TestModel(
        custom_result_text="Revenue increased 25% due to new product launch"
    )
    with agent.override(model=model):
        result = await agent.run("Analyze Q4 revenue", deps=test_ctx)
        assert result.output.confidence > 0.7
```

### Integration Tests
```python
# Test with real model but controlled inputs
async def test_agent_integration():
    # Use actual Bedrock model but with test data
    result = await agent.run("Analyze test dataset", deps=integration_ctx)
    assert isinstance(result.output, AnalysisOutput)
```

### Evals (AI-Specific Testing)
```python
from pydantic_ai import evaluate

# Test agent behavior over multiple runs
async def test_agent_evals():
    results = await evaluate(
        agent,
        test_cases=[
            {"input": "Revenue analysis", "expected_type": "financial"},
            {"input": "User churn", "expected_type": "customer"}
        ],
        deps=eval_ctx
    )
    assert results.accuracy > 0.9
```

### Testing Checklist
- Unit tests with TestModel (no real LLM calls)
- Integration tests with real models on test data
- Evals for probabilistic behavior validation
- Pytest fixtures for reusable test setup
- inline-snapshot for long assertions
- ALLOW_MODEL_REQUESTS=False in CI/CD

## Monitoring & Observability

### Key Metrics to Track

1. **Cost Metrics**:
   - Token usage per request
   - Cost per conversation/session
   - Model calls per feature

2. **Performance Metrics**:
   - Response latency (p50, p95, p99)
   - Time to first token (streaming)
   - Tool call frequency and duration

3. **Quality Metrics**:
   - Validation failure rate
   - Retry count per request
   - Structured output parsing success rate

4. **Reliability Metrics**:
   - Rate limit hits (429 errors)
   - Timeout rate
   - Model availability

### Implementation

```python
# Langfuse automatically captures via OpenTelemetry
logfire.configure(
    processors=[BatchSpanProcessor(LangfuseSpanExporter())]
)
logfire.instrument_pydantic_ai()

# Access metrics in Langfuse dashboard:
# - Traces for individual requests
# - Cost tracking across sessions
# - Performance analytics
# - Error rate monitoring
```

### Alerting Thresholds
- Token cost exceeds $X per day
- Validation failure rate > 5%
- p95 latency > 3 seconds
- Rate limit errors > 10/hour

## Trade-offs Accepted

1. **Smaller Ecosystem vs Type Safety**:
   - Accepting smaller community/tooling ecosystem in exchange for superior type safety and developer experience
   - Mitigated by OpenTelemetry compatibility and model-agnostic design

2. **New Framework vs Proven at Scale**:
   - PydanticAI v1 is newer than LangChain but brings production-grade features
   - Mitigated by Pydantic team's track record and API stability commitment

3. **Learning Curve vs Long-term Maintainability**:
   - Team needs to learn new patterns but gains more maintainable codebase
   - Mitigated by FastAPI-like ergonomics (team already familiar)

4. **Migration Effort vs Technical Debt**:
   - Time investment to migrate from LlamaIndex to PydanticAI
   - Mitigated by gradual migration strategy and improved productivity long-term

## When to Revisit

Consider revisiting this decision if:

1. **Ecosystem Gap**: PydanticAI lacks critical integration that LangChain/LlamaIndex provides (evaluate workarounds first)
2. **API Breaking Changes**: If v2.0 introduces breaking changes before 2026 end (unlikely given stability commitment)
3. **Performance Issues**: If PydanticAI shows performance problems at Project's scale (monitor for 3-6 months)
4. **Team Productivity**: If learning curve significantly impacts velocity after 1-2 months (assess with team)
5. **Observability Problems**: If OpenTelemetry integration with Langfuse proves insufficient (try Pydantic Logfire)
6. **AWS Bedrock Issues**: If Bedrock integration has bugs or limitations (contribute fixes or use OpenAI temporarily)

## References

### Official Documentation
- [Pydantic AI Documentation](https://ai.pydantic.dev/)
- [Pydantic AI v1 Release Announcement](https://pydantic.dev/articles/pydantic-ai-v1)
- [PydanticAI PyPI Package](https://pypi.org/project/pydantic-ai/)

### Integration Guides
- [Langfuse OpenTelemetry Integration](https://langfuse.com/integrations/native/opentelemetry)
- [Langfuse PydanticAI Integration](https://langfuse.com/integrations/frameworks/pydantic-ai)
- [Building API with FastAPI](https://tech.appunite.com/posts/building-an-api-for-your-pydantic-ai-agent-with-fast-api-part-2)
- [Chat App with FastAPI Example](https://ai.pydantic.dev/examples/chat-app/)
- [Streaming with Pydantic AI](https://datastud.dev/posts/pydantic-ai-streaming/)

### Best Practices & Comparisons
- [Building Production-Ready Multi-User AI Agents](https://medium.com/@alexandrdzhumurat/building-production-ready-multi-user-ai-agents-pydantic-ai-e9021daede5f)
- [LangChain vs PydanticAI Comparison](https://medium.com/@finndersen/langchain-vs-pydanticai-for-building-an-ai-agent-e0a059435e9d)
- [Understanding PydanticAI as Alternative to LangChain/LlamaIndex](https://tech.appunite.com/posts/understanding-pydantic-ai-a-powerful-alternative-to-lang-chain-and-llama-index)
- [Top AI Agent Frameworks 2026](https://genta.dev/resources/best-ai-agent-frameworks-2026)
- [AI Agent Frameworks Comparison](https://softcery.com/lab/top-14-ai-agent-frameworks-of-2025-a-founders-guide-to-building-smarter-systems)

### Testing & Error Handling
- [PydanticAI Testing Documentation](https://ai.pydantic.dev/testing/)
- [Retry Strategies](https://ai.pydantic.dev/evals/how-to/retry-strategies/)
- [HTTP Request Retries](https://ai.pydantic.dev/retries/)
- [PydanticAI Testing Guide](https://medium.com/@rajgpt630/pydanticai-just-made-ai-testing-dead-simple-heres-how-it-works-7cfc1205b787)
- [Better Python Tests with inline-snapshot](https://pydantic.dev/articles/inline-snapshot)

### Advanced Topics
- [Dependency Injection Documentation](https://ai.pydantic.dev/dependencies/)
- [Mastering Dependency Injection](https://medium.com/@nninad/mastering-pydanticai-enhancing-ai-agents-with-dependency-injection-day-2-a11f8aa18f49)
- [Durable Execution Overview](https://ai.pydantic.dev/durable_execution/overview/)
- [UI Overview (Streaming Events)](https://ai.pydantic.dev/ui/overview/)
