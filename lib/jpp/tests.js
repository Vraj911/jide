/**
 * J++ Compiler Tests - Validates strict type checking
 * 
 * Run with: node lib/jpp/tests.js
 */

const compileJPlusPlus = require('./compiler.js');


function test(name, code, shouldSucceed = true) {
  console.log(`\n🧪 Test: ${name}`);
  console.log(`Code:\n${code}\n`);
  
  const result = compileJPlusPlus(code);
  
  if (shouldSucceed) {
    if (result.success) {
      console.log(`✅ PASSED`);
      console.log(`Generated JS:\n${result.code}\n`);
    } else {
      console.log(`❌ FAILED (expected success)`);
      console.log(`Error: ${result.errors[0].message}\n`);
    }
  } else {
    if (!result.success) {
      console.log(`✅ PASSED (correctly rejected)`);
      console.log(`Error: ${result.errors[0].message}\n`);
    } else {
      console.log(`❌ FAILED (should have been rejected)`);
      console.log(`Generated JS:\n${result.code}\n`);
    }
  }
}

console.log('='.repeat(60));
console.log('J++ COMPILER TESTS - Strict Type Checking');
console.log('='.repeat(60));

// ✅ VALID: Numeric addition
test(
  'Numeric addition with +',
  `ye a = 5
ye b = 10
ye sum = a + b
bol sum`
);

// ✅ VALID: String concatenation with .
test(
  'String concatenation with .',
  `ye x = "hello"
ye y = "world"
ye z = x . y
bol z`
);

// ✅ VALID: Mixed usage (separate operations)
test(
  'Mixed numeric and string operations',
  `ye num = 42
ye str1 = "answer: "
ye str2 = "42"
bol str1 . str2`
);

// ✅ VALID: Multiple concatenations
test(
  'Multiple string concatenations',
  `ye a = "hello"
ye b = " "
ye c = "world"
bol a . b . c`
);

// ✅ VALID: Arithmetic expressions
test(
  'Complex arithmetic',
  `ye x = 10
ye y = 20
ye z = x + y * 2
bol z`
);

// ❌ INVALID: Mixing types with +
test(
  'Mixing string and number with + (should fail)',
  `ye x = 5
ye y = "10"
bol x + y`,
  false
);

// ❌ INVALID: Mixing types with .
test(
  'Mixing number and string with . (should fail)',
  `ye x = "hello"
ye y = 5
bol x . y`,
  false
);

// ❌ INVALID: Type reassignment
test(
  'Reassigning incompatible type (should fail)',
  `ye x = 5
x = "hi"`,
  false
);

// ❌ INVALID: String literal with +
test(
  'String literal with + operator (should fail)',
  `bol "hello" + "world"`,
  false
);

// ❌ INVALID: Number literal with .
test(
  'Number literal with . operator (should fail)',
  `bol 5 . 10`,
  false
);

// ✅ VALID: String literals with .
test(
  'String literals with . operator',
  `ye result = "hello" . " " . "world"
bol result`
);

// ✅ VALID: Number literals with +
test(
  'Number literals with + operator',
  `ye result = 5 + 10 + 15
bol result`
);

// ❌ INVALID: Uninitialized variable usage
test(
  'Using variable before declaration (should fail)',
  `bol x
ye x = 5`,
  false
);

console.log('\n' + '='.repeat(60));
console.log('TESTS COMPLETE');
console.log('='.repeat(60));
