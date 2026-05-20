'use strict';
const lexer = require('../lib/jpp/lexer');
const parser = require('../lib/jpp/parser');
const TypeChecker = require('../lib/jpp/typeChecker');
const { typeCheck } = require('../lib/jpp/compiler');
function analyze(sourceCode) {
  const errors = [];
  let tokens = [];
  let ast = null;
  let tc = null;
  try {
    tokens = lexer(sourceCode);
  } catch (e) {
    errors.push(makeError(e, 'lexer'));
    return { tokens: [], ast: null, typeChecker: null, errors };
  }
  try {
    ast = parser([...tokens]);
  } catch (e) {
    errors.push(makeError(e, 'parser'));
    return { tokens, ast: null, typeChecker: null, errors };
  }
  tc = new TypeChecker();
  try {
    typeCheck(ast, tc);
  } catch (e) {
    errors.push(makeError(e, 'typecheck'));
  }
  return { tokens, ast, typeChecker: tc, errors };
}
function makeError(e, phase) {
  const line = e.line || 1;
  const col = e.col || 1;
  return {
    message: e.message || 'Unknown error',
    line,
    col,
    endCol: col + Math.max(8, Math.min((e.message || '').length, 25)),
    severity: 'error',
    phase
  };
}
module.exports = { analyze };
