/**
 * Monaco Editor Configuration for J++ Language
 * Defines syntax highlighting and language features
 */

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
    'print', 'var', 'func', 'if', 'else', 'for', 'while',
    'return', 'true', 'false', 'null', 'undefined'
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
      // Keywords
      [/[a-z_$][\w$]*/, {
        cases: {
          '@keywords': 'keyword',
          '@default': 'identifier'
        }
      }],

      // Whitespace
      { include: '@whitespace' },

      // Delimiters and operators
      [/[{}()\[\]]/, '@brackets'],
      [/[<>](?!@symbols)/, '@brackets'],
      [/@symbols/, {
        cases: {
          '@operators': 'operator',
          '@default': ''
        }
      }],

      // Numbers
      [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
      [/0[xX][0-9a-fA-F]+/, 'number.hex'],
      [/\d+/, 'number'],

      // Strings
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
  base: 'vs-dark' as const,
  inherit: true,
  rules: [
    { token: 'keyword', foreground: '00d9ff', fontStyle: 'bold' },
    { token: 'string', foreground: '7dd3a0' },
    { token: 'number', foreground: 'ffab70' },
    { token: 'comment', foreground: '6c7a89', fontStyle: 'italic' },
    { token: 'operator', foreground: 'ffffff' },
    { token: 'identifier', foreground: 'dcdcdc' },
  ],
  colors: {
    'editor.background': '#1e2530',
    'editor.foreground': '#dcdcdc',
    'editorLineNumber.foreground': '#4a5568',
    'editor.selectionBackground': '#264f78',
    'editor.inactiveSelectionBackground': '#264f7844',
  }
};
