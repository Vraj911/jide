import { NextResponse } from "next/server";
import authStore from "@/lib/authStore.cjs";
import { applyRateLimit } from "@/lib/rateLimit.cjs";
import { getRequestContext } from "@/lib/requestContext.cjs";

const SESSION_COOKIE = "jide_session";
const { getSessionUser, touchSession } = authStore;

export async function GET(request) {
  const rate = applyRateLimit(request, "auth-me", { limit: 120, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const context = getRequestContext(request);
  const user = await getSessionUser(token, context);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  await touchSession(token);
  return NextResponse.json({ user });
}
