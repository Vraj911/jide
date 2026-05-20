'use strict';
const KEYWORD_DOCS = {
  'ye': '**ye** - declare a variable\n\n`ye name = value`',
  'bol': '**bol** - print to output\n\n`bol expression`',
  'agar': '**agar** - if statement\n\n`agar condition { ... }`',
  'nahi': '**nahi** - else branch\n\n`} nahi { ... }`',
  'nahi agar': '**nahi agar** - else-if\n\n`} nahi agar condition { ... }`',
  'jabtak': '**jabtak** - while loop\n\n`jabtak condition { ... }`',
  'ke liye': '**ke liye** - for loop\n\n`ke liye i = start tak end { ... }`',
  'tak': '**tak** - exclusive upper bound in for loop',
  'break': '**break** - exit the current loop immediately',
  'continue': '**continue** - skip to the next loop iteration'
};
const OPERATOR_DOCS = {
  '+': '`+` - numeric addition *(numbers only, no coercion)*',
  '-': '`-` - numeric subtraction',
  '*': '`*` - numeric multiplication',
  '/': '`/` - numeric division',
  '.': '`.` - string concatenation *(strings only, no coercion)*',
  '==': '`==` - equality comparison',
  '!=': '`!=` - inequality comparison',
  '<': '`<` - less than',
  '>': '`>` - greater than',
  '<=': '`<=` - less than or equal',
  '>=': '`>=` - greater than or equal',
  '=': '`=` - assignment'
};
function getHover(line, col, tokens, typeChecker) {
  if (!tokens || tokens.length === 0) return null;
  const token = tokens.find((t) => {
    const len = String(t.value).length;
    return t.line === line && col >= t.col && col < t.col + len;
  });
  if (!token) return null;
  const range = {
    line: token.line,
    col: token.col,
    endCol: token.col + String(token.value).length
  };
  if (token.type === 'keyword') {
    const doc = KEYWORD_DOCS[token.value];
    return doc ? { content: doc, range } : null;
  }
  if (token.type === 'identifier') {
    if (!typeChecker) {
      return {
        content: `**${token.value}** - identifier *(type unknown, file has errors)*`,
        range
      };
    }
    const info = typeChecker.getVariableInfo(token.value);
    if (info) {
      const declNote = info.line ? `\n\n*Declared at line ${info.line}, col ${info.col}*` : '';
      return { content: `**${token.value}**: \`${info.type}\`${declNote}`, range };
    }
    return { content: `**${token.value}** - undeclared variable`, range };
  }
  if (token.type === 'number') {
    return { content: `\`${token.value}\` - number literal`, range };
  }
  if (token.type === 'string') {
    const preview = token.value.length > 40 ? token.value.slice(0, 40) + '...' : token.value;
    return { content: `\`"${preview}"\` - string literal *(${token.value.length} chars)*`, range };
  }
  if (token.type === 'operator') {
    const doc = OPERATOR_DOCS[token.value];
    return doc ? { content: doc, range } : null;
  }
  return null;
}
module.exports = { getHover };
