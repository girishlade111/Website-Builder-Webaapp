// API: Installed Plugin - Update settings and Uninstall
// PUT /api/projects/:id/plugins/:pluginId - Update plugin settings
// DELETE /api/projects/:id/plugins/:pluginId - Uninstall plugin

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
  { params }: { params: Promise<{ id: string; pluginId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id, pluginId } = await params;
    const body = await request.json();
    const { settings } = body;

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

    const existing = await prisma.installedPlugin.findFirst({
      where: {
        projectId: id,
        pluginId
      }
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Plugin not installed' },
        { status: 404 }
      );
    }

    const installed = await prisma.installedPlugin.update({
      where: { id: existing.id },
      data: {
        settings: settings || {}
      },
      include: {
        plugin: true
      }
    });

    return NextResponse.json({
      success: true,
      data: installed,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pluginId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id, pluginId } = await params;

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

    const existing = await prisma.installedPlugin.findFirst({
      where: {
        projectId: id,
        pluginId
      }
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Plugin not installed' },
        { status: 404 }
      );
    }

    await prisma.installedPlugin.delete({
      where: { id: existing.id }
    });

    // Decrement plugin install count
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
