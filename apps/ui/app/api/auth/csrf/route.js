import { NextResponse } from "next/server";
import csrf from "@/lib/csrf.cjs";

export async function GET() {
  const token = csrf.issueCsrfToken();
  const response = NextResponse.json({ csrfToken: token });
  response.cookies.set(csrf.buildCsrfCookie(token));
  return response;
}
