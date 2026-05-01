const { createHash, randomBytes, scryptSync, timingSafeEqual } = require("node:crypto");
const { MongoClient } = require("mongodb");

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000;

const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB = process.env.MONGO_DB || "jide";

let indexInitPromise = null;

function getClient() {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not configured.");
  }

  if (!globalThis.__jideMongoClientPromise) {
    const client = new MongoClient(MONGO_URI);
    globalThis.__jideMongoClientPromise = client.connect();
  }

  return globalThis.__jideMongoClientPromise;
}

async function getDb() {
  const client = await getClient();
  return client.db(MONGO_DB);
}

async function ensureIndexes() {
  if (!indexInitPromise) {
    indexInitPromise = (async () => {
      const db = await getDb();
      await db.collection("users").createIndex({ email: 1 }, { unique: true });
      await db.collection("sessions").createIndex({ token: 1 }, { unique: true });
      await db.collection("sessions").createIndex({ expiresAt: 1 });
    })();
  }

  return indexInitPromise;
}

function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const digest = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${digest}`;
}

function verifyPassword(password, storedHash) {
  const [salt, digest] = String(storedHash || "").split(":");
  if (!salt || !digest) return false;
  const expected = Buffer.from(digest, "hex");
  const actual = Buffer.from(scryptSync(password, salt, 64).toString("hex"), "hex");
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeUser(user) {
  return {
    id: String(user._id),
    email: user.email,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt || null,
  };
}

function createClientFingerprint(context = {}) {
  const raw = `${context.ip || "unknown"}|${context.userAgent || "unknown"}`;
  return createHash("sha256").update(raw).digest("hex");
}

async function createUser(email, password) {
  await ensureIndexes();
  const normalizedEmail = normalizeEmail(email);
  const normalizedPassword = String(password || "");

  if (!normalizedEmail || !normalizedPassword) {
    throw new Error("Email and password are required.");
  }
  if (!isValidEmail(normalizedEmail)) {
    throw new Error("Please provide a valid email address.");
  }
  if (normalizedPassword.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  const now = new Date().toISOString();
  const userDoc = {
    email: normalizedEmail,
    passwordHash: hashPassword(normalizedPassword),
    createdAt: now,
    lastLoginAt: null,
  };

  const db = await getDb();
  try {
    const result = await db.collection("users").insertOne(userDoc);
    return sanitizeUser({ ...userDoc, _id: result.insertedId });
  } catch (error) {
    if (error && error.code === 11000) {
      throw new Error("Email already registered.");
    }
    throw error;
  }
}

async function loginUser(email, password, context = {}) {
  await ensureIndexes();
  const normalizedEmail = normalizeEmail(email);
  const normalizedPassword = String(password || "");

  if (!normalizedEmail || !normalizedPassword) {
    throw new Error("Email and password are required.");
  }

  const db = await getDb();
  const user = await db.collection("users").findOne({ email: normalizedEmail });

  if (!user || !verifyPassword(normalizedPassword, user.passwordHash)) {
    throw new Error("Invalid credentials.");
  }

  const now = Date.now();
  const token = randomBytes(24).toString("hex");
  const fingerprint = createClientFingerprint(context);

  await db.collection("sessions").deleteMany({
    $or: [{ expiresAt: { $lte: now } }, { idleExpiresAt: { $lte: now } }],
  });

  await db.collection("users").updateOne(
    { _id: user._id },
    { $set: { lastLoginAt: new Date(now).toISOString() } },
  );

  await db.collection("sessions").insertOne({
    token,
    userId: user._id,
    createdAt: now,
    updatedAt: now,
    expiresAt: now + SESSION_MAX_AGE_MS,
    idleExpiresAt: now + SESSION_IDLE_TIMEOUT_MS,
    fingerprint,
  });

  return {
    user: sanitizeUser({ ...user, lastLoginAt: new Date(now).toISOString() }),
    token,
  };
}

async function getSessionUser(token, context = {}) {
  if (!token) return null;

  await ensureIndexes();
  const db = await getDb();
  const now = Date.now();
  const expectedFingerprint = createClientFingerprint(context);

  const session = await db.collection("sessions").findOne({ token });
  if (!session) return null;
  if (Number(session.expiresAt) <= now || Number(session.idleExpiresAt) <= now) {
    await db.collection("sessions").deleteOne({ _id: session._id });
    return null;
  }
  if (session.fingerprint !== expectedFingerprint) {
    return null;
  }

  const user = await db.collection("users").findOne({ _id: session.userId });
  return user ? sanitizeUser(user) : null;
}

async function touchSession(token) {
  if (!token) return;
  await ensureIndexes();
  const db = await getDb();
  const now = Date.now();
  await db.collection("sessions").updateOne(
    { token },
    {
      $set: {
        updatedAt: now,
        idleExpiresAt: now + SESSION_IDLE_TIMEOUT_MS,
      },
    },
  );
}

async function deleteSession(token) {
  if (!token) return;
  await ensureIndexes();
  const db = await getDb();
  await db.collection("sessions").deleteOne({ token });
}

async function resetStoreData() {
  await ensureIndexes();
  const db = await getDb();
  await db.collection("sessions").deleteMany({});
  await db.collection("users").deleteMany({});
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
