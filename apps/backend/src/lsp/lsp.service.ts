import { Injectable } from '@nestjs/common';
import { createRequire } from 'node:module';
import { resolveJppLspPath } from '../common/jpp-paths';

type LspImpl = {
  getDiagnostics: (code: string, uri?: string) => unknown;
  getHover: (code: string, line: number, character: number) => unknown;
  getCompletions: (code: string, line: number, character: number) => unknown;
  getDocumentSymbols: (code: string) => unknown;
};

@Injectable()
export class LspService {
  private readonly impl: LspImpl;

  constructor() {
    const require = createRequire(__filename);
    const lspPath = resolveJppLspPath();
    const loaded = require(lspPath);
    this.impl = (loaded?.default || loaded) as LspImpl;

    if (
      !this.impl ||
      typeof this.impl.getDiagnostics !== 'function' ||
      typeof this.impl.getHover !== 'function' ||
      typeof this.impl.getCompletions !== 'function' ||
      typeof this.impl.getDocumentSymbols !== 'function'
    ) {
      throw new Error('lib/jpp/lsp.js export shape is not compatible');
    }
  }

  diagnostics(code: string, uri?: string) {
    return { diagnostics: this.impl.getDiagnostics(code, uri) };
  }

  hover(code: string, line: number, character: number) {
    return { hover: this.impl.getHover(code, line, character) };
  }

  completions(code: string, line: number, character: number) {
    return { completions: this.impl.getCompletions(code, line, character) };
  }

  symbols(code: string) {
    return { symbols: this.impl.getDocumentSymbols(code) };
  }
}
