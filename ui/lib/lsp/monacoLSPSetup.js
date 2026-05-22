export const JPP_LANGUAGE_ID = 'jpp';
const LSP_WS_URL =
  process.env.NEXT_PUBLIC_LSP_WS_URL || 'ws://localhost:3001';
export function registerJppLanguage(monaco) {
  const existing = monaco.languages.getLanguages();
  if (existing.some(l => l.id === JPP_LANGUAGE_ID)) return;
  monaco.languages.register({
    id: JPP_LANGUAGE_ID,
    extensions: ['.jpp'],
    aliases: ['J++', 'jpp'],
  });
  monaco.languages.setMonarchTokensProvider(JPP_LANGUAGE_ID, {
    keywords: [
      'ye', 'bol', 'agar', 'nahi', 'jabtak', 'tak', 'break', 'continue'
    ],
    tokenizer: {
      root: [
        [/nahi agar/, 'keyword'],
        [/ke liye/,   'keyword'],
        [/\b(ye|bol|agar|nahi|jabtak|tak|break|continue)\b/, 'keyword'],
        [/"([^"\\]|\\.)*"/, 'string'],
        [/'([^'\\]|\\.)*'/, 'string'],
        [/\b\d+\b/, 'number'],
        [/\/\/.*$/,  'comment'],
        [/\/\*/,     'comment', '@comment'],
        [/[+\-*\/=<>!.]+/, 'operator'],
        [/[a-zA-Z_]\w*/, 'identifier'],
      ],
      comment: [
        [/[^/*]+/, 'comment'],
        [/\*\//,   'comment', '@pop'],
        [/[/*]/,   'comment'],
      ],
    },
  });
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
export function connectToLSP(monaco, model, onStatusChange) {
  const uri = model.uri.toString();
  let ws = null;
  let msgId = 1;
  const pending = new Map();
  const disposables = [];
  onStatusChange?.('connecting');
  function send(obj) {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(obj));
    }
  }
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
  function notify(method, params) {
    send({ jsonrpc: '2.0', method, params });
  }
  function onMessage(raw) {
    let msg;
    try { msg = JSON.parse(raw); }
    catch { return; }
    if (msg.id !== undefined && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else           resolve(msg.result);
      return;
    }
    if (msg.method === 'textDocument/publishDiagnostics') {
      const { uri: diagUri, diagnostics } = msg.params;
      if (diagUri !== uri) return;
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
      monaco.editor.setModelMarkers(model, 'jpp-lsp', markers);
    }
  }
  ws = new WebSocket(LSP_WS_URL);
  ws.onopen = async () => {
    try {
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
      notify('initialized', {});
      notify('textDocument/didOpen', {
        textDocument: {
          uri:        uri,
          languageId: JPP_LANGUAGE_ID,
          version:    1,
          text:       model.getValue(),
        },
      });
      onStatusChange?.('connected');
      let version = 2;
      const changeDisposable = model.onDidChangeContent(() => {
        notify('textDocument/didChange', {
          textDocument: { uri, version: version++ },
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
    monaco.editor.setModelMarkers(model, 'jpp-lsp', []);
    onStatusChange?.('error');
  };
  disposables.push(
    monaco.languages.registerHoverProvider(JPP_LANGUAGE_ID, {
      provideHover: async (mdl, position) => {
        if (mdl.uri.toString() !== uri) return null;
        if (ws?.readyState !== WebSocket.OPEN) return null;
        try {
          const result = await request('textDocument/hover', {
            textDocument: { uri },
            position: {
              line:      position.lineNumber - 1,  
              character: position.column     - 1,
            },
          });
          if (!result?.contents) return null;
          const value = result.contents.value ?? result.contents;
          return {
            contents: [{ value: String(value) }],
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
  return function cleanup() {
    disposables.forEach(d => {
      if (d && typeof d.dispose === 'function') d.dispose();
    });
    monaco.editor.setModelMarkers(model, 'jpp-lsp', []);
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
