# Skills

Three skills live here. Each is project-specific tooling that superpowers does not cover.
Run one via the Skill tool, or invoke its slash-command alias if it has one.

| Skill | Purpose | Fires when |
|---|---|---|
| `plan-explorer` | Open a markdown plan, spec, or design doc in a browser UI for interactive exploration and editing; edits round-trip to disk | User runs `/plan-explore <path>`, or asks to open a plan/spec visually |
| `setup-testing` | Bootstrap Python/React test infrastructure — pytest markers, Testcontainers fixtures for PostgreSQL/Qdrant/Redis, LLM mocking via VCR or a Bedrock stub, Playwright, MSW | A repo has no `conftest.py` with Testcontainers fixtures, or no Playwright config |
| `setup-langfuse-tracing` | Instrument LLM calls with Langfuse v4 tracing — client setup, a reusable tracing module, context-manager and nested-span patterns | A repo makes LLM calls with no Langfuse spans around them |

Each skill's own `SKILL.md` has the full detail.

Everything process-related — brainstorming, planning, TDD, debugging, code review, merging
a branch — lives in the superpowers plugin, not here. See the root
[README's Superpowers section](../README.md#superpowers) to install it.
