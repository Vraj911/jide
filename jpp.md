# J++ Language Reference

This document defines the J++ language: its goals, operators, syntax rules, and compiler model.

## 1. Core Philosophy: Zero Implicit Coercion

J++ fixes JavaScript's biggest design flaw: the ambiguous `+` operator. J++ is strict and predictable.

Key ideas:

- `+` is numeric addition only.
- `.` is string concatenation only.
- Variables keep their type; reassignment to a different type is a compile error.

## 2. Operators and Type Rules

### 2.1 `+` (numeric addition only)

Valid:

```jpp
5 + 3   // 8
```

Invalid:

```jpp
"hello" + 5   // COMPILE ERROR
```

### 2.2 `.` (string concatenation only)

Valid:

```jpp
"hello" . "world"   // "helloworld"
```

Invalid:

```jpp
5 . "hello"   // COMPILE ERROR
```

### 2.3 Type Safety

Types are inferred from literals and remembered by variables.

```jpp
ye x = 5        // x is number
x = "hi"       // COMPILE ERROR (type mismatch)
```

## 3. Example Programs

### 3.1 Valid Code

Numeric addition:

```jpp
ye a = 5
ye b = 10
ye sum = a + b
bol sum   // 15
```

String concatenation:

```jpp
ye x = "hello"
ye y = "world"
ye z = x . y
bol z   // "helloworld"
```

Mixed usage:

```jpp
ye num = 42
ye str = "answer: "
bol str . "42"   // "answer: 42"
```

### 3.2 Compile Errors

Invalid: mixing types with `+`:

```jpp
ye x = 5
ye y = "10"
bol x + y   // ERROR: '+' requires numeric operands
```

Invalid: mixing types with `.`:

```jpp
ye a = "hello"
ye b = 5
bol a . b   // ERROR: '.' requires string operands
```

Invalid: type reassignment:

```jpp
ye x = 5
x = "hi"   // ERROR: Cannot assign string to number variable
```

## 4. Compiler Architecture (Conceptual)

Pipeline:

1. Source Code
2. Lexer -> Tokens (includes string literals and `.` operator)
3. Parser -> AST (includes ConcatOp nodes for `.`)
4. TypeChecker -> Validated AST (strict types enforced)
5. Generator -> JavaScript code

## 5. Operator Precedence

1. Primary: Number, String, Identifier, `(Expression)`
2. Multiplicative: `*`, `/`
3. Concatenation: `.` (string-only)
4. Additive: `+`, `-` (numeric-only)

## 6. Type System Summary

- **Inferred Types**: literals determine type
  - `"abc"` -> string
  - `123` -> number
- **Variable Types**: stored in the symbol table
- **Strict Checking**: no implicit conversions

## 7. Compiler Files (Reference)

These are the core implementation files under `lib/jpp/`:

- `lexer.js` - tokenizes source, handles strings and `.`
- `parser.js` - builds AST with precedence
- `typeChecker.js` - enforces strict type rules
- `generator.js` - emits JavaScript
- `compiler.js` - compilation pipeline
- `tests.js` - compiler test suite
