import { NextResponse } from "next/server";
import rag from "@/lib/rag";
import { applyRateLimit } from "@/lib/rateLimit.cjs";
const { getRagAnswer } = rag;
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(req) {
  try {
    const rate = applyRateLimit(req, "docs-chat", { limit: 20, windowMs: 60_000 });
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many chat requests. Try again later." }, { status: 429 });
    }
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const lastUser = [...messages].reverse().find((m) => m?.role === "user");
    const query = (lastUser?.content || body?.prompt || "").trim();
    if (!query) {
      return NextResponse.json({ error: "Missing prompt." }, { status: 400 });
    }
    const result = await getRagAnswer(query, { messages });
    if (process.env.NODE_ENV !== "production" && result?.debug) {
      console.log("[/api/chat]", result.debug);
    }
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to generate response.",
        debug: process.env.NODE_ENV !== "production"
          ? { message: err instanceof Error ? err.message : String(err) }
          : undefined,
      },
      { status: 500 },
    );
  }
}
