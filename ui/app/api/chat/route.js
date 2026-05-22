import { NextResponse } from "next/server";
import ai from "@/lib/ai";
const { getAiAnswer } = ai;
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(req) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const lastUser = [...messages].reverse().find((m) => m?.role === "user");
    const query = (lastUser?.content || body?.prompt || "").trim();
    if (!query) {
      return NextResponse.json({ error: "Missing prompt." }, { status: 400 });
    }
    const result = await getAiAnswer(query);
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
