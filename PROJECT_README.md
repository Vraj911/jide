# J++ Monorepo – Language, CLI, and Web IDE

This repository is an Nx monorepo that contains:

- The **J++ language compiler** under `lib/jpp/`
- A **CLI package** (`jpp`) that wraps the compiler
- A **Next.js Web IDE** for writing and running J++ in the browser
- A **NestJS backend** (MongoDB) for scalable APIs
- Docker configuration for containerized deployments

---

## 1. J++ Language Overview

Language documentation now lives in `jpp.md`.

If you want compiler internals, see `lib/jpp/README.md`.

---

## 2. Repository Layout (Nx Monorepo)

Top‑level layout:

- `apps/cli` – CLI source (`src/cli.js`, commands, errors)
- `apps/backend` – NestJS backend (REST API + MongoDB)
- `apps/ui/app` – Next.js app router (pages, API routes)
- `apps/ui/components` – React UI components (buttons, cards, editor, header, etc.)
- `apps/ui/hooks` – UI hooks (toast, theme helpers)
- `apps/ui/lib` – Monaco language configuration and UI utilities
- `lib/jpp` – Language core: lexer, parser, type checker, generator, compiler
- `bin/jpp.js` – Published CLI entry point
- `tests/ide-output.test.js` – IDE output test
- `nx.json`, `project.json` – Nx workspace + project configuration
- `Dockerfile`, `compose.yaml`, `DOCKER_README.md` – Docker build/run helpers

The Nx projects:

- **cli** – Rooted at `apps/cli` (see `project.json`)
- **backend** – Rooted at `apps/backend` (see `apps/backend/project.json`)
- **ui** – Rooted at `apps/ui/app` (see `apps/ui/project.json`)

---

## 3. Installation

From the monorepo root:

```bash
npm install
```

This installs Nx, the CLI dependencies, and the Next.js UI dependencies.

---

## 4. Running the Projects

### 4.0 Backend (NestJS + MongoDB)

The NestJS backend lives under `apps/backend` and reuses the existing compiler/LSP implementation from `lib/jpp/*`.

Prereqs:

- Node.js >= 18
- MongoDB running locally (default connection: `mongodb://localhost:27017/jide`)

Environment:

- Copy `apps/backend/.env.example` to `apps/backend/.env` and adjust values as needed.

Run dev server (from repo root):

```bash
npm install
npm run start:backend
```

By default the backend listens on `http://localhost:4000`.

Endpoints:

- `POST /compile/run`
- `POST /compile/check`
- `POST /lsp/diagnostics`
- `POST /lsp/hover`
- `POST /lsp/completions`
- `POST /lsp/symbols`
- `POST /contributions`
- `GET /contributions`
- `GET /contributions/:name`
- `POST /auth/signup`
- `POST /auth/login`

Notes:

- Auth is implemented but NOT enforced yet (all endpoints remain public).
- Code execution is currently unsafe-by-design (dynamic execution). It is wrapped in a service to allow future sandboxing.

### 4.1 Web IDE (Next.js)

Development server:

```bash
npm run start:ui
```

This delegates to `nx run ui:serve` and starts the Next.js dev server for the app under `apps/ui/app`. The IDE is available at `http://localhost:3000`.

Production build:

```bash
npm run build:ui
```

Or via Nx directly:

```bash
npx nx run ui:build
```

### 4.2 CLI (Local Development)

To run the CLI from this repo without publishing:

```bash
npm run start:cli -- --help
```

This executes `apps/cli/src/cli.js`, which wires up the commands.

For a quick smoke test:

```bash
npm test
```

---

## 5. CLI Package (Published `jpp`)

When installed globally:

```bash
npm install -g jpp
```

You get a `jpp` binary on your PATH that uses `bin/jpp.js`, which in turn calls the same compiler as the Web IDE (`lib/jpp/compiler.js`).

### CLI Commands

| Command | Description |
|---------|-------------|
| `jpp run <file.jpp>` | Compile **and execute** the program. Errors go to `stderr`; exit code `1` on failure, `0` on success. |
| `jpp check <file.jpp>` | Compile **only** for type‑checking. No execution. |
| `jpp build <file.jpp> --out <file.js>` | Emit JavaScript to the given file. |
| `jpp ast <file.jpp>` | Print the AST as pretty‑printed JSON. |
| `jpp fmt <file.jpp>` | Deterministic whitespace formatting (fails on parse errors). |

All commands exit with `0` on success and `1` on failure.

### Relation to the Web IDE

The Web IDE’s `/api/execute` endpoint uses `lib/jpp/compiler.js` under the hood. The CLI wraps the **same** compiler, so behavior is identical between browser and terminal.

---

## 6. Web IDE Features

The Next.js app under `apps/ui/app` provides a browser IDE with:

- Monaco Editor configured with the J++ language (via `apps/ui/lib/monacoConfig.js`)
- Real‑time compilation via `/api/execute`
- Error diagnostics and output panel
- Basic LSP‑style features via `/api/lsp` (diagnostics, hover, simple completions)

Key routes:

- `/` – Marketing/landing page
- `/ide` – Full IDE (editor, output, problems view)
- `/docs` – Project and language documentation
- `/contribute` – Contribution entry point
- `/auth/login`, `/auth/signup` – Auth UI shells (no backend yet)

---

## 7. Docker & Deployment

The repository includes a production‑ready Dockerfile and `compose.yaml`.

### 7.1 Local Docker Compose

```bash
docker compose up --build
```

This builds the image and starts the app; it will be available at `http://localhost:3000`.

### 7.2 Building and Pushing Images

Build a tagged image:

```bash
docker build -t myapp .
```

For a specific platform (e.g. deploy to amd64 from an Apple Silicon dev machine):

```bash
docker build --platform=linux/amd64 -t myapp .
```

Then push to your registry:

```bash
docker push myregistry.com/myapp
```

For more details, see Docker’s docs and the original notes in `DOCKER_README.md`.

---

## 8. Nx Notes

- Nx workspace layout: `appsDir: "apps"`, `libsDir: "libs"` (see `nx.json`)
- UI project: `ui` at `apps/ui/app` (see `apps/ui/project.json`)
- CLI project: `cli` at `apps/cli` (see root `project.json`)

You can run the same commands via Nx directly, for example:

```bash
npx nx run ui:serve
npx nx run ui:build
npx nx run cli:serve
```

---

## 9. Troubleshooting

### Next.js can’t find the app directory

- Ensure you are in the repo root
- Verify `apps/ui/app` exists and contains `layout.js` and `page.js`
- Confirm `apps/ui/app/next.config.js` is present

### LSP not working

- Check that `lib/jpp/lsp.js` exists
- Verify the `/api/lsp` endpoint under `apps/ui/app/api/lsp/route.js`

### Compiler tests

- Run the compiler’s own tests via:

```bash
node lib/jpp/tests.js
```

---

## 10. License

MIT © 2026 Vraj Shah
