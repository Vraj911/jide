'use strict';

function getDefinition(line, col, tokens, ast) {
  if (!tokens || !ast) return null;

  const token = tokens.find(
    (t) => t.type === 'identifier' && t.line === line && col >= t.col && col < t.col + t.value.length
  );
  if (!token) return null;

  const decl = findDeclaration(ast.body, token.value);
  if (!decl) return null;

  return {
    line: decl.line,
    col: decl.col,
    endCol: decl.col + decl.name.length
  };
}

function findDeclaration(stmts, name) {
  for (const stmt of stmts) {
    if (stmt.type === 'Declaration' && stmt.name === name) return stmt;
    if (stmt.body) {
      const f = findDeclaration(stmt.body, name);
      if (f) return f;
    }
    if (stmt.elseBody) {
      const f = findDeclaration(stmt.elseBody, name);
      if (f) return f;
    }
    if (stmt.elseIf) {
      for (const elif of stmt.elseIf) {
        const f = findDeclaration(elif.body || [], name);
        if (f) return f;
      }
    }
  }
  return null;
}

module.exports = { getDefinition };
