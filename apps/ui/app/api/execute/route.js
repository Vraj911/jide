import { NextResponse } from 'next/server';
import jppExecution from '@/lib/jppExecution.cjs';
import { applyRateLimit } from '@/lib/rateLimit.cjs';
const { compileAndRunJpp } = jppExecution;

export async function POST(request) {
  try {
    const rate = applyRateLimit(request, "execute", { limit: 30, windowMs: 60_000 });
    if (!rate.allowed) {
      return NextResponse.json({ success: false, errors: [{ message: "Too many execution requests.", type: "rate_limit" }] }, { status: 429 });
    }
    const body = await request.json();
    const result = await compileAndRunJpp(body?.code);
    return NextResponse.json(result.body, { status: result.status });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        code: null,
        output: null,
        ast: null,
        errors: [{
          message: error instanceof Error ? error.message : 'Unknown server error',
          type: 'server'
        }]
      },
      { status: 500 }
    );
  }
}
