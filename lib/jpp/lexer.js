'use strict';

function lexer(input) {
  const tokens = [];
  let cursor = 0;
  let line = 1;
  let col = 1;

  function advance() {
    const ch = input[cursor];
    cursor++;
    if (ch === '\n') { line++; col = 1; }
    else { col++; }
    return ch;
  }

  function peek(offset = 0) {
    return input[cursor + offset] || '';
  }

  while (cursor < input.length) {
    let char = input[cursor];

    // Skip whitespace
    if (/\s/.test(char)) { advance(); continue; }

    // Single-line comments
    if (char === '/' && peek(1) === '/') {
      while (cursor < input.length && input[cursor] !== '\n') advance();
      continue;
    }

    // Multi-line comments
    if (char === '/' && peek(1) === '*') {
      advance(); advance();
      while (cursor + 1 < input.length &&
             !(input[cursor] === '*' && peek(1) === '/')) advance();
      advance(); advance();
      continue;
    }

    const tokenLine = line;
    const tokenCol = col;

    if (char === '"') {
      advance();
      let str = '';
      while (cursor < input.length && input[cursor] !== '"') {
        if (input[cursor] === '\\' && cursor + 1 < input.length) {
          advance();
          const next = input[cursor];
          if (next === 'n') str += '\n';
          else if (next === 't') str += '\t';
          else if (next === '\\') str += '\\';
          else if (next === '"') str += '"';
          else str += next;
          advance();
        } else { str += input[cursor]; advance(); }
      }
      if (cursor >= input.length) {
        const err = new Error('Unclosed string literal');
        err.line = tokenLine; err.col = tokenCol; throw err;
      }
      advance();
      tokens.push({ type: 'string', value: str, line: tokenLine, col: tokenCol });
      continue;
    }

    if (char === "'") {
      advance();
      let str = '';
      while (cursor < input.length && input[cursor] !== "'") {
        if (input[cursor] === '\\' && cursor + 1 < input.length) {
          advance();
          const next = input[cursor];
          if (next === 'n') str += '\n';
          else if (next === 't') str += '\t';
          else if (next === '\\') str += '\\';
          else if (next === "'") str += "'";
          else str += next;
          advance();
        } else { str += input[cursor]; advance(); }
      }
      if (cursor >= input.length) {
        const err = new Error('Unclosed string literal');
        err.line = tokenLine; err.col = tokenCol; throw err;
      }
      advance();
      tokens.push({ type: 'string', value: str, line: tokenLine, col: tokenCol });
      continue;
    }

    if (input.slice(cursor).startsWith('nahi agar')) {
      tokens.push({ type: 'keyword', value: 'nahi agar', line: tokenLine, col: tokenCol });
      for (let i = 0; i < 9; i++) advance();
      continue;
    }

    if (input.slice(cursor).startsWith('ke liye')) {
      const after = cursor + 7;
      const boundaryOk = after >= input.length || !/[a-zA-Z0-9_]/.test(input[after]);
      if (boundaryOk) {
        tokens.push({ type: 'keyword', value: 'ke liye', line: tokenLine, col: tokenCol });
        for (let i = 0; i < 7; i++) advance();
        continue;
      }
    }

    if (/[a-zA-Z_]/.test(char)) {
      let word = '';
      while (cursor < input.length && /[a-zA-Z0-9_]/.test(input[cursor])) {
        word += input[cursor]; advance();
      }
      const keywords = ['ye', 'bol', 'agar', 'nahi', 'jabtak', 'tak', 'break', 'continue'];
      tokens.push({
        type: keywords.includes(word) ? 'keyword' : 'identifier',
        value: word,
        line: tokenLine,
        col: tokenCol
      });
      continue;
    }

    if (/[0-9]/.test(char)) {
      let num = '';
      while (cursor < input.length && /[0-9]/.test(input[cursor])) {
        num += input[cursor]; advance();
      }
      tokens.push({ type: 'number', value: num, line: tokenLine, col: tokenCol });
      continue;
    }

    if (char === '.') {
      if (peek(1) === '.') {
        const err = new Error('Unexpected ".." operator (not supported)');
        err.line = tokenLine; err.col = tokenCol; throw err;
      }
      tokens.push({ type: 'operator', value: '.', line: tokenLine, col: tokenCol });
      advance();
      continue;
    }

    if (/[\+\-\*\/\=\<\>\!]/.test(char)) {
      if (char === '=' && peek(1) === '=') {
        tokens.push({ type: 'operator', value: '==', line: tokenLine, col: tokenCol });
        advance(); advance();
      } else if (char === '<' && peek(1) === '=') {
        tokens.push({ type: 'operator', value: '<=', line: tokenLine, col: tokenCol });
        advance(); advance();
      } else if (char === '>' && peek(1) === '=') {
        tokens.push({ type: 'operator', value: '>=', line: tokenLine, col: tokenCol });
        advance(); advance();
      } else if (char === '!' && peek(1) === '=') {
        tokens.push({ type: 'operator', value: '!=', line: tokenLine, col: tokenCol });
        advance(); advance();
      } else {
        tokens.push({ type: 'operator', value: char, line: tokenLine, col: tokenCol });
        advance();
      }
      continue;
    }

    if (char === '{' || char === '}') {
      tokens.push({ type: 'brace', value: char, line: tokenLine, col: tokenCol });
      advance(); continue;
    }

    if (char === '(' || char === ')') {
      tokens.push({ type: 'paren', value: char, line: tokenLine, col: tokenCol });
      advance(); continue;
    }

    advance();
  }

  return tokens;
}

module.exports = lexer;