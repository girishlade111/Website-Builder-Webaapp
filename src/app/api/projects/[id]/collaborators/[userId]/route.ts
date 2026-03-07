// API: Collaborator Update and Remove
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId, userId } = await params;
    const body = await request.json();

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Only owner or admin can update roles
    if (project.ownerId !== user.id) {
      const collaboration = await prisma.collaboration.findFirst({
        where: { userId: user.id, projectId }
      });

      if (!collaboration || (collaboration.role !== 'OWNER' && collaboration.role !== 'ADMIN')) {
        return NextResponse.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    const { role } = body;

    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Role is required' },
        { status: 400 }
      );
    }

    const validRoles = ['ADMIN', 'EDITOR', 'VIEWER'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Cannot change owner role
    if (userId === project.ownerId) {
      return NextResponse.json(
        { success: false, error: 'Cannot change owner role' },
        { status: 400 }
      );
    }

    const collaboration = await prisma.collaboration.findFirst({
      where: { userId, projectId }
    });

    if (!collaboration) {
      return NextResponse.json(
        { success: false, error: 'Collaborator not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.collaboration.update({
      where: { id: collaboration.id },
      data: { role: role as 'ADMIN' | 'EDITOR' | 'VIEWER' },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Collaborator role updated successfully'
    });
  } catch (error) {
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

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Only owner or admin can remove collaborators
    if (project.ownerId !== user.id) {
      const collaboration = await prisma.collaboration.findFirst({
        where: { userId: user.id, projectId }
      });

      if (!collaboration || (collaboration.role !== 'OWNER' && collaboration.role !== 'ADMIN')) {
        return NextResponse.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // Cannot remove owner
    if (userId === project.ownerId) {
      return NextResponse.json(
        { success: false, error: 'Cannot remove owner' },
        { status: 400 }
      );
    }

    const collaboration = await prisma.collaboration.findFirst({
      where: { userId, projectId }
    });

    if (!collaboration) {
      return NextResponse.json(
        { success: false, error: 'Collaborator not found' },
        { status: 404 }
      );
    }

    await prisma.collaboration.delete({
      where: { id: collaboration.id }
    });

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
