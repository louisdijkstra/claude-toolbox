# AI Framework Selection Examples

Real-world use cases with detailed requirements and recommendations.

## Table of Contents

1. [Customer Support Chatbot](#example-1-customer-support-chatbot)
2. [Document Q&A System](#example-2-document-qa-system)
3. [Research Report Generator](#example-3-research-report-generator)
4. [Healthcare Data Pipeline](#example-4-healthcare-data-pipeline)
5. [API Integration Agent](#example-5-api-integration-agent)

## Example 1: Customer Support Chatbot

### Requirements
- Conversation history across sessions
- Integration with ticketing system (Zendesk API)
- 10K users
- Need to remember user context
- Production deployment
- FastAPI backend

### User Answers
1. What are you building? → b) Conversational agent/chatbot
2. Workflow complexity → b) Conditional logic
3. State management needs → d) Persistent state across sessions
4. Scale → c) Medium production (100-10K users)
5. Team collaboration → a) Single agent
6. Type safety → b) Nice to have
7. Existing ecosystem → c) Need FastAPI integration

### Recommendation: **LangGraph**

**Why:**
- State persistence for conversation history across sessions
- PostgreSQL checkpointer for cross-session memory
- FastAPI streaming for real-time chat UI
- Error handling for API failures (Zendesk integration)
- TypedDict state schema for conversation context
- Production-ready at 10K user scale

**Architecture:**
```
User Message → LangGraph StateGraph → [
  Agent Node (decides action)
  ├─ Query Zendesk API Node
  ├─ Search Knowledge Base Node
  └─ Generate Response Node
] → Stream Response
```

**State Schema:**
```python
class ChatbotState(TypedDict):
    messages: Annotated[list[dict], add_messages]
    user_id: str
    ticket_id: str | None
    knowledge_base_results: list[str]
    status: str
```

**Next Steps:**
1. Invoke `building-langgraph-agents` skill
2. Set up PostgreSQL checkpointer
3. Integrate Zendesk API as tools
4. Create FastAPI SSE streaming endpoint
5. Configure Langfuse for observability

## Example 2: Document Q&A System

### Requirements
- 10,000+ PDFs (technical documentation)
- Fast retrieval required (< 100ms response)
- No conversation history needed
- Production deployment
- 1K users
- Multilingual documents (English, Spanish, German)

### User Answers
1. What are you building? → a) RAG system
2. Workflow complexity → a) Linear/simple
3. State management needs → a) No state needed
4. Scale → c) Medium production (100-10K users)
5. Team collaboration → a) Single agent
6. Type safety → a) Not important
7. Existing ecosystem → d) Need cloud deployment (AWS)

### Recommendation: **LlamaIndex + LangChain**

**Why:**
- LlamaIndex is the industry standard for RAG (30ms p99 latency)
- 10K+ documents require optimized retrieval
- Multilingual support built into LlamaIndex
- Simple linear workflow (query → retrieve → answer) fits LangChain
- No state persistence needed

**Architecture:**
```
User Query → LangChain Chain → [
  LlamaIndex Query Engine (retrieval)
  → LLM Generate Answer
] → Return Response
```

**Vector Store:**
- Qdrant (self-hosted on AWS) or Pinecone (managed)
- Embeddings: Amazon Bedrock (Cohere Multilingual)

**Setup Steps:**
1. Install: `uv add llama-index llama-index-core langchain-core`
2. Set up Qdrant vector store
3. Ingest PDFs with LlamaIndex document loaders
4. Create LangChain chain that calls LlamaIndex query engine
5. Deploy on AWS ECS with FastAPI

**Performance Targets:**
- Retrieval: < 30ms (LlamaIndex p99)
- LLM generation: 200-500ms
- Total: < 600ms end-to-end

## Example 3: Research Report Generator

### Requirements
- Multiple agents (researcher, writer, reviewer)
- Agents collaborate on report sections
- Well-defined roles and tasks
- Medium scale (internal tool, ~50 users)
- Sequential workflow with handoffs
- Generate 5-10 page reports

### User Answers
1. What are you building? → c) Multi-agent system
2. Workflow complexity → b) Conditional logic
3. State management needs → b) Simple conversation history
4. Scale → b) Small production (<100 users)
5. Team collaboration → c) Multiple agents with distinct roles
6. Type safety → b) Nice to have
7. Existing ecosystem → a) Starting from scratch

### Recommendation: **CrewAI**

**Why:**
- Multi-agent collaboration with distinct roles is CrewAI's specialty
- Well-defined roles (Researcher, Writer, Reviewer)
- Sequential workflow with task handoffs
- Easier setup than LangGraph for role-based agents
- Production-ready with strong documentation

**Architecture:**
```
User Query → CrewAI Crew → [
  Researcher Agent (web search, document analysis)
    ↓ findings
  Writer Agent (draft generation, structuring)
    ↓ draft
  Reviewer Agent (quality check, fact verification)
] → Final Report
```

**Crew Configuration:**
```python
researcher = Agent(
    role="Research Analyst",
    goal="Gather comprehensive information on topic",
    tools=[web_search, pdf_reader]
)

writer = Agent(
    role="Technical Writer",
    goal="Create well-structured report",
    tools=[outline_generator, section_writer]
)

reviewer = Agent(
    role="Quality Reviewer",
    goal="Ensure accuracy and clarity",
    tools=[fact_checker, citation_validator]
)

crew = Crew(
    agents=[researcher, writer, reviewer],
    process=Process.sequential
)
```

**Next Steps:**
1. Install: `uv add crewai crewai-tools`
2. Define agent roles and tools
3. Set up sequential process
4. Implement report template
5. Add web search and document tools

## Example 4: Healthcare Data Pipeline

### Requirements
- Regulated industry (HIPAA compliance)
- On-premise deployment (no cloud)
- Enterprise support needed
- Production SLAs required
- Process medical records and extract structured data
- 5K records/day
- Audit logging required

### User Answers
1. What are you building? → d) Data processing pipeline
2. Workflow complexity → b) Conditional logic
3. State management needs → a) No state needed
4. Scale → e) Enterprise/regulated industry
5. Team collaboration → a) Single agent
6. Type safety → c) Critical
7. Existing ecosystem → e) Enterprise infrastructure (on-prem)

### Recommendation: **Haystack**

**Why:**
- Enterprise-grade production focus with SLAs
- Proven at scale (Airbus, NVIDIA, Comcast)
- Strong on-premise deployment support
- Haystack Enterprise offering available
- Excellent for regulated industries (healthcare, finance)
- Built-in audit logging and compliance features

**Architecture:**
```
Medical Records → Haystack Pipeline → [
  Document Preprocessor
  → Entity Extractor (NER)
  → Structured Data Generator
  → Validator
] → Structured Output + Audit Log
```

**Pipeline Components:**
```python
from haystack import Pipeline
from haystack.components.preprocessors import DocumentCleaner
from haystack.components.extractors import EntityExtractor
from haystack.components.validators import OutputValidator

pipeline = Pipeline()
pipeline.add_component("cleaner", DocumentCleaner())
pipeline.add_component("extractor", EntityExtractor())
pipeline.add_component("validator", OutputValidator())
pipeline.connect("cleaner", "extractor")
pipeline.connect("extractor", "validator")
```

**Deployment:**
- Hayhooks for production deployment
- On-premise Kubernetes cluster
- PostgreSQL for audit logs
- Haystack Enterprise license for SLAs

**Next Steps:**
1. Install: `uv add haystack-ai`
2. Design pipeline architecture
3. Set up entity extractors for medical data
4. Configure on-premise deployment
5. Implement audit logging
6. Contact Haystack Enterprise for SLA

## Example 5: API Integration Agent

### Requirements
- Call multiple APIs based on user intent (Stripe, SendGrid, Twilio)
- Type-safe API schemas (Pydantic models)
- Validation critical (payment processing)
- Structured outputs required
- Error handling with typed exceptions
- Medium scale (1K users)

### User Answers
1. What are you building? → e) Tool-calling agent
2. Workflow complexity → b) Conditional logic
3. State management needs → b) Simple conversation history
4. Scale → c) Medium production (100-10K users)
5. Team collaboration → a) Single agent
6. Type safety → c) Critical (heavily validated inputs/outputs)
7. Existing ecosystem → b) Existing Python codebase (FastAPI + Pydantic)

### Recommendation: **PydanticAI**

**Why:**
- Type safety is critical for payment processing
- Native Pydantic integration for API schemas
- Compile-time validation reduces runtime errors
- Best for projects already using Pydantic (existing FastAPI app)
- Structured output parsing with full type checking
- Error handling with typed exceptions

**Architecture:**
```
User Request → PydanticAI Agent → [
  Intent Classifier
  ├─ Stripe Tool (payment processing)
  ├─ SendGrid Tool (email notifications)
  └─ Twilio Tool (SMS alerts)
] → Structured Response
```

**Type-Safe Tools:**
```python
from pydantic import BaseModel
from pydantic_ai import Agent

class PaymentRequest(BaseModel):
    amount: int
    currency: str
    customer_id: str

class PaymentResponse(BaseModel):
    transaction_id: str
    status: str
    timestamp: datetime

agent = Agent(
    'claude-3-5-sonnet',
    result_type=PaymentResponse,
    system_prompt="Process payment requests with Stripe"
)

@agent.tool
def process_payment(request: PaymentRequest) -> PaymentResponse:
    # Type-safe tool implementation
    ...
```

**Benefits:**
- Compile-time type checking (catch errors before runtime)
- Pydantic validation on all inputs/outputs
- IDE autocomplete and type hints
- Structured error handling

**Next Steps:**
1. Install: `uv add pydantic-ai`
2. Define Pydantic schemas for API requests/responses
3. Create type-safe tools for each API
4. Implement agent with structured outputs
5. Add error handling with typed exceptions
6. Deploy with existing FastAPI app
