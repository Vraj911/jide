const test = require("node:test");
const assert = require("node:assert/strict");
const authApi = require("../apps/ui/lib/authApi.cjs");
const authStore = require("../apps/ui/lib/authStore.cjs");
const csrf = require("../apps/ui/lib/csrf.cjs");

test("signup -> login -> me uses cookie-backed session", { concurrency: false }, async () => {
  await authStore.resetStoreData();

  const csrfToken = csrf.issueCsrfToken();
  const csrfCookie = csrf.buildCsrfCookie(csrfToken);
  assert.ok(csrfCookie.value);

  const context = { ip: "127.0.0.1", userAgent: "integration-test-agent" };
  const signupResponse = await authApi.signup(
    { email: "integrate@example.com", password: "password123" },
    context,
  );
  assert.equal(signupResponse.status, 201);
  assert.ok(csrfToken);

  const loginResponse = await authApi.login(
    { email: "integrate@example.com", password: "password123" },
    context,
  );
  assert.equal(loginResponse.status, 200);
  const sessionCookie = loginResponse.sessionCookie?.value;
  assert.ok(sessionCookie);

  const user = await authStore.getSessionUser(sessionCookie, context);
  assert.equal(user.email, "integrate@example.com");
  assert.ok(["USER", "ADMIN"].includes(user.role));
});
