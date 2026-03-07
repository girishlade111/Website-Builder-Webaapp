// API: Project Collaborators - List and Invite
// GET /api/projects/:id/collaborators - List all collaborators
// POST /api/projects/:id/collaborators - Invite new collaborator

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    const project = await checkProjectAccess(id, user.id);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    const collaborations = await prisma.collaboration.findMany({
      where: { projectId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: { invitedAt: 'desc' }
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
        invitedAt: project.createdAt,
        acceptedAt: project.createdAt
      },
      ...collaborations.map(c => ({
        user: c.user,
        role: c.role,
        invitedAt: c.invitedAt,
        acceptedAt: c.acceptedAt
      }))
    ];

    return NextResponse.json({
      success: true,
      data: { collaborators }
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
    const { id } = await params;
    const body = await request.json();
    const { email, role = 'EDITOR' } = body;

    const project = await checkProjectAccess(id, user.id);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Only owner or admin can invite
    if (project.role !== 'OWNER' && project.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to invite collaborators' },
        { status: 403 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
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

    // Find or create user
    let invitee = await prisma.user.findUnique({
      where: { email }
    });

    if (!invitee) {
      invitee = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0]
        }
      });
    }

    // Check if already a collaborator
    const existing = await prisma.collaboration.findFirst({
      where: {
        projectId: id,
        userId: invitee.id
      }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'User is already a collaborator' },
        { status: 400 }
      );
    }

    // Create collaboration
    const collaboration = await prisma.collaboration.create({
      data: {
        projectId: id,
        userId: invitee.id,
        role: role as any
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
