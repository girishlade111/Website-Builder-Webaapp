// API: Real-time Collaboration (WebSocket endpoint)
// This handles Yjs-based real-time collaboration

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

// GET /api/collaboration/[projectId] - Get collaboration state
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { projectId } = await params;

    // Verify user has access to project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        collaborations: {
          where: { userId: user.id }
        }
      }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    const isOwner = project.ownerId === user.id;
    const isCollaborator = project.collaborations.length > 0;

    if (!isOwner && !isCollaborator) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get collaboration session
    const session = await prisma.collaborationSession.findUnique({
      where: { projectId }
    });

    return NextResponse.json({
      success: true,
      data: {
        projectId,
        hasSession: !!session,
        yjsState: session?.yjsState ? Array.from(session.yjsState) : null,
        cursors: session?.cursors || []
      }
    });
  } catch (error) {
    console.error('Error fetching collaboration state:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch collaboration state' },
      { status: 500 }
    );
  }
}

// POST /api/collaboration/[projectId] - Update collaboration state
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { projectId } = await params;
    const body = await request.json();
    const { yjsState, cursors } = body || {};

    // Verify access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        collaborations: {
          where: { userId: user.id }
        }
      }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    const isOwner = project.ownerId === user.id;
    const isCollaborator = project.collaborations.length > 0;

    if (!isOwner && !isCollaborator) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Update or create collaboration session
    const session = await prisma.collaborationSession.upsert({
      where: { projectId },
      update: {
        ...(yjsState && { yjsState: new Uint8Array(yjsState) }),
        ...(cursors && { cursors }),
        updatedAt: new Date()
      },
      create: {
        projectId,
        yjsState: yjsState ? new Uint8Array(yjsState) : null,
        cursors: cursors || null
      }
    });

    return NextResponse.json({
      success: true,
      data: { sessionId: session.id },
      message: 'Collaboration state updated'
    });
  } catch (error) {
    console.error('Error updating collaboration state:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update collaboration state' },
      { status: 500 }
    );
  }
}
