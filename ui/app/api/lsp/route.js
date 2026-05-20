import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({
    url: process.env.NEXT_PUBLIC_LSP_WS_URL || 'ws://localhost:3001',
    enabled: process.env.NEXT_PUBLIC_ENABLE_LSP === 'true',
  });
}
