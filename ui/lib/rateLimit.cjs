const { getClientIp } = require("./requestContext.cjs");
const buckets = new Map();
function applyRateLimit(request, keyPrefix, options = {}) {
  const limit = options.limit ?? 30;
  const windowMs = options.windowMs ?? 60_000;
  const ip = getClientIp(request);
  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }
  existing.count += 1;
  buckets.set(key, existing);
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}
module.exports = { applyRateLimit };
