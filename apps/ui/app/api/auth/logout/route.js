import { NextResponse } from "next/server";
import authStore from "@/lib/authStore.cjs";
import csrf from "@/lib/csrf.cjs";
import { applyRateLimit } from "@/lib/rateLimit.cjs";
import { getRequestContext } from "@/lib/requestContext.cjs";

const SESSION_COOKIE = "jide_session";
const { deleteSession } = authStore;

export async function POST(request) {
  const rate = applyRateLimit(request, "auth-logout", { limit: 30, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many logout requests. Try again later." }, { status: 429 });
  }
  if (!csrf.isValidCsrfToken(request)) {
    return NextResponse.json({ error: "Invalid CSRF token." }, { status: 403 });
  }
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  await deleteSession(token, getRequestContext(request));
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    maxAge: 0,
    path: "/",
  });
  return response;
}
