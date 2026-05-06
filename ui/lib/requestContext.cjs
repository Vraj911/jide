function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

function getUserAgent(request) {
  return request.headers.get("user-agent") || "unknown";
}

function getRequestContext(request) {
  return {
    ip: getClientIp(request),
    userAgent: getUserAgent(request),
  };
}

module.exports = { getClientIp, getUserAgent, getRequestContext };
