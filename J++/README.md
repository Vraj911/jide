J++ Language

A custom toy programming language built with Node.js that compiles to JavaScript.
J++ uses a Hindi-inspired syntax and supports variables, arithmetic, conditionals, loops, comments, and basic loop control.

Features

Variables using ye

Print statements using bol

Arithmetic expressions: +, -, *, /

Conditionals:

agar (if)

nahi agar (else-if)

nahi (else)

While loops using jabtak

For loops using ke liye ... tak ...

Comparison operators: ==, !=, <, >, <=, >=

Loop control: break, continue

Comments:

// single-line

/* ... */ multi-line

Syntax
Variable Declaration
ye variableName = value

Print Statement
bol value

If / Else-if / Else
agar condition {
  statements
} nahi agar other_condition {
  statements
} nahi {
  statements
}

While Loop
jabtak condition {
  statements
}

For Loop
ke liye i = start tak end {
  statements
}

Comments
// single-line comment

/* 
   multi-line comment 
*/

Example Code
ye x = 10
ye y = 20
ye z = x * y
bol z

agar x < y {
  bol 100
} nahi agar x == y {
  bol 200
} nahi {
  bol 300
}

jabtak x < 15 {
  bol x
  x = x + 1
}

ke liye i = 0 tak 5 {
  bol i
}

Project Structure
my-lang/
├── lexer.js        # Tokenizer
├── parser.js       # AST builder
├── generator.js    # JS code generator
├── runner.js       # Executes generated JS
├── compiler.js     # Full pipeline (lex → parse → generate → run)
├── code.js         # Sample J++ source code
└── README.md

Execution Pipeline

Lexer
Converts raw code into tokens.

Parser
Builds an Abstract Syntax Tree (AST).

Generator
Converts AST into JavaScript code.

Runner
Executes the generated JavaScript.

Running J++ Code

Make sure Node.js is installed.

node compiler.js


This compiles and executes whatever you put inside code.js.

Keywords
Keyword	Meaning	Example
ye	Variable declaration	ye x = 10
bol	Print	bol x
agar	If	agar x < y {}
nahi agar	Else-if	} nahi agar x > 10 {
nahi	Else	} nahi {}
jabtak	While loop	jabtak x < 5 {}
ke liye	For loop	ke liye i = 0 tak 5 {}
tak	Loop end keyword	0 tak 5
break	Exit loop	Inside any loop
continue	Skip iteration	Inside any loop
Operators
Arithmetic

+ addition

- subtraction

* multiplication

/ division

Comparison

== equal

!= not equal

< less than

> greater than

<= less-or-equal

>= greater-or-equal

Assignment

= assign value

Example Programs
Simple Calculation
ye a = 5
ye b = 10
ye sum = a + b
bol sum

Conditional Logic
ye age = 18
agar age >= 18 {
  bol 100
}

Loop Examples
jabtak x < 10 {
  bol x
  x = x + 1
}

ke liye i = 0 tak 5 {
  bol i
}

Break & Continue Example
ye i = 0
jabtak i < 10 {
  i = i + 1
  agar i == 3 {
    continue
  } nahi agar i == 7 {
    break
  }
  bol i
}

Current Limitations

These features do NOT exist yet:

No functions

No arrays or data structures

No strings or string operations

No boolean literals (true, false)

No logical operators (&&, ||, !)

No modulo operator (%)

No unary operators (-x)

Limited error messages (no line/column numbers)

No scoping rules (everything is global)

No return values or user-defined I/O functions

Future Enhancements (planned)

 Functions & scoping

 Arrays and objects

 String support

 Logical operators

 Modulo operator %

 Unary minus

 Error reporting with line numbers

 Standard library

Architecture
Token Types

keyword

identifier

number

operator

brace ({, })

paren ((, ))

AST Node Types

Program

Declaration

Assignment

PrintStatement

IfStatement

WhileStatement

ForStatement

BreakStatement

ContinueStatement

BinaryOp

Number

Identifier

Troubleshooting

Error: "Expected identifier after ye"
You wrote an invalid variable name.

Error: "Expected comparison operator in condition"
Your condition is missing ==, !=, <, >, etc.

Error: "break/continue outside loop"
These keywords can only be inside jabtak or ke liye.

Error: "Unexpected token"
Likely invalid syntax or unsupported operator.

License

This project is open-source under the MIT License.