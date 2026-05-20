'use strict';
function getSymbols(ast, typeChecker) {
  if (!ast) return [];
  const symbols = [];
  walkStatements(ast.body || [], symbols, typeChecker);
  return symbols;
}
function walkStatements(stmts, symbols, typeChecker) {
  for (const stmt of stmts) {
    if (stmt.type === 'Declaration') {
      const info = typeChecker ? typeChecker.getVariableInfo(stmt.name) : null;
      symbols.push({
        name: stmt.name,
        type: info ? info.type : 'unknown',
        line: stmt.line || 0,
        col: stmt.col || 0,
        endCol: (stmt.col || 0) + stmt.name.length,
        kind: 'variable'
      });
    }
    if (stmt.type === 'ForStatement') {
      symbols.push({
        name: stmt.variable,
        type: 'number',
        line: stmt.varLine || stmt.line || 0,
        col: stmt.varCol || stmt.col || 0,
        endCol: (stmt.varCol || stmt.col || 0) + stmt.variable.length,
        kind: 'loop-variable'
      });
      if (stmt.body) walkStatements(stmt.body, symbols, typeChecker);
    }
    if (stmt.type === 'WhileStatement' && stmt.body) {
      walkStatements(stmt.body, symbols, typeChecker);
    }
    if (stmt.type === 'IfStatement') {
      if (stmt.body) walkStatements(stmt.body, symbols, typeChecker);
      if (stmt.elseBody) walkStatements(stmt.elseBody, symbols, typeChecker);
      if (stmt.elseIf) {
        for (const elif of stmt.elseIf) walkStatements(elif.body || [], symbols, typeChecker);
      }
    }
  }
}
module.exports = { getSymbols };
