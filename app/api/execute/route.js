import { NextResponse } from 'next/server';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
// Use createRequire to load CommonJS modules in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);
let compileJPlusPlus;
try {
  // Use a static path so Webpack can resolve the dependency at build time
  compileJPlusPlus = require('../../../lib/jpp/compiler.js');
} catch (e) {
  // If loading fails in the server environment, log and keep null so we can return a 500 at request time
  compileJPlusPlus = null;
  console.error('Failed to load J++ compiler:', e && e.message ? e.message : e);
}

/**
 * POST /api/execute
 * Executes J++ code server-side
 * 
 * Request body: { code: string }
 * Response: { success: boolean, output: string, ast: object, errors: array }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!compileJPlusPlus) {
      return NextResponse.json(
        {
          success: false,
          code: null,
          output: null,
          ast: null,
          errors: [{ message: 'Server error: compiler not available', type: 'server' }]
        },
        { status: 500 }
      );
    }

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        {
          success: false,
          code: null,
          output: null,
          ast: null,
          errors: ['Invalid request: code is required and must be a string']
        },
        { status: 400 }
      );
    }
    const compileResult = compileJPlusPlus(code);
    if (!compileResult.success) {
      return NextResponse.json({
        success: false,
        code: compileResult.code || null,
        output: null,
        ast: compileResult.ast || null,
        errors: compileResult.errors || []
      });
    }
    // Execute the compiled JavaScript and capture output
    let output = '';
    let executionErrors = [];
    let originalConsoleLog;
    const logs = [];
    try {
      // Capture console.log output
      originalConsoleLog = console.log;
      console.log = (...args) => {
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' '));
      };
      const executeCode = new Function(compileResult.code);
      executeCode();
      output = logs.join('\n');
    } catch (execError) {
      executionErrors.push({
        message: execError instanceof Error ? execError.message : 'Runtime error occurred',
        type: 'runtime'
      });
    } finally {
      if (originalConsoleLog) console.log = originalConsoleLog;
    }
    return NextResponse.json({
      success: compileResult.success && executionErrors.length === 0,
      code: compileResult.code || null,
      output: output,
      ast: compileResult.ast || null,
      errors: [...(compileResult.errors || []), ...executionErrors]
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        code: null,
        output: null,
        ast: null,
        errors: [{
          message: error instanceof Error ? error.message : 'Unknown server error',
          type: 'server'
        }]
      },
      { status: 500 }
    );
  }
}
