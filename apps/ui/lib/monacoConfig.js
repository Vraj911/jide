export const jppLanguageConfig = {
  id: 'jpp',
  extensions: ['.jpp'],
  aliases: ['J++', 'jpp'],
  mimetypes: ['text/x-jpp']
};
export const jppMonarchTokens = {
  defaultToken: '',
  tokenPostfix: '.jpp',
  keywords: [
    'ye', 'bol', 'agar', 'nahi', 'nahi agar', 'jabtak', 'ke liye', 'tak',
    'break', 'continue'
  ],
  operators: [
    '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
    '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
    '<<', '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=',
    '%=', '<<=', '>>=', '>>>=' 
  ],
  symbols: /[=><!~?:&|+\-*\/\^%]+/,
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
  tokenizer: {
    root: [
      [/[a-z_$][\w$]*/, {
        cases: {
          '@keywords': 'keyword',
          '@default': 'identifier'
        }
      }],
      { include: '@whitespace' },
      [/[{}()\[\]]/, '@brackets'],
      [/[<>](?!@symbols)/, '@brackets'],
      [/@symbols/, {
        cases: {
          '@operators': 'operator',
          '@default': ''
        }
      }],
      [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
      [/0[xX][0-9a-fA-F]+/, 'number.hex'],
      [/\d+/, 'number'],
      [/"([^"\\]|\\.)*$/, 'string.invalid'],
      [/"/, 'string', '@string_double'],
      [/'([^'\\]|\\.)*$/, 'string.invalid'],
      [/'/, 'string', '@string_single'],
    ],
    whitespace: [
      [/[ \t\r\n]+/, ''],
      [/\/\*/, 'comment', '@comment'],
      [/\/\/.*$/, 'comment'],
    ],
    comment: [
      [/[^\/*]+/, 'comment'],
      [/\*\//, 'comment', '@pop'],
      [/[\/*]/, 'comment']
    ],
    string_double: [
      [/[^\\"]+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/"/, 'string', '@pop']
    ],
    string_single: [
      [/[^\\']+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/'/, 'string', '@pop']
    ],
  },
};
export const jppTheme = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: '4dd9ff', fontStyle: 'bold' }, 
    { token: 'string', foreground: '7dd3a0' }, 
    { token: 'number', foreground: 'ffab70' }, 
    { token: 'comment', foreground: '6c7a89', fontStyle: 'italic' },
    { token: 'operator', foreground: '00d9ff' }, 
    { token: 'identifier', foreground: 'd4d8e0' }, 
  ],
  colors: {
    'editor.background': '#2a3441',
    'editor.foreground': '#d4d8e0', 
    'editorLineNumber.foreground': '#6c7a89', 
    'editor.selectionBackground': '#00d9ff40', 
    'editor.inactiveSelectionBackground': '#00d9ff20', 
    'editor.lineHighlightBackground': '#323d4a', 
    'editorCursor.foreground': '#00d9ff', 
    'editorWhitespace.foreground': '#4a5568',
    'editorIndentGuide.background': '#3a4451', 
    'editorIndentGuide.activeBackground': '#4a5568', 
  }
};
export const jppLightTheme = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: '0066cc', fontStyle: 'bold' }, // Darker sky blue for light mode
    { token: 'string', foreground: '008000' }, // Darker green for readability
    { token: 'number', foreground: 'ff6600' }, // Orange
    { token: 'comment', foreground: '808080', fontStyle: 'italic' }, // Gray
    { token: 'operator', foreground: '0066cc' }, // Sky blue
    { token: 'identifier', foreground: '1f2937' }, // Dark gray/black
  ],
  colors: {
    'editor.background': '#ffffff',
    'editor.foreground': '#1f2937', 
    'editorLineNumber.foreground': '#9ca3af', 
    'editor.selectionBackground': '#0066cc40', 
    'editor.inactiveSelectionBackground': '#0066cc20', 
    'editor.lineHighlightBackground': '#f3f4f6', 
    'editorCursor.foreground': '#0066cc', 
    'editorWhitespace.foreground': '#d1d5db',
    'editorIndentGuide.background': '#e5e7eb', 
    'editorIndentGuide.activeBackground': '#d1d5db', 
  }
};
