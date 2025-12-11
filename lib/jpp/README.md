# J++ Language Compiler

## 🎯 Core Philosophy: Zero Implicit Coercion

J++ fixes JavaScript's biggest design flaw: **the ambiguous `+` operator**.

### Strict Operator Rules

1. **`+` operator**: Numeric addition ONLY
   - `5 + 3` → `8` ✅
   - `"hello" + 5` → **COMPILE ERROR** ❌
   - `5 + "hello"` → **COMPILE ERROR** ❌

2. **`.` operator**: String concatenation ONLY
   - `"hello" . "world"` → `"helloworld"` ✅
   - `5 . "hello"` → **COMPILE ERROR** ❌
   - `"hello" . 5` → **COMPILE ERROR** ❌

3. **Type Safety**: Variables remember their type
   - `ye x = 5` → `x` is `number`
   - `x = "hi"` → **COMPILE ERROR** (type mismatch)
   - `ye y = "hello"` → `y` is `string`
   - `y = "world"` → ✅ (same type)

## Architecture

### Compilation Pipeline

```
Source Code
    ↓
[Lexer] → Tokens (including string literals and . operator)
    ↓
[Parser] → AST (with ConcatOp nodes for .)
    ↓
[TypeChecker] → Validated AST (enforces strict types)
    ↓
[Generator] → JavaScript Code
```

### Operator Precedence

1. Primary: `Number`, `String`, `Identifier`, `(Expression)`
2. Multiplicative: `*`, `/`
3. Concatenation: `.` (string-only)
4. Additive: `+`, `-` (numeric-only)

### Type System

- **Inferred Types**: Literals determine type
  - `"abc"` → `string`
  - `123` → `number`
- **Variable Types**: Tracked in symbol table
- **Strict Checking**: No implicit conversions

## Example Programs

### ✅ Valid Code

```jpp
// Numeric addition
ye a = 5
ye b = 10
ye sum = a + b
bol sum   // 15

// String concatenation
ye x = "hello"
ye y = "world"
ye z = x . y
bol z   // "helloworld"

// Mixed usage
ye num = 42
ye str = "answer: "
bol str . "42"   // "answer: 42"
```

### ❌ Compile Errors

```jpp
// Invalid: mixing types with +
ye x = 5
ye y = "10"
bol x + y   // ERROR: '+' requires numeric operands

// Invalid: mixing types with .
ye a = "hello"
ye b = 5
bol a . b   // ERROR: '.' requires string operands

// Invalid: type reassignment
ye x = 5
x = "hi"    // ERROR: Cannot assign string to number variable
```

## Files

- `lexer.js` - Tokenizes source code (handles strings and `.` operator)
- `parser.js` - Builds AST with proper precedence
- `typeChecker.js` - Enforces strict type rules
- `generator.js` - Generates JavaScript code
- `compiler.js` - Main compilation pipeline

## Future Enhancements

- Explicit type annotations: `ye x: number = 5`
- Type inference improvements
- More operators (modulo, exponentiation)
- Arrays and objects with type safety
