# J++ – A Tiny Compiled Language

J++ is a small, statically‑typed language that compiles to JavaScript. The core compiler lives in `lib/jpp/` and is used by the web IDE. This package adds a **CLI** for local development while keeping the compiler untouched.

## Installation

```bash
npm install -g jpp
```

## CLI Usage

| Command | Description |
|---------|-------------|
| `jpp run <file.jpp>` | Compile **and execute** the program. Errors are printed to `stderr`; exit code `1` on failure, `0` on success. |
| `jpp check <file.jpp>` | Compile **only** for type‑checking. No execution. |
| `jpp build <file.jpp> --out <file.js>` | Emit JavaScript to the given file. |
| `jpp ast <file.jpp>` | Print the AST as pretty‑printed JSON. |
| `jpp fmt <file.jpp>` | Deterministic whitespace formatting (fails on parse errors). |

All commands exit with `0` on success and `1` on failure.

## Relation to the Web IDE

The web IDE (`/api/execute`) already uses the same `lib/jpp/compiler.js`. The CLI simply re‑exports that black‑box compiler, so behavior is **identical** between the IDE and the command line.

## License

MIT © 2026 Your Name
