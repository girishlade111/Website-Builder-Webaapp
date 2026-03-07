// API: Real-time Collaboration
// GET /api/collaboration/[projectId] - Get collaboration state
// POST /api/collaboration/[projectId] - Update collaboration state (Yjs sync)

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

const checkProjectAccess = async (projectId: string, userId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { collaborations: true }
  });

  if (!project) return { allowed: false, reason: 'Project not found' };

  const isOwner = project.ownerId === userId;
  const isCollaborator = project.collaborations.some(
    c => c.userId === userId && c.acceptedAt !== null
  );

  if (!isOwner && !isCollaborator) {
    return { allowed: false, reason: 'Access denied' };
  }

  return { allowed: true };
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { projectId } = await params;

    // Check access
    const access = await checkProjectAccess(projectId, user.id);
    if (!access.allowed) {
      return NextResponse.json(
        { success: false, error: access.reason },
        { status: 403 }
      );
    }

    // Get collaboration session
    let session = await prisma.collaborationSession.findUnique({
      where: { projectId }
    });

    // Get active collaborators
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        collaborations: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true }
            }
          }
        }
      }
    });

    const collaborators = project?.collaborations.map(c => ({
      userId: c.userId,
      user: c.user,
      role: c.role,
      cursor: (session?.cursors as any)?.[c.userId] || null
    })) || [];

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session?.id || null,
        yjsState: session?.yjsState ? Array.from(new Uint8Array(session.yjsState)) : null,
        cursors: session?.cursors || {},
        collaborators
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { projectId } = await params;
    const body = await request.json();
    const { yjsUpdate, cursor, presence } = body;

    // Check access
    const access = await checkProjectAccess(projectId, user.id);
    if (!access.allowed) {
      return NextResponse.json(
        { success: false, error: access.reason },
        { status: 403 }
      );
    }

    // Get or create collaboration session
    let session = await prisma.collaborationSession.findUnique({
      where: { projectId }
    });

    if (!session) {
      session = await prisma.collaborationSession.create({
        data: {
          projectId,
          yjsState: yjsUpdate ? Buffer.from(new Uint8Array(yjsUpdate)) : null,
          cursors: cursor ? { [user.id]: cursor } : {}
        }
      });
    } else {
      // Update session
      const updates: any = {};

      if (yjsUpdate) {
        // Merge Yjs updates
        const currentState = session.yjsState ? new Uint8Array(session.yjsState) : new Uint8Array();
        const newState = new Uint8Array(yjsUpdate);
        // In production, properly merge Yjs states
        updates.yjsState = Buffer.from(newState);
      }

      if (cursor) {
        const currentCursors = (session.cursors as any) || {};
        updates.cursors = { ...currentCursors, [user.id]: cursor };
      }

      if (Object.keys(updates).length > 0) {
        session = await prisma.collaborationSession.update({
          where: { projectId },
          data: updates
        });
      }
    }

    // Get current cursors for broadcasting to other users
    const cursors = (session.cursors as any) || {};
    const otherCursors = Object.fromEntries(
      Object.entries(cursors).filter(([userId]) => userId !== user.id)
    );

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        cursors: otherCursors,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('Error updating collaboration state:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update collaboration state' },
      { status: 500 }
    );
  }
}
