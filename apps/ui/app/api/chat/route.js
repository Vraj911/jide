import { NextResponse } from "next/server";
import { getRagAnswer } from "@/lib/rag";
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
const result = await getRagAnswer(query, { messages });
console.log("RAG ANSWER:", result.answer);
console.log("RAG SOURCES:", result.sources);
return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: "Failed to generate response." }, { status: 500 });
  }
}
