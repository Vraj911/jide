/**
 * J++ Language Server Protocol (LSP) Implementation
 * Provides diagnostics, hover, completion, and other LSP features
 */

const compiler = require('./compiler.js');
const lexer = require('./lexer.js');
const parser = require('./parser.js');
const TypeChecker = require('./typeChecker.js');

/**
 * Get diagnostics (errors/warnings) for a document
 * @param {string} code - Source code
 * @param {string} uri - Document URI (optional)
 * @returns {Array} Array of diagnostic objects
 */
function getDiagnostics(code, uri = 'file:///untitled') {
  const diagnostics = [];
  
  try {
    const result = compiler(code);
    
    if (!result.success && result.errors) {
      result.errors.forEach((error, index) => {
        // Try to extract line/column from error message if available
        let line = 0;
        let character = 0;
        
        // Parse error message for position information
        const lineMatch = error.message?.match(/line (\d+)/i);
        const colMatch = error.message?.match(/column (\d+)/i);
        
        if (lineMatch) {
          line = Math.max(0, parseInt(lineMatch[1]) - 1); // LSP uses 0-based
        }
        if (colMatch) {
          character = Math.max(0, parseInt(colMatch[1]) - 1);
        }
        
        // If no position found, try to find the error in the code
        if (line === 0 && character === 0) {
          // Simple heuristic: find the first problematic line
          const lines = code.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(error.message?.split(':')[0] || '')) {
              line = i;
              break;
            }
          }
        }
        
        diagnostics.push({
          range: {
            start: { line, character },
            end: { line, character: character + 10 } // Approximate end
          },
          severity: 1, // Error
          message: error.message || 'Compilation error',
          source: 'jpp'
        });
      });
    }
  } catch (err) {
    diagnostics.push({
      range: {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 0 }
      },
      severity: 1, // Error
      message: err.message || 'Internal error',
      source: 'jpp'
    });
  }
  
  return diagnostics;
}

/**
 * Get hover information at a position
 * @param {string} code - Source code
 * @param {number} line - Line number (0-based)
 * @param {number} character - Character position (0-based)
 * @returns {Object|null} Hover information
 */
function getHover(code, line, character) {
  try {
    const tokens = lexer(code);
    const ast = parser(tokens);
    const typeChecker = new TypeChecker();
    
    // Find the token/identifier at the position
    let currentPos = 0;
    let targetToken = null;
    
    for (const token of tokens) {
      const tokenStart = currentPos;
      const tokenEnd = currentPos + (token.value?.length || 0);
      const tokenLine = code.substring(0, tokenStart).split('\n').length - 1;
      const tokenChar = tokenStart - code.lastIndexOf('\n', tokenStart) - 1;
      
      if (tokenLine === line && tokenChar <= character && character <= tokenChar + (token.value?.length || 0)) {
        targetToken = token;
        break;
      }
      
      currentPos = tokenEnd + 1;
    }
    
    if (targetToken && targetToken.type === 'IDENTIFIER') {
      // Check if it's a variable in the type checker
      try {
        typeCheck({ type: 'Program', body: ast.body }, typeChecker);
        const varInfo = typeChecker.getVariableInfo(targetToken.value);
        
        if (varInfo) {
          return {
            contents: {
              kind: 'markdown',
              value: `\`\`\`jpp\n${targetToken.value}: ${varInfo.type}\n\`\`\``
            }
          };
        }
      } catch (err) {
        // Ignore type checking errors for hover
      }
    }
    
    // Provide basic keyword information
    const keywords = {
      'ye': 'Variable declaration keyword',
      'bol': 'Print statement',
      'agar': 'If statement',
      'nahi': 'Else statement',
      'jabtak': 'While loop',
      'ke': 'For loop'
    };
    
    if (targetToken && keywords[targetToken.value]) {
      return {
        contents: {
          kind: 'markdown',
          value: `**${targetToken.value}**\n\n${keywords[targetToken.value]}`
        }
      };
    }
    
    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Get completion items at a position
 * @param {string} code - Source code
 * @param {number} line - Line number (0-based)
 * @param {number} character - Character position (0-based)
 * @returns {Array} Array of completion items
 */
function getCompletions(code, line, character) {
  const completions = [];
  
  // Basic keyword completions
  const keywords = [
    { label: 'ye', kind: 14, detail: 'Variable declaration', insertText: 'ye ' },
    { label: 'bol', kind: 3, detail: 'Print statement', insertText: 'bol ' },
    { label: 'agar', kind: 14, detail: 'If statement', insertText: 'agar ' },
    { label: 'nahi', kind: 14, detail: 'Else statement', insertText: 'nahi ' },
    { label: 'jabtak', kind: 14, detail: 'While loop', insertText: 'jabtak ' },
    { label: 'ke', kind: 14, detail: 'For loop', insertText: 'ke ' }
  ];
  
  try {
    const tokens = lexer(code);
    const ast = parser(tokens);
    const typeChecker = new TypeChecker();
    
    // Type check to get variable names
    typeCheck({ type: 'Program', body: ast.body }, typeChecker);
    const variables = typeChecker.getVariables();
    
    variables.forEach((varName, varType) => {
      completions.push({
        label: varName,
        kind: 6, // Variable
        detail: `Variable: ${varType}`,
        insertText: varName
      });
    });
    
    completions.push(...keywords);
  } catch (err) {
    // If parsing fails, still return keywords
    completions.push(...keywords);
  }
  
  return completions;
}

/**
 * Get document symbols (outline)
 * @param {string} code - Source code
 * @returns {Array} Array of symbol information
 */
function getDocumentSymbols(code) {
  const symbols = [];
  
  try {
    const tokens = lexer(code);
    const ast = parser(tokens);
    
    ast.body.forEach((stmt, index) => {
      if (stmt.type === 'Declaration' && stmt.name) {
        symbols.push({
          name: stmt.name,
          kind: 13, // Variable
          location: {
            range: {
              start: { line: index, character: 0 },
              end: { line: index, character: 0 }
            }
          }
        });
      }
    });
  } catch (err) {
    // Ignore errors
  }
  
  return symbols;
}

// Helper function for type checking (matches compiler.js)
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
    }
  }
}

module.exports = {
  getDiagnostics,
  getHover,
  getCompletions,
  getDocumentSymbols
};
