---
name: setting-up-langchain
description: Set up LangChain for your project. Intelligently routes to LangGraph when stateful agents, multi-agent systems, or complex workflows are detected. Use for RAG, chatbots, and LLM-powered applications.
---

# Setting Up LangChain (2026)

## Purpose
Set up LangChain in your project following 2026 best practices. This skill intelligently determines whether LangChain or LangGraph is appropriate for your use case and routes accordingly.

## When to Use This Skill

Use this skill when:
- Setting up a new simple LLM-powered application
- Adding LangChain to an existing project for linear workflows
- Building basic RAG systems with linear retrieval → generation flow
- Creating simple prototypes or MVPs (<2 weeks lifespan)
- Uncertain whether LangChain or LangGraph is needed (skill will route appropriately)
- Building educational/learning projects

**Do NOT use for:**
- Production agents requiring state persistence (use ai-framework-build-langgraph instead)
- Multi-agent coordination systems (use ai-framework-build-langgraph or ai-framework-select)
- Complex workflows with loops, branches, or conditional logic (use ai-framework-build-langgraph)
- Applications that will scale beyond simple prototypes (start with ai-framework-build-langgraph)
- Projects already using LangGraph (use ai-framework-build-langgraph for enhancements)
- When you need sophisticated error handling and retry logic (use ai-framework-build-langgraph)

**If uncertain:** Use this skill when building simple linear workflows or prototypes. The skill includes intelligent routing logic that will assess your requirements and automatically route to ai-framework-build-langgraph if your use case requires stateful agents, multi-agent coordination, or complex workflows. When in doubt, start here and let the routing logic guide you.

## Important: Routing to LangGraph

**LangGraph is preferred for production agents in 2026.** This skill will assess requirements and automatically route to `ai-framework-build-langgraph` if:
- Stateful agents with persistent conversations needed
- Multi-agent coordination required
- Workflow has loops, branches, or conditional logic
- Sophisticated error handling and recovery needed
- Production deployment with scaling requirements

**LangChain is appropriate for:**
- Simple linear RAG pipelines
- Prototypes and MVPs (< 2 weeks lifespan)
- One-off data processing tasks
- Educational/learning purposes
- Very simple Q&A systems with no state

## Process

### Step 1: Assess Requirements

Ask the user these questions to determine the right framework:

```
I'll help you set up LangChain. First, let me understand your requirements:

1. What are you building? (e.g., RAG system, chatbot, document analyzer, agent)

2. Does your application need to:
   - Remember conversation history across multiple turns? (Y/N)
   - Coordinate multiple AI agents? (Y/N)
   - Make decisions based on previous steps (loops/branches)? (Y/N)
   - Handle complex error recovery and retries? (Y/N)

3. What's the expected lifespan and scale?
   - Quick prototype (< 2 weeks)
   - Production application (long-term)
   - Scale: < 100 users | 100-10K users | 10K+ users

4. Does your workflow follow a simple linear path or have complex branching?
   - Linear: input → retrieval → generation → output
   - Complex: decision trees, loops, conditional paths
```

### Step 2: Route Decision

**If ANY of these are true → Use LangGraph instead:**
- Needs conversation memory/state persistence
- Multi-agent coordination required
- Complex workflow (loops, branches, conditions)
- Production deployment (not just prototype)
- Scale > 100 users
- Sophisticated error handling needed

**Decision Output:**
```
Based on your requirements, I recommend using **LangGraph** instead of LangChain because:
[list specific reasons based on their answers]

LangGraph provides:
- Native state management for conversation history
- Graph-based architecture for complex workflows
- Production-ready error handling and retry logic
- Better scalability and observability
- Explicit control flow (vs. implicit chains)

I'll now invoke the ai-framework-build-langgraph skill to set this up properly.
```

Then invoke:
```
Skill: ai-framework-build-langgraph
```

**If LangChain is appropriate:** Continue to Step 3.

### Step 3: Project Setup (LangChain Path)

**Note to user:**
```
You've confirmed a simple linear workflow. I'll set up LangChain for this use case.

⚠️  Important: If you later need state management, multi-agent coordination, or complex workflows, plan to migrate to LangGraph. It's designed for production scale.
```

**Create project structure:**
See EXAMPLES.md → "Project Structure" for detailed directory layout.

### Step 4: Install Dependencies

**Using UV (recommended 2026):**
See EXAMPLES.md → "Installation" for complete dependency setup commands.

Choose based on user requirements:
- Core: langchain, langchain-core, langchain-community
- Model provider: langchain-anthropic, langchain-openai, or langchain-aws
- Vector store: langchain-chroma or langchain-qdrant (for RAG)
- Observability: langfuse (mandatory for production)
- API: fastapi, uvicorn (if building web service)

### Step 5: Basic Setup

**Configuration:**
See EXAMPLES.md → "Configuration Setup" for:
- `src/config/settings.py` - Pydantic settings with environment variables
- `.env.example` - Environment variable template

Key configurations:
- Model provider API keys
- Langfuse observability keys
- RAG parameters (chunk size, overlap)

### Step 6: Implement Core Components

**Choose based on use case:**

1. **Simple Q&A Chain:** See EXAMPLES.md → "Simple Q&A Chain"
   - For basic question answering without document retrieval
   - Uses prompt template + LLM + output parser
   - Includes Langfuse observability integration

2. **RAG System:** See EXAMPLES.md → "RAG Chain"
   - For document-based question answering
   - Includes vector store, retriever, and document formatting
   - Uses Chroma for vector storage (can swap for Qdrant)

Both examples include:
- Langfuse callback handler for observability
- Proper error handling patterns
- LCEL (LangChain Expression Language) syntax

### Step 7: Add Error Handling & Retry Logic

See EXAMPLES.md → "Error Handling" for:
- Retry logic with exponential backoff
- Exception handling patterns
- Langfuse error logging integration

Critical for production: wrap chains with `RunnableRetry` to handle transient failures.

### Step 8: FastAPI Integration (Optional)

If building a web service, see EXAMPLES.md → "FastAPI Integration" for:
- REST API endpoints for Q&A and RAG
- Request/response models with Pydantic
- Error handling at API boundaries
- Running the API server

### Step 9: Testing

See EXAMPLES.md → "Testing" for:
- Unit tests with fake LLMs
- Integration test patterns
- Testing chain logic without API calls

Always test core logic with mock LLMs to avoid API costs during development.

### Step 10: Documentation

Create README.md following template in EXAMPLES.md → "Documentation Template".

Include:
- Setup instructions
- Usage examples
- Architecture overview
- Migration path to LangGraph
- Observability configuration

### Step 11: Production Checklist

Before deploying, verify all items in REFERENCE.md → "Production Checklist":
- Observability configured (Langfuse)
- Environment variables secured
- Input validation and rate limiting
- Error handling and retry logic
- Testing and monitoring
- Security measures (input sanitization, output validation)

### Step 12: Next Steps

**If staying with LangChain:**
- Implement specific use case
- Add comprehensive tests
- Set up monitoring and alerts
- Document API endpoints

**If migrating to LangGraph:**
- Invoke `ai-framework-build-langgraph` skill
- Map chains to graph nodes
- Add state schema for data flow
- Implement persistence (PostgreSQL)

See REFERENCE.md → "Migration Path to LangGraph" for detailed migration strategy.

## Quick Reference

### When LangChain is Appropriate
✓ Simple linear RAG pipelines
✓ Prototypes and MVPs (< 2 weeks lifespan)
✓ One-off data processing tasks
✓ Educational/learning purposes
✓ Very simple Q&A systems with no state

### When to Use LangGraph Instead
→ Conversation history across sessions
→ Multi-agent coordination
→ Complex workflows with loops/branches
→ Production deployment at scale
→ Sophisticated error handling needs

## Integration with Development

This skill coordinates with:
- **ai-framework-select**: Use when uncertain which framework to choose; this skill may redirect based on requirements
- **ai-framework-build-langgraph**: Routes to this skill when stateful agents or complex workflows are detected
- **setup-langfuse-tracing**: Essential for observability in all LangChain applications
- **setup-logging**: Coordinate general logging with LangChain-specific observability
- **setup-uv**: Manages Python dependencies and package installation for LangChain projects
- **project-inception**: Set up LangChain during Stage 5 (Initial Deliverables) for simple AI projects
- **dev-workflow-flow**: Implement LangChain chains during Stage 2 (Implementation)
- **dev-workflow-test-driven**: Test LangChain chains with fake LLMs to avoid API costs

## Common Pitfalls to Avoid

**Don't:**
- Use LangChain for production stateful agents (use LangGraph instead)
- Skip observability setup (Langfuse is mandatory for production)
- Ignore the routing logic (it will save you from future migration pain)
- Build complex workflows with chains (use LangGraph's graph architecture)
- Use deprecated LangChain patterns from 2023-2024 (use LCEL syntax)
- Skip input validation and rate limiting (security vulnerabilities)
- Forget to test with fake LLMs first (expensive API calls during development)
- Store API keys in code (use environment variables via Pydantic Settings)
- Deploy without error handling and retry logic (transient failures will break your app)
- Use LangChain for multi-agent systems (use LangGraph or CrewAI)

**Do:**
- Follow the routing assessment carefully (saves migration effort later)
- Always set up Langfuse observability from the start
- Use LCEL (LangChain Expression Language) for chain composition
- Wrap chains with RunnableRetry for production error handling
- Test core logic with FakeLLM to avoid API costs
- Use Pydantic Settings for configuration management
- Implement proper input validation and output sanitization
- Document migration path to LangGraph in README
- Start with LangGraph if you suspect the prototype will grow
- Use uv for consistent dependency management across team
- Pin exact package versions for production deployments
- Keep chains simple and linear (otherwise use LangGraph)

## Additional Resources

**Skill Files:**
- **EXAMPLES.md** - Complete code examples for all components
- **REFERENCE.md** - Anti-patterns, use cases, production guidance

**External References:**
- [LangChain Documentation](https://python.langchain.com/docs/)
- [Langfuse Integration](https://langfuse.com/integrations/frameworks/langchain)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [UV Package Manager](https://github.com/astral-sh/uv)

**Related Skills:**
- `ai-framework-build-langgraph` - For production stateful agents
- `ai-framework-select` - For framework selection guidance
