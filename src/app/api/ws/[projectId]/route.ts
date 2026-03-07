// API: WebSocket endpoint (for Next.js API routes compatibility)
// This is a placeholder - actual WebSocket handling happens in server.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  return NextResponse.json({
    success: true,
    message: 'WebSocket endpoint',
    data: {
      projectId,
      wsUrl: `ws://localhost:3000/ws/${projectId}`,
      info: 'Use WebSocket connection for real-time collaboration'
    }
  });
}
