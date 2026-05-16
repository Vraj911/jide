const test = require("node:test");
const assert = require("node:assert/strict");
const jppExecution = require("../ui/lib/jppExecution.cjs");
const { getRagAnswer } = require("../ui/lib/rag.js");

test("execution endpoint core logic responds under performance budget", async () => {
  const start = process.hrtime.bigint();
  const result = await jppExecution.compileAndRunJpp("ye x = 1\nbol x");
  const elapsedMs = Number(process.hrtime.bigint() - start) / 1_000_000;
  assert.equal(result.status, 200);
  assert.ok(elapsedMs < 1000, `Execution took ${elapsedMs.toFixed(2)}ms`);
});

test("docs chat retrieval responds quickly without upstream model key", async () => {
  const start = process.hrtime.bigint();
  const result = await getRagAnswer("what is jpp");
  const elapsedMs = Number(process.hrtime.bigint() - start) / 1_000_000;
  assert.ok(typeof result.answer === "string");
  assert.ok(elapsedMs < 1500, `RAG retrieval took ${elapsedMs.toFixed(2)}ms`);
});
