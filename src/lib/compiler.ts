/**
 * J++ Custom Language Compiler
 * Transforms J++ syntax into executable JavaScript
 */

export interface CompilationResult {
  success: boolean;
  code?: string;
  errors?: CompilationError[];
}

export interface CompilationError {
  message: string;
  line?: number;
  column?: number;
  type: 'error' | 'warning';
}

/**
 * Main compilation function
 * Converts J++ source code to JavaScript
 */
export function compileJPlusPlus(source: string): CompilationResult {
  try {
    const errors: CompilationError[] = [];
    let jsCode = source;

    // Transform print statements
    // print "text" -> console.log("text")
    jsCode = jsCode.replace(/print\s+"([^"]*)"/g, 'console.log("$1")');
    jsCode = jsCode.replace(/print\s+'([^']*)'/g, "console.log('$1')");
    
    // Transform print with variables
    // print variable -> console.log(variable)
    jsCode = jsCode.replace(/print\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g, 'console.log($1)');

    // Transform variable declarations
    // var x = 5 -> let x = 5
    jsCode = jsCode.replace(/var\s+/g, 'let ');

    // Transform function declarations
    // func name(params) { } -> function name(params) { }
    jsCode = jsCode.replace(/func\s+/g, 'function ');

    // Basic syntax validation
    const lines = source.split('\n');
    lines.forEach((line, index) => {
      // Check for unclosed strings
      const quotes = (line.match(/"/g) || []).length;
      if (quotes % 2 !== 0) {
        errors.push({
          message: 'Unclosed string literal',
          line: index + 1,
          type: 'error'
        });
      }
    });

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return {
      success: true,
      code: jsCode,
      errors: []
    };
  } catch (error) {
    return {
      success: false,
      errors: [{
        message: `Compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      }]
    };
  }
}

/**
 * Safe execution wrapper
 * Captures console output and runtime errors
 */
export function executeCode(code: string): { output: string; error?: string } {
  const outputs: string[] = [];
  
  // Override console.log to capture output
  const originalLog = console.log;
  console.log = (...args: any[]) => {
    outputs.push(args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' '));
  };

  try {
    // Execute in a function scope for safety
    const fn = new Function(code);
    const result = fn();
    
    // If there's a return value, add it to output
    if (result !== undefined) {
      outputs.push(`Return value: ${result}`);
    }

    console.log = originalLog;
    return { output: outputs.join('\n') || 'Program executed successfully (no output)' };
  } catch (error) {
    console.log = originalLog;
    return {
      output: outputs.join('\n'),
      error: error instanceof Error ? error.message : 'Runtime error occurred'
    };
  }
}
