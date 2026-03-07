// API: Project Collaborators - List and Invite
// GET /api/projects/[id]/collaborators - List all collaborators
// POST /api/projects/[id]/collaborators - Invite a collaborator

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId } = await params;

    // Check access
    const access = await checkProjectAccess(projectId, user.id);
    if (!access.allowed) {
      return NextResponse.json(
        { success: false, error: access.reason },
        { status: 403 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: {
          select: { id: true, name: true, email: true, image: true }
        },
        collaborations: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true }
            }
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Format collaborators list with owner first
    const collaborators = [
      {
        user: project.owner,
        role: 'OWNER' as const,
        invitedAt: project.createdAt,
        acceptedAt: project.createdAt
      },
      ...project.collaborations.map(c => ({
        user: c.user,
        role: c.role,
        invitedAt: c.invitedAt,
        acceptedAt: c.acceptedAt
      }))
    ];

    return NextResponse.json({
      success: true,
      data: collaborators
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
    const { email, role = 'EDITOR' } = body;

    // Check access
    const access = await checkProjectAccess(projectId, user.id);
    if (!access.allowed) {
      return NextResponse.json(
        { success: false, error: access.reason },
        { status: 403 }
      );
    }

    // Only owner and admin can invite collaborators
    if (access.role !== 'OWNER' && access.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Permission denied to invite collaborators' },
        { status: 403 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find or create user
    let targetUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!targetUser) {
      targetUser = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0]
        }
      });
    }

    // Check if already a collaborator
    const existing = await prisma.collaboration.findFirst({
      where: {
        projectId,
        userId: targetUser.id
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
        projectId,
        userId: targetUser.id,
        role: role as any,
        invitedAt: new Date()
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
      message: `Invitation sent to ${email}`
    }, { status: 201 });
  } catch (error) {
    console.error('Error inviting collaborator:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to invite collaborator' },
      { status: 500 }
    );
  }
}
