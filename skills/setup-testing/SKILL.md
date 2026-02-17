---
name: setup-testing
description: Set up the complete testing infrastructure for a project — pytest markers, Testcontainers for real databases, LLM call mocking (VCR or AWS Bedrock stub), FastAPI test client, Playwright for E2E, and MSW for frontend. Run once per project to bootstrap test foundations.
---

# Setup Testing Infrastructure

## Purpose
Bootstrap a complete, layered testing setup for a project. Generates configuration and fixture boilerplate so the team can write tests immediately without fighting infrastructure. Covers all three layers: unit, integration, and E2E.

## When to Use This Skill

Use when:
- Starting a new project with no test infrastructure
- Migrating from mocked-DB tests to real Testcontainers
- Adding integration or E2E tests to an existing codebase
- Need a consistent test structure across a monorepo workspace

**Do NOT use for:**
- Writing the actual tests (use `tdd` or `dev-workflow-tdd`)
- Projects already using a different test framework (Vitest, unittest) — adapt rather than replace
- Simple scripts with no I/O (just use `pytest` directly)

**If uncertain:** Run this skill if the project has no `conftest.py` with Testcontainers fixtures, or no Playwright config.

---

## Step 1: Discover Project Stack

Read these files before generating anything:

```
pyproject.toml (or setup.py)     → Python dependencies, async framework
package.json                      → Frontend framework, test tooling
.env.example or README            → External services (Postgres, Bedrock, Qdrant, Redis)
```

**Determine:**

| Question | Where to check | Implication |
|---|---|---|
| Python async (FastAPI)? | `pyproject.toml` dependencies | Need `pytest-asyncio` + async fixtures |
| PostgreSQL? | deps / env vars | Add Testcontainers `PostgresContainer` |
| pgvector? | deps / env vars | Use `pgvector/pgvector:pg16` image instead |
| Qdrant? | deps / env vars | Add Testcontainers `QdrantContainer` |
| Redis? | deps / env vars | Add Testcontainers `RedisContainer` |
| HTTP LLM (OpenAI / Anthropic direct)? | deps | Use `pytest-recording` (VCR) |
| AWS Bedrock? | deps (boto3/botocore) | Use custom boto3 Converse stub |
| React frontend? | `package.json` | Add Playwright + MSW |
| TypeScript? | `tsconfig.json` | Use TypeScript Playwright config |

If a service is unclear, ask:
> "I see boto3 in your dependencies — are you calling AWS Bedrock directly for LLM calls, or using an HTTP-based API like OpenAI?"

---

## Step 2: Install Dependencies

### Python

```bash
uv add --dev pytest pytest-asyncio httpx
```

Add based on stack:
```bash
# Database containers
uv add --dev testcontainers

# VCR for HTTP-based LLMs (OpenAI, Anthropic direct)
uv add --dev pytest-recording vcrpy

# Async SQLAlchemy
uv add --dev asyncpg
```

### Frontend (if React)

```bash
npm install --save-dev @playwright/test msw
npx playwright install --with-deps chromium
```

---

## Step 3: Configure pytest

Add to `pyproject.toml` (or create `pytest.ini`):

```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"           # only if async (FastAPI, SQLAlchemy async)
markers = [
    "unit: fast, no I/O — run on every save",
    "integration: requires Docker — run on every PR",
    "e2e: requires full running stack — run after integration",
]
testpaths = ["tests"]
```

**Directory layout to create:**

```
tests/
├── conftest.py          ← session fixtures (containers, engine, app client)
├── unit/
│   └── conftest.py      ← lightweight fixtures for unit tests
├── integration/
│   └── conftest.py      ← import from root conftest
└── e2e/                 ← only if frontend exists
    └── conftest.py
```

---

## Step 4: Root conftest.py

Generate `tests/conftest.py` based on the discovered stack.

### Base (always included — FastAPI async)

```python
import pytest
from httpx import AsyncClient, ASGITransport
from your_app.main import app  # adjust import path


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    """FastAPI test client — use in integration tests."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac
```

### PostgreSQL (add if PostgreSQL detected)

```python
from testcontainers.postgres import PostgresContainer
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from your_app.db import Base  # adjust import path
import pytest


@pytest.fixture(scope="session")
def postgres():
    # Use pgvector image if pgvector is in the stack, plain postgres otherwise
    image = "pgvector/pgvector:pg16"  # or "postgres:16"
    with PostgresContainer(image) as pg:
        yield pg


@pytest.fixture(scope="session")
async def db_engine(postgres):
    url = postgres.get_connection_url().replace("psycopg2", "asyncpg")
    engine = create_async_engine(url, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()


@pytest.fixture(scope="session")
def db_session_factory(db_engine):
    return sessionmaker(db_engine, class_=AsyncSession, expire_on_commit=False)


@pytest.fixture
async def db(db_session_factory):
    async with db_session_factory() as session:
        yield session


@pytest.fixture(autouse=True)
async def clean_tables(db_engine):
    """Truncate all tables between tests — never share state."""
    yield
    async with db_engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            await conn.execute(table.delete())
```

**If using Alembic:** replace `create_all` with migrations run:

```python
from alembic import command
from alembic.config import Config

async with engine.begin() as conn:
    alembic_cfg = Config("alembic.ini")
    alembic_cfg.attributes["connection"] = conn
    await conn.run_sync(lambda c: command.upgrade(alembic_cfg, "head"))
```

### Qdrant (add if Qdrant detected)

```python
from testcontainers.core.container import DockerContainer
import pytest


@pytest.fixture(scope="session")
def qdrant():
    with DockerContainer("qdrant/qdrant:latest") \
            .with_exposed_ports(6333) as container:
        yield container


@pytest.fixture(scope="session")
def qdrant_url(qdrant):
    host = qdrant.get_container_host_ip()
    port = qdrant.get_exposed_port(6333)
    return f"http://{host}:{port}"
```

### Redis (add if Redis detected)

```python
from testcontainers.redis import RedisContainer
import pytest


@pytest.fixture(scope="session")
def redis():
    with RedisContainer("redis:7-alpine") as r:
        yield r


@pytest.fixture(scope="session")
def redis_url(redis):
    return redis.get_connection_url()
```

---

## Step 5: LLM Call Mocking

### Option A — VCR (HTTP-based LLMs: OpenAI, Anthropic direct)

Add to `tests/conftest.py`:

```python
import pytest


@pytest.fixture(scope="module")
def vcr_config():
    return {
        # Never commit auth headers
        "filter_headers": ["authorization", "x-api-key", "anthropic-version"],
        # In CI use "none"; run locally with "new_episodes" to re-record
        "record_mode": "none",
        "cassette_library_dir": "tests/cassettes",
    }
```

Create `tests/cassettes/` directory and add to `.gitignore`:
```
# keep cassette YAML files (they contain sanitized responses, not secrets)
!tests/cassettes/*.yaml
```

Usage in tests:
```python
@pytest.mark.vcr()
async def test_summarize(summarizer):
    result = await summarizer.run("quarterly report...")
    assert len(result) > 10
```

Record on first run: `pytest --vcr-record=all tests/integration/test_summarizer.py`
CI uses default (`none`): no live calls made.

### Option B — AWS Bedrock stub (if Bedrock detected)

Add to `tests/conftest.py`:

```python
from unittest.mock import patch, MagicMock
import pytest


def _bedrock_converse_response(text: str = "Mocked LLM response."):
    return {
        "output": {
            "message": {
                "role": "assistant",
                "content": [{"text": text}],
            }
        },
        "stopReason": "end_turn",
        "usage": {"inputTokens": 20, "outputTokens": 10, "totalTokens": 30},
    }


@pytest.fixture
def mock_bedrock():
    """Stub AWS Bedrock Converse API — moto does not support bedrock-runtime."""
    client = MagicMock()
    client.converse.return_value = _bedrock_converse_response()
    with patch("boto3.client", return_value=client):
        yield client


@pytest.fixture
def mock_bedrock_with_response():
    """Variant: pass custom response text per test."""
    def factory(text: str):
        client = MagicMock()
        client.converse.return_value = _bedrock_converse_response(text)
        return patch("boto3.client", return_value=client)
    return factory
```

For other AWS services (S3, SQS), use `moto` alongside — it coexists with the custom Bedrock stub:
```python
from moto import mock_aws

@mock_aws
def test_s3_upload(mock_bedrock):
    ...
```

---

## Step 6: Override FastAPI Dependencies in Tests

When the app uses dependency injection (e.g., `Depends(get_db)`), override in tests:

```python
# tests/conftest.py
from your_app.main import app
from your_app.db import get_db


@pytest.fixture
async def client(db):
    """Test client with real DB session injected."""
    async def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac
    app.dependency_overrides.clear()
```

---

## Step 7: Playwright (if React frontend)

Create `playwright.config.ts` at the repo root:

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

Create `tests/e2e/example.spec.ts` to verify the setup:

```typescript
import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/.+/);
});
```

**Best practices to document for the team:**
- Always use `data-testid` attributes — never CSS classes or text content
- Each test sets up its own state
- Mock third-party API calls with `page.route()` to avoid real network calls in E2E

---

## Step 8: MSW (if React frontend)

Create `src/mocks/handlers.ts`:

```typescript
import { http, HttpResponse } from "msw";

export const handlers = [
  // Add your API routes here as you write tests
  // Example:
  http.get("/api/health", () => HttpResponse.json({ status: "ok" })),
];
```

Create `src/mocks/server.ts` (for Jest/Node):

```typescript
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

Add to `src/setupTests.ts` (Jest setup file):

```typescript
import { server } from "./mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());  // prevent state leaks between tests
afterAll(() => server.close());
```

---

## Step 9: CI Configuration

Add to `.github/workflows/test.yml` (or equivalent):

```yaml
test-unit:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: astral-sh/setup-uv@v5
    - run: uv sync --all-extras
    - run: uv run pytest -m unit -x

test-integration:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: astral-sh/setup-uv@v5
    - run: uv sync --all-extras
    - run: uv run pytest -m integration --vcr-record=none
    # Docker is available on ubuntu-latest runners by default

test-e2e:
  needs: [test-unit, test-integration]
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: npm ci
    - run: npx playwright install --with-deps chromium
    - run: npx playwright test
    - uses: actions/upload-artifact@v4
      if: failure()
      with:
        name: playwright-report
        path: playwright-report/
```

---

## Verification Checklist

After setup, verify:

- [ ] `pytest -m unit` runs with no Docker required
- [ ] `pytest -m integration` starts containers automatically and cleans up after
- [ ] VCR cassettes exist in `tests/cassettes/` (or Bedrock stub is in conftest)
- [ ] Each integration test leaves the DB empty (check `autouse` truncation fixture)
- [ ] `npx playwright test` runs the home page smoke test (if frontend)
- [ ] MSW server wraps all Jest tests (if frontend)
- [ ] No secrets in committed cassette YAML files

---

## Anti-Patterns to Avoid

- **Using SQLite for PostgreSQL tests**: Misses JSONB, pgvector, arrays, constraint behavior
- **Module-scoped or session-scoped test data**: One test's writes corrupt another — always truncate per test
- **docker-compose up in CI**: Hard lifecycle to manage; Testcontainers handles it automatically
- **E2E tests for every feature**: Belongs in the integration layer; keep E2E to 3–8 critical user flows
- **`waitForTimeout()` in Playwright**: Causes flaky tests — use `expect(locator).toBeVisible()` instead
- **Committing secrets in VCR cassettes**: Always set `filter_headers` before recording
- **Not resetting MSW handlers in `afterEach`**: State leaks cause order-dependent frontend test failures
- **Session-scoped `client` fixture in integration tests**: Dependency overrides persist — use function-scoped `client`

---

## Integration with Other Skills

- **`tdd` / `dev-workflow-tdd`**: Run this skill first to set up infrastructure; then use `tdd` to write tests feature by feature
- **`setup-uv`**: Install pytest and testcontainers via `uv add --dev`
- **`setup-langfuse-tracing`**: Disable Langfuse tracing in tests via `LANGFUSE_TRACING_ENABLED=false` env var in pytest config
- **`dev-workflow-patterns`**: Discover existing test patterns before setting up new infrastructure
- **`research-deep`**: Validate specific testing choices against current standards

---

## References

- [testcontainers-python — GitHub](https://github.com/testcontainers/testcontainers-python)
- [Testcontainers pgvector Module](https://testcontainers.com/modules/pgvector/)
- [pytest-recording — GitHub](https://github.com/kiwicom/pytest-recording)
- [Unit Testing Amazon Bedrock — Medium](https://medium.com/@peterjdavis/unit-testing-amazon-bedrock-in-python-3b5558fb7c9a)
- [Playwright E2E Guide](https://playwright.dev/docs/intro)
- [MSW — Mock Service Worker](https://mswjs.io/docs/)
- [FastAPI Testing — Official Docs](https://fastapi.tiangolo.com/advanced/testing-database/)
- Research: `docs/research/2026-02-17-testing-best-practices-databases-docker-llm.md`
