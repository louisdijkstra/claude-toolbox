# LangChain Setup Examples

Complete code examples for all components referenced in SKILL.md.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Installation](#installation)
3. [Configuration Setup](#configuration-setup)
4. [Simple Q&A Chain](#simple-qa-chain)
5. [RAG Chain](#rag-chain)
6. [Error Handling](#error-handling)
7. [FastAPI Integration](#fastapi-integration)
8. [Testing](#testing)
9. [Documentation Template](#documentation-template)

## Project Structure

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

## Installation

### Using UV (recommended 2026)

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

### Using Poetry

```bash
poetry init
poetry add langchain langchain-core langchain-community
poetry add langchain-anthropic  # or provider of choice
poetry add langfuse fastapi uvicorn
poetry install
```

## Configuration Setup

### Settings File: `src/config/settings.py`

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Model provider
    anthropic_api_key: str = ""
    model_name: str = "claude-sonnet-4-5-20250929"

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

### Environment Template: `.env.example`

```bash
# Model Provider
ANTHROPIC_API_KEY=your-api-key-here
MODEL_NAME=claude-sonnet-4-5-20250929

# Observability (sign up at langfuse.com or self-host)
LANGFUSE_PUBLIC_KEY=pk-...
LANGFUSE_SECRET_KEY=sk-...
LANGFUSE_HOST=https://cloud.langfuse.com

# RAG Configuration (if applicable)
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
```

## Simple Q&A Chain

### File: `src/chains/qa_chain.py`

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

## RAG Chain

### File: `src/chains/rag_chain.py`

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

## Error Handling

### Retry Logic with Error Handling

```python
from langchain_core.runnables import RunnableRetry
from src.chains.qa_chain import qa_chain, langfuse_handler

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

## FastAPI Integration

### File: `src/main.py`

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

### Running the API

```bash
uv run uvicorn src.main:app --reload
```

## Testing

### File: `tests/unit/test_qa_chain.py`

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

### Running Tests

```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=src --cov-report=html

# Run specific test file
uv run pytest tests/unit/test_qa_chain.py
```

## Documentation Template

### README.md

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

## Testing

Run tests:
\`\`\`bash
uv run pytest
\`\`\`

## Deployment

[Add deployment instructions]
```
