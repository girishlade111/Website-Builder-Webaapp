// API: Single Collaborator - Update and Remove
// PUT /api/projects/[id]/collaborators/[userId] - Update collaborator role
// DELETE /api/projects/[id]/collaborators/[userId] - Remove collaborator

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

  const role = isOwner ? 'OWNER' : project.collaborations.find(c => c.userId === userId)?.role;

  return { allowed: true, role };
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId, userId } = await params;
    const body = await request.json();
    const { role } = body;

    // Check access
    const access = await checkProjectAccess(projectId, user.id);
    if (!access.allowed) {
      return NextResponse.json(
        { success: false, error: access.reason },
        { status: 403 }
      );
    }

    // Only owner and admin can update roles
    if (access.role !== 'OWNER' && access.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Permission denied to update roles' },
        { status: 403 }
      );
    }

    // Prevent changing owner role
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (project?.ownerId === userId) {
      return NextResponse.json(
        { success: false, error: 'Cannot change owner role' },
        { status: 400 }
      );
    }

    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Role is required' },
        { status: 400 }
      );
    }

    const collaboration = await prisma.collaboration.update({
      where: {
        userId_projectId: {
          userId,
          projectId
        }
      },
      data: { role: role as any },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: collaboration,
      message: 'Collaborator role updated'
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Collaborator not found' },
        { status: 404 }
      );
    }
    console.error('Error updating collaborator:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update collaborator' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId, userId } = await params;

    // Check access
    const access = await checkProjectAccess(projectId, user.id);
    if (!access.allowed) {
      return NextResponse.json(
        { success: false, error: access.reason },
        { status: 403 }
      );
    }

    // Only owner and admin can remove collaborators
    if (access.role !== 'OWNER' && access.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Permission denied to remove collaborators' },
        { status: 403 }
      );
    }

    // Prevent removing owner
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (project?.ownerId === userId) {
      return NextResponse.json(
        { success: false, error: 'Cannot remove project owner' },
        { status: 400 }
      );
    }

    // Prevent self-removal (use leave endpoint instead)
    if (userId === user.id) {
      return NextResponse.json(
        { success: false, error: 'Use the leave endpoint to remove yourself' },
        { status: 400 }
      );
    }

    await prisma.collaboration.delete({
      where: {
        userId_projectId: {
          userId,
          projectId
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Collaborator removed'
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Collaborator not found' },
        { status: 404 }
      );
    }
    console.error('Error removing collaborator:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove collaborator' },
      { status: 500 }
    );
  }
}
