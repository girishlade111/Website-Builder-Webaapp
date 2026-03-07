// API: Project Collaborators - List and Invite
// GET /api/projects/[id]/collaborators - List all collaborators
// POST /api/projects/[id]/collaborators - Invite collaborator

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId } = await params;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
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

    const collaborations = await prisma.collaboration.findMany({
      where: { projectId },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    });

    // Include owner as well
    const owner = await prisma.user.findUnique({
      where: { id: project.ownerId },
      select: { id: true, name: true, email: true, image: true }
    });

    const result = [
      {
        id: `owner-${project.id}`,
        userId: project.ownerId,
        projectId,
        role: 'OWNER' as const,
        acceptedAt: new Date(),
        user: owner
      },
      ...collaborations
    ];

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch collaborators' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId } = await params;
    const body = await request.json();

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Only owner or admin can invite
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

    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json(
        { success: false, error: 'Email and role are required' },
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

    // Find or create user
    let targetUser = await prisma.user.findFirst({
      where: { email }
    });

    if (!targetUser) {
      targetUser = await prisma.user.create({
        data: { email, name: email.split('@')[0] }
      });
    }

    // Check if already a collaborator
    const existing = await prisma.collaboration.findFirst({
      where: { userId: targetUser.id, projectId }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'User is already a collaborator' },
        { status: 400 }
      );
    }

    // Cannot invite owner
    if (targetUser.id === project.ownerId) {
      return NextResponse.json(
        { success: false, error: 'Cannot change owner role' },
        { status: 400 }
      );
    }

    // Create collaboration
    const collaboration = await prisma.collaboration.create({
      data: {
        userId: targetUser.id,
        projectId,
        role: role as 'ADMIN' | 'EDITOR' | 'VIEWER'
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    });

    // TODO: Send invitation email

    return NextResponse.json({
      success: true,
      data: collaboration,
      message: 'Collaborator invited successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error inviting collaborator:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to invite collaborator' },
      { status: 500 }
    );
  }
}
