const { createHash, randomBytes, scryptSync, timingSafeEqual } = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");

const STORE_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(STORE_DIR, "auth-store.json");
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const STORE_VERSION = 2;

let mutationQueue = Promise.resolve();

function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const digest = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${digest}`;
}

function verifyPassword(password, storedHash) {
  const [salt, digest] = String(storedHash).split(":");
  if (!salt || !digest) return false;
  const expected = Buffer.from(digest, "hex");
  const actual = Buffer.from(scryptSync(password, salt, 64).toString("hex"), "hex");
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

async function ensureStore() {
  await fs.mkdir(STORE_DIR, { recursive: true });
  try {
    await fs.access(STORE_FILE);
  } catch {
    await fs.writeFile(
      STORE_FILE,
      JSON.stringify({ version: STORE_VERSION, users: [], sessions: [], auditLog: [] }, null, 2),
      "utf8",
    );
  }
}

async function readStore() {
  await ensureStore();
  let raw = await fs.readFile(STORE_FILE, "utf8");
  if (!raw.trim()) {
    raw = '{"users":[],"sessions":[]}';
  }
  const parsed = JSON.parse(raw);
  return {
    version: Number.isFinite(parsed.version) ? parsed.version : STORE_VERSION,
    users: Array.isArray(parsed.users) ? parsed.users : [],
    sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
    auditLog: Array.isArray(parsed.auditLog) ? parsed.auditLog : [],
  };
}

async function writeStore(store) {
  const tempFile = `${STORE_FILE}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(store, null, 2), "utf8");
  await fs.rename(tempFile, STORE_FILE);
}

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role || "USER",
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt || null,
  };
}

function withMutation(fn) {
  const run = mutationQueue.then(async () => {
    const store = await readStore();
    const result = await fn(store);
    await writeStore(store);
    return result;
  });
  mutationQueue = run.catch(() => undefined);
  return run;
}

function createClientFingerprint(context = {}) {
  const raw = `${context.ip || "unknown"}|${context.userAgent || "unknown"}`;
  return createHash("sha256").update(raw).digest("hex");
}

function appendAuditLog(store, action, context = {}) {
  store.auditLog.push({
    action,
    timestamp: new Date().toISOString(),
    email: context.email || null,
    userId: context.userId || null,
    ip: context.ip || null,
  });

  if (store.auditLog.length > 500) {
    store.auditLog = store.auditLog.slice(store.auditLog.length - 500);
  }
}

async function createUser(email, password, context = {}) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedPassword = String(password || "");
  if (!normalizedEmail || !normalizedPassword) throw new Error("Email and password are required.");
  if (normalizedPassword.length < 6) throw new Error("Password must be at least 6 characters.");

  return withMutation(async (store) => {
    if (store.users.some((u) => u.email === normalizedEmail)) throw new Error("Email already registered.");

    const user = {
      id: randomBytes(12).toString("hex"),
      email: normalizedEmail,
      role: store.users.length === 0 ? "ADMIN" : "USER",
      passwordHash: hashPassword(normalizedPassword),
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
    };
    store.users.push(user);
    appendAuditLog(store, "SIGNUP", { email: normalizedEmail, userId: user.id, ip: context.ip });
    return sanitizeUser(user);
  });
}

async function loginUser(email, password, context = {}) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedPassword = String(password || "");

  return withMutation(async (store) => {
    const user = store.users.find((u) => u.email === normalizedEmail);
    if (!user || !verifyPassword(normalizedPassword, user.passwordHash)) {
      appendAuditLog(store, "LOGIN_FAILED", { email: normalizedEmail, ip: context.ip });
      throw new Error("Invalid credentials.");
    }

    const token = randomBytes(24).toString("hex");
    const now = Date.now();
    const fingerprint = createClientFingerprint(context);

    store.sessions = store.sessions.filter((s) => Number(s.expiresAt) > now);
    user.lastLoginAt = new Date(now).toISOString();
    store.sessions.push({
      token,
      userId: user.id,
      createdAt: now,
      updatedAt: now,
      expiresAt: now + SESSION_MAX_AGE_MS,
      idleExpiresAt: now + SESSION_IDLE_TIMEOUT_MS,
      fingerprint,
    });
    appendAuditLog(store, "LOGIN_SUCCESS", { email: normalizedEmail, userId: user.id, ip: context.ip });
    return { user: sanitizeUser(user), token };
  });
}

async function getSessionUser(token, context = {}) {
  if (!token) return null;
  const store = await readStore();
  const now = Date.now();
  const expectedFingerprint = createClientFingerprint(context);
  const session = store.sessions.find(
    (s) =>
      s.token === token &&
      Number(s.expiresAt) > now &&
      Number(s.idleExpiresAt || 0) > now &&
      s.fingerprint === expectedFingerprint,
  );
  if (!session) return null;
  const user = store.users.find((u) => u.id === session.userId);
  return user ? sanitizeUser(user) : null;
}

async function touchSession(token) {
  if (!token) return;
  await withMutation(async (store) => {
    const session = store.sessions.find((s) => s.token === token);
    if (!session) return;
    const now = Date.now();
    session.updatedAt = now;
    session.idleExpiresAt = now + SESSION_IDLE_TIMEOUT_MS;
  });
}

async function deleteSession(token, context = {}) {
  if (!token) return;
  await withMutation(async (store) => {
    const existing = store.sessions.find((s) => s.token === token);
    store.sessions = store.sessions.filter((s) => s.token !== token);
    if (existing) {
      appendAuditLog(store, "LOGOUT", { userId: existing.userId, ip: context.ip });
    }
  });
}

async function resetStoreData() {
  await withMutation(async (store) => {
    store.version = STORE_VERSION;
    store.users = [];
    store.sessions = [];
    store.auditLog = [];
  });
}

module.exports = {
  createUser,
  loginUser,
  getSessionUser,
  touchSession,
  deleteSession,
  resetStoreData,
  createClientFingerprint,
  authSessionMaxAgeSeconds: Math.floor(SESSION_MAX_AGE_MS / 1000),
};
