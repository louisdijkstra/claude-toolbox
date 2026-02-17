# Research: Testing Best Practices — Unit, Integration, and E2E

## Context
- Project: Python/TypeScript full-stack applications with AI components (LlamaIndex, AWS Bedrock)
- Stack: FastAPI backend, PostgreSQL/pgvector/Qdrant, AWS Bedrock (Claude), React/TypeScript frontend, uv/pytest
- Constraints: External I/O (databases, LLM APIs, AWS), async codebase, non-deterministic LLM responses

## Research Question
"What are the 2026 industry standards for structuring unit, integration, and E2E tests for a FastAPI + React application that uses PostgreSQL, Docker containers, and LLM API calls?"

---

## Industry Standards (2026)

1. **Test pyramid ratio**: ~70% unit / 20–25% integration / 5–10% E2E (adjust per risk profile)
2. **Never mock databases** — use real DB instances via Testcontainers; SQLite/in-memory fakes hide real bugs
3. **Record-replay for LLM calls** — vcrpy/pytest-recording cassettes for deterministic CI; custom stubs for AWS Bedrock (boto3)
4. **Session-scoped containers, function-scoped data cleanup** — minimize startup cost while ensuring test isolation
5. **Playwright over Cypress** for E2E in 2026 — better cross-browser, faster, native parallel execution
6. **MSW (Mock Service Worker)** for intercepting API calls in frontend unit/component tests
7. **pytest-asyncio** with `asyncio_mode = "auto"` for async FastAPI + SQLAlchemy code

---

## Options Evaluated

### Option 1: Mock Everything (unittest.mock only)

**Description:** Patch all external dependencies (DB, LLM, AWS) with Python mocks.

**Pros:**
- Fast execution; no infrastructure needed
- Zero setup friction

**Cons:**
- Couples tests to implementation details — refactoring breaks tests
- Misses real bugs: connection pooling, schema mismatches, async context manager issues
- LLM mocks return hardcoded strings — miss API contract changes, token limit edge cases
- Gives false confidence: green CI, broken production

**Verdict:** Use only for pure functions with zero I/O. Never for DB or network boundaries.

---

### Option 2: Testcontainers (Recommended for Databases)

**Description:** Spin up real Docker containers (PostgreSQL, pgvector, Qdrant, Redis) per test session via `testcontainers-python`, managed by pytest fixtures.

**Pros:**
- Tests against the real DB engine — catches constraint violations, JSONB quirks, pgvector index behavior
- Self-contained lifecycle: container starts and stops with the test session
- Dynamic port mapping — no conflicts in parallel CI jobs
- Session-scoped startup (~10–15s once) with per-test data truncation

**Cons:**
- Requires Docker daemon in CI (standard in GitHub Actions / GitLab CI)
- First run pulls image — use CI layer caching

**Pattern:**
```python
# conftest.py
import pytest
from testcontainers.postgres import PostgresContainer
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

@pytest.fixture(scope="session")
def postgres():
    with PostgresContainer("pgvector/pgvector:pg16") as pg:
        yield pg

@pytest.fixture(scope="session")
async def engine(postgres):
    url = postgres.get_connection_url().replace("psycopg2", "asyncpg")
    engine = create_async_engine(url)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()

@pytest.fixture(autouse=True)
async def clean_tables(engine):
    """Truncate all tables between tests — never share state."""
    yield
    async with engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            await conn.execute(table.delete())
```

---

### Option 3: VCR / pytest-recording for LLM HTTP Calls

**Description:** On first run, record all HTTP interactions to a YAML cassette file. CI replays cassettes deterministically without live API calls.

**Best for:** OpenAI, Anthropic direct HTTP API, any HTTP-based LLM

**NOT for:** AWS Bedrock (uses botocore, not plain HTTP — see Option 4)

**Setup:**
```python
# conftest.py
@pytest.fixture(scope="module")
def vcr_config():
    return {
        "filter_headers": ["authorization", "x-api-key"],  # never commit secrets
        "record_mode": "none",  # in CI; use "new_episodes" to re-record
    }

# test_summarizer.py
@pytest.mark.vcr()
async def test_summarize_document(summarizer):
    result = await summarizer.summarize("quarterly report text...")
    assert "revenue" in result.lower()
```

Run once with `--vcr-record=all` to generate cassette; commit YAML file; CI uses `--vcr-record=none`.

---

### Option 4: Custom Bedrock Mock (for AWS Bedrock)

**Description:** `moto` does not support `bedrock-runtime`. Use a custom boto3 stub that returns realistic response shapes.

**Setup:**
```python
# conftest.py
from unittest.mock import patch, MagicMock
import pytest

@pytest.fixture
def mock_bedrock():
    def fake_converse(**kwargs):
        return {
            "output": {
                "message": {
                    "role": "assistant",
                    "content": [{"text": "This is a mocked response."}]
                }
            },
            "stopReason": "end_turn",
            "usage": {"inputTokens": 20, "outputTokens": 15, "totalTokens": 35}
        }

    with patch("boto3.client") as mock_client:
        client = MagicMock()
        client.converse.side_effect = fake_converse
        mock_client.return_value = client
        yield client
```

For other AWS services (S3, SQS, DynamoDB), combine with moto's `@mock_aws` — it coexists cleanly.

---

### Option 5: Playwright for E2E UI Testing (Recommended)

**Description:** Playwright drives a real browser against a running stack. Test critical user flows end-to-end.

**Playwright vs Cypress (2026):**
- Playwright: native parallel execution, cross-browser (Chromium/Firefox/WebKit), faster, better CI performance
- Cypress: better interactive debug UX, time-travel debugger — use if DX matters more than speed

**Industry verdict 2025–2026:** Playwright is the leading choice by GitHub usage and industry surveys.

**Pattern:**
```typescript
// tests/e2e/analytics.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Analytics dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('[data-testid="email"]', "test@example.com");
    await page.fill('[data-testid="password"]', "password");
    await page.click('[data-testid="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("uploads file and sees chart", async ({ page }) => {
    await page.setInputFiles('[data-testid="file-upload"]', "fixtures/sales.csv");
    await page.click('[data-testid="analyze-btn"]');
    await expect(page.locator('[data-testid="chart"]')).toBeVisible();
  });
});
```

**Best practices:**
- Use `data-testid` attributes, never CSS classes or text content
- Each test sets up its own state — no shared state between tests
- Mock network calls that go to third-party services (`page.route()` or MSW)
- Run only 3–5 critical flows in E2E; don't replicate integration tests

**playwright.config.ts:**
```typescript
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

---

### Option 6: MSW (Mock Service Worker) for Frontend Component Tests

**Description:** Intercept HTTP calls in frontend tests without modifying application code. Works in both Jest (Node) and Playwright (browser).

**Best for:** React component tests that depend on API responses

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/analytics/results", () =>
    HttpResponse.json({ charts: [...], summary: "..." })
  ),
];

// src/mocks/server.ts (for Jest/Node)
import { setupServer } from "msw/node";
export const server = setupServer(...handlers);

// setupTests.ts
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## Recommended Approach

### The Testing Pyramid

```
               ┌────────────┐
               │    E2E     │  3–5 critical user flows (Playwright)
               │  (few, slow)│
           ┌───┴────────────┴───┐
           │   Integration Tests │  FastAPI routes + real DB (Testcontainers)
           │   (some, medium)    │  + LLM mocked via VCR/Bedrock stub
        ┌──┴─────────────────────┴──┐
        │        Unit Tests          │  Pure functions, React components (Jest/RTL + MSW)
        │    (many, fast, no I/O)    │
        └────────────────────────────┘
```

### Layer 1 — Unit Tests

**Python:**
- Target pure functions: parsers, transformers, data models, business rules
- No DB, no HTTP, no AWS
- `pytest` + `unittest.mock` where truly necessary
- Run in milliseconds; run on every file save / pre-commit

**Frontend:**
- Jest + React Testing Library for component behavior
- MSW to intercept API calls without modifying components
- Test: what renders, what the user sees after interactions
- Avoid testing implementation details (internal state, class names)

---

### Layer 2 — Integration Tests

**Python backend:**
- Testcontainers (session-scoped) for PostgreSQL + pgvector
- `httpx.AsyncClient` pointing to a running FastAPI `app` for endpoint tests
- Alembic migrations (`alembic upgrade head`) run once at session start
- Per-test table truncation via `autouse` fixture
- VCR cassettes for HTTP LLMs; custom boto3 mock for Bedrock
- pytest-asyncio with `asyncio_mode = "auto"`

**CI time target:** < 2 minutes for the full integration suite

---

### Layer 3 — E2E Tests

- Playwright against a full local stack (frontend + backend + real DB)
- Scope: 3–5 highest-risk user flows only (login, core feature, data upload, etc.)
- All external LLM calls mocked via `page.route()` or environment-level stub
- CI: run after unit + integration pass; retry flaky tests 2× in CI
- Local: use `--headed` for debugging; `--trace on` for CI failures

---

### pytest Configuration

```toml
# pyproject.toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
markers = [
    "unit: fast, no I/O",
    "integration: requires Docker",
    "e2e: requires full running stack",
]
```

### CI Pipeline Structure

```yaml
# Runs on every PR
test-unit:
  run: pytest -m unit -x
  time: ~10s

test-integration:
  needs: [docker]
  run: pytest -m integration --vcr-record=none
  time: ~60–120s

# Runs after unit+integration pass
test-e2e:
  run: npx playwright test
  time: ~2–5min
```

---

## Anti-Patterns to Avoid

- **SQLite for PostgreSQL code**: Misses JSONB, arrays, pgvector, upsert conflicts, triggers
- **Shared test state**: Tests that pass alone but fail in suite — hardest class of CI bugs to diagnose
- **docker-compose up in CI**: Hard to manage lifecycle; Testcontainers is more reliable and self-contained
- **E2E tests for everything**: Becomes the primary test layer; slow, flaky, hard to maintain
- **Hard-coding `data-testid` values in multiple places**: Extract to constants shared between app and tests
- **Not filtering secrets from VCR cassettes**: API keys end up committed in YAML cassette files
- **Awaiting arbitrary timeouts in E2E** (`await page.waitForTimeout(3000)`): Use `await expect(locator).toBeVisible()` instead — Playwright auto-waits
- **Not resetting MSW handlers between tests**: State leaks between component tests causing order-dependent failures

---

## Testing Strategy Summary

| Layer | Tool | Scope | Speed | Run When |
|-------|------|-------|-------|----------|
| Unit (Python) | pytest + mock | Pure functions | <10s | Pre-commit, every push |
| Unit (Frontend) | Jest + RTL + MSW | React components | <30s | Pre-commit, every push |
| Integration (Python) | pytest + Testcontainers + VCR | API routes + DB | ~60–120s | Every PR |
| E2E | Playwright | Critical user flows | 2–5min | Every PR (post integration) |

---

## Trade-offs Accepted

- **Testcontainers adds ~15s CI startup**: Acceptable vs. false confidence from mocked DB tests
- **VCR cassettes need periodic re-recording**: Acceptable; price of deterministic CI with real API shapes
- **E2E suite stays small (5–10 tests)**: Intentional — more coverage belongs in faster integration layer
- **Custom Bedrock mock requires maintenance**: Acceptable until moto supports `bedrock-runtime`

---

## When to Revisit

- When moto adds `bedrock-runtime` support — replace custom mock with `@mock_aws`
- If integration test suite exceeds 5 minutes — profile and add parallelism (`pytest-xdist`)
- If E2E flakiness rate exceeds ~5% — review waitFor patterns or move coverage to integration layer
- When switching DB or adding new external services — add Testcontainers module for each

---

## References

- [Testcontainers Best Practices — Docker Blog](https://www.docker.com/blog/testcontainers-best-practices/)
- [testcontainers-python — GitHub](https://github.com/testcontainers/testcontainers-python)
- [Testcontainers pgvector Module](https://testcontainers.com/modules/pgvector/)
- [pytest-recording — GitHub](https://github.com/kiwicom/pytest-recording)
- [VCR for LLMs (eliminating flaky tests) — Medium](https://anaynayak.medium.com/eliminating-flaky-tests-using-vcr-tests-for-llms-a3feabf90bc5)
- [Unit Testing Amazon Bedrock in Python — Medium](https://medium.com/@peterjdavis/unit-testing-amazon-bedrock-in-python-3b5558fb7c9a)
- [FastAPI + Async SQLAlchemy + Alembic + pytest — Medium](https://medium.com/@estretyakov/the-ultimate-async-setup-fastapi-sqlmodel-alembic-pytest-ae5cdcfed3d4)
- [Playwright E2E Testing React — Mergify](https://articles.mergify.com/e-2-e-testing-react-playwright/)
- [Guide to Playwright 2026 — DeviQA](https://www.deviqa.com/blog/guide-to-playwright-end-to-end-testing-in-2025/)
- [Modern Test Pyramid Guide 2025 — FullScale](https://fullscale.io/blog/modern-test-pyramid-guide/)
- [Testing Pyramid for AI Agents — Block Engineering Blog](https://engineering.block.xyz/blog/testing-pyramid-for-ai-agents)
- [Moto — GitHub](https://github.com/getmoto/moto)
