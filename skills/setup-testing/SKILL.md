---
name: setup-testing
description: Bootstrap Python/React test infrastructure — pytest markers, Testcontainers fixtures for PostgreSQL/Qdrant/Redis, LLM mocking via VCR or a Bedrock stub, Playwright, MSW. Use when a repo has no conftest.py with Testcontainers fixtures, or no Playwright config.
---

# Setup Testing Infrastructure

Detect the stack from `pyproject.toml`, `package.json`, and `docker-compose.yml`, then apply only the matching sections below.

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

Directory layout to create:

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

**If PostgreSQL is detected:**

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

**If Qdrant is detected:**

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

**If Redis is detected:**

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

## Step 7: Playwright (if React frontend)

`playwright.config.ts` at the repo root:

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

## Step 8: MSW (if React frontend)

`src/mocks/handlers.ts`:

```typescript
import { http, HttpResponse } from "msw";

export const handlers = [
  // Add your API routes here as you write tests
  // Example:
  http.get("/api/health", () => HttpResponse.json({ status: "ok" })),
];
```

`src/mocks/server.ts` (for Jest/Node):

```typescript
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

`src/setupTests.ts` (Jest setup file):

```typescript
import { server } from "./mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());  // prevent state leaks between tests
afterAll(() => server.close());
```

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
