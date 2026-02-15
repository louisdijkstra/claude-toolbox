---
description: Incrementally fix build and type errors with minimal, safe changes. One error at a time.
---

# Build Fix Command

This command systematically resolves build and compilation errors.

## What This Command Does

1. **Detect Build System** - Identify build tool and commands
2. **Run Build** - Capture all errors
3. **Group Errors** - Organize by file and dependency order
4. **Fix Incrementally** - Resolve one error at a time
5. **Verify Each Fix** - Ensure no new errors introduced

## Step 1: Detect Build System

Identify the project's build tool:

| Indicator | Build Command |
|-----------|---------------|
| `package.json` with `build` script | `npm run build` |
| `tsconfig.json` (TypeScript only) | `npx tsc --noEmit` |
| `Cargo.toml` | `cargo build 2>&1` |
| `pom.xml` | `mvn compile` |
| `go.mod` | `go build ./...` |
| `pyproject.toml` | `python -m py_compile` or `mypy .` |
| `uv` workspace | `uv run mypy .` or language-specific |

## Step 2: Parse and Group Errors

1. Run the build command and capture stderr
2. Group errors by file path
3. Sort by dependency order (fix imports/types before logic)
4. Count total errors for progress tracking

## Step 3: Fix Loop (One Error at a Time)

For each error:

1. **Read the file** - See error context (lines around the error)
2. **Diagnose** - Identify root cause (missing import, wrong type, syntax)
3. **Fix minimally** - Smallest change that resolves the error
4. **Re-run build** - Verify error gone and no new errors
5. **Move to next** - Continue with remaining errors

## Step 4: Guardrails

Stop and ask the user if:
- A fix introduces **more errors than it resolves**
- The **same error persists after 3 attempts** (deeper issue)
- The fix requires **architectural changes** (not just a build fix)
- Build errors stem from **missing dependencies** (need install)

## Recovery Strategies

| Situation | Action |
|-----------|--------|
| Missing module/import | Check if package installed; suggest install command |
| Type mismatch | Read both type definitions; fix the narrower type |
| Circular dependency | Identify cycle with import graph; suggest extraction |
| Version conflict | Check dependency file for version constraints |
| Build tool misconfiguration | Read config file; compare with working defaults |

## Example Workflow

```
1. Run: npm run build
   Output: 15 errors found

2. Group by file:
   - src/auth.ts (5 errors)
   - src/api.ts (8 errors)
   - src/utils.ts (2 errors)

3. Fix src/utils.ts first (dependency)
   - Error: Cannot find name 'UserType'
   - Fix: import { UserType } from './types'
   - Result: 2 errors → 0 errors in utils.ts

4. Fix src/auth.ts (depends on utils)
   - Error: Property 'id' does not exist on type 'User'
   - Fix: Add 'id: string' to User interface
   - Result: 5 errors → 0 errors in auth.ts

5. Fix src/api.ts
   - Resolve remaining 8 errors one by one
   - Result: All errors resolved

6. Final build: npm run build
   Output: Build successful!
```

## Important Rules

- **Fix one error at a time** for safety
- **Prefer minimal diffs** over refactoring
- **Verify after each fix** - run build again
- **Stop if making it worse** - ask for guidance

## Integration with Other Commands

- Use `/review` after fixes to check code quality
- Use `/tdd` to add tests for fixed code
- Use `/flow` to integrate fixes into workflow

## Related Skills

- **dev-flow** - Integration with development workflow
- **systematic-debugging** - Root cause analysis
