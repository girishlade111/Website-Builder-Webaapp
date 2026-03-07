// API: Project Plugins - List, Install, Update, Uninstall
// GET /api/projects/:id/plugins - List installed plugins
// POST /api/projects/:id/plugins - Install plugin
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

    const installedPlugins = await prisma.installedPlugin.findMany({
      where: { projectId: id },
      include: {
        plugin: {
          select: {
            id: true,
            name: true,
            description: true,
            version: true,
            type: true,
            manifest: true,
            schema: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: installedPlugins
    });
  } catch (error) {
    console.error('Error fetching plugins:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch plugins' },
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
    const { pluginId, settings } = body;

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

    // Check if plugin exists
    const plugin = await prisma.plugin.findUnique({
      where: { id: pluginId }
    });

    if (!plugin) {
      return NextResponse.json(
        { success: false, error: 'Plugin not found' },
        { status: 404 }
      );
    }

    // Check if already installed
    const existing = await prisma.installedPlugin.findFirst({
      where: {
        projectId: id,
        pluginId
      }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Plugin already installed' },
        { status: 400 }
      );
    }

    // Install plugin
    const installed = await prisma.installedPlugin.create({
      data: {
        projectId: id,
        pluginId,
        settings: settings || {}
      },
      include: {
        plugin: {
          select: {
            id: true,
            name: true,
            description: true,
            version: true,
            type: true
          }
        }
      }
    });

    // Update plugin install count
    await prisma.plugin.update({
      where: { id: pluginId },
      data: {
        installs: { increment: 1 }
      }
    });

    return NextResponse.json({
      success: true,
      data: installed,
      message: 'Plugin installed successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error installing plugin:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to install plugin' },
      { status: 500 }
    );
  }
}
