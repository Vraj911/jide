import { Injectable } from '@nestjs/common';

@Injectable()
export class ExecutionService {
  runJavaScriptUnsafe(jsCode: string): { output: string; errors: Array<{ message: string; type: string }> } {
    const logs: string[] = [];
    const errors: Array<{ message: string; type: string }> = [];

    let originalConsoleLog: typeof console.log | undefined;
    try {
      originalConsoleLog = console.log;
      console.log = (...args: unknown[]) => {
        logs.push(
          args
            .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
            .join(' '),
        );
      };

      const fn = new Function(jsCode);
      fn();
    } catch (err) {
      errors.push({
        message: err instanceof Error ? err.message : 'Runtime error occurred',
        type: 'runtime',
      });
    } finally {
      if (originalConsoleLog) console.log = originalConsoleLog;
    }

    return { output: logs.join('\n'), errors };
  }
}
