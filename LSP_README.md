# J++ LSP Integration README

This repository now includes a real Language Server Protocol setup for J++ that can be consumed by the Next.js web editor over WebSocket.

## What Was Implemented

### 1) Compiler pipeline updated with source positions

- Added line/column tracking in `lib/jpp/lexer.js` for all emitted tokens.
- Updated parser nodes in `lib/jpp/parser.js` to carry positional metadata:
  - `Declaration`
  - `Assignment`
  - `Identifier`, `Number`, `String` expression nodes
  - `ForStatement` + loop-variable position fields
- Updated type checker in `lib/jpp/typeChecker.js`:
  - Symbol table now stores `{ type, line, col }`
  - Errors include `line` and `col` where possible
  - `getVariableInfo()` returns full metadata
  - `getVariables()` remains compatible for completion lookup
- Updated compiler exports in `lib/jpp/compiler.js`:
  - Added `typeCheck` export for LSP reuse
  - Kept CommonJS backward compatibility (`require(...)` still works as function)
  - Type-check calls now forward node positions

### 2) Standalone LSP WebSocket server package

Created a separate runtime under `lsp-server/`:

- `lsp-server/package.json` — standalone package with `ws`
- `lsp-server/server.js` — JSON-RPC 2.0 + LSP server over WebSocket
- `lsp-server/analysis.js` — shared compiler analysis pipeline
- `lsp-server/hover.js` — keyword/operator/identifier hover content
- `lsp-server/completion.js` — keyword + in-scope variable completion
- `lsp-server/definition.js` — go-to-definition from identifier usage
- `lsp-server/symbols.js` — document symbol generation

Implemented LSP methods:

- `initialize`, `shutdown`, `exit`
- `textDocument/didOpen`, `didChange`, `didClose`
- `textDocument/hover`
- `textDocument/completion`
- `textDocument/definition`
- `textDocument/documentSymbol`
- `textDocument/publishDiagnostics` notifications (debounced)

### 3) Next.js Monaco client wiring (web editor)

Integrated Monaco client-side LSP bridge in UI app:

- Added `apps/ui/lib/lsp/monacoLSPSetup.js`
  - WebSocket connection to LSP server using `NEXT_PUBLIC_LSP_WS_URL`
  - Monaco Language Client startup
  - Connection status callbacks
- Updated `apps/ui/components/Editor.jsx`
  - Establishes model URI `file:///workspace/main.jpp`
  - Connects to LSP for editable J++ documents
  - Emits Monaco diagnostics markers back to page state
- Updated `apps/ui/app/ide/page.js`
  - Added LSP status indicator (`connecting`, `connected`, `error`)
  - Added live LSP diagnostics display in Problems panel
- Updated `apps/ui/next.config.js`
  - Webpack externals for Monaco/LSP server-side bundling issues
  - permissive CORS header for local dev compatibility

### 4) Scripts and environment support

- Updated root `package.json` scripts:
  - `dev` now runs UI + LSP together via `concurrently`
  - `dev:lsp` added for standalone LSP process
- Added `apps/ui/.env.local.example`:
  - `NEXT_PUBLIC_LSP_WS_URL=ws://localhost:3001`
- Installed `ws` in `lsp-server`.

## Dependency Changes

### Root

- Added dev dependency: `concurrently`

### UI App (`apps/ui/package.json`)

- Added:
  - `monaco-editor`
  - `monaco-languageclient`
  - `vscode-languageclient`
  - `vscode-ws-jsonrpc`
  - `@codingame/monaco-vscode-api`

## Run Instructions

1. Install dependencies:
   - root workspace: `npm install`
   - LSP package: `npm --prefix lsp-server install`
2. Configure env for UI (`apps/ui/.env.local`):
   - `NEXT_PUBLIC_LSP_WS_URL=ws://localhost:3001`
3. Start everything:
   - from repo root: `npm run dev`
4. Open editor:
   - `http://localhost:3000/ide`

## Deployed Setup

- Deploy `lsp-server` on a WebSocket-capable host (Railway/Render).
- Set UI env var:
  - `NEXT_PUBLIC_LSP_WS_URL=wss://<your-lsp-host>`
- Deploy Next.js app and verify WS connection in browser DevTools.

## Notes

- This implementation reuses the same compiler/type checker pipeline for diagnostics and language intelligence.
- Position conversion is handled at the LSP transport layer (compiler is 1-indexed; LSP protocol is 0-indexed).
