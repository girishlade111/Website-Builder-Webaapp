// API: Plugin Uninstall
// DELETE /api/projects/[id]/plugins/[pluginId] - Uninstall plugin

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pluginId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId, pluginId } = await params;

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

      if (!collaboration || collaboration.role === 'VIEWER') {
        return NextResponse.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    const installedPlugin = await prisma.installedPlugin.findFirst({
      where: { projectId, pluginId }
    });

    if (!installedPlugin) {
      return NextResponse.json(
        { success: false, error: 'Plugin not installed' },
        { status: 404 }
      );
    }

    await prisma.installedPlugin.delete({
      where: { id: installedPlugin.id }
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
