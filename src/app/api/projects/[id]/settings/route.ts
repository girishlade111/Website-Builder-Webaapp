// API: Project Settings
// GET /api/projects/[id]/settings - Get project settings
// PUT /api/projects/[id]/settings - Update project settings

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  getProjectSettings,
  updateProjectSettings,
  updateSeoSettings,
  updateDomainSettings,
  updateAnalyticsSettings,
  validateDomainConfiguration
} from '@/lib/services/projectSettings';

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

// Get project settings
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

    const settings = await getProjectSettings(projectId);

    if (!settings) {
      return NextResponse.json(
        { success: false, error: 'Settings not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching project settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project settings' },
      { status: 500 }
    );
  }
}

// Update project settings
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId } = await params;
    const body = await request.json();

    // Check access
    const access = await checkProjectAccess(projectId, user.id);
    if (!access.allowed) {
      return NextResponse.json(
        { success: false, error: access.reason },
        { status: 403 }
      );
    }

    // Check if user has admin permission
    if (access.role !== 'OWNER' && access.role !== 'ADMIN' && access.role !== 'EDITOR') {
      return NextResponse.json(
        { success: false, error: 'Edit permission denied' },
        { status: 403 }
      );
    }

    const settings = await updateProjectSettings(projectId, body);

    return NextResponse.json({
      success: true,
      data: settings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating project settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project settings' },
      { status: 500 }
    );
  }
}
