---
name: setting-up-anthropic-connection
description: Set up and use Anthropic's Python SDK for Claude API integration. Covers client initialization, streaming, prompt caching, tool use, and best practices for production agents.
---

# Anthropic Python SDK Setup

## Purpose
Guide for implementing Claude API using Anthropic's official Python SDK. Use when building agents, chat interfaces, or integrating Claude into applications. Covers streaming decisions, prompt caching, tool use, and production patterns.

## When to Use

Use when:
- Initializing new Claude API integration
- Implementing prompt caching for cost optimization
- Adding tool use (function calling) to agents
- Building multi-turn conversation systems
- Optimizing token usage and costs
- Setting up vision capabilities
- Implementing error handling and retries

**Do NOT use for:**
- Agent orchestration with state machines (use LangGraph skill instead)
- Multi-agent coordination (use framework selection skill first)
- RAG systems (consider LlamaIndex for complex RAG)

**Check existing code first:** If agent implementation exists, examine it to understand current patterns before suggesting changes. If uncertain about which approach fits the user's needs, ask clarifying questions about their use case and requirements.

## Prerequisites
```bash
uv add anthropic python-dotenv
```

## Environment Setup

**.env file:**
```
ANTHROPIC_API_KEY=...
```

**Loading:**
```python
from dotenv import load_dotenv
from anthropic import Anthropic

load_dotenv()
client = Anthropic()  # Auto-discovers ANTHROPIC_API_KEY
```

 ## Model Selection

**Latest models (recommended):**
- **claude-sonnet-4-5-20250929** (alias: `claude-sonnet-4-5`): Smartest model for complex agents and coding. Best balance of intelligence and speed. **Use as default.**
- **claude-haiku-4-5-20251001** (alias: `claude-haiku-4-5`): Fastest with near-frontier intelligence. Great for real-time tasks.
- **claude-opus-4-1-20250805** (alias: `claude-opus-4-1`): Most capable for specialized reasoning tasks. Highest cost.

**Legacy models (still supported):**
- **claude-sonnet-4-20250514**: Previous Sonnet 4 version
- **claude-sonnet-3-7-20250219**: Claude 3.7 Sonnet (with extended thinking)
- **claude-opus-4-20250514**: Previous Opus 4 version
- **claude-3-5-haiku-20241022**: Claude 3.5 Haiku
- **claude-3-haiku-20240307**: Claude 3 Haiku

**Pro tip:** Use versioned IDs (with date) in production for consistent behavior. Aliases auto-update to latest versions.

## Basic Usage
```python
message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Your prompt"}]
)
response = message.content[0].text
```

## Streaming: When and How

### Decision Guide

**Use streaming when:**
- Interactive chat interfaces (show responses in real-time)
- Long-form generation (reduces perceived latency)
- User needs to see progress

**Skip streaming when:**
- Background processing or batch operations
- Simple Q&A where full response is fine
- Response will be processed programmatically

### Basic Streaming
```python
with client.messages.stream(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Tell a story"}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

### Event Handling
```python
with client.messages.stream(...) as stream:
    for event in stream:
        if event.type == "content_block_delta":
            print(event.delta.text, end="")
        elif event.type == "message_stop":
            usage = stream.get_final_message().usage
            print(f"\nTokens: {usage.input_tokens}/{usage.output_tokens}")
```

## Prompt Caching

### When to Cache

**Use caching for:**
- System prompts >1024 tokens
- Large context (docs, codebases) reused across requests
- Multi-turn conversations with stable context

**Benefits:**
- 90% cost reduction on cached tokens
- Lower latency
- 5-minute TTL (refreshed on use)

### Implementation
```python
message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": "Large system prompt or docs...",
            "cache_control": {"type": "ephemeral"}
        }
    ],
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Large context to cache...",
                    "cache_control": {"type": "ephemeral"}
                },
                {"type": "text", "text": "Dynamic query..."}
            ]
        }
    ]
)

# Check cache performance
print(f"Cached: {message.usage.cache_read_input_tokens}")
print(f"New cache: {message.usage.cache_creation_input_tokens}")
```

**Key rule:** Place cacheable content at end of system blocks or start of user messages.

## System Prompts and Conversations

**Single system prompt:**
```python
message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    system="You are a Python expert.",
    messages=[{"role": "user", "content": "Explain decorators"}]
)
```

**Multi-turn:**
```python
conversation = [
    {"role": "user", "content": "What's 2+2?"},
    {"role": "assistant", "content": "4"},
    {"role": "user", "content": "What about 3+3?"}
]

message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=conversation
)
```

## Tool Use (Function Calling)
```python
tools = [
    {
        "name": "get_weather",
        "description": "Get current weather",
        "input_schema": {
            "type": "object",
            "properties": {
                "location": {"type": "string", "description": "City name"}
            },
            "required": ["location"]
        }
    }
]

message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    tools=tools,
    messages=[{"role": "user", "content": "Weather in Berlin?"}]
)

if message.stop_reason == "tool_use":
    tool_use = next(b for b in message.content if b.type == "tool_use")
    result = execute_tool(tool_use.name, tool_use.input)
    
    # Continue conversation with result
    continuation = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        tools=tools,
        messages=[
            {"role": "user", "content": "Weather in Berlin?"},
            {"role": "assistant", "content": message.content},
            {
                "role": "user",
                "content": [{
                    "type": "tool_result",
                    "tool_use_id": tool_use.id,
                    "content": str(result)
                }]
            }
        ]
    )
```

## Vision
```python
import base64

with open("image.jpg", "rb") as f:
    image_data = base64.b64encode(f.read()).decode()

message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/jpeg",
                    "data": image_data
                }
            },
            {"type": "text", "text": "Describe this"}
        ]
    }]
)
```

## Error Handling
```python
from anthropic import APIError, RateLimitError, APIConnectionError

try:
    message = client.messages.create(...)
except RateLimitError as e:
    retry_after = e.response.headers.get('retry-after')
    # Implement exponential backoff
except APIConnectionError:
    # Network error, retry
except APIError as e:
    # Handle API errors
    print(f"{e.status_code}: {e.message}")
```

## Production Patterns

### Agent with Caching
```python
class ClaudeAgent:
    def __init__(self):
        self.client = Anthropic()
        self.history = []
        
    def send(self, user_input, cache_system=False):
        self.history.append({"role": "user", "content": user_input})
        
        system_prompt = self._build_system(cache_system)
        message = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2048,
            system=system_prompt,
            messages=self.history
        )
        
        self.history.append({
            "role": "assistant",
            "content": message.content
        })
        
        return message.content[0].text
    
    def _build_system(self, use_cache):
        prompt = "Your system prompt..."
        if use_cache:
            return [{
                "type": "text",
                "text": prompt,
                "cache_control": {"type": "ephemeral"}
            }]
        return prompt
```

### Streaming with Tools
```python
def agent_loop(user_input, tools):
    messages = [{"role": "user", "content": user_input}]
    
    while True:
        with client.messages.stream(
            model="claude-sonnet-4-20250514",
            max_tokens=2048,
            tools=tools,
            messages=messages
        ) as stream:
            response = stream.get_final_message()
        
        if response.stop_reason == "tool_use":
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    result = execute_tool(block.name, block.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result
                    })
            
            messages.append({"role": "assistant", "content": response.content})
            messages.append({"role": "user", "content": tool_results})
        else:
            return response.content[0].text
```

### RAG with Caching
```python
def query_documents(query, documents):
    context = "\n\n".join(documents)
    
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        system=[{
            "type": "text",
            "text": f"Answer using these docs:\n\n{context}",
            "cache_control": {"type": "ephemeral"}
        }],
        messages=[{"role": "user", "content": query}]
    )
    return message.content[0].text
```

### Async Operations
```python
import asyncio
from anthropic import AsyncAnthropic

async def batch_process(prompts):
    client = AsyncAnthropic()
    
    tasks = [
        client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            messages=[{"role": "user", "content": p}]
        )
        for p in prompts
    ]
    
    responses = await asyncio.gather(*tasks)
    return [r.content[0].text for r in responses]
```

## Quick Decision Matrix

| Scenario | Stream? | Cache? | Model |
|----------|---------|--------|-------|
| Chat UI | Yes | System prompt if >1K tokens | Sonnet |
| Background analysis | No | Yes for docs/context | Sonnet/Opus |
| Simple classification | No | No | Haiku |
| Multi-turn with docs | Yes | Yes (docs + system) | Sonnet |
| One-off query | No | No | Sonnet |

## Cost Optimization

1. **Use caching** for repeated context (90% savings)
2. **Choose right model**: Haiku for simple tasks
3. **Set max_tokens** appropriately
4. **Monitor usage**: Check `message.usage` tokens
5. **Batch requests** when possible (async)

## Common Pitfalls

- Forgetting to add `cache_control` to large prompts
- Not handling `tool_use` stop reason in loops
- Using Opus when Sonnet suffices
- Streaming without displaying incrementally
- Not implementing retry logic for rate limits

## Resources

- [API Docs](https://docs.anthropic.com/en/api/messages)
- [Prompt Caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)
- [Tool Use Guide](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)
- [Python SDK](https://github.com/anthropics/anthropic-sdk-python)

## Integration Notes

**Use with other skills:**
- `getting-the-bigger-picture`: Check project constraints before choosing models/caching strategy
- `deep-research`: For complex decisions (e.g., custom tool validation)

**Before implementing:** Examine existing agent code to maintain consistency with current patterns.