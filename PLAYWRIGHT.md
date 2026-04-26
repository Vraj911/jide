# Playwright Testing Guide

## What Playwright is used for
Playwright is used for browser-level validation of real user workflows:
- authentication flow from UI forms
- navigation across pages (`/`, `/docs`, `/ide`)
- triggering UI actions that call backend APIs (for example, compile and run)

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Install browser binaries:
   ```bash
   npx playwright install
   ```
3. Start application:
   ```bash
   npm run start:ui
   ```

## Test structure
- `tests/ide-output.test.js`: legacy browser smoke script for compile-output behavior
- new Playwright tests should live under `tests/e2e/` grouped by user journey:
  - `auth.spec.ts`
  - `navigation.spec.ts`
  - `compile.spec.ts`

## Key scenarios
- **Auth flow:** fetch CSRF token, submit signup/login, verify successful route transition and session-backed `/api/auth/me`
- **Page navigation:** verify header navigation links and route rendering
- **API interaction through UI:** enter J++ code in editor, click compile, assert output and error panel changes

## How to run
Once Playwright specs are added:
```bash
npx playwright test
```

For headed mode during debugging:
```bash
npx playwright test --headed
```

## Best practices used
- keep tests deterministic and isolated by resetting test user/store state
- avoid brittle selectors; prefer labels/roles/data-testid
- validate visible UI outcomes, not internal implementation details
- keep auth and compile tests independent to reduce cascading failures
