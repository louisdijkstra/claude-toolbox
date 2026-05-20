# Rich Features Demo

## Callouts

> [!NOTE]
> This is a note callout.

> [!WARNING]
> Watch out for this.

## Code

```python
def greet(name):
    return f"hello, {name}"
```

## Diagram

```mermaid
graph TD
  A[Start] --> B[Middle]
  B --> C[End]
```

## Table

| Feature | Status |
|---|---|
| Parsing | done |
| Rendering | wip |
| Tests | todo |

## Tree

```tree
project/
├── src/
│   ├── main.py
│   └── utils.py
├── tests/
│   └── test_main.py
└── README.md
```

## Diff

```diff
@@ -3,4 +3,5 @@
 def greet(name):
-    return f"hi, {name}"
+    return f"hello, {name}"
+    # polite version
```

## Endpoint

```endpoint
GET /users
description: list users
params: id (uuid, optional), include (string, optional)
response: 200 {users: []}

POST /users
description: create a user
body: {name: string, email: string}
response: 201 {id: uuid}
```

## Env

```env
# database
DATABASE_URL=postgres://localhost/app
# secrets
API_SECRET=hunter2
JWT_SIGNING_KEY=aabbccdd
# public knobs
LOG_LEVEL=info
PORT=8080
```

## Risk

```risk
- title: SQL injection
  likelihood: med
  impact: high
  mitigation: parameterized queries everywhere
- title: Token leak in logs
  likelihood: low
  impact: high
  mitigation: redact in log formatter
- title: Cache staleness
  likelihood: high
  impact: low
  mitigation: TTL + manual purge
- title: UX regression
  likelihood: med
  impact: med
  mitigation: visual regression tests
```

## Deps

```deps
ecosystem: npm
react@18.3.0
@radix-ui/react-tooltip@1.0.7
ecosystem: pypi
fastapi@0.110
sqlalchemy@2.0
ecosystem: crates
serde@1.0
```

## Cross-references

This phase references the [[Phase 1]] callouts section and the [[Phase 3]] diagram. See [[Task 2]] for the implementation order.

## Task dependencies

### Task 1

Set up the base.

### Task 2

This depends on Task 1.

### Task 3

This requires Task 2 and Task 1.

## Footnotes Demo

The Plan Explorer v1.4[^1] supports inline footnotes[^2] and automatic reference linking. Footnotes enhance documentation by providing supplementary information without cluttering the main text.

[^1]: Released in May 2026.
[^2]: Each footnote is a reference link that users can hover or click to see the content.

## Image Gallery

This gallery demonstrates multiple inline images rendered as a responsive grid. Click any image to open the lightbox viewer.

![Mountain landscape](/static/img/mountain.jpg) ![Forest trees](/static/img/forest.jpg) ![Ocean waves](/static/img/ocean.jpg)

## Glossary

**Adaptive**: Adjusting behavior based on user preferences or system state.

**Cache**: A storage layer that holds frequently accessed data for quick retrieval.

**Declarative**: Specifying what should happen rather than how it should happen.

**Ephemeral**: Lasting only a short time; temporary by nature.

**Memoization**: Storing computed results to avoid recalculation.
