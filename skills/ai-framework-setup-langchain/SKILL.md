---
name: ai-framework-setup-langchain
description: Set up LangChain for your project. Intelligently routes to LangGraph when stateful agents, multi-agent systems, or complex workflows are detected. Use for RAG, chatbots, and LLM-powered applications.
---

# Setting Up LangChain (2026)

## Purpose
Set up LangChain in your project following 2026 best practices. This skill intelligently determines whether LangChain or LangGraph is appropriate for your use case and routes accordingly.

## When to Use
- Setting up a new LLM-powered application
- Adding LangChain to an existing project
- Building RAG systems, chatbots, or AI agents
- Uncertain whether LangChain or LangGraph is needed

## Important Note
**LangGraph is preferred for production agents in 2026.** This skill will assess your requirements and automatically route to the `ai-framework-build-langgraph` skill if:
- You need stateful agents with persistent conversations
- You require multi-agent coordination
- Your workflow has loops, branches, or conditional logic
- You need sophisticated error handling and recovery
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

**If LangChain is appropriate:**
Continue to Step 3.

### Step 3: Project Setup (LangChain Path)

**Note to user:**
```
You've confirmed a simple linear workflow. I'll set up LangChain for this use case.

⚠️  Important: If you later need state management, multi-agent coordination, or complex workflows, plan to migrate to LangGraph. It's designed for production scale.
```

**Create project structure:**
```bash
project/
├── src/
│   ├── chains/          # LangChain chain definitions
│   ├── prompts/         # Prompt templates
│   ├── tools/           # Custom tools (if needed)
│   ├── loaders/         # Document loaders (for RAG)
│   ├── config/          # Configuration
│   └── main.py          # Entry point
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── pyproject.toml       # or requirements.txt
└── README.md
```

### Step 4: Install Dependencies

**Using UV (recommended 2026):**
```bash
# Install UV if not present
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create project
uv init project-name
cd project-name

# Core dependencies
uv add langchain langchain-core langchain-community

# Model provider (choose based on user preference)
uv add langchain-openai          # OpenAI/GPT
uv add langchain-anthropic       # Claude
uv add langchain-aws             # AWS Bedrock

# For RAG systems
uv add langchain-chroma          # Vector store
# OR
uv add langchain-qdrant          # Alternative vector store

# Observability (mandatory for production)
uv add langfuse                  # Open-source observability

# API (if building web service)
uv add fastapi uvicorn

# Sync dependencies
uv sync
```

**Alternative (Poetry):**
```bash
poetry init
poetry add langchain langchain-core langchain-community
poetry add langchain-anthropic  # or provider of choice
poetry add langfuse fastapi uvicorn
poetry install
```

### Step 5: Basic Setup

**Create configuration file: `src/config/settings.py`**
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Model provider
    anthropic_api_key: str = ""
    model_name: str = "claude-3-5-sonnet-20241022"

    # Observability
    langfuse_public_key: str = ""
    langfuse_secret_key: str = ""
    langfuse_host: str = "https://cloud.langfuse.com"

    # RAG (if applicable)
    chunk_size: int = 1000
    chunk_overlap: int = 200

    class Config:
        env_file = ".env"

settings = Settings()
```

**Create `.env.example`:**
```bash
# Model Provider
ANTHROPIC_API_KEY=your-api-key-here
MODEL_NAME=claude-3-5-sonnet-20241022

# Observability (sign up at langfuse.com or self-host)
LANGFUSE_PUBLIC_KEY=pk-...
LANGFUSE_SECRET_KEY=sk-...
LANGFUSE_HOST=https://cloud.langfuse.com

# RAG Configuration (if applicable)
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
```

### Step 6: Implement Core Components

**For Simple Q&A Chain: `src/chains/qa_chain.py`**
```python
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langfuse.callback import CallbackHandler
from src.config.settings import settings

# Initialize observability
langfuse_handler = CallbackHandler(
    public_key=settings.langfuse_public_key,
    secret_key=settings.langfuse_secret_key,
    host=settings.langfuse_host
)

# Initialize model
llm = ChatAnthropic(
    model=settings.model_name,
    api_key=settings.anthropic_api_key,
    temperature=0.7
)

# Create prompt
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant. Answer questions concisely and accurately."),
    ("human", "{question}")
])

# Create chain
qa_chain = (
    {"question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

def ask_question(question: str) -> str:
    """Ask a question and get an answer."""
    return qa_chain.invoke(
        question,
        config={"callbacks": [langfuse_handler]}
    )
```

**For RAG System: `src/chains/rag_chain.py`**
```python
from langchain_anthropic import ChatAnthropic
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langfuse.callback import CallbackHandler
from src.config.settings import settings

# Initialize components
langfuse_handler = CallbackHandler(
    public_key=settings.langfuse_public_key,
    secret_key=settings.langfuse_secret_key,
    host=settings.langfuse_host
)

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

vectorstore = Chroma(
    persist_directory="./chroma_db",
    embedding_function=embeddings
)

retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

llm = ChatAnthropic(
    model=settings.model_name,
    api_key=settings.anthropic_api_key
)

# RAG prompt
rag_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a helpful assistant. Answer the question based on the provided context.
    If the context doesn't contain enough information, say so.

    Context: {context}"""),
    ("human", "{question}")
])

# Format documents
def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

# Create RAG chain
rag_chain = (
    {
        "context": retriever | format_docs,
        "question": RunnablePassthrough()
    }
    | rag_prompt
    | llm
    | StrOutputParser()
)

def query_documents(question: str) -> str:
    """Query documents using RAG."""
    return rag_chain.invoke(
        question,
        config={"callbacks": [langfuse_handler]}
    )
```

### Step 7: Add Error Handling & Retry Logic

**Wrap chains with retry logic:**
```python
from langchain_core.runnables import RunnableRetry

# Add retry to chain
qa_chain_with_retry = qa_chain.with_retry(
    retry_if_exception_type=(ConnectionError, TimeoutError),
    wait_exponential_jitter=True,
    stop_after_attempt=3
)

def ask_question_safe(question: str) -> str:
    """Ask question with automatic retry on transient failures."""
    try:
        return qa_chain_with_retry.invoke(
            question,
            config={"callbacks": [langfuse_handler]}
        )
    except Exception as e:
        # Log error with Langfuse
        langfuse_handler.log_error(str(e))
        return f"Error processing question: {str(e)}"
```

### Step 8: FastAPI Integration (Optional)

**Create API endpoint: `src/main.py`**
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from src.chains.qa_chain import ask_question_safe
from src.chains.rag_chain import query_documents

app = FastAPI(title="LangChain API")

class Question(BaseModel):
    question: str

class Answer(BaseModel):
    answer: str

@app.post("/ask", response_model=Answer)
async def ask_endpoint(q: Question):
    """Simple Q&A endpoint."""
    try:
        answer = ask_question_safe(q.question)
        return Answer(answer=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/rag", response_model=Answer)
async def rag_endpoint(q: Question):
    """RAG-based Q&A endpoint."""
    try:
        answer = query_documents(q.question)
        return Answer(answer=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

**Run the API:**
```bash
uv run uvicorn src.main:app --reload
```

### Step 9: Testing

**Create basic tests: `tests/unit/test_qa_chain.py`**
```python
import pytest
from langchain_core.language_models.fake import FakeListLLM
from src.chains.qa_chain import qa_chain

def test_qa_chain():
    """Test Q&A chain with mock LLM."""
    # Use fake LLM for testing
    fake_llm = FakeListLLM(responses=["This is a test answer"])

    # Replace real LLM in chain for testing
    # (In real implementation, inject LLM as dependency)

    result = fake_llm.invoke("What is LangChain?")
    assert isinstance(result, str)
    assert len(result) > 0

def test_qa_chain_error_handling():
    """Test error handling in Q&A chain."""
    # Test with various error conditions
    pass
```

### Step 10: Documentation

**Create README.md:**
```markdown
# [Project Name]

Simple LangChain application for [purpose].

## Setup

1. Install dependencies:
   \`\`\`bash
   uv sync
   \`\`\`

2. Configure environment:
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your API keys
   \`\`\`

3. Run the application:
   \`\`\`bash
   uv run python src/main.py
   \`\`\`

## Usage

[Add usage examples]

## Architecture

Simple linear chain:
1. Input question
2. [Retrieve documents (if RAG)]
3. Generate response with LLM
4. Return answer

## Migration to LangGraph

If you later need:
- Conversation memory/state
- Multi-agent coordination
- Complex workflows (loops, branches)

Consider migrating to LangGraph. See: [ai-framework-build-langgraph skill]

## Observability

This project uses Langfuse for observability:
- View traces at: https://cloud.langfuse.com (or your self-hosted instance)
- Monitor token usage, latency, and costs
- Debug issues with detailed trace inspection
```

### Step 11: Production Checklist

Before deploying, ensure:

- [ ] **Observability configured**: Langfuse or LangSmith set up
- [ ] **Environment variables**: Never commit secrets, use .env
- [ ] **Input validation**: Validate all user inputs, add length limits
- [ ] **Error handling**: Retry logic on API calls, graceful error messages
- [ ] **Rate limiting**: Protect against abuse (if public API)
- [ ] **Caching**: Consider Redis cache for repeated queries
- [ ] **Testing**: Unit and integration tests passing
- [ ] **Documentation**: README with setup and usage instructions
- [ ] **Monitoring**: Set up alerts for errors and high costs
- [ ] **Security**: Input sanitization, output validation

### Step 12: Migration Path to LangGraph

**When to migrate:**
- Users request conversation history
- Need for complex decision logic emerges
- Multi-step workflows with error recovery required
- State management becomes critical

**Migration strategy:**
1. Read existing LangChain implementation
2. Invoke `ai-framework-build-langgraph` skill
3. Map chains to graph nodes
4. Add state schema for data flow
5. Implement persistence (PostgreSQL)
6. Test thoroughly before switching

## Anti-Patterns to Avoid

### ❌ No Observability
**Problem**: Can't debug production issues, no visibility into costs/performance.
**Solution**: Set up Langfuse from day one. Single environment variable.

### ❌ Hardcoded API Keys
**Problem**: Security vulnerability, can't change keys per environment.
**Solution**: Always use environment variables, never commit .env files.

### ❌ No Input Validation
**Problem**: Prompt injection attacks, excessive token usage.
**Solution**: Validate inputs at API boundaries, implement length limits.

### ❌ Synchronous-Only Code
**Problem**: Poor performance, can't handle concurrent requests.
**Solution**: Use async patterns if building API (FastAPI with async def).

### ❌ No Error Handling
**Problem**: Transient API failures cause user-facing errors.
**Solution**: Implement retry logic with exponential backoff.

### ❌ Building Complex Workflows in LangChain
**Problem**: Chains become unmaintainable with nested logic.
**Solution**: Use LangGraph for any complex workflows from the start.

### ❌ No Testing
**Problem**: Production bugs, regression when updating.
**Solution**: Write tests with fake LLMs, test core logic.

### ❌ Ignoring Cost Monitoring
**Problem**: Unexpected high bills from LLM usage.
**Solution**: Monitor costs in Langfuse, set budget alerts.

## Common Use Cases

### Use Case 1: Simple RAG System
**Appropriate for LangChain**: Yes (linear workflow)
**Setup**: Follow Step 6 RAG implementation
**Key components**: Document loader, vector store, retriever, LLM

### Use Case 2: Chatbot with Memory
**Appropriate for LangChain**: NO - Use LangGraph
**Reason**: Needs state persistence across conversations
**Action**: Invoke `ai-framework-build-langgraph` skill

### Use Case 3: Multi-Agent System
**Appropriate for LangChain**: NO - Use LangGraph
**Reason**: Multi-agent coordination requires graph architecture
**Action**: Invoke `ai-framework-build-langgraph` skill

### Use Case 4: Data Processing Pipeline
**Appropriate for LangChain**: Yes (if one-off/batch)
**Setup**: Simple chain with document processing
**Note**: If ongoing processing with error recovery needed, use LangGraph

### Use Case 5: Quick Prototype/Demo
**Appropriate for LangChain**: Yes (< 2 week lifespan)
**Setup**: Minimal setup, focus on core functionality
**Note**: Plan migration to LangGraph if becoming production app

## References

- [LangChain Documentation](https://python.langchain.com/docs/)
- [Langfuse Integration](https://langfuse.com/integrations/frameworks/langchain)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [UV Package Manager](https://github.com/astral-sh/uv)
- [Research: LangChain Setup Best Practices](docs/research/2026-02-16-langchain-setup-best-practices.md)
- [Building LangGraph Agents Skill](~/.claude/skills/ai-framework-build-langgraph/SKILL.md)

## Next Steps

After completing setup:

1. **If staying with LangChain:**
   - Implement your specific use case
   - Add comprehensive tests
   - Set up monitoring and alerts
   - Document API endpoints

2. **If migrating to LangGraph:**
   - Invoke `ai-framework-build-langgraph` skill
   - Plan migration strategy
   - Test thoroughly before switching

3. **Production deployment:**
   - Containerize with Docker
   - Set up CI/CD pipeline
   - Configure auto-scaling
   - Implement backup and recovery
