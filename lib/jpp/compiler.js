/**
 * J++ Compiler - Full compilation pipeline with strict type checking
 * Lex → Parse → Type Check → Generate → Execute
 *
 * CORE FEATURE: Strict operator separation
 * - + is numeric-only (no coercion)
 * - . is string-only (no coercion)
 */

// CommonJS imports
const lexer = require('./lexer.js');
const parser = require('./parser.js');
const generate = require('./generator.js');
const TypeChecker = require('./typeChecker.js');


/**
 * Perform type-checking on the AST  
 */
function typeCheck(ast, typeChecker) {
  for (const stmt of ast.body) {

    switch (stmt.type) {

      case 'Declaration':
        if (stmt.value) {
          typeChecker.checkExpression(stmt.value);
        }
        typeChecker.checkDeclaration(stmt.name, stmt.value);
        break;

      case 'Assignment':
        typeChecker.checkAssignment(stmt.name, stmt.value);
        break;

      case 'PrintStatement':
        typeChecker.checkExpression(stmt.value);
        break;

      case 'IfStatement':
        typeChecker.checkExpression(stmt.condition.left);
        typeChecker.checkExpression(stmt.condition.right);

        for (const bodyStmt of stmt.body) {
          typeCheck({ type: 'Program', body: [bodyStmt] }, typeChecker);
        }

        for (const elif of stmt.elseIf) {
          typeChecker.checkExpression(elif.condition.left);
          typeChecker.checkExpression(elif.condition.right);
          for (const bodyStmt of elif.body) {
            typeCheck({ type: 'Program', body: [bodyStmt] }, typeChecker);
          }
        }

        if (stmt.elseBody) {
          for (const bodyStmt of stmt.elseBody) {
            typeCheck({ type: 'Program', body: [bodyStmt] }, typeChecker);
          }
        }
        break;

      case 'WhileStatement':
        typeChecker.checkExpression(stmt.condition.left);
        typeChecker.checkExpression(stmt.condition.right);

        for (const bodyStmt of stmt.body) {
          typeCheck({ type: 'Program', body: [bodyStmt] }, typeChecker);
        }
        break;

      case 'ForStatement':
        const prevScope = typeChecker.createScope();

        typeChecker.checkExpression(stmt.start);
        typeChecker.checkExpression(stmt.end);

        typeChecker.symbols.set(stmt.variable, 'number');

        for (const bodyStmt of stmt.body) {
          typeCheck({ type: 'Program', body: [bodyStmt] }, typeChecker);
        }

        typeChecker.restoreScope(prevScope);
        break;

      case 'BreakStatement':
      case 'ContinueStatement':
        break;

      default:
        throw new Error(`Unknown statement type: ${stmt.type}`);
    }
  }
}


/**
 * COMPILE FUNCTION (CommonJS Export)
 */
function compileJPlusPlus(source) {
  try {
    const tokens = lexer(source);
    const ast = parser(tokens);

    const typeChecker = new TypeChecker();
    typeCheck(ast, typeChecker);

    const jsCode = generate(ast);

    return {
      success: true,
      code: jsCode,
      errors: []
    };

  } catch (error) {
    return {
      success: false,
      errors: [{
        message: error instanceof Error ? error.message : 'Unknown compilation error',
        type: 'error'
      }]
    };
  }
}

// CommonJS export
module.exports = compileJPlusPlus;
