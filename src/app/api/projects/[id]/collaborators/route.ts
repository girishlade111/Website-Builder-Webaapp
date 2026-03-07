// API: Project Collaborators
// GET /api/projects/[id]/collaborators - List all collaborators
// POST /api/projects/[id]/collaborators - Invite a collaborator
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId } = await params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        collaborations: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true }
            }
          }
        },
        owner: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Format collaborators including owner
    const collaborators = [
      {
        id: project.owner.id,
        email: project.owner.email,
        name: project.owner.name,
        image: project.owner.image,
        role: 'OWNER' as const,
        acceptedAt: new Date()
      },
      ...project.collaborations.map(c => ({
        id: c.user.id,
        email: c.user.email,
        name: c.user.name,
        image: c.user.image,
        role: c.role,
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

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Only owner or admin can invite
    if (project.ownerId !== user.id) {
      const collaboration = await prisma.collaboration.findUnique({
        where: {
          userId_projectId: {
            userId: user.id,
            projectId
          }
        }
      });

      if (collaboration?.role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // Find or create user
    let targetUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!targetUser) {
      targetUser = await prisma.user.create({
        data: { email }
      });
    }

    // Create or update collaboration
    const collaboration = await prisma.collaboration.upsert({
      where: {
        userId_projectId: {
          userId: targetUser.id,
          projectId
        }
      },
      update: { role },
      create: {
        userId: targetUser.id,
        projectId,
        role
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: collaboration,
      message: `Invitation sent to ${email}`
    });
  } catch (error) {
    console.error('Error inviting collaborator:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to invite collaborator' },
      { status: 500 }
    );
  }
}
