const test = require("node:test");
const assert = require("node:assert/strict");
const authApi = require("../apps/ui/lib/authApi.cjs");
const authStore = require("../apps/ui/lib/authStore.cjs");

async function resetStore() {
  await authStore.resetStoreData();
}

test("signup should return 201 and session cookie", { concurrency: false }, async () => {
  await resetStore();
  const result = await authApi.signup({ email: "api@example.com", password: "password123" });
  assert.equal(result.status, 201);
  assert.equal(result.body.user.email, "api@example.com");
  assert.equal(result.sessionCookie.name, authApi.SESSION_COOKIE);
});

test("login should reject invalid credentials", { concurrency: false }, async () => {
  await resetStore();
  const result = await authApi.login({ email: "missing@example.com", password: "wrong" });
  assert.equal(result.status, 401);
  assert.match(result.body.error, /invalid credentials/i);
});
