// API: Project Domain Settings
// GET /api/projects/:id/settings/domain - Get domain settings
// PUT /api/projects/:id/settings/domain - Update domain settings

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

    const settings = (project.settings as any) || {};
    const domain = settings.domain || {};

    return NextResponse.json({
      success: true,
      data: domain
    });
  } catch (error) {
    console.error('Error fetching domain settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch domain settings' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    const body = await request.json();
    const { domain } = body;

    const project = await checkProjectAccess(id, user.id);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    if (project.role !== 'OWNER' && project.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const currentSettings = (project.settings as any) || {};
    const updatedSettings = {
      ...currentSettings,
      domain: {
        ...(currentSettings.domain || {}),
        ...domain
      }
    };

    const updated = await prisma.project.update({
      where: { id },
      data: {
        settings: updatedSettings,
        ...(domain.customDomain && {
          deploymentConfig: {
            ...(project.deploymentConfig as any) || {},
            customDomain: domain.customDomain
          }
        })
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedSettings.domain,
      message: 'Domain settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating domain settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update domain settings' },
      { status: 500 }
    );
  }
}
