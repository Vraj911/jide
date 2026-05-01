# J++ Language and Compiler Guide

## 1) Language Overview
J++ is a small, strict language that compiles to JavaScript.  
Its primary goal is to remove implicit type coercion pitfalls common in JavaScript and provide predictable compile-time behavior.

### Design goals
- deterministic behavior for arithmetic and string operations
- compile-time type safety for variables and expressions
- simple syntax for beginners, strict rules for reliability

## 2) Language Features

### Type system
- inferred primitive types from literals (`number`, `string`)
- variables keep their first assigned type
- incompatible reassignment fails during compilation

### Operators
- `+` is numeric-only
- `.` is string-concatenation-only

This separation prevents mixed-type ambiguity.

### Syntax examples

```jpp
ye a = 5
ye b = 10
ye total = a + b
bol total
```

```jpp
ye first = "hello"
ye second = "world"
ye joined = first . second
bol joined
```

```jpp
ye x = 5
x = "wrong"   // compile-time type mismatch
```

## 3) Compiler Architecture

### Lexer (`lib/jpp/lexer.js`)
- tokenizes source text into language tokens
- supports numbers, strings, keywords, operators, control flow tokens

### Parser (`lib/jpp/parser.js`)
- transforms tokens into an AST
- enforces precedence, including dedicated concatenation precedence for `.`

### Type Checker (`lib/jpp/typeChecker.js`)
- walks AST to infer and validate expression/variable types
- blocks invalid operations (like `number . string` or `string + number`)

### Generator (`lib/jpp/generator.js`)
- emits JavaScript from validated AST
- keeps generated code minimal (checks happen at compile time)

### Compiler Orchestration (`lib/jpp/compiler.js`)
- pipeline: tokenize -> parse -> type-check -> generate
- returns either compiled JS/AST or structured compile errors

## 4) Design Decisions

### Why strict typing?
- catches mistakes before execution
- reduces runtime surprises
- makes error reporting clearer for learners and interview-level discussion

### Why separate concatenation operator (`.`)?
- avoids ambiguity of JavaScript `+`
- keeps arithmetic and text operations semantically explicit

### Trade-offs
- stricter language means less shorthand convenience
- fewer dynamic patterns compared to JavaScript
- simpler internal model improves maintainability and predictability

## 5) Implementation Details

### Core modules
- `compiler.js`: top-level compile API
- `lexer.js`: lexical analysis
- `parser.js`: AST generation
- `typeChecker.js`: semantic validation
- `generator.js`: JS output generation
- `tests.js`: language-focused regression checks

### Data flow
1. source code enters compiler
2. lexer emits tokens
3. parser creates AST
4. type checker validates AST
5. generator produces JS
6. runtime executes generated JS through server execution layer

## 6) Limitations

### Security
- generated JavaScript execution is constrained server-side but not equivalent to OS/container-grade sandboxing
- production multi-tenant isolation still requires stronger boundaries (containerization/process isolation + policy controls)

### Language gaps
- no advanced type annotations yet
- no modules/import system
- limited standard library/runtime capabilities

## 7) Run and Test J++

### CLI usage
```bash
npm run start:cli -- --help
```

Examples:
```bash
node apps/cli/src/cli.js run test.jpp
node apps/cli/src/cli.js check test.jpp
node apps/cli/src/cli.js build test.jpp --out out.js
```

### Compiler tests
```bash
node lib/jpp/tests.js
```

### Project-level tests
```bash
npm test
```

## 8) Interview Talking Points (Non-Deep but Solid)
- J++ is intentionally small so the compiler pipeline is easy to explain end-to-end.
- Strong compile-time checks demonstrate language design choices, not just syntax changes.
- The IDE shows a complete loop: source -> compile -> execute -> diagnostics.
- The project proves full-stack ownership: language runtime + API + UI + docs assistant.

## 9) Near-Term Language Additions
- boolean literals and richer conditional expressions
- basic arrays and indexed access
- small standard library helpers (`len`, string utils, number parse helpers)
- better error spans for IDE-level inline diagnostics
