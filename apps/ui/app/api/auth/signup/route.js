import { NextResponse } from "next/server";
import authApi from "@/lib/authApi.cjs";
import csrf from "@/lib/csrf.cjs";
import { applyRateLimit } from "@/lib/rateLimit.cjs";
import { getRequestContext } from "@/lib/requestContext.cjs";

export async function POST(request) {
  const rate = applyRateLimit(request, "auth-signup", { limit: 10, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many signup requests. Try again later." }, { status: 429 });
  }
  if (!csrf.isValidCsrfToken(request)) {
    return NextResponse.json({ error: "Invalid CSRF token." }, { status: 403 });
  }

  const body = await request.json();
  const result = await authApi.signup(body, getRequestContext(request));
  const response = NextResponse.json(result.body, { status: result.status });
  if (result.sessionCookie) {
    response.cookies.set(result.sessionCookie);
  }
  return response;
}
