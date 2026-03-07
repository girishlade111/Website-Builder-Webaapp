// API: Collaboration - Real-time collaboration state
// GET /api/collaboration/:projectId - Get collaboration state
// POST /api/collaboration/:projectId - Update collaboration state

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
    include: {
      collaborations: {
        where: { userId }
      }
    }
  });

  if (!project) return null;
  if (project.ownerId === userId) return { ...project, role: 'OWNER' as const };
  if (project.collaborations.length > 0) {
    return { ...project, role: project.collaborations[0].role };
  }
  return null;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { projectId } = await params;

    const project = await checkProjectAccess(projectId, user.id);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found or access denied' },
        { status: 404 }
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
          yjsState: null,
          cursors: {}
        }
      });
    }

    // Get active collaborators
    const collaborations = await prisma.collaboration.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    // Include owner
    const owner = await prisma.user.findUnique({
      where: { id: project.ownerId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true
      }
    });

    const collaborators = [
      {
        user: owner,
        role: 'OWNER',
        cursor: null
      },
      ...collaborations.map(c => ({
        user: c.user,
        role: c.role,
        cursor: (session.cursors as any)?.[c.userId] || null
      }))
    ];

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        yjsState: session.yjsState,
        cursors: session.cursors || {},
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

    const project = await checkProjectAccess(projectId, user.id);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Get or create session
    let session = await prisma.collaborationSession.findUnique({
      where: { projectId }
    });

    if (!session) {
      session = await prisma.collaborationSession.create({
        data: {
          projectId,
          yjsState: null,
          cursors: {}
        }
      });
    }

    // Update session
    const updateData: any = {};

    if (yjsUpdate) {
      // Merge Yjs updates
      updateData.yjsState = Buffer.from(yjsUpdate);
    }

    if (cursor) {
      // Update cursor position for current user
      const cursors = (session.cursors as any) || {};
      cursors[user.id] = {
        ...cursor,
        userId: user.id,
        userName: user.name || user.email,
        updatedAt: new Date()
      };
      updateData.cursors = cursors;
    }

    if (Object.keys(updateData).length > 0) {
      session = await prisma.collaborationSession.update({
        where: { projectId },
        data: updateData
      });
    }

    // Get other collaborators' cursors (exclude current user)
    const otherCursors: Record<string, any> = {};
    const cursors = (session.cursors as any) || {};
    for (const [userId, cursorData] of Object.entries(cursors)) {
      if (userId !== user.id) {
        otherCursors[userId] = cursorData;
      }
    }

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
