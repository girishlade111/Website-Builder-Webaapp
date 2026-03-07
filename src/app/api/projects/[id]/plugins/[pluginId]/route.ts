// API: Plugin Settings Update
// PUT /api/projects/[id]/plugins/[pluginId] - Update plugin settings

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

// Update plugin settings
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pluginId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId, pluginId } = await params;
    const body = await request.json();
    const { settings } = body;

    // Check access
    const access = await checkProjectAccess(projectId, user.id);
    if (!access.allowed) {
      return NextResponse.json(
        { success: false, error: access.reason },
        { status: 403 }
      );
    }

    // Check if user has edit permission
    if (access.role !== 'OWNER' && access.role !== 'ADMIN' && access.role !== 'EDITOR') {
      return NextResponse.json(
        { success: false, error: 'Edit permission denied' },
        { status: 403 }
      );
    }

    // Update plugin settings
    const updated = await prisma.installedPlugin.update({
      where: {
        projectId_pluginId: {
          projectId,
          pluginId
        }
      },
      data: { settings },
      include: {
        plugin: {
          select: {
            id: true,
            name: true,
            description: true,
            version: true,
            type: true,
            manifest: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Plugin settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating plugin settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update plugin settings' },
      { status: 500 }
    );
  }
}

// Uninstall a plugin
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pluginId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId, pluginId } = await params;

    // Check access
    const access = await checkProjectAccess(projectId, user.id);
    if (!access.allowed) {
      return NextResponse.json(
        { success: false, error: access.reason },
        { status: 403 }
      );
    }

    // Check if user has edit permission
    if (access.role !== 'OWNER' && access.role !== 'ADMIN' && access.role !== 'EDITOR') {
      return NextResponse.json(
        { success: false, error: 'Edit permission denied' },
        { status: 403 }
      );
    }

    // Check if plugin is installed
    const installed = await prisma.installedPlugin.findUnique({
      where: {
        projectId_pluginId: {
          projectId,
          pluginId
        }
      }
    });

    if (!installed) {
      return NextResponse.json(
        { success: false, error: 'Plugin is not installed' },
        { status: 404 }
      );
    }

    // Uninstall plugin
    await prisma.installedPlugin.delete({
      where: {
        projectId_pluginId: {
          projectId,
          pluginId
        }
      }
    });

    // Update plugin install count
    await prisma.plugin.update({
      where: { id: pluginId },
      data: {
        installs: { decrement: 1 }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Plugin uninstalled successfully'
    });
  } catch (error) {
    console.error('Error uninstalling plugin:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to uninstall plugin' },
      { status: 500 }
    );
  }
}
