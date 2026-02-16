---
name: setting-up-logging
description: Set up production logging (frontend, backend, infrastructure) using FREE services with 5-minute setup. Structured JSON logging with minimal code changes.
---

# Setting Up Logging

## Purpose
Implement production-grade logging across entire stack using free services. Setup time: 5-10 minutes.

## When to Use This Skill

Use this skill when:
- Starting a new project without logging configured
- Adding structured logging to existing project
- Replacing ad-hoc print statements with production logging
- Setting up error tracking and monitoring
- Need to debug production issues
- Preparing project for deployment

**Do NOT use for:**
- Projects that already have logging configured (use existing setup)
- Quick prototypes or experiments (add logging when stabilizing)
- Simple scripts with minimal error handling needs (print statements may suffice)
- When debugging locally with IDE debugger (direct debugging more efficient)
- Documentation-only projects (no code to log)
- Projects explicitly using enterprise logging solutions (follow enterprise standards)

**If uncertain:** Use this skill when preparing code for production or when you need to track errors and behavior in deployed environments. Skip for throwaway prototypes or when working within established enterprise logging infrastructure.

## Core Requirements
- **Format**: Structured JSON logs
- **Cost**: $0 (free tier services)
- **Setup**: <10 lines of code
- **Levels**: DEBUG < INFO < WARN < ERROR < FATAL

## Recommended Services

**Best for most projects**: Sentry
- Free: 5K errors/month forever
- Setup: 5 minutes, 5 lines of code
- Features: Errors, session replay, performance, traces
- No credit card needed
- Website: sentry.io

**Alternatives**:
- Better Stack: 1GB/1M events free, unified logs + errors
- Grafana Cloud: 50GB logs/month free, full observability
- Self-hosted Sentry: Unlimited, full data ownership

## Standard

Use **research-deep** skill to determine the best fit for the current setup. If needed, use **docs-bigger-picture** skill to understand project context and requirements. 

## What to Log

### Backend
**Always**:
- Errors with stack traces
- API requests: method, path, status, duration_ms, user_id
- Slow operations (>100ms database, >1s requests)
- Auth events: login, logout, failures
- External API calls: URL, duration, status, retries
- LLM requests: model, tokens, cost, latency

**JSON structure**:
```json
{
  "timestamp": "2024-11-20T10:30:45.123Z",
  "level": "info",
  "event": "api.request",
  "trace_id": "abc-123",
  "http": {"method": "POST", "path": "/api/users", "status": 201, "duration_ms": 145},
  "user_id": "usr_123"
}
```

### Frontend
**Always**:
- Uncaught exceptions
- Network errors (failed API calls, timeouts)
- Performance metrics (Web Vitals)
- User context on errors

### Infrastructure
- Container starts/stops
- Health check failures
- Resource exhaustion (CPU, memory, disk)

## Quick Setup

### Backend (Python + Sentry)
```bash
pip install sentry-sdk structlog
```

```python
import sentry_sdk
import structlog

# Sentry
sentry_sdk.init(dsn="YOUR-DSN", traces_sample_rate=0.1, environment="production")

# Structured logging
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ]
)
logger = structlog.get_logger()

# Usage
logger.info("user.login", user_id="123", ip="192.168.1.1")
```

### Backend (Node.js + Sentry)
```bash
npm install @sentry/node pino
```

```javascript
const Sentry = require('@sentry/node');
const pino = require('pino');

Sentry.init({ dsn: 'YOUR-DSN', tracesSampleRate: 0.1 });
const logger = pino({ level: 'info' });

logger.info({ event: 'user.login', user_id: '123' }, 'User logged in');
```

### Frontend (React + Sentry)
```bash
npm install @sentry/react
```

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR-DSN",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true })
  ],
  tracesSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
});

// Wrap app
<Sentry.ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</Sentry.ErrorBoundary>
```

## Best Practices

### Schema Consistency
Use same field names everywhere:
- `user_id` (not `userId`, `user`, `userID`)
- `duration_ms` (not `time`, `duration`)
- `timestamp` (ISO 8601 format)

### Essential Fields
Every log entry needs:
- `timestamp` (ISO 8601)
- `level` (debug|info|warn|error|fatal)
- `event` (e.g., "api.request", "user.login")
- `trace_id` (for correlation across services)

### Privacy
Never log:
- Passwords, API keys, tokens
- Credit card numbers
- Full PII without consent
- Full session IDs

Redact or hash:
```json
{"user_email": "u***@example.com", "user_id_hash": "abc123"}
```

### Sampling for High Volume
```python
# Log 100% errors, 10% success, 100% slow
if status >= 400 or duration > 1.0 or random.random() < 0.1:
    logger.info({...})
```

### Trace IDs
Generate at entry point, pass to all services:
```python
trace_id = str(uuid.uuid4())
logger.info({"trace_id": trace_id, ...})
requests.post(url, headers={"X-Trace-ID": trace_id})
```

## Log Levels

**Production default**: INFO
- **DEBUG**: Development only or temporary troubleshooting
- **INFO**: User-driven events, system operations
- **WARN**: Potential issues (slow queries, near capacity)
- **ERROR**: Errors that don't break service
- **FATAL**: Service-breaking errors

## Alerting

Configure alerts for:
- Error rate >1% of requests
- Any FATAL logs
- Response time P95 >5s
- Failed auth attempts >10/min
- LLM costs >$X/day (if applicable)

Alert channels: Email (low), Slack (medium), PagerDuty (critical)

## Common Patterns

### API Middleware
```python
@app.before_request
def before():
    request.trace_id = str(uuid.uuid4())
    request.start_time = time.time()

@app.after_request
def after(response):
    logger.info({
        "event": "api.request",
        "trace_id": request.trace_id,
        "http": {
            "method": request.method,
            "path": request.path,
            "status": response.status_code,
            "duration_ms": (time.time() - request.start_time) * 1000
        },
        "user_id": getattr(request, 'user_id', None)
    })
    return response
```

### LLM Logging
```python
def call_llm(prompt, model):
    start = time.time()
    logger.info({"event": "llm.start", "model": model, "prompt_tokens": len(prompt)})
    
    try:
        response = llm.complete(prompt, model=model)
        cost = calculate_cost(response.usage, model)
        
        logger.info({
            "event": "llm.complete",
            "model": model,
            "prompt_tokens": response.usage.prompt_tokens,
            "completion_tokens": response.usage.completion_tokens,
            "duration_ms": (time.time() - start) * 1000,
            "cost_usd": cost
        })
        return response
    except Exception as e:
        logger.error({"event": "llm.failed", "model": model, "error": str(e)})
        raise
```

## Performance
- Use async logging (non-blocking)
- Sample high-volume logs
- Avoid expensive operations in log statements
- Production: INFO level, not DEBUG

## Testing
Before production:
1. Trigger error → Verify in Sentry
2. Check logs are JSON structured
3. Verify trace_id propagation
4. Test alert triggers

## 5-Minute Quick Start

1. Sign up: sentry.io (no credit card)
2. Get DSN from new project
3. Install: `pip install sentry-sdk` or `npm install @sentry/react`
4. Init: `sentry_sdk.init(dsn="YOUR-DSN")`
5. Trigger error, check dashboard

Done. 5,000 errors/month free forever.

## Key Points
- Setup: 5-10 minutes
- Cost: $0 for most projects
- Code: ~5-10 lines to initialize
- Format: JSON structured logs
- Free tiers are generous (5K-50GB/month)
- No credit card required
- Start with Sentry for errors, expand later

## Integration with Development

This skill coordinates with:
- **research-deep**: Validate logging service choice against 2026 best practices and project requirements
- **docs-bigger-picture**: Understand project context, scale, and constraints for logging configuration
- **project-inception**: Set up logging during Stage 5 (Initial Deliverables) of project launch
- **setup-repository-structure**: Ensure logging configuration files are properly organized in project structure
- **dev-workflow-flow**: Add logging during Stage 2 (Implementation) when building features
- **docs-manager**: Document logging conventions, schema standards, and alert configurations

## Common Pitfalls to Avoid

**Don't:**
- Log sensitive data (passwords, tokens, PII without consent)
- Use different field names across services (breaks correlation)
- Skip trace_id implementation (can't track requests across services)
- Log at DEBUG level in production (performance impact)
- Ignore log sampling for high-volume endpoints (cost explosion)
- Forget to test alerting before production
- Mix structured and unstructured logging
- Use print statements instead of proper logging library

**Do:**
- Use consistent JSON schema across all services
- Implement trace_id propagation from day one
- Start with free tier services (Sentry, Better Stack, Grafana Cloud)
- Log all errors with full stack traces and context
- Set up alerting for critical metrics (error rate, latency)
- Sample high-volume logs intelligently (100% errors, 10% success)
- Test logging by triggering errors before deployment
- Follow privacy requirements (redact PII, hash sensitive fields)