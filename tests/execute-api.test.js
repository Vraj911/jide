const test = require("node:test");
const assert = require("node:assert/strict");
const jppExecution = require("../apps/ui/lib/jppExecution.cjs");

test("compileAndRunJpp returns output for valid program", async () => {
  const code = "ye x = 5\nbol x";
  const result = await jppExecution.compileAndRunJpp(code);
  assert.equal(result.status, 200);
  assert.equal(result.body.success, true);
  assert.match(result.body.output, /5/);
});

test("compileAndRunJpp returns validation error for empty input", async () => {
  const result = await jppExecution.compileAndRunJpp("");
  assert.equal(result.status, 400);
  assert.equal(result.body.success, false);
});

test("compileAndRunJpp returns compile errors for invalid syntax", async () => {
  const result = await jppExecution.compileAndRunJpp("ye =");
  assert.equal(result.status, 200);
  assert.equal(result.body.success, false);
  assert.ok(Array.isArray(result.body.errors));
  assert.ok(result.body.errors.length > 0);
});
