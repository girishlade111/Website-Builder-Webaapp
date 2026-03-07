// API: Collaboration WebSocket Endpoint
// GET /api/collaboration/[projectId] - WebSocket endpoint for real-time collaboration

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const getCurrentUser = async () => {
  let user = await prisma.user.findFirst({
    where: { email: 'demo@example.com' }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'demo@example.com',
        name: 'Demo User'
      }
    });
  }

  return user;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { projectId } = await params;

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check access
    if (project.ownerId !== user.id) {
      const collaboration = await prisma.collaboration.findFirst({
        where: { userId: user.id, projectId }
      });

      if (!collaboration) {
        return NextResponse.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // Get or create collaboration session
    let session = await prisma.collaborationSession.findUnique({
      where: { projectId }
    });

    if (!session) {
      session = await prisma.collaborationSession.create({
        data: {
          projectId,
          yjsState: null,
          cursors: []
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        projectId,
        sessionId: session.id,
        wsUrl: process.env.WS_URL || `ws://localhost:3001`
      }
    });
  } catch (error) {
    console.error('Error getting collaboration session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get collaboration session' },
      { status: 500 }
    );
  }
}
