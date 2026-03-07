// API: Project Settings - Analytics
// PUT /api/projects/:id/settings/analytics - Update analytics settings

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    const body = await request.json();
    const { analytics } = body;

    const project = await checkProjectAccess(id, user.id);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    if (project.role !== 'OWNER' && project.role !== 'ADMIN' && project.role !== 'EDITOR') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const existingSettings = (project.settings as any) || {};
    const updatedSettings = {
      ...existingSettings,
      analytics: {
        ...(existingSettings.analytics || {}),
        ...analytics
      }
    };

    const updated = await prisma.project.update({
      where: { id },
      data: {
        settings: updatedSettings
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedSettings.analytics,
      message: 'Analytics settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating analytics settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update analytics settings' },
      { status: 500 }
    );
  }
}
