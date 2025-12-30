# J++ IDE (jide)

A modern, web-based IDE and documentation site for **J++** — a small, opinionated programming language that fixes JavaScript's implicit coercion problems by separating numeric addition (`+`) from string concatenation (`.`) and enforcing strict typing semantics.

This repository contains:
- A Next.js 14 website (App Router) with an interactive IDE, docs, and auth pages
- A J++ compiler implemented in JavaScript under `lib/jpp/`
- Monaco Editor integration and syntax/theme definitions in `lib/monacoConfig.js`
- API endpoint to compile & execute J++ code server-side (`/api/execute`)

---

## Quick Project Summary (for LLMs / indexers) ✅

- name: jpp-ide
- language: JavaScript (ESM + Next.js)
- framework: Next.js 14 (App Router)
- editor: Monaco Editor with custom language support (`jpp`)
- compiler: `lib/jpp` (lexer, parser, type checker, generator, compiler pipeline)
- key API: `POST /api/execute` - accepts `{ code: string }`, returns `{ success, code, output, ast, errors }`
- main entrypoints: `app/` (UI), `lib/jpp/compiler.js` (compile API), `lib/monacoConfig.js` (syntax & theme)
- tests: `tests/ide-output.test.js`, Postman collection `postman_jide_collection.json`

---

## J++ Language Overview 🧩

Purpose: J++ improves predictability by eliminating implicit coercion between strings and numbers.

Key features:
- `+` is numeric addition ONLY (operates on numbers)
- `.` is string concatenation ONLY (operates on strings)
- Variables are statically typed/inferred at compile time (no implicit conversions)
- Minimal syntax inspired by simplified scripting languages

Examples:

```jpp
// Numbers
ye a = 5
ye b = 10
ye sum = a + b
bol sum // 15

// Strings
ye s1 = "hello"
ye s2 = "world"
ye s3 = s1 . s2
bol s3 // "helloworld"

// Invalid: mixing operators and types
ye x = 5
ye y = "10"
bol x + y // COMPILE ERROR ('+' requires numeric operands)
```

Keywords (non-exhaustive): `ye`, `bol`, `agar`, `nahi`, `jabtak`, `ke liye`, `tak`, `break`, `continue` (see `lib/monacoConfig.js` for the full list used by Monaco).

---

## Compiler Architecture & Files 🔧

The compiler follows a standard pipeline:

1. Lexer (`lib/jpp/lexer.js`) - tokenizes input (handles string literals, numbers, identifiers, the `.` operator, etc.)
2. Parser (`lib/jpp/parser.js`) - builds an AST with proper operator precedence (note: `.` is string concatenation and has its own precedence)
3. TypeChecker (`lib/jpp/typeChecker.js`) - enforces strict typing rules (no implicit coercion)
4. Generator (`lib/jpp/generator.js`) - converts AST to JavaScript code (safe, explicit operations)
5. Compiler entry (`lib/jpp/compiler.js`) - orchestrates the pipeline and returns a structured result

Typical compile result shape (used by `/api/execute`):

```json
{
  "success": true,
  "code": "// generated JS code",
  "ast": { /* AST object */ },
  "errors": []
}
```

Common files:
- `lib/jpp/lexer.js`
- `lib/jpp/parser.js`
- `lib/jpp/typeChecker.js`
- `lib/jpp/generator.js`
- `lib/jpp/compiler.js`
- `lib/jpp/tests.js` (unit tests / examples)

Future compiler goals: explicit type annotations, richer type inference, arrays/objects, more operators, improved diagnostics and source maps.

---

## IDE Features (what the site provides) 💻

The web IDE aims to be a compact, modern experience with the following features:

- Monaco-based editor with `jpp` language syntax highlighting and themes (dark & light)
- File / project workspace (single-file for now, expandable to multi-file)
- Run & evaluate: compile J++ code via `/api/execute` and show runtime output (console capture)
- Error diagnostics: show compiler errors and AST info inline and in a side panel
- Code examples / snippets and documentation panel
- Theming and editor settings (font, theme toggle)
- Authentication pages (`/auth/login`, `/auth/signup`) for user sessions
- Docs page (`/docs`) to explain J++ and the IDE features
- 3D background visuals via Three.js for visual polish

UX notes:
- The server attempts to load the compiler module; if it fails, `/api/execute` returns a helpful server error.
- Execution is sandboxed by constructing a new Function from generated JS; errors are captured and returned in `errors`.

---

## API: /api/execute 📡

Endpoint: `POST /api/execute`
Body: `{ code: string }`
Response: `{ success: boolean, code: string|null, output: string|null, ast: object|null, errors: array }`

Behavior:
- Validates request body
- Calls the compiled `lib/jpp/compiler.js`
- If compilation failed, returns `success: false` with compiler errors
- If compilation succeeded, executes the generated JavaScript and captures console output

Security note: Execution uses `new Function(...)` in the server process - keep this isolated and limit runtime capabilities for production use.

---

## Development & Local Setup 🔨

Requirements:
- Node.js 18+
- npm / pnpm / yarn

Setup & run:

```bash
# install deps
npm install

# run (dev)
npm run dev
# opens at http://localhost:3000

# run tests
npm run test:ui     # minimal UI tests
npm run test:api    # uses Newman to run postman_jide_collection.json
```

Scripts (from `package.json`):
- `dev` — start Next.js in dev mode
- `build` — build for production
- `start` — start production server
- `test:api` — run Postman collection against running server
- `test:ui` — run simple node-based UI checks

---

## Editor / Language Integration Notes 📝

- Monaco language id: `jpp` (see `lib/monacoConfig.js`)
- Theme rules and tokenization are defined in `lib/monacoConfig.js`
- Keywords and operators are intentionally minimal and are curated to match the compiler's tokenizer

---

## Testing & CI ✅

- Unit tests for the compiler are in `lib/jpp/tests.js`
- API integration tests: Postman collection `postman_jide_collection.json` (run with `newman` via `npm run test:api`)
- UI tests: `tests/ide-output.test.js` (lightweight smoke tests)

---

## Contributing & Roadmap 🚀

Contributions welcome. Suggested next items:
- Connect compiler to IDE for live diagnostics and linting
- Add multi-file projects and module system
- Add explicit type annotations and better error messages
- Add sandboxed execution (isolated worker / microservice)
- Enhance Monaco language with hover docs and completions

How to contribute:
1. Fork the repo
2. Create a feature branch
3. Add tests for new behavior in `lib/jpp/tests.js`
4. Open a PR with a clear description and link to failing tests (if any)

**Contributor hub:** Visit the in-app contributor hub at `/contribute` for step-by-step setup, templates, the code of conduct, and quick links to docs and issue templates. You can also submit issues, examples, and small patches directly from the site (no GitHub workflow required).

---

## License & Contact

- License: MIT
- Author / maintainer: (You can add your name or contact here)

---

## Example: Minimal workflow

1. Open the IDE at `/ide`
2. Paste this sample code and press Run:

```jpp
ye a = 10
ye b = 32
ye c = a + b
bol c
```

3. The IDE sends code to `POST /api/execute` → compiler runs → generated JS is executed → console output appears in the UI.

---

If you'd like, I can also generate a short machine-readable metadata file (e.g., `project.json` or `README.metadata.md`) that summarizes the repo for automatic LLM ingestion. Would you like that? 💡

