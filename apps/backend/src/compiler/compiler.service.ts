import { Injectable } from '@nestjs/common';
import { createRequire } from 'node:module';
import { resolveJppCompilerPath } from '../common/jpp-paths';
import { ExecutionService } from './execution.service';

type CompileResult = {
  success: boolean;
  code?: string | null;
  ast?: unknown;
  errors?: any[];
};

@Injectable()
export class CompilerService {
  private readonly compileFn: (code: string) => CompileResult;

  constructor(private readonly exec: ExecutionService) {
    const require = createRequire(__filename);
    const compilerPath = resolveJppCompilerPath();
    const loaded = require(compilerPath);
    this.compileFn = (loaded?.default || loaded?.compile || loaded) as (code: string) => CompileResult;

    if (typeof this.compileFn !== 'function') {
      throw new Error('lib/jpp/compiler.js did not export a compile function');
    }
  }

  compileOnly(source: string, opts?: { includeAst?: boolean }) {
    const compileResult = this.compileFn(source);
    return {
      success: !!compileResult.success,
      output: null,
      ast: opts?.includeAst === false ? null : compileResult.ast ?? null,
      errors: compileResult.errors ?? [],
    };
  }

  compileAndRun(source: string) {
    const compileResult = this.compileFn(source);

    if (!compileResult.success) {
      return {
        success: false,
        output: null,
        ast: compileResult.ast ?? null,
        errors: compileResult.errors ?? [],
      };
    }

    const jsCode = compileResult.code || '';
    const { output, errors: runtimeErrors } = this.exec.runJavaScriptUnsafe(jsCode);

    return {
      success: runtimeErrors.length === 0,
      output,
      ast: compileResult.ast ?? null,
      errors: [...(compileResult.errors ?? []), ...runtimeErrors],
    };
  }
}
