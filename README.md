# JIDE - Next.js Full-Stack J++ IDE

## Project Overview
JIDE is a Next.js full-stack application that lets users sign up, log in, write J++ code in-browser, compile it on the server, execute it in a constrained runtime, and inspect output/errors.

This repository includes:
- web app (`apps/ui`) with App Router pages and API routes
- J++ compiler and CLI (`lib/jpp`, `apps/cli`)
- focused tests for auth, execution, integration, and performance checks

## Tech Stack
- **Frontend:** Next.js, React, Tailwind, Radix components
- **Backend:** Next.js route handlers (`apps/ui/app/api/*`)
- **Auth:** cookie-based sessions with server-side validation, CSRF protection
- **Execution:** J++ compiler + worker-thread constrained JavaScript execution
- **Testing:** Node test runner + Playwright guidance (`PLAYWRIGHT.md`)

## Folder Structure
- `apps/ui/app` - pages and API route handlers
- `apps/ui/lib` - backend services (auth, execution, chat retrieval, security utilities)
- `apps/ui/components` - UI components
- `apps/cli` - J++ CLI
- `lib/jpp` - language compiler implementation
- `tests` - unit/integration/performance tests

## Core Modules
- `apps/ui/app/api/auth/*`
  - `csrf`, `signup`, `login`, `me`, `logout`
- `apps/ui/lib/authStore.cjs`
  - user/session persistence with serialized mutations and audit log
  - role support (`ADMIN`, `USER`)
- `apps/ui/lib/authApi.cjs`
  - auth orchestration and cookie shaping
- `apps/ui/lib/csrf.cjs`
  - CSRF token issuance + validation
- `apps/ui/lib/rateLimit.cjs`
  - in-memory per-IP endpoint rate limiting
- `apps/ui/lib/jppExecution.cjs`
  - code validation, compile, worker execution with timeout/memory constraints
- `apps/ui/lib/rag.js`
  - docs retrieval index with TTL cache + retry/backoff for upstream chat call

## Full Workflow
1. User loads auth page and receives CSRF token from `GET /api/auth/csrf`.
2. Signup/Login sends CSRF header and credentials to auth route.
3. Backend validates CSRF, applies rate limits, stores/verifies user, and sets `jide_session`.
4. Client calls `GET /api/auth/me` to validate session.
5. In `/ide`, client posts J++ source to `POST /api/execute`.
6. Backend compiles J++ and executes JS in a worker with constrained resources.
7. Response returns `success`, `code`, `output`, `errors`, and optional AST metadata.
8. `/docs` chat sends prompts to `POST /api/chat`, which retrieves context and queries LLM endpoint with retry/backoff.

## Security and Reliability Notes
- CSRF protection on sensitive auth POST routes
- request rate limiting on auth, execute, and chat endpoints
- session fingerprint validation (IP + user-agent hash)
- serialized auth-store mutation queue + atomic writes to prevent data corruption
- docs retrieval cache uses TTL and deployment identity invalidation
- execution sandbox is hardened, but not equivalent to full process/container isolation for hostile multi-tenant workloads

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start app:
   ```bash
   npm run start:ui
   ```
3. Open:
   - `http://localhost:3000`

Optional environment variables for docs chat:
- `OPENAI_API_KEY`
- `OPENAI_BASE_URL`
- `OPENAI_MODEL`

## API Overview
- `GET /api/auth/csrf`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `POST /api/execute`
- `POST /api/chat`

## Testing
Run all current tests:
```bash
npm test
```

Includes:
- auth store and auth API tests
- execution logic tests
- integration flow test (signup -> login -> me)
- basic performance budget tests

For browser automation strategy and setup, see `PLAYWRIGHT.md`.  
For J++ language internals, see `JPP_README.md`.  
For Docker usage, see `DOCKER.md`.
