const { Worker } = require("node:worker_threads");
let compileJPlusPlus = null;
const MAX_SOURCE_CHARS = 20_000;
const EXECUTION_TIMEOUT_MS = 750;
const WORKER_MEMORY_MB = 32;

try {
  compileJPlusPlus = require("../../../lib/jpp/compiler.js");
} catch {
  try {
    compileJPlusPlus = require("../../../../lib/jpp/compiler.js");
  } catch {
    compileJPlusPlus = null;
  }
}

function executeCompiledJavaScript(jsCode) {
  return new Promise((resolve) => {
    let settled = false;
    const workerCode = `
      const { parentPort, workerData } = require("node:worker_threads");
      const vm = require("node:vm");
      const logs = [];
      const sandbox = Object.freeze({
        console: Object.freeze({
          log: (...args) => {
            logs.push(args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg))).join(" "));
          },
        }),
      });
      try {
        const script = new vm.Script(workerData.code);
        script.runInNewContext(sandbox, { timeout: workerData.timeoutMs });
        parentPort.postMessage({ output: logs.join("\\n"), errors: [] });
      } catch (error) {
        parentPort.postMessage({
          output: logs.join("\\n"),
          errors: [{ message: error instanceof Error ? error.message : "Runtime error", type: "runtime" }],
        });
      }
    `;

    const worker = new Worker(workerCode, {
      eval: true,
      workerData: { code: jsCode, timeoutMs: EXECUTION_TIMEOUT_MS },
      resourceLimits: {
        maxOldGenerationSizeMb: WORKER_MEMORY_MB,
        maxYoungGenerationSizeMb: 8,
      },
    });

    const timeoutId = setTimeout(async () => {
      if (settled) return;
      settled = true;
      await worker.terminate();
      resolve({
        output: "",
        errors: [{ message: "Execution timed out.", type: "runtime_timeout" }],
      });
    }, EXECUTION_TIMEOUT_MS + 100);

    worker.once("message", async (message) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      await worker.terminate();
      resolve(message);
    });

    worker.once("error", async (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      await worker.terminate();
      resolve({
        output: "",
        errors: [{ message: error instanceof Error ? error.message : "Worker error", type: "runtime_worker" }],
      });
    });
  });
}

function validateSourceCode(code) {
  if (typeof code !== "string" || code.trim().length === 0) {
    return "Code must be a non-empty string";
  }
  if (code.length > MAX_SOURCE_CHARS) {
    return `Code exceeds ${MAX_SOURCE_CHARS} characters`;
  }
  if (code.includes("\0")) {
    return "Code contains invalid null bytes";
  }
  return null;
}

async function compileAndRunJpp(code) {
  if (!compileJPlusPlus) {
    return { status: 500, body: { success: false, code: null, output: null, ast: null, errors: [{ message: "Compiler unavailable", type: "server" }] } };
  }
  const validationError = validateSourceCode(code);
  if (validationError) {
    return { status: 400, body: { success: false, code: null, output: null, ast: null, errors: [{ message: validationError, type: "validation" }] } };
  }
  const compileResult = compileJPlusPlus(code);
  if (!compileResult.success) {
    return {
      status: 200,
      body: {
        success: false,
        code: compileResult.code || null,
        output: null,
        ast: compileResult.ast || null,
        errors: compileResult.errors || [],
      },
    };
  }
  const execution = await executeCompiledJavaScript(compileResult.code || "");
  return {
    status: 200,
    body: {
      success: execution.errors.length === 0,
      code: compileResult.code || null,
      output: execution.output,
      ast: compileResult.ast || null,
      errors: [...(compileResult.errors || []), ...execution.errors],
    },
  };
}

module.exports = { executeCompiledJavaScript, compileAndRunJpp };
