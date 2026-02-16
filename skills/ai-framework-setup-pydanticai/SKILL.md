---
name: setting-up-pydanticai
description: Set up PydanticAI for production-grade AI agents with type safety, observability, error handling, and testing. Includes FastAPI integration and comprehensive testing infrastructure.
---

# Setting Up PydanticAI

## Purpose
Set up PydanticAI for production-grade AI agent development with type safety, structured output validation, observability, and comprehensive testing. Automatically configures integration with FastAPI, Langfuse/Pydantic Logfire tracing, LLM providers, and testing infrastructure.

## When to Use This Skill

Use this skill when:
- Starting new AI agent development with type safety requirements
- Migrating from LangChain/LlamaIndex to type-safe architecture
- Building agents with structured, validated outputs
- Need FastAPI integration for streaming responses
- Require compile-time type checking for agent code
- Building multi-agent systems with dependency injection
- Production deployment requires validation guarantees

**Do NOT use for:**
- Simple prototypes where type safety isn't critical (use ai-framework-setup-langchain)
- Rapid experimentation without validation needs (use ai-framework-setup-langchain)
- Projects where dynamic typing is preferred (Python's strength, use LangChain)
- Complex state machines with loops/branching (use ai-framework-build-langgraph instead)
- Multi-agent coordination requiring shared state (use ai-framework-build-langgraph)
- Projects already using LangGraph or CrewAI (use framework-specific skills)

**If uncertain:** Use this skill when type safety and structured output validation are critical requirements. PydanticAI excels at single-agent or loosely-coupled multi-agent systems where each agent has clear inputs/outputs validated via Pydantic models. For complex workflows with shared state or orchestration needs, use ai-framework-build-langgraph instead. If completely uncertain about framework choice, invoke ai-framework-select first.

## Prerequisites
- Python 3.10+ installed (3.13+ recommended)
- Project uses `uv` for dependency management
- FastAPI backend exists (if integrating with API)
- Observability platform available (Langfuse recommended, or Pydantic Logfire)
- LLM provider credentials configured (AWS Bedrock, Anthropic, OpenAI, etc.)

## Process

### Step 1: Analyze Project Context

Read project documentation and configuration to understand:
- Existing agent/LLM infrastructure (if any)
- FastAPI backend location and structure
- Current observability setup (Langfuse, Logfire, none)
- LLM provider (AWS Bedrock, Anthropic, OpenAI, etc.)
- Testing framework in use (pytest, etc.)

**Questions to determine**:
1. Where should agent code live? (e.g., `libs/agents`, `src/agents`)
2. Is this a new setup or migration from another framework?
3. Which LLM provider(s) to support?
4. Existing observability platform to integrate with?

### Step 2: Install PydanticAI Dependencies

Install appropriate extras based on project needs.

See EXAMPLES.md → "Installation" for:
- Base installation commands
- Provider-specific extras (bedrock, anthropic, openai, google)
- Observability extras (logfire)
- Testing dependencies (inline-snapshot, dirty-equals, pytest-asyncio)
- Optional durable execution extras (temporal, dbos, prefect)

**Key decision**: Use `pydantic-ai` (full) or `pydantic-ai-slim[extras]` for selective dependencies.

### Step 3: Set Up Observability Integration

Configure observability based on existing platform.

See EXAMPLES.md → "Observability Setup" for:
- **Option A: Langfuse** (via OpenTelemetry) - Complete configuration with logfire and LangfuseSpanExporter
- **Option B: Pydantic Logfire** - Direct integration with logfire.configure()

Both options include:
- Environment variable documentation
- Service name configuration
- Automatic instrumentation setup

**File created**: `<agents-directory>/observability.py`

### Step 4: Create Base Agent Infrastructure

Set up foundational agent structure with dependency injection.

See EXAMPLES.md → "Base Infrastructure" for:
- **base.py** - AgentContext dataclass and BaseAgentOutput model
- **config.py** - Model provider configuration and selection logic

Key concepts:
- Dependency injection via `AgentContext`
- Type-safe base models with Pydantic
- Provider-agnostic model configuration
- Environment-based model selection

**Files created**: `<agents-directory>/base.py`, `<agents-directory>/config.py`

### Step 5: Create Example Agent

Build a complete example agent demonstrating best practices.

See EXAMPLES.md → "Example Agent" for:
- Structured output with AnalysisOutput model
- Dependency injection with AgentContext
- Dynamic instructions using @agent.instructions
- Tools with error handling (ModelRetry)
- Usage examples

**File created**: `<agents-directory>/examples/analysis_agent.py`

Key patterns demonstrated:
- Type-safe structured outputs
- Dependency injection for database access
- Tool error handling with ModelRetry
- Context-aware dynamic instructions

### Step 6: Set Up Error Handling and Retries

Configure robust HTTP error handling for LLM API calls.

See EXAMPLES.md → "Error Handling" for:
- AsyncTenacityTransport configuration
- Retry logic for transient failures (429, 502, 503, 504)
- HTTP timeout configuration
- Integration with agent initialization

**File created**: `<agents-directory>/retries.py`

### Step 7: FastAPI Integration (if applicable)

If project has FastAPI backend, add streaming endpoints.

See EXAMPLES.md → "FastAPI Integration" for:
- Server-Sent Events (SSE) streaming endpoint
- UIAdapter for protocol compliance
- Synchronous endpoint for non-streaming use
- Dependency injection with FastAPI Depends
- Router registration

**File created**: `<backend-directory>/routers/agents.py`

Endpoints created:
- `POST /agents/analysis/stream` - Streaming with SSE
- `POST /agents/analysis` - Synchronous execution

### Step 8: Testing Infrastructure

Set up comprehensive testing with TestModel and pytest fixtures.

See EXAMPLES.md → "Testing Infrastructure" for:
- **conftest.py** - Pytest fixtures (test_model, mock_agent_context, prevent_real_model_calls)
- **test_analysis_agent.py** - Complete test suite with unit and integration tests
- **pytest.ini** - Configuration with integration test markers

Testing patterns:
- Unit tests with TestModel (no real API calls)
- Mock dependency contexts
- Structured output validation with inline-snapshot
- Integration test markers for real API tests

**Files created**: `<agents-directory>/tests/conftest.py`, `<agents-directory>/tests/test_*.py`, `pytest.ini`

### Step 9: Environment Configuration

Document all required environment variables.

See EXAMPLES.md → "Environment Configuration" for:
- Complete `.env.example` template
- Provider-specific credentials (AWS, Anthropic, OpenAI, Google)
- Observability configuration (Langfuse, Logfire)
- HTTP client settings
- Testing flags

**File created**: `.env.example`
**Updated**: `.gitignore` (ensure .env files excluded)

### Step 10: Documentation

Create comprehensive setup documentation.

See EXAMPLES.md → "Documentation Template" for:
- README.md with features, setup, usage examples
- Project structure overview
- Creating new agents guide
- Testing examples
- Best practices
- Environment variables reference

**File created**: `<agents-directory>/README.md`

### Step 11: Validation

Verify the setup is working correctly:

1. **Run tests**: `uv run pytest -v`
   - All tests should pass with no real API calls
2. **Check imports**: Verify PydanticAI and logfire installed
3. **Verify observability**: Test configuration loads without errors
4. **Test example agent** (optional): Run integration tests with real API

See REFERENCE.md → "Validation Criteria" for complete checklist.

### Step 12: Update Project Documentation

Update CLAUDE.md with PydanticAI patterns and conventions.

Add section documenting:
- Agent code structure and location
- Development commands (testing, integration tests)
- Best practices (dependency injection, type hints, TestModel)
- Creating new agents workflow

See EXAMPLES.md → "CLAUDE.md Update" for template.

## Quick Reference

### When PydanticAI is Appropriate
✓ Type safety and validation critical
✓ Structured outputs with Pydantic models
✓ Compile-time type checking needed
✓ Payment processing or sensitive operations
✓ IDE autocomplete and type hints important
✓ Production deployment with validation guarantees

### When to Use Alternative Frameworks
→ Complex state machines with loops → Use LangGraph
→ Multi-agent coordination with shared state → Use LangGraph
→ Rapid prototyping without type safety → Use LangChain
→ Simple linear workflows → Use LangChain
→ RAG systems with large document sets → Use LlamaIndex

### Key Advantages
- **Type Safety**: Full compile-time type checking with Pydantic
- **Structured Outputs**: Validated, type-safe responses
- **Dependency Injection**: Clean architecture via RunContext
- **Testing**: TestModel for unit tests without API calls
- **Observability**: Native OpenTelemetry integration
- **IDE Support**: Full autocomplete and type hints

## Integration with Development

This skill coordinates with:
- **ai-framework-select**: Use when uncertain which framework to choose; may route here for type-safe agent requirements
- **ai-framework-build-langgraph**: Use for complex workflows with state machines; PydanticAI for type-safe single agents
- **setup-langfuse-tracing**: Essential for observability; integrates via OpenTelemetry and logfire
- **setup-logging**: Coordinate general logging with PydanticAI-specific observability
- **setup-uv**: Manages Python dependencies and selective installation of PydanticAI extras
- **project-inception**: Set up PydanticAI during Stage 5 (Initial Deliverables) for type-safe AI projects
- **dev-workflow-flow**: Implement PydanticAI agents during Stage 2 (Implementation)
- **dev-workflow-test-driven**: Test PydanticAI agents with TestModel to avoid API costs
- **ai-framework-setup-anthropic**: Can integrate for direct Anthropic SDK usage alongside PydanticAI

## Common Pitfalls to Avoid

**Don't:**
- Use PydanticAI for complex state machines with loops/branches (use LangGraph instead)
- Skip type hints on agent functions and outputs (defeats main PydanticAI benefit)
- Use dynamic typing instead of Pydantic models for outputs (bypasses validation)
- Skip TestModel in unit tests (expensive API calls during development)
- Forget to configure observability (Langfuse or Logfire mandatory for production)
- Install full `pydantic-ai` package when you only need specific providers (bloated dependencies)
- Use ModelRetry for all errors (only for retryable errors like rate limits)
- Skip dependency injection via RunContext (leads to tight coupling)
- Ignore structured output validation (Pydantic models are the core feature)
- Mix PydanticAI with LangChain in same agent (framework confusion)

**Do:**
- Always use type hints and Pydantic models for agent outputs (core PydanticAI strength)
- Use `pydantic-ai-slim[extras]` for selective provider installation
- Configure observability from the start (logfire or OpenTelemetry + Langfuse)
- Test with TestModel for unit tests (no real API calls, fast feedback)
- Use dependency injection via RunContext for clean architecture
- Configure ModelRetry for retryable errors (429, 502, 503, 504)
- Use AsyncTenacityTransport for robust HTTP retry logic
- Structure outputs with Pydantic models for validation guarantees
- Pin exact versions for production (`pydantic-ai==x.y.z`)
- Use integration test markers to separate unit from API tests
- Configure FastAPI streaming with UIAdapter for SSE compatibility
- Document all required environment variables in .env.example
- Use inline-snapshot for test validation (catches regressions automatically)
- Check existing code patterns before suggesting changes

## Additional Resources

**Skill Files:**
- **EXAMPLES.md** - Complete code examples for all components
- **REFERENCE.md** - Best practices, common issues, validation criteria

**External References:**
- [PydanticAI Documentation](https://ai.pydantic.dev/)
- [Pydantic Logfire](https://pydantic.dev/logfire)
- [Langfuse OpenTelemetry Integration](https://langfuse.com/docs/integrations/opentelemetry)

**Related Skills:**
- `ai-framework-build-langgraph` - For complex state machines
- `ai-framework-select` - For framework selection guidance
- `ai-framework-setup-anthropic` - For direct Anthropic SDK usage
