J++ LSP SERVER — COMPLETE REFERENCE
=====================================
Read this top to bottom once. By the end you will understand what LSP
is, why it exists, how the protocol works, and exactly what every line
of your implementation does.


================================================================
PART 1 — WHAT IS LSP AND WHY DOES IT EXIST
================================================================

Before LSP, every editor had to write its own plugin for every language.
VS Code wanted Python support? Someone writes a VS Code Python plugin.
Vim wanted Python support? Someone writes a different Vim Python plugin.
That is M languages times N editors = a lot of duplicated work.

LSP (Language Server Protocol) was invented by Microsoft in 2016.
The idea: write one "language server" per language, and every editor
that supports LSP gets all the features for free.

M languages + N editors = M + N integrations instead of M * N.

A language server is just a Node process (or any process) that:
  - talks JSON over a connection (WebSocket, stdio, etc.)
  - receives questions from the editor ("what is at line 3 col 5?")
  - responds with answers ("it is a variable of type number")

The editor is called the CLIENT.
Your server is called the LANGUAGE SERVER.

The protocol between them is called JSON-RPC 2.0.


================================================================
PART 2 — WHAT IS JSON-RPC 2.0
================================================================

JSON-RPC is just a convention for sending JSON messages.
Every message is a plain JSON object. There are three kinds:

KIND 1 — REQUEST (client asks, expects an answer)
  Sent by client:
    { "jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {...} }
  Server must respond:
    { "jsonrpc": "2.0", "id": 1, "result": {...} }
  The id ties the response to the request. Can be any number.

KIND 2 — NOTIFICATION (fire and forget, no response expected)
  Sent by either side:
    { "jsonrpc": "2.0", "method": "initialized", "params": {} }
  No id field. No response sent back. Ever.

KIND 3 — ERROR RESPONSE (when something goes wrong)
  Server sends:
    { "jsonrpc": "2.0", "id": 1, "error": { "code": -32601, "message": "Method not found" } }

That is the entire protocol. LSP is just a defined set of method names
on top of JSON-RPC. Things like "textDocument/hover" or
"textDocument/publishDiagnostics" are just agreed-upon method names.


================================================================
PART 3 — HOW LSP WORKS IN PRACTICE (THE LIFECYCLE)
================================================================

Step 1 — INITIALIZE
  Client sends "initialize" request with its capabilities.
  Server responds with its own capabilities (what features it supports).
  This is the handshake. Nothing else works until this happens.

Step 2 — INITIALIZED
  Client sends "initialized" notification (no id, no response).
  This tells the server "ok handshake done, we can start working."

Step 3 — DOCUMENT SYNC
  Whenever the user opens, edits, or closes a file, the client
  notifies the server. The server keeps an in-memory copy of every
  open document. It uses this copy to answer hover/completion/etc.

  textDocument/didOpen   — user opened a file
  textDocument/didChange — user typed something
  textDocument/didClose  — user closed the file

  We use "Full" sync (change: 1 in capabilities). This means on every
  edit, the client sends the ENTIRE file content. Simpler than
  incremental sync which sends only the changed range.

Step 4 — DIAGNOSTICS (pushed, not requested)
  After every didOpen or didChange, the server runs the compiler and
  pushes errors back via "textDocument/publishDiagnostics" notification.
  The CLIENT did not ask for this. The server just sends it.
  This is the only LSP feature that is server-initiated.

Step 5 — INTELLIGENCE FEATURES (requested by client)
  When the user hovers, the client sends "textDocument/hover" request.
  When the user presses Ctrl+Space, client sends "textDocument/completion".
  When the user presses F12, client sends "textDocument/definition".
  Server responds with the data, editor renders it.

Step 6 — SHUTDOWN
  Client sends "shutdown" request. Server responds null.
  Client sends "exit" notification. Server closes connection.


================================================================
PART 4 — ONE CRITICAL DETAIL: POSITION INDEXING
================================================================

The LSP protocol uses 0-indexed line and character positions.
Line 1 in the editor = line 0 in LSP. Column 1 = character 0.

Your J++ compiler uses 1-indexed positions.
The lexer numbers lines starting from 1, columns starting from 1.
This is natural for error messages ("error at line 3").

The conversion happens at the transport boundary in server.js:
  - When RECEIVING a position from the client: add 1 before passing to compiler
      line = params.position.line + 1
      col  = params.position.character + 1
  - When SENDING a position to the client: subtract 1
      { line: token.line - 1, character: token.col - 1 }

The compiler never sees 0-indexed values. Good.


================================================================
PART 5 — YOUR FILE STRUCTURE
================================================================

lsp-server/
  server.js      The WebSocket server. Speaks JSON-RPC. Routes all
                 LSP method calls to the right module.
  analysis.js    Runs the full J++ compiler pipeline on source code.
                 Returns tokens, AST, typeChecker, and errors.
                 Every other module calls this.
  hover.js       Given cursor position, returns hover popup content.
  completion.js  Returns autocomplete suggestions.
  definition.js  Returns the location of a variable's declaration.
  symbols.js     Returns all named variables in the document.
  package.json   Standalone package. Only dependency is "ws".

The compiler files (lexer, parser, typeChecker, compiler) live in
lib/jpp/ in the main repo. lsp-server imports them with relative paths:
  require('../lib/jpp/lexer')
  require('../lib/jpp/compiler')
etc.

This means the compiler lives in one place. Both the web editor
(via Next.js API route) and the LSP server use the same code.
No duplication.


================================================================
PART 6 — analysis.js LINE BY LINE
================================================================

This is the most important file. Every LSP feature runs the compiler
first and then does its specific job on the result.

  const { typeCheck } = require('../lib/jpp/compiler');

compiler.js exports two things: compileJPlusPlus (the full pipeline
that generates JS) and typeCheck (just the type checking step).
We only need typeCheck here because we don't want to generate JS,
we just want to find errors and populate the symbol table.

  function analyze(sourceCode) {

Takes raw J++ source as a string. Returns an object with four fields:
  - tokens:      array of tokens from the lexer (with line + col)
  - ast:         the parsed AST from the parser, or null if parse failed
  - typeChecker: TypeChecker instance with populated symbol table, or null
  - errors:      array of error objects from any phase that failed

  Phase 1 — Lex:
    tokens = lexer(sourceCode)
  If this throws, we return immediately with only the lexer error.
  There is no point parsing if we cannot even tokenize.

  Phase 2 — Parse:
    ast = parser([...tokens])
  Note: [...tokens] spreads tokens into a new array. The parser
  mutates (shifts) the token array as it reads it, so we pass a copy
  to avoid destroying the original token list (which hover.js needs).
  If this throws, we return with tokens (still useful for hover) but
  no AST.

  Phase 3 — Type check:
    tc = new TypeChecker()
    typeCheck(ast, tc)
  CRITICAL: We do NOT return early if typeCheck throws. We catch the
  error, record it, and still return whatever partial data tc has.
  This is important because:
    - The user is actively typing, so errors are common
    - Even with a type error, the symbol table is partially filled
    - hover.js and completion.js can still work on partial data
    - Returning null typeChecker on every type error would break hover

  function makeError(e, phase) {
    endCol: col + Math.max(8, Math.min(e.message.length, 25))

  endCol is an estimate of where the error underline should end.
  We use Math.min(message.length, 25) capped at 25 characters so
  the squiggle is not absurdly long, and Math.max(8) so it is never
  shorter than 8 characters (at least something is underlined).


================================================================
PART 7 — server.js LINE BY LINE
================================================================

  const PORT = process.env.PORT || process.env.LSP_PORT || 3001;

Render sets process.env.PORT automatically. LSP_PORT is the fallback
for when you want to set it manually. 3001 is the local dev default.

  const wss = new WebSocketServer({ port: PORT });

Creates a WebSocket server using the "ws" library. Plain Node. No
Express, no HTTP framework. Just a WebSocket listener on the port.

  wss.on('connection', (ws, req) => {

Fires every time a new client connects. Each connection gets its own
isolated scope because everything below this is inside this callback.

  const documents = new Map();
  const debounceTimers = new Map();

documents: stores the text of every open file for this connection.
  Key: uri (like "file:///workspace/main.jpp")
  Value: { text: string, version: number }

debounceTimers: stores setTimeout handles for diagnostics, one per uri.
  Needed to cancel the previous timer when the user types again.

---- The four helper functions ----

  function send(obj)
  Checks ws.readyState === ws.OPEN before sending. This prevents
  errors if the connection closed between when we scheduled a message
  and when we try to send it (common with debounced diagnostics).

  function respond(id, result)
  Sends a JSON-RPC response. Always includes the same id that came
  in with the request, so the client can match response to request.

  function respondError(id, code, message)
  Sends a JSON-RPC error response. Used for unknown methods.
  Code -32601 is the standard JSON-RPC "method not found" code.

  function notify(method, params)
  Sends a notification (no id). Used for publishDiagnostics since
  that is server-initiated, not a response to any request.

---- scheduleDiagnostics ----

  function scheduleDiagnostics(uri, text) {
    if (debounceTimers.has(uri)) clearTimeout(debounceTimers.get(uri));
    debounceTimers.set(uri, setTimeout(() => { ... }, 250));

Debounce pattern. The user types fast. We do not want to recompile
on every single keystroke because that would be wasteful.
Instead: every time a change comes in, cancel the previous timer
and set a new 250ms timer. Only when 250ms of silence passes do
we actually run the compiler and send diagnostics.

Inside the timeout:
  const result = analyze(text);
  const diagnostics = result.errors.map(e => ({
    range: {
      start: { line: e.line - 1, character: e.col - 1 },     <- 0-indexed
      end:   { line: e.line - 1, character: e.endCol - 1 }   <- 0-indexed
    },
    severity: 1,   <- 1 = Error, 2 = Warning, 3 = Info, 4 = Hint
    message: e.message,
    source: 'J++'  <- appears in the editor next to the squiggle
  }));
  notify('textDocument/publishDiagnostics', { uri, diagnostics });

Even if diagnostics is empty ([]), we still send it. This is how
squiggles get cleared when the user fixes an error.

---- The message handler switch ----

ws.on('message', (raw) => {
  msg = JSON.parse(raw.toString());
  const { id, method, params } = msg;
  switch (method) { ... }

Every incoming WebSocket message is parsed as JSON and routed by
method name. Here is what each case does:

'initialize'
  The first message. Client sends its capabilities (we ignore them,
  we just trust the client). We respond with our capabilities:
    textDocumentSync.change: 1   means full sync
    hoverProvider: true          we handle textDocument/hover
    completionProvider: {...}    we handle textDocument/completion
    definitionProvider: true     we handle textDocument/definition
    documentSymbolProvider: true we handle textDocument/documentSymbol
  The serverInfo block is optional but nice to have.

'initialized'
  Notification from client confirming handshake is done.
  We do nothing. No response. Just break.

'shutdown'
  Client is about to close. We respond null (required by spec).
  After this the client sends 'exit'.

'exit'
  We close the WebSocket. Connection ends.

'textDocument/didOpen'
  User opened a file. We store it in documents Map and schedule
  diagnostics. First analysis of this file.

'textDocument/didChange'
  User typed something. contentChanges[0]?.text is the full new
  content of the file (because we use full sync). We update the
  stored document and reschedule diagnostics.
  The ?. is defensive — if somehow contentChanges is empty we
  default to empty string instead of crashing.

'textDocument/didClose'
  User closed the file. We delete it from documents, cancel any
  pending diagnostics timer, and send an empty diagnostics notification
  to clear any squiggles still showing for that file.

'textDocument/hover'
  Client asks: "what should I show when user hovers at this position?"
  We:
    1. Get the document text from our Map
    2. Convert 0-indexed position to 1-indexed (add 1 to both)
    3. Run analyze() to get fresh tokens and typeChecker
    4. Call getHover(line, col, tokens, typeChecker)
    5. Return the content as markdown with the token range

  The range in the response tells the editor exactly which characters
  to highlight while the hover popup is showing.

'textDocument/completion'
  Client asks: "what completions should I show at this cursor?"
  We run analyze(), call getCompletions(), then map each item to the
  LSP CompletionItem format:
    kind 14 = Keyword (shows K icon in VS Code)
    kind 6  = Variable (shows V icon in VS Code)
  sortText ensures keywords appear before variables in the list.
  isIncomplete: false tells the client this is the full list,
  do not ask again as the user continues typing.

'textDocument/definition'
  Client asks: "where is this identifier declared?"
  We run analyze(), call getDefinition(), return a Location object:
    { uri: same file uri, range: { start, end } }
  The editor jumps to that range when user presses F12.

'textDocument/documentSymbol'
  Client asks: "what named things are in this file?"
  Used for the outline panel. We run analyze(), call getSymbols(),
  map to LSP DocumentSymbol format:
    kind 13 = Variable
  Both 'range' and 'selectionRange' are required. We use the same
  value for both (the exact identifier span).

'default'
  Unknown method. If it had an id (was a request), we send error
  -32601. If it had no id (was a notification), we silently ignore it.
  This is per JSON-RPC spec.

---- Cleanup ----

ws.on('close', () => {
  debounceTimers.forEach(t => clearTimeout(t));

When a client disconnects, we cancel all pending timers. Without this,
if a timer fires after disconnect, send() would try to write to a
closed socket. The readyState check in send() would catch it, but
clearing timers is the cleaner approach.


================================================================
PART 8 — hover.js LINE BY LINE
================================================================

getHover(line, col, tokens, typeChecker)
  line and col are 1-indexed (already converted in server.js).

  First: find the token at the cursor position.
    tokens.find(t => t.line === line && col >= t.col && col < t.col + len)
  A token spans from t.col to t.col + value.length - 1.
  If col is anywhere in that span, this is the token the cursor is on.

  Build range for the response (still 1-indexed here, server.js converts):
    range = { line: token.line, col: token.col, endCol: token.col + value.length }

  Then branch by token type:

  'keyword': look up in KEYWORD_DOCS map. Each keyword has a short
  description and a usage example. If the keyword is not in the map
  (shouldn't happen), return null.

  'identifier': look up in typeChecker.getVariableInfo(name).
  getVariableInfo returns { type, line, col } or null.
    - If found: show the type and where it was declared
    - If not found but typeChecker exists: show "undeclared variable"
    - If typeChecker is null (file has errors): show "type unknown"
  The null typeChecker case handles files that fail type checking —
  hover still works on identifiers, just without type info.

  'number': simple. Show "number literal".

  'string': show first 40 chars as preview. Show length.
  The preview prevents a huge hover popup for long strings.

  'operator': look up in OPERATOR_DOCS. Includes the key distinction:
  + is numeric only, . is string only — this reinforces the type rule
  visually right in the editor.

  Any other token type (brace, paren): return null, no hover shown.


================================================================
PART 9 — completion.js LINE BY LINE
================================================================

getCompletions(line, col, tokens, typeChecker)

  KEYWORDS array: 10 items, one per J++ keyword. Each has:
    label:  what gets inserted
    detail: short description shown to the right in the dropdown
    doc:    usage example shown in the side panel

  Prefix detection:
    We look for a token at the current cursor position that is an
    identifier or keyword. If found, we slice the token value up to
    the cursor character to get what the user has typed so far.
    Example: user typed "ya", cursor is after "ya" — prefix = "ya".
    Then we filter: only items whose label starts with "ya".
    If no prefix token found (cursor is in whitespace), prefix stays ""
    and all items are returned.

  Keywords: always included (filtered by prefix).

  Variables: from typeChecker.getVariables() which returns a Map of
  name -> type. These are all variables declared so far in the file.
  If typeChecker is null (file has errors), we skip variables but
  still return keywords.

  The kind field here is our internal string ('keyword' or 'variable').
  server.js converts it to LSP numeric kind (14 or 6) before sending.


================================================================
PART 10 — definition.js LINE BY LINE
================================================================

getDefinition(line, col, tokens, ast)

  Step 1: Find the identifier token at the cursor.
    Same position check as hover.js.
    Only looks at type === 'identifier', not keywords or other tokens.
    If user is on a keyword, definition returns null (makes sense —
    keywords are not declared anywhere).

  Step 2: Walk the AST to find a Declaration node with that name.
    findDeclaration(ast.body, token.value)

  findDeclaration recurses into:
    stmt.body      — if/while/for block bodies
    stmt.elseBody  — else blocks
    stmt.elseIf[].body — else-if blocks
  This means variables declared inside any block can be found.

  Returns { line, col, endCol } of the Declaration node.
  These are 1-indexed, server.js subtracts 1 before sending.

  Note: ForStatement loop variables (ke liye i = ...) are not
  Declaration nodes, they are ForStatement.variable strings.
  Definition will not find them because findDeclaration only matches
  stmt.type === 'Declaration'. This is a known limitation.


================================================================
PART 11 — symbols.js LINE BY LINE
================================================================

getSymbols(ast, typeChecker)
  Returns an array of all named symbols in the file.
  Used for the "outline" panel in editors (the list of all variables).

walkStatements(stmts, symbols, typeChecker)
  Recursively walks every statement in the AST.

  Declaration nodes: variable declared with 'ye'. We get the type
  from typeChecker.getVariableInfo(name).type. If typeChecker is null,
  type shows as 'unknown'.

  ForStatement: the loop variable (e.g. i in ke liye i = 0 tak 10)
  is added as a 'loop-variable' kind symbol. Its position comes from
  stmt.varLine / stmt.varCol which the parser stores separately from
  the ForStatement position itself.
  Then we recurse into stmt.body to catch any declarations inside
  the loop.

  WhileStatement: no symbol added for the while itself, but we
  recurse into stmt.body to catch declarations inside.

  IfStatement: recurse into stmt.body, stmt.elseBody, and each
  stmt.elseIf[].body to catch declarations in all branches.

  The returned symbol shape:
    name:   variable name string
    type:   'number' or 'string' or 'unknown'
    line:   1-indexed line of declaration
    col:    1-indexed column
    endCol: col + name.length (end of the identifier span)
    kind:   'variable' or 'loop-variable'

  server.js converts to LSP DocumentSymbol format (subtracts 1 from
  all positions, uses kind: 13 for all).


================================================================
PART 12 — THE COMPILER CHANGES THAT MADE LSP POSSIBLE
================================================================

The original compiler had no position information. Tokens were just
{ type, value }. AST nodes had no line or col. Errors had messages
but no location. LSP needs exact positions for everything.

Three changes were made:

CHANGE 1 — lexer.js
  Added line and col tracking using an advance() helper function.
  Every call to advance() increments col by 1. When a newline is
  seen, line increments and col resets to 1.
  Every token push now includes line: tokenLine, col: tokenCol
  captured before reading the token's characters.
  Errors from the lexer now have e.line and e.col attached.

CHANGE 2 — parser.js
  Declaration nodes now include line and col from the name token.
  Assignment nodes include line and col from the name token.
  Identifier, Number, String expression nodes include line and col
  copied from their source token.
  ForStatement nodes include both the keyword position (line, col)
  and the loop variable position (varLine, varCol) separately.

CHANGE 3 — typeChecker.js + compiler.js
  Symbol table changed from Map<name, string> to Map<name, {type, line, col}>.
  checkDeclaration now accepts declLine and declCol parameters.
  checkAssignment now accepts assignLine and assignCol parameters.
  getVariableInfo() now returns {type, line, col} or null.
  getVariables() now returns a Map<name, type_string> for backward
  compatibility with completion.js which only needs the type string.
  compiler.js forwards stmt.line and stmt.col when calling
  checkDeclaration and checkAssignment.
  compiler.js exports typeCheck separately so analysis.js can call
  just the type checking step without the code generation step.


================================================================
PART 13 — DEPLOYMENT
================================================================

The LSP server is deployed on Render as a Web Service.
URL: wss://jplusplus-lsp.onrender.com

It uses wss:// (secure WebSocket) in production because Render
terminates TLS for you. Your server speaks plain ws:// internally.
Render handles the TLS layer. Your server does not need to.

The PORT env var is set by Render automatically.
server.js reads: process.env.PORT || process.env.LSP_PORT || 3001

The web editor (Next.js) connects to the LSP server using the URL
stored in: NEXT_PUBLIC_LSP_WS_URL
For local dev this is: ws://localhost:3001
For production this is: wss://jplusplus-lsp.onrender.com

The only dependency is "ws" version ^8.16.0.
No LSP library, no Express, no framework. Plain Node.js.

lsp-server/ has its own package.json so it can be deployed as an
isolated service without pulling in all the Next.js dependencies.


================================================================
PART 14 — HOW IT ALL FITS TOGETHER (DATA FLOW)
================================================================

User types a character in the Monaco editor in their browser.

  Monaco editor (browser)
    detects change
    sends textDocument/didChange via WebSocket
    payload: { uri, version, contentChanges: [{ text: full_file }] }

  server.js
    receives message
    updates documents Map with new text
    calls scheduleDiagnostics(uri, text)
    debounce: waits 250ms

  After 250ms of silence:
    analysis.js runs lexer -> parser -> typeCheck
    errors collected with line/col positions
    positions converted to 0-indexed
    server sends textDocument/publishDiagnostics notification

  Monaco editor (browser)
    receives publishDiagnostics
    Monaco Language Client converts to Monaco markers
    Monaco renders red squiggles at the correct positions

User hovers over a variable name:

  Monaco editor (browser)
    detects hover at position (line, character) — 0-indexed
    sends textDocument/hover request with id

  server.js
    gets document text from Map
    converts position to 1-indexed (add 1)
    calls analyze(text) — runs full compiler
    calls getHover(line, col, tokens, typeChecker)

  hover.js
    finds token at that position in token array
    looks up type in typeChecker symbol table
    returns { content: markdown string, range: token span }

  server.js
    converts range back to 0-indexed (subtract 1)
    responds with { contents: { kind: 'markdown', value }, range }

  Monaco editor (browser)
    Monaco Language Client receives response
    Monaco renders hover popup with the markdown content


================================================================
PART 15 — THINGS TO KNOW FOR THE INTERVIEW
================================================================

Q: Why not use Next.js API routes for the LSP?
A: Next.js Route Handlers are stateless HTTP handlers. LSP needs a
   persistent WebSocket connection to maintain per-document state
   (the documents Map) and push diagnostics without being asked.
   HTTP cannot push. WebSocket can.

Q: Why implement JSON-RPC manually instead of using an LSP library?
A: The server side of LSP is just a JSON switch statement. An LSP
   library would add complexity without adding much value here. The
   entire protocol fits in one file. Implementing it manually also
   means there is nothing magic happening — everything is readable.

Q: What does "full sync" vs "incremental sync" mean?
A: Full sync (change: 1): on every edit, client sends the entire file.
   Incremental sync (change: 2): client sends only the changed range.
   Full sync is simpler to implement. For J++ files which are small,
   the overhead of sending the full file on every keystroke is fine.

Q: Why does analyze() return partial results even on error?
A: If we returned null on every type error, hover and completion would
   stop working the moment there is any error — which is almost always
   during active editing. Returning partial results means the editor
   stays useful even when the file is not valid.

Q: Where does the 0-indexed / 1-indexed conversion happen?
A: At the transport boundary in server.js. Receiving: add 1. Sending:
   subtract 1. The compiler never sees 0-indexed values.

Q: What LSP methods are implemented?
A: initialize, initialized, shutdown, exit (lifecycle)
   textDocument/didOpen, didChange, didClose (document sync)
   textDocument/publishDiagnostics (pushed, not requested)
   textDocument/hover
   textDocument/completion
   textDocument/definition
   textDocument/documentSymbol
   Total: 10 methods.

Q: What would you add next?
A: textDocument/references (find all usages of a variable)
   textDocument/rename (rename a variable across the file)
   Per-document analysis cache keyed on version number, so hover
   does not re-run the full compiler on every mouse move.


================================================================
PART 16 — QUICK REFERENCE: WHAT IS IN EACH FILE
================================================================

server.js
  - WebSocket server setup on PORT
  - Per-connection state: documents Map, debounceTimers Map
  - send(), respond(), respondError(), notify() helpers
  - scheduleDiagnostics() with 250ms debounce
  - switch on method: routes all 10 LSP methods
  - Position conversion: +1 on receive, -1 on send
  - Cleanup on connection close

analysis.js
  - analyze(sourceCode) function
  - Runs lexer -> parser -> typeCheck in sequence
  - Returns { tokens, ast, typeChecker, errors } always
  - makeError(e, phase) normalizes any caught error into
    { message, line, col, endCol, severity, phase }
  - Stops at lexer error (cannot parse without tokens)
  - Stops at parser error (cannot type check without AST)
  - Does NOT stop at type check error (returns partial typeChecker)

hover.js
  - KEYWORD_DOCS: docs for 10 J++ keywords
  - OPERATOR_DOCS: docs for 12 operators
  - getHover(line, col, tokens, typeChecker)
  - Finds token at position, branches by token.type
  - For identifiers: looks up symbol table, handles null typeChecker
  - Returns { content: markdown, range: {line, col, endCol} } or null

completion.js
  - KEYWORDS: 10 items with label, detail, doc
  - getCompletions(line, col, tokens, typeChecker)
  - Detects prefix by finding token at cursor position
  - Filters keywords and variables by prefix
  - Returns array of { label, kind, detail, documentation }
  - kind is 'keyword' or 'variable' (server.js converts to 14 or 6)

definition.js
  - getDefinition(line, col, tokens, ast)
  - Finds identifier token at cursor
  - Calls findDeclaration(ast.body, name)
  - findDeclaration recurses into body, elseBody, elseIf blocks
  - Returns { line, col, endCol } of Declaration node or null

symbols.js
  - getSymbols(ast, typeChecker)
  - walkStatements recurses through all statement types
  - Collects Declaration nodes as 'variable' kind
  - Collects ForStatement.variable as 'loop-variable' kind
  - Recurses into if/while/for bodies to find nested declarations
  - Returns array of { name, type, line, col, endCol, kind }

package.json
  - name: jpp-lsp-server
  - scripts.start: node server.js
  - scripts.dev: node server.js
  - dependencies: ws ^8.16.0 only
