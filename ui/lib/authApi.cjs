const authStore = require("./authStore.cjs");

const SESSION_COOKIE = "jide_session";

function buildSessionCookie(value) {
  return {
    name: SESSION_COOKIE,
    value,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: authStore.authSessionMaxAgeSeconds,
  };
}

async function signup(payload, context) {
  try {
    const user = await authStore.createUser(payload?.email, payload?.password, context);
    const session = await authStore.loginUser(payload?.email, payload?.password, context);
    return { status: 201, body: { user }, sessionCookie: buildSessionCookie(session.token) };
  } catch (error) {
    return { status: 400, body: { error: error instanceof Error ? error.message : "Signup failed." } };
  }
}

async function login(payload, context) {
  try {
    const { user, token } = await authStore.loginUser(payload?.email, payload?.password, context);
    return { status: 200, body: { user }, sessionCookie: buildSessionCookie(token) };
  } catch (error) {
    return { status: 401, body: { error: error instanceof Error ? error.message : "Login failed." } };
  }
}

module.exports = { SESSION_COOKIE, signup, login };
