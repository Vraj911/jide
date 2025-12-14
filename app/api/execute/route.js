import { NextResponse } from 'next/server';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
// Use createRequire to load CommonJS modules in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);
const compileJPlusPlus = require(resolve(__dirname, '../../lib/jpp/compiler.js'));

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
    try {
      // Capture console.log output
      const originalConsoleLog = console.log;
      const logs = [];
      
      console.log = (...args) => {
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' '));
      };
      const executeCode = new Function(compileResult.code);
      executeCode();
            console.log = originalConsoleLog;
      output = logs.join('\n');
    } catch (execError) {
      executionErrors.push({
        message: execError instanceof Error ? execError.message : 'Runtime error occurred',
        type: 'runtime'
      });
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
