# PydanticAI Setup Reference

Quick reference for best practices, common issues, validation criteria, and framework comparisons.

## Table of Contents

1. [Best Practices](#best-practices)
2. [Common Issues & Solutions](#common-issues--solutions)
3. [Validation Criteria](#validation-criteria)
4. [Framework Comparison](#framework-comparison)
5. [When to Use Hybrid Approaches](#when-to-use-hybrid-approaches)
6. [Migration Considerations](#migration-considerations)

## Best Practices

### Type Safety is Everything

**Always use type hints**:
```python
# Good
async def my_tool(ctx: RunContext[AgentContext], param: str) -> dict:
    ...

# Bad - loses type safety benefits
async def my_tool(ctx, param):
    ...
```

**Reason**: PydanticAI's power comes from compile-time type checking. Without type hints, you lose IDE autocomplete, validation, and error detection.

### Dependency Injection Over Global State

**Never use global variables**:
```python
# Bad
DATABASE = connect_to_db()

@agent.tool
async def query_data(query: str):
    return DATABASE.execute(query)  # Hard to test

# Good
@agent.tool
async def query_data(ctx: RunContext[AgentContext], query: str):
    return await ctx.deps.db.execute(query)  # Testable via mock context
```

**Reason**: Dependency injection via `RunContext` enables testing, isolation, and scalability.

### Test with TestModel, Not Real LLMs

**Unit tests should NEVER call real APIs**:
```python
# Good
async def test_agent(test_model, mock_agent_context):
    with agent.override(model=test_model):
        result = await agent.run("test", deps=mock_agent_context)
        assert result.output is not None

# Bad - slow, costly, flaky
async def test_agent(mock_agent_context):
    result = await agent.run("test", deps=mock_agent_context)  # Real API call!
    assert result.output is not None
```

**Reason**: Real API calls are slow (seconds), cost money, can fail due to rate limits, and make tests non-deterministic.

### Structured Outputs with Pydantic

**Always define output structure**:
```python
# Good
class AnalysisOutput(BaseModel):
    summary: str = Field(description="Brief summary")
    confidence: float = Field(ge=0, le=1)

agent = Agent(..., output_type=AnalysisOutput)

# Bad - no validation
agent = Agent(..., output_type=str)
```

**Reason**: Structured outputs provide runtime validation, type safety, and clear contracts.

### Descriptive Tool Docstrings

**LLM uses docstrings to decide when to call tools**:
```python
# Good
@agent.tool
async def calculate_metrics(data: list[float]) -> dict:
    """
    Calculate statistical metrics for numerical data.

    Use this when the user asks for statistics, averages, or data analysis.
    """
    ...

# Bad - LLM won't know when to use this
@agent.tool
async def calculate_metrics(data: list[float]) -> dict:
    ...
```

**Reason**: Descriptive docstrings help the LLM choose the right tool at the right time.

### Stream for Better UX

**Use streaming endpoints for interactive applications**:
```python
# Good - user sees progress
@router.post("/analysis/stream")
async def stream_analysis(request: Request, ctx: AgentContext):
    adapter = await UIAdapter.from_request(request)
    stream = adapter.run_stream(agent, deps=ctx)
    return StreamingResponse(adapter.encode_stream(stream))

# Acceptable for background processing
@router.post("/analysis")
async def run_analysis(prompt: str, ctx: AgentContext):
    result = await agent.run(prompt, deps=ctx)
    return result.output
```

**Reason**: Streaming provides real-time feedback, reducing perceived latency for users.

### Monitor All Runs

**Always configure observability**:
```python
# At application startup
import logfire
logfire.configure()
logfire.instrument_pydantic_ai()
```

**Reason**: Production issues are impossible to debug without traces. Langfuse/Logfire track costs, performance, and errors automatically.

### Prevent Test API Calls

**Use autouse fixture**:
```python
@pytest.fixture(autouse=True)
def prevent_real_model_calls(monkeypatch):
    """Prevent accidental calls to real LLM APIs in tests."""
    monkeypatch.setenv("ALLOW_MODEL_REQUESTS", "False")
```

**Reason**: Prevents accidental expensive API calls during test runs.

## Common Issues & Solutions

### Issue: Import errors for pydantic_ai

**Symptoms**:
```
ModuleNotFoundError: No module named 'pydantic_ai'
```

**Solution**:
```bash
# Ensure uv sync ran successfully
uv sync

# Check pyproject.toml has pydantic-ai
cat pyproject.toml | grep pydantic-ai

# If missing, add it
uv add pydantic-ai
```

### Issue: ALLOW_MODEL_REQUESTS error in tests

**Symptoms**:
```
Error: Real model requests are not allowed in tests
```

**Solution**:
```python
# In conftest.py - ensure this fixture exists
@pytest.fixture(autouse=True)
def prevent_real_model_calls(monkeypatch):
    monkeypatch.setenv("ALLOW_MODEL_REQUESTS", "False")

# Or for integration tests, set explicitly
@pytest.mark.integration
async def test_with_real_model(monkeypatch):
    monkeypatch.setenv("ALLOW_MODEL_REQUESTS", "True")
    # Test code here
```

### Issue: Langfuse connection failed

**Symptoms**:
```
ValueError: Langfuse credentials not found
```

**Solution**:
```bash
# Verify environment variables are set
echo $LANGFUSE_PUBLIC_KEY
echo $LANGFUSE_SECRET_KEY

# If missing, add to .env
cat >> .env <<EOF
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
EOF

# Reload environment
source .env
```

### Issue: Agent validation failures

**Symptoms**:
```
pydantic.ValidationError: Output does not match expected structure
```

**Solution**:
```python
# Ensure output_type matches what LLM actually returns
class MyOutput(BaseModel):
    # Add optional fields if LLM might omit them
    result: str
    confidence: float | None = None  # Optional

# Or use Field with default
class MyOutput(BaseModel):
    result: str
    confidence: float = Field(default=0.5)
```

### Issue: Tool not being called

**Symptoms**:
- Agent returns text response instead of using tool
- Tool exists but never executes

**Solution**:
```python
# Ensure tool has descriptive docstring
@agent.tool
async def my_tool(param: str) -> str:
    """
    DETAILED description of what this tool does.

    When to use: Describe scenarios when LLM should call this.
    """
    ...

# Make instructions more explicit
agent = Agent(
    model,
    instructions=(
        "You have access to tools. Use them when appropriate. "
        "Call my_tool when you need to [describe when]."
    )
)
```

### Issue: Tests failing with real API calls

**Symptoms**:
- Tests take seconds to run
- "Rate limit exceeded" errors
- Unexpected API costs

**Solution**:
```python
# Use TestModel override
async def test_agent(test_model, mock_agent_context):
    with agent.override(model=test_model):  # ← This is critical
        result = await agent.run("test", deps=mock_agent_context)
        # Now using fake model, no real API calls
```

### Issue: Type errors with RunContext

**Symptoms**:
```
Type error: incompatible type "RunContext[AgentContext]"
```

**Solution**:
```python
# Ensure proper type hints
from pydantic_ai import RunContext
from .base import AgentContext

@agent.tool
async def my_tool(
    ctx: RunContext[AgentContext],  # Specify context type
    param: str
) -> dict:
    # Now ctx.deps has correct type
    result = await ctx.deps.db.execute(...)
```

## Validation Criteria

Setup is complete when all of these are verified:

### Installation
- [ ] PydanticAI installed with appropriate extras
- [ ] Provider-specific packages installed (bedrock, anthropic, openai, or google)
- [ ] Testing dependencies installed (inline-snapshot, dirty-equals, pytest-asyncio)
- [ ] Imports work: `uv run python -c "from pydantic_ai import Agent"`

### Observability
- [ ] Observability configured (Langfuse or Logfire)
- [ ] logfire successfully imports and configures
- [ ] Environment variables set (LANGFUSE_* or LOGFIRE_TOKEN)
- [ ] `configure_observability()` runs without errors

### Base Infrastructure
- [ ] base.py created with AgentContext and BaseAgentOutput
- [ ] config.py created with get_model_name() function
- [ ] observability.py configured with chosen platform
- [ ] retries.py created with AsyncTenacityTransport

### Example Agent
- [ ] Example agent created with tools and structured output
- [ ] Dependency injection working via RunContext
- [ ] Tools have descriptive docstrings
- [ ] Output model extends BaseAgentOutput

### FastAPI Integration (if applicable)
- [ ] Router created in backend/routers/agents.py
- [ ] Streaming endpoint configured with UIAdapter
- [ ] Synchronous endpoint available
- [ ] Router registered in main app

### Testing
- [ ] conftest.py created with fixtures
- [ ] test_model fixture provides TestModel
- [ ] mock_agent_context fixture provides test context
- [ ] prevent_real_model_calls fixture (autouse=True)
- [ ] At least one unit test with TestModel override
- [ ] pytest.ini configured with integration markers
- [ ] Tests pass: `uv run pytest -v`
- [ ] No real API calls in unit tests

### Documentation
- [ ] .env.example created with all variables
- [ ] .gitignore updated to exclude .env files
- [ ] README.md created with setup and usage examples
- [ ] CLAUDE.md updated with PydanticAI patterns

### Validation Commands
```bash
# All should succeed
uv run pytest -v
uv run python -c "from pydantic_ai import Agent; print('✓')"
uv run python -c "import logfire; print('✓')"
uv run python -c "from agents.observability import configure_observability; configure_observability()"
```

## Framework Comparison

### PydanticAI vs LangChain

| Feature | PydanticAI | LangChain |
|---------|------------|-----------|
| **Type Safety** | ⭐⭐⭐⭐⭐ Compile-time | ⭐⭐ Runtime only |
| **Structured Output** | ⭐⭐⭐⭐⭐ Native Pydantic | ⭐⭐⭐ Via parsers |
| **Setup Speed** | ⭐⭐⭐⭐ Fast | ⭐⭐⭐⭐⭐ Very fast |
| **Dependency Injection** | ⭐⭐⭐⭐⭐ Built-in | ⭐ Manual |
| **Testing** | ⭐⭐⭐⭐⭐ TestModel | ⭐⭐⭐ FakeListLLM |
| **State Management** | ⭐⭐ Basic | ⭐ None |
| **Community/Docs** | ⭐⭐⭐ Growing | ⭐⭐⭐⭐⭐ Mature |
| **Best For** | Type-safe validation | Rapid prototyping |

### PydanticAI vs LangGraph

| Feature | PydanticAI | LangGraph |
|---------|------------|-----------|
| **Type Safety** | ⭐⭐⭐⭐⭐ Compile-time | ⭐⭐ Runtime |
| **State Management** | ⭐⭐ Basic | ⭐⭐⭐⭐⭐ Advanced |
| **Complex Workflows** | ⭐⭐ Limited | ⭐⭐⭐⭐⭐ Graph-based |
| **Multi-Agent** | ⭐⭐⭐ Via composition | ⭐⭐⭐⭐⭐ Native |
| **Persistence** | ⭐⭐ Manual | ⭐⭐⭐⭐⭐ PostgreSQL |
| **Testing** | ⭐⭐⭐⭐⭐ TestModel | ⭐⭐⭐ Mock state |
| **Best For** | Type-safe single agents | Complex state machines |

**Decision Matrix**:
- **Need type safety + simple agent** → PydanticAI
- **Need complex workflows + state** → LangGraph
- **Need both** → Use hybrid (PydanticAI agents + LangGraph orchestration)

### PydanticAI vs CrewAI

| Feature | PydanticAI | CrewAI |
|---------|------------|--------|
| **Type Safety** | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Multi-Agent** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Team Abstraction** | ⭐⭐ Manual | ⭐⭐⭐⭐⭐ Built-in |
| **Flexibility** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Setup Speed** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Best For** | Type-safe validation | Team collaboration |

## When to Use Hybrid Approaches

### PydanticAI + LangGraph

**Use case**: Complex workflows requiring both type safety and state management.

**Architecture**:
```python
# Use PydanticAI for individual agents
analysis_agent = Agent(
    model,
    deps_type=AgentContext,
    output_type=AnalysisOutput,
)

# Use LangGraph for orchestration
from langgraph.graph import StateGraph

class State(TypedDict):
    analysis: AnalysisOutput  # PydanticAI output
    messages: list[dict]

def analysis_node(state: State) -> dict:
    # Run PydanticAI agent
    result = await analysis_agent.run(
        state["messages"][-1]["content"],
        deps=context
    )
    return {"analysis": result.output}

graph = StateGraph(State)
graph.add_node("analyze", analysis_node)
# Add more nodes for workflow...
```

**Benefits**:
- Type-safe agents (PydanticAI)
- Complex orchestration (LangGraph)
- State persistence (LangGraph)
- Structured outputs (PydanticAI)

### PydanticAI + LlamaIndex

**Use case**: Type-safe RAG with advanced document retrieval.

**Architecture**:
```python
# LlamaIndex for RAG
from llama_index import VectorStoreIndex

index = VectorStoreIndex.from_documents(documents)
retriever = index.as_retriever(similarity_top_k=3)

# PydanticAI agent with retrieval tool
@rag_agent.tool
async def retrieve_docs(ctx: RunContext[AgentContext], query: str) -> list[str]:
    """Retrieve relevant documents for the query."""
    results = await retriever.aretrieve(query)
    return [node.text for node in results]
```

**Benefits**:
- Fast retrieval (LlamaIndex)
- Type-safe agent logic (PydanticAI)
- Structured RAG outputs (PydanticAI)

## Migration Considerations

### From LangChain to PydanticAI

**Timeline**: Medium (2-4 days for simple agents)

**Steps**:
1. **Map chains to agents**: Convert LangChain chains to PydanticAI agents
2. **Add output types**: Define Pydantic models for structured outputs
3. **Implement dependency injection**: Replace global state with AgentContext
4. **Update tests**: Convert to TestModel-based tests
5. **Configure observability**: Set up Langfuse/Logfire

**Example migration**:
```python
# Before (LangChain)
chain = prompt | llm | StrOutputParser()
result = chain.invoke({"question": "..."})

# After (PydanticAI)
class Output(BaseModel):
    answer: str

agent = Agent(model, output_type=Output)
result = await agent.run("...")
```

### From LangGraph to PydanticAI

**Only migrate if**:
- Complex state management not needed
- Workflow is simple and linear
- Type safety is more important than orchestration

**Warning**: Migrating from LangGraph usually means losing state persistence and complex workflows. Only do this if those features aren't needed.

### Adding PydanticAI to Existing Project

**Best approach**: Incremental adoption
1. Start with new agents in PydanticAI
2. Keep existing LangChain/LangGraph code
3. Gradually migrate as you add features
4. Use hybrid architecture during transition

## Additional Resources

- [PydanticAI Documentation](https://ai.pydantic.dev/)
- [Pydantic Logfire](https://pydantic.dev/logfire)
- [Langfuse OpenTelemetry Integration](https://langfuse.com/docs/integrations/opentelemetry)
- [TestModel Documentation](https://ai.pydantic.dev/testing/)
