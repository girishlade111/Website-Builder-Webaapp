// API: Collaborator by ID - Update role and Remove
// PUT /api/projects/:id/collaborators/:userId - Update collaborator role
// DELETE /api/projects/:id/collaborators/:userId - Remove collaborator

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id, userId } = await params;
    const body = await request.json();
    const { role } = body;

    const project = await checkProjectAccess(id, user.id);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Only owner or admin can update roles
    if (project.role !== 'OWNER' && project.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Cannot change owner role
    if (userId === project.ownerId) {
      return NextResponse.json(
        { success: false, error: 'Cannot change owner role' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['ADMIN', 'EDITOR', 'VIEWER'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    const collaboration = await prisma.collaboration.updateMany({
      where: {
        projectId: id,
        userId
      },
      data: { role: role as any }
    });

    if (collaboration.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Collaboration not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.collaboration.findFirst({
      where: {
        projectId: id,
        userId
      },
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

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Role updated successfully'
    });
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update role' },
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
    const { id, userId } = await params;

    const project = await checkProjectAccess(id, user.id);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Only owner or admin can remove collaborators
    if (project.role !== 'OWNER' && project.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Cannot remove owner
    if (userId === project.ownerId) {
      return NextResponse.json(
        { success: false, error: 'Cannot remove project owner' },
        { status: 400 }
      );
    }

    // Cannot remove yourself
    if (userId === user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot remove yourself. Transfer ownership first.' },
        { status: 400 }
      );
    }

    const result = await prisma.collaboration.deleteMany({
      where: {
        projectId: id,
        userId
      }
    });

    if (result.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Collaborator not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Collaborator removed successfully'
    });
  } catch (error) {
    console.error('Error removing collaborator:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove collaborator' },
      { status: 500 }
    );
  }
}
