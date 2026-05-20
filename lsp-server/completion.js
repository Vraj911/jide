'use strict';
const KEYWORDS = [
  { label: 'ye', detail: 'declare variable', doc: '`ye name = value`' },
  { label: 'bol', detail: 'print value', doc: '`bol expression`' },
  { label: 'agar', detail: 'if statement', doc: '`agar condition { }`' },
  { label: 'nahi', detail: 'else branch', doc: '`} nahi {`' },
  { label: 'nahi agar', detail: 'else-if branch', doc: '`} nahi agar condition {`' },
  { label: 'jabtak', detail: 'while loop', doc: '`jabtak condition { }`' },
  { label: 'ke liye', detail: 'for loop', doc: '`ke liye i = 0 tak 10 { }`' },
  { label: 'tak', detail: 'for loop end bound', doc: '`ke liye i = 0 tak end`' },
  { label: 'break', detail: 'exit loop', doc: '`break`' },
  { label: 'continue', detail: 'next iteration', doc: '`continue`' }
];
function getCompletions(line, col, tokens, typeChecker) {
  const items = [];
  let prefix = '';
  if (tokens && line && col) {
    const tok = tokens.find(
      (t) =>
        t.line === line &&
        col > t.col &&
        col <= t.col + String(t.value).length &&
        (t.type === 'identifier' || t.type === 'keyword')
    );
    if (tok) {
      prefix = String(tok.value).slice(0, col - tok.col).toLowerCase();
    }
  }
  for (const kw of KEYWORDS) {
    if (!prefix || kw.label.startsWith(prefix)) {
      items.push({
        label: kw.label,
        kind: 'keyword',
        detail: kw.detail,
        documentation: kw.doc
      });
    }
  }
  if (typeChecker) {
    for (const [name, type] of typeChecker.getVariables()) {
      if (!prefix || name.toLowerCase().startsWith(prefix)) {
        items.push({
          label: name,
          kind: 'variable',
          detail: `${type} variable`,
          documentation: `J++ variable of type \`${type}\``
        });
      }
    }
  }
  return items;
}
module.exports = { getCompletions };
