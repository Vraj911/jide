const test = require("node:test");
const assert = require("node:assert/strict");
const authStore = require("../apps/ui/lib/authStore.cjs");

async function resetStore() {
  await authStore.resetStoreData();
}

test("createUser and loginUser should persist and authenticate", { concurrency: false }, async () => {
  await resetStore();
  const user = await authStore.createUser("test@example.com", "password123");
  assert.equal(user.email, "test@example.com");

  const session = await authStore.loginUser("test@example.com", "password123");
  assert.ok(session.token);

  const sessionUser = await authStore.getSessionUser(session.token);
  assert.equal(sessionUser.email, "test@example.com");
});

test("createUser should reject duplicate email", { concurrency: false }, async () => {
  await resetStore();
  await authStore.createUser("duplicate@example.com", "password123");
  await assert.rejects(
    () => authStore.createUser("duplicate@example.com", "password123"),
    /already registered/i,
  );
});

test("deleteSession should invalidate token", { concurrency: false }, async () => {
  await resetStore();
  await authStore.createUser("logout@example.com", "password123");
  const { token } = await authStore.loginUser("logout@example.com", "password123");
  await authStore.deleteSession(token);
  const user = await authStore.getSessionUser(token);
  assert.equal(user, null);
});
