# Contributing to J++ IDE (jide)

Thanks for your interest in contributing to J++! This document gives an overview of common contribution types and explains how to get your development environment ready.

## Getting started

1. Fork the repository and create a branch: `git checkout -b feat/some-feature`
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev` (site runs at http://localhost:3000)
4. Run tests: `npm run test:ui` and `npm run test:api` (ensure Postman/newman tests have an active server)

## Local development (quick)

- The IDE runs in `app/ide`, docs live in `app/docs` and the J++ compiler lives under `lib/jpp/`.
- To run compiler tests: `node lib/jpp/tests.js` (or add tests to the file and run the project's test script)

## Contribution types

- Bug fixes — small, self-contained patches
- Features — ideally with tests and docs
- Docs — clarifications, tutorials, examples
- Examples — add small example programs demonstrating J++ features

## Contribute from the website

If you prefer not to interact with GitHub, you can submit contributions directly from the website at `/contribute`:

- Report an issue using the in-app form
- Submit runnable examples (the site will attempt to compile them)
- Propose small patches or code snippets

Submissions are stored in the `contributions/` folder in JSON format and will be reviewed by maintainers. Do not post secrets or private keys; include an email if you want a follow-up (optional).
## Workflow

- Keep changes minimal and focused per PR
- Add tests for bug fixes or new behavior
- Use descriptive commit messages
- Rebase or merge the latest `main` before opening a PR

## Code style & testing

- Use existing patterns in `lib/jpp` and the `app/` components
- Add tests when fixing or extending behavior

## Submitting a PR

1. Open a Pull Request (PR) describing the change and why it matters
2. Link to any failing tests or sample inputs
3. Use the PR template and fill the checklist

## Communication

If the project is large it may maintain a discussion forum or chat — see the `CONTRIBUTING` hub at `/contribute` for any available links.

---

Thanks — your contributions help J++ get better for everyone! 🎉
