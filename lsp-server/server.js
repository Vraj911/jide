'use strict';
const { WebSocketServer } = require('ws');
const { analyze } = require('./analysis');
const { getHover } = require('./hover');
const { getCompletions } = require('./completion');
const { getDefinition } = require('./definition');
const { getSymbols } = require('./symbols');
const PORT = process.env.PORT || process.env.LSP_PORT || 3001;
const wss = new WebSocketServer({ port: PORT });
console.log(`[J++ LSP] WebSocket server listening on ws://localhost:${PORT}`);
wss.on('connection', (ws, req) => {
  console.log('[J++ LSP] Client connected:', req.socket.remoteAddress);
  const documents = new Map();
  const debounceTimers = new Map();
  function send(obj) {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(obj));
  }
  function respond(id, result) {
    send({ jsonrpc: '2.0', id, result });
  }
  function respondError(id, code, message) {
    send({ jsonrpc: '2.0', id, error: { code, message } });
  }
  function notify(method, params) {
    send({ jsonrpc: '2.0', method, params });
  }
  function scheduleDiagnostics(uri, text) {
    if (debounceTimers.has(uri)) clearTimeout(debounceTimers.get(uri));
    debounceTimers.set(
      uri,
      setTimeout(() => {
        const result = analyze(text);
        const diagnostics = result.errors.map((e) => ({
          range: {
            start: { line: Math.max(0, e.line - 1), character: Math.max(0, e.col - 1) },
            end: { line: Math.max(0, e.line - 1), character: Math.max(0, e.endCol - 1) }
          },
          severity: 1,
          message: e.message,
          source: 'J++'
        }));
        notify('textDocument/publishDiagnostics', { uri, diagnostics });
      }, 250)
    );
  }
  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }
    const { id, method, params } = msg;
    switch (method) {
      case 'initialize':
        respond(id, {
          capabilities: {
            textDocumentSync: { openClose: true, change: 1 },
            hoverProvider: true,
            completionProvider: { triggerCharacters: [' ', '\n'], resolveProvider: false },
            definitionProvider: true,
            documentSymbolProvider: true
          },
          serverInfo: { name: 'J++ Language Server', version: '1.0.0' }
        });
        break;
      case 'initialized':
        break;
      case 'shutdown':
        respond(id, null);
        break;
      case 'exit':
        ws.close();
        break;
      case 'textDocument/didOpen': {
        const { textDocument } = params;
        documents.set(textDocument.uri, { text: textDocument.text, version: textDocument.version });
        scheduleDiagnostics(textDocument.uri, textDocument.text);
        break;
      }
      case 'textDocument/didChange': {
        const { textDocument, contentChanges } = params;
        const text = contentChanges[0]?.text || '';
        documents.set(textDocument.uri, { text, version: textDocument.version });
        scheduleDiagnostics(textDocument.uri, text);
        break;
      }
      case 'textDocument/didClose': {
        const uri = params.textDocument.uri;
        documents.delete(uri);
        if (debounceTimers.has(uri)) {
          clearTimeout(debounceTimers.get(uri));
          debounceTimers.delete(uri);
        }
        notify('textDocument/publishDiagnostics', { uri, diagnostics: [] });
        break;
      }
      case 'textDocument/hover': {
        const uri = params.textDocument.uri;
        const doc = documents.get(uri);
        if (!doc) {
          respond(id, null);
          break;
        }
        const line = params.position.line + 1;
        const col = params.position.character + 1;
        const result = analyze(doc.text);
        const hover = getHover(line, col, result.tokens, result.typeChecker);
        if (!hover) {
          respond(id, null);
          break;
        }
        respond(id, {
          contents: { kind: 'markdown', value: hover.content },
          range: {
            start: { line: hover.range.line - 1, character: hover.range.col - 1 },
            end: { line: hover.range.line - 1, character: hover.range.endCol - 1 }
          }
        });
        break;
      }
      case 'textDocument/completion': {
        const uri = params.textDocument.uri;
        const doc = documents.get(uri);
        if (!doc) {
          respond(id, { items: [] });
          break;
        }
        const line = params.position.line + 1;
        const col = params.position.character + 1;
        const result = analyze(doc.text);
        const rawItems = getCompletions(line, col, result.tokens, result.typeChecker);
        const items = rawItems.map((item, i) => ({
          label: item.label,
          kind: item.kind === 'keyword' ? 14 : 6,
          detail: item.detail,
          documentation: { kind: 'markdown', value: item.documentation || '' },
          sortText: String(i).padStart(5, '0')
        }));
        respond(id, { items, isIncomplete: false });
        break;
      }
      case 'textDocument/definition': {
        const uri = params.textDocument.uri;
        const doc = documents.get(uri);
        if (!doc) {
          respond(id, null);
          break;
        }
        const line = params.position.line + 1;
        const col = params.position.character + 1;
        const result = analyze(doc.text);
        const def = getDefinition(line, col, result.tokens, result.ast);
        if (!def) {
          respond(id, null);
          break;
        }
        respond(id, {
          uri,
          range: {
            start: { line: def.line - 1, character: def.col - 1 },
            end: { line: def.line - 1, character: def.endCol - 1 }
          }
        });
        break;
      }
      case 'textDocument/documentSymbol': {
        const uri = params.textDocument.uri;
        const doc = documents.get(uri);
        if (!doc) {
          respond(id, []);
          break;
        }
        const result = analyze(doc.text);
        const rawSymbols = getSymbols(result.ast, result.typeChecker);
        const symbols = rawSymbols.map((s) => ({
          name: s.name,
          detail: s.type,
          kind: 13,
          range: {
            start: { line: s.line - 1, character: s.col - 1 },
            end: { line: s.line - 1, character: s.endCol - 1 }
          },
          selectionRange: {
            start: { line: s.line - 1, character: s.col - 1 },
            end: { line: s.line - 1, character: s.endCol - 1 }
          }
        }));
        respond(id, symbols);
        break;
      }
      default:
        if (id !== undefined) respondError(id, -32601, `Method not found: ${method}`);
    }
  });
  ws.on('close', () => {
    console.log('[J++ LSP] Client disconnected');
    debounceTimers.forEach((t) => clearTimeout(t));
  });
  ws.on('error', (err) => {
    console.error('[J++ LSP] Error:', err.message);
  });
});
