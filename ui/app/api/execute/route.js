import { NextResponse } from 'next/server';
import jppExecution from '@/lib/jppExecution.cjs';
const { compileAndRunJpp } = jppExecution;
export async function POST(request) {
  try {
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
