const { randomBytes, timingSafeEqual } = require("node:crypto");

const CSRF_COOKIE = "jide_csrf";
const CSRF_HEADER = "x-csrf-token";

function issueCsrfToken() {
  return randomBytes(24).toString("hex");
}

function buildCsrfCookie(token) {
  return {
    name: CSRF_COOKIE,
    value: token,
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  };
}

function isValidCsrfToken(request) {
  const cookieToken = request.cookies.get(CSRF_COOKIE)?.value || "";
  const headerToken = request.headers.get(CSRF_HEADER) || "";
  if (!cookieToken || !headerToken) return false;
  const a = Buffer.from(cookieToken);
  const b = Buffer.from(headerToken);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

module.exports = {
  CSRF_COOKIE,
  CSRF_HEADER,
  issueCsrfToken,
  buildCsrfCookie,
  isValidCsrfToken,
};
