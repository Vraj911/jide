/**
 * J++ Lexer - Tokenizes J++ source code
 * 
 * STRICT OPERATOR RULES:
 * - + is numeric-only addition
 * - . is string-only concatenation
 * - No implicit coercion
 */

 function lexer(input) {
  const tokens = [];
  let cursor = 0;
  
  while (cursor < input.length) {
    let char = input[cursor];
    
    // Skip whitespace
    if (/\s/.test(char)) {
      cursor++;
      continue;
    }
    
    // Single-line comments
    if (char === '/' && cursor + 1 < input.length && input[cursor + 1] === '/') {
      while (cursor < input.length && input[cursor] !== '\n') {
        cursor++;
      }
      continue;
    }
    
    // Multi-line comments
    if (char === '/' && cursor + 1 < input.length && input[cursor + 1] === '*') {
      cursor += 2;
      while (cursor + 1 < input.length && !(input[cursor] === '*' && input[cursor + 1] === '/')) {
        cursor++;
      }
      cursor += 2;
      continue;
    }
    
    // String literals (double quotes)
    if (char === '"') {
      cursor++; // Skip opening quote
      let str = '';
      while (cursor < input.length && input[cursor] !== '"') {
        if (input[cursor] === '\\' && cursor + 1 < input.length) {
          // Handle escape sequences
          cursor++;
          const next = input[cursor];
          if (next === 'n') str += '\n';
          else if (next === 't') str += '\t';
          else if (next === '\\') str += '\\';
          else if (next === '"') str += '"';
          else str += next;
          cursor++;
        } else {
          str += input[cursor];
          cursor++;
        }
      }
      if (cursor >= input.length) {
        throw new Error('Unclosed string literal');
      }
      cursor++; // Skip closing quote
      tokens.push({ type: 'string', value: str });
      continue;
    }
    
    // String literals (single quotes)
    if (char === "'") {
      cursor++; // Skip opening quote
      let str = '';
      while (cursor < input.length && input[cursor] !== "'") {
        if (input[cursor] === '\\' && cursor + 1 < input.length) {
          // Handle escape sequences
          cursor++;
          const next = input[cursor];
          if (next === 'n') str += '\n';
          else if (next === 't') str += '\t';
          else if (next === '\\') str += '\\';
          else if (next === "'") str += "'";
          else str += next;
          cursor++;
        } else {
          str += input[cursor];
          cursor++;
        }
      }
      if (cursor >= input.length) {
        throw new Error('Unclosed string literal');
      }
      cursor++; // Skip closing quote
      tokens.push({ type: 'string', value: str });
      continue;
    }
    
    // Multi-word keywords
    if (input.slice(cursor).startsWith('nahi agar')) {
      tokens.push({ type: 'keyword', value: 'nahi agar' });
      cursor += 'nahi agar'.length;
      continue;
    }
    
    if (input.slice(cursor).startsWith('ke liye')) {
      const after = cursor + 'ke liye'.length;
      const boundaryOk =
        after >= input.length ||
        !/[a-zA-Z0-9_]/.test(input[after]);
      if (boundaryOk) {
        tokens.push({ type: 'keyword', value: 'ke liye' });
        cursor = after;
        continue;
      }
    }
    
    // Identifiers and keywords
    if (/[a-zA-Z_]/.test(char)) {
      let word = '';
      while (cursor < input.length && /[a-zA-Z0-9_]/.test(input[cursor])) {
        word += input[cursor];
        cursor++;
      }
      const keywords = ['ye', 'bol', 'agar', 'nahi', 'jabtak', 'tak', 'break', 'continue'];
      if (keywords.includes(word)) {
        tokens.push({ type: 'keyword', value: word });
      } else {
        tokens.push({ type: 'identifier', value: word });
      }
      continue;
    }
    
    // Numbers
    if (/[0-9]/.test(char)) {
      let num = '';
      while (cursor < input.length && /[0-9]/.test(input[cursor])) {
        num += input[cursor];
        cursor++;
      }
      tokens.push({ type: 'number', value: num });
      continue;
    }
    
    // String concatenation operator (.) - MUST be checked before other operators
    // to avoid conflicts with decimal numbers (handled above) and method calls (future)
    if (char === '.') {
      // Ensure it's not part of a number (already handled above)
      // Ensure it's not .. (future range operator)
      if (cursor + 1 < input.length && input[cursor + 1] === '.') {
        throw new Error('Unexpected ".." operator (not yet supported)');
      }
      tokens.push({ type: 'operator', value: '.' });
      cursor++;
      continue;
    }
    
    // Operators
    if (/[\+\-\*\/\=\<\>\!]/.test(char)) {
      if (char === '=' && cursor + 1 < input.length && input[cursor + 1] === '=') {
        tokens.push({ type: 'operator', value: '==' });
        cursor += 2;
      } else if (char === '<' && cursor + 1 < input.length && input[cursor + 1] === '=') {
        tokens.push({ type: 'operator', value: '<=' });
        cursor += 2;
      } else if (char === '>' && cursor + 1 < input.length && input[cursor + 1] === '=') {
        tokens.push({ type: 'operator', value: '>=' });
        cursor += 2;
      } else if (char === '!' && cursor + 1 < input.length && input[cursor + 1] === '=') {
        tokens.push({ type: 'operator', value: '!=' });
        cursor += 2;
      } else {
        tokens.push({ type: 'operator', value: char });
        cursor++;
      }
      continue;
    }
    
    // Braces
    if (char === '{' || char === '}') {
      tokens.push({ type: 'brace', value: char });
      cursor++;
      continue;
    }
    
    // Parentheses
    if (char === '(' || char === ')') {
      tokens.push({ type: 'paren', value: char });
      cursor++;
      continue;
    }
    
    cursor++;
  }
  
  return tokens;
}
module.exports = lexer;