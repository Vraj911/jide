// apps/ui/lib/lsp/monacoLSPSetup.js
// Manual LSP <-> Monaco bridge.
// No monaco-languageclient or any external LSP library.
// Speaks plain JSON-RPC 2.0 over WebSocket directly.
// This file only runs in the browser (called from Editor.jsx).

export const JPP_LANGUAGE_ID = 'jpp';

const LSP_WS_URL =
  process.env.NEXT_PUBLIC_LSP_WS_URL || 'ws://localhost:3001';

// ----------------------------------------------------------------
// registerJppLanguage
// Call once before creating any Monaco editor instance.
// Registers the J++ language ID, syntax tokenizer, and bracket config.
// ----------------------------------------------------------------
export function registerJppLanguage(monaco) {
  // Prevent double registration
  const existing = monaco.languages.getLanguages();
  if (existing.some(l => l.id === JPP_LANGUAGE_ID)) return;

  monaco.languages.register({
    id: JPP_LANGUAGE_ID,
    extensions: ['.jpp'],
    aliases: ['J++', 'jpp'],
  });

  // Monarch syntax tokenizer
  // Gives keyword/string/number/comment colouring before LSP responds
  monaco.languages.setMonarchTokensProvider(JPP_LANGUAGE_ID, {
    keywords: [
      'ye', 'bol', 'agar', 'nahi', 'jabtak', 'tak', 'break', 'continue'
    ],
    tokenizer: {
      root: [
        // Multi-word keywords must be checked first
        [/nahi agar/, 'keyword'],
        [/ke liye/,   'keyword'],
        // Single-word keywords
        [/\b(ye|bol|agar|nahi|jabtak|tak|break|continue)\b/, 'keyword'],
        // Strings
        [/"([^"\\]|\\.)*"/, 'string'],
        [/'([^'\\]|\\.)*'/, 'string'],
        // Numbers
        [/\b\d+\b/, 'number'],
        // Comments
        [/\/\/.*$/,  'comment'],
        [/\/\*/,     'comment', '@comment'],
        // Operators
        [/[+\-*\/=<>!.]+/, 'operator'],
        // Identifiers
        [/[a-zA-Z_]\w*/, 'identifier'],
      ],
      comment: [
        [/[^/*]+/, 'comment'],
        [/\*\//,   'comment', '@pop'],
        [/[/*]/,   'comment'],
      ],
    },
  });

  // Bracket/autoclosing config
  monaco.languages.setLanguageConfiguration(JPP_LANGUAGE_ID, {
    comments: {
      lineComment:  '//',
      blockComment: ['/*', '*/'],
    },
    brackets: [['{', '}'], ['(', ')']],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '(', close: ')' },
      { open: '"', close: '"', notIn: ['string'] },
      { open: "'", close: "'", notIn: ['string'] },
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
  });
}

// ----------------------------------------------------------------
// connectToLSP
// Call after the Monaco editor has mounted and a model exists.
//
// Parameters:
//   monaco          — the monaco namespace object
//   model           — the Monaco ITextModel for the J++ document
//   onStatusChange  — optional callback(status: string)
//                     called with 'connecting', 'connected', 'error'
//
// Returns a cleanup function. Call it when the editor unmounts.
// ----------------------------------------------------------------
export function connectToLSP(monaco, model, onStatusChange) {
  const uri = model.uri.toString();
  let ws = null;
  let msgId = 1;

  // pending: Map of id -> { resolve, reject }
  // Used to match server responses to our requests
  const pending = new Map();

  // disposables: array of Monaco provider disposables + model listeners
  // All disposed in cleanup()
  const disposables = [];

  onStatusChange?.('connecting');

  // ---- Core send helpers ----

  function send(obj) {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(obj));
    }
  }

  // request: send a JSON-RPC request, return Promise that resolves
  // with result or rejects with error. Times out after 5 seconds.
  function request(method, params) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pending.set(id, { resolve, reject });

      send({ jsonrpc: '2.0', id, method, params });

      setTimeout(() => {
        if (pending.has(id)) {
          pending.delete(id);
          reject(new Error(`LSP timeout: ${method}`));
        }
      }, 5000);
    });
  }

  // notify: send a JSON-RPC notification (no id, no response expected)
  function notify(method, params) {
    send({ jsonrpc: '2.0', method, params });
  }

  // ---- Message handler ----

  function onMessage(raw) {
    let msg;
    try { msg = JSON.parse(raw); }
    catch { return; }

    // Server response to one of our requests
    if (msg.id !== undefined && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else           resolve(msg.result);
      return;
    }

    // Server-pushed notification (no id)
    if (msg.method === 'textDocument/publishDiagnostics') {
      const { uri: diagUri, diagnostics } = msg.params;

      // Only process diagnostics for this document
      if (diagUri !== uri) return;

      // Convert LSP diagnostic format to Monaco marker format.
      // LSP uses 0-indexed positions, Monaco uses 1-indexed.
      const markers = diagnostics.map(d => ({
        severity:        d.severity === 1
                           ? monaco.MarkerSeverity.Error
                           : monaco.MarkerSeverity.Warning,
        message:         d.message,
        source:          d.source || 'J++',
        startLineNumber: d.range.start.line      + 1,
        startColumn:     d.range.start.character + 1,
        endLineNumber:   d.range.end.line        + 1,
        endColumn:       d.range.end.character   + 1,
      }));

      // setModelMarkers renders the squiggles in Monaco
      monaco.editor.setModelMarkers(model, 'jpp-lsp', markers);
    }
  }

  // ---- WebSocket setup ----

  ws = new WebSocket(LSP_WS_URL);

  ws.onopen = async () => {
    try {
      // Step 1: send initialize request with our capabilities
      await request('initialize', {
        processId: null,
        rootUri:   null,
        capabilities: {
          textDocument: {
            hover: {
              contentFormat: ['markdown', 'plaintext'],
            },
            completion: {
              completionItem: {
                documentationFormat: ['markdown', 'plaintext'],
              },
            },
            definition: {},
            documentSymbol: {},
          },
        },
      });

      // Step 2: send initialized notification (required by LSP spec)
      notify('initialized', {});

      // Step 3: tell server this document is now open
      notify('textDocument/didOpen', {
        textDocument: {
          uri:        uri,
          languageId: JPP_LANGUAGE_ID,
          version:    1,
          text:       model.getValue(),
        },
      });

      onStatusChange?.('connected');

      // Step 4: send content changes to server on every edit
      let version = 2;
      const changeDisposable = model.onDidChangeContent(() => {
        notify('textDocument/didChange', {
          textDocument: { uri, version: version++ },
          // Full sync: send entire content on every change
          contentChanges: [{ text: model.getValue() }],
        });
      });
      disposables.push(changeDisposable);

    } catch (err) {
      console.error('[J++ LSP] Initialization failed:', err);
      onStatusChange?.('error');
    }
  };

  ws.onmessage = (event) => onMessage(event.data);

  ws.onerror = (err) => {
    console.error('[J++ LSP] WebSocket error:', err);
    onStatusChange?.('error');
  };

  ws.onclose = () => {
    // Clear squiggles when connection drops
    monaco.editor.setModelMarkers(model, 'jpp-lsp', []);
    onStatusChange?.('error');
  };

  // ---- Register Monaco intelligence providers ----

  // HOVER PROVIDER
  // Monaco calls this when user hovers over a token.
  // We forward to LSP server and return the result.
  disposables.push(
    monaco.languages.registerHoverProvider(JPP_LANGUAGE_ID, {
      provideHover: async (mdl, position) => {
        // Only respond for our specific document
        if (mdl.uri.toString() !== uri) return null;
        if (ws?.readyState !== WebSocket.OPEN) return null;

        try {
          const result = await request('textDocument/hover', {
            textDocument: { uri },
            position: {
              line:      position.lineNumber - 1,  // Monaco 1-indexed → LSP 0-indexed
              character: position.column     - 1,
            },
          });

          if (!result?.contents) return null;

          // contents can be { kind, value } or a plain string
          const value = result.contents.value ?? result.contents;

          return {
            contents: [{ value: String(value) }],
            // Highlight the token span while hover is showing
            range: result.range ? {
              startLineNumber: result.range.start.line      + 1,
              startColumn:     result.range.start.character + 1,
              endLineNumber:   result.range.end.line        + 1,
              endColumn:       result.range.end.character   + 1,
            } : undefined,
          };
        } catch {
          return null;
        }
      },
    })
  );

  // COMPLETION PROVIDER
  // Monaco calls this on Ctrl+Space or trigger characters.
  disposables.push(
    monaco.languages.registerCompletionItemProvider(JPP_LANGUAGE_ID, {
      triggerCharacters: [' '],
      provideCompletionItems: async (mdl, position) => {
        if (mdl.uri.toString() !== uri) return { suggestions: [] };
        if (ws?.readyState !== WebSocket.OPEN) return { suggestions: [] };

        try {
          const result = await request('textDocument/completion', {
            textDocument: { uri },
            position: {
              line:      position.lineNumber - 1,
              character: position.column     - 1,
            },
          });

          const items = (result?.items || []).map(item => {
            // LSP kind 14 = Keyword, 6 = Variable
            const kind = item.kind === 14
              ? monaco.languages.CompletionItemKind.Keyword
              : monaco.languages.CompletionItemKind.Variable;

            const documentation = item.documentation
              ? {
                  value: item.documentation.value
                      ?? item.documentation
                      ?? '',
                }
              : undefined;

            return {
              label:         item.label,
              kind,
              detail:        item.detail || '',
              documentation,
              insertText:    item.insertText || item.label,
              // Range: replace from cursor position
              range: {
                startLineNumber: position.lineNumber,
                startColumn:     position.column,
                endLineNumber:   position.lineNumber,
                endColumn:       position.column,
              },
            };
          });

          return { suggestions: items };
        } catch {
          return { suggestions: [] };
        }
      },
    })
  );

  // DEFINITION PROVIDER
  // Monaco calls this when user presses F12 or Ctrl+Click.
  disposables.push(
    monaco.languages.registerDefinitionProvider(JPP_LANGUAGE_ID, {
      provideDefinition: async (mdl, position) => {
        if (mdl.uri.toString() !== uri) return null;
        if (ws?.readyState !== WebSocket.OPEN) return null;

        try {
          const result = await request('textDocument/definition', {
            textDocument: { uri },
            position: {
              line:      position.lineNumber - 1,
              character: position.column     - 1,
            },
          });

          if (!result?.range) return null;

          return {
            uri:   monaco.Uri.parse(result.uri || uri),
            range: {
              startLineNumber: result.range.start.line      + 1,
              startColumn:     result.range.start.character + 1,
              endLineNumber:   result.range.end.line        + 1,
              endColumn:       result.range.end.character   + 1,
            },
          };
        } catch {
          return null;
        }
      },
    })
  );

  // ---- Cleanup function ----
  // Call this when the editor component unmounts.
  // Disposes all Monaco providers, closes WebSocket cleanly.
  return function cleanup() {
    // Dispose all Monaco provider registrations and model listeners
    disposables.forEach(d => {
      if (d && typeof d.dispose === 'function') d.dispose();
    });

    // Clear any squiggles
    monaco.editor.setModelMarkers(model, 'jpp-lsp', []);

    // Tell server we closed the document, then shutdown
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        notify('textDocument/didClose', { textDocument: { uri } });
        request('shutdown', {}).finally(() => {
          notify('exit', {});
          ws.close();
        });
      } catch {
        ws.close();
      }
    }
  };
}
