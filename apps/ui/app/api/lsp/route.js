import { NextResponse } from 'next/server';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

let lsp;
try {
  lsp = require('../../../../../lib/jpp/lsp.js');
} catch (e) {
  lsp = null;
  console.error('Failed to load J++ LSP:', e?.message || e);
}

export async function POST(request) {
  if (!lsp) {
    return NextResponse.json(
      { error: 'LSP server not available' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { method, code, line, character, uri } = body;

    if (!method || typeof method !== 'string') {
      return NextResponse.json(
        { error: 'Method is required' },
        { status: 400 }
      );
    }

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    switch (method) {
      case 'diagnostics': {
        const diagnostics = lsp.getDiagnostics(code, uri);
        return NextResponse.json({ diagnostics });
      }
      case 'hover': {
        if (typeof line !== 'number' || typeof character !== 'number') {
          return NextResponse.json(
            { error: 'Line and character are required for hover' },
            { status: 400 }
          );
        }
        const hover = lsp.getHover(code, line, character);
        return NextResponse.json({ hover });
      }
      case 'completions': {
        if (typeof line !== 'number' || typeof character !== 'number') {
          return NextResponse.json(
            { error: 'Line and character are required for completions' },
            { status: 400 }
          );
        }
        const completions = lsp.getCompletions(code, line, character);
        return NextResponse.json({ completions });
      }
      case 'symbols': {
        const symbols = lsp.getDocumentSymbols(code);
        return NextResponse.json({ symbols });
      }
      default:
        return NextResponse.json(
          { error: `Unknown method: ${method}` },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
