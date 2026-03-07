// API: Plugin Installation Management
// GET /api/projects/[id]/plugins - List installed plugins
// POST /api/projects/[id]/plugins - Install a plugin

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

// List installed plugins for a project
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

    const installedPlugins = await prisma.installedPlugin.findMany({
      where: { projectId },
      include: {
        plugin: {
          select: {
            id: true,
            name: true,
            description: true,
            version: true,
            type: true,
            manifest: true,
            schema: true,
            isPremium: true
          }
        }
      },
      orderBy: { installedAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: installedPlugins.map(ip => ({
        ...ip,
        plugin: ip.plugin
      }))
    });
  } catch (error) {
    console.error('Error fetching installed plugins:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch installed plugins' },
      { status: 500 }
    );
  }
}

// Install a plugin
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId } = await params;
    const body = await request.json();
    const { pluginId, settings } = body;

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

    if (!pluginId) {
      return NextResponse.json(
        { success: false, error: 'Plugin ID is required' },
        { status: 400 }
      );
    }

    // Get plugin
    const plugin = await prisma.plugin.findUnique({
      where: { id: pluginId }
    });

    if (!plugin) {
      return NextResponse.json(
        { success: false, error: 'Plugin not found' },
        { status: 404 }
      );
    }

    if (!plugin.isPublished) {
      return NextResponse.json(
        { success: false, error: 'Plugin is not published' },
        { status: 400 }
      );
    }

    // Check if already installed
    const existing = await prisma.installedPlugin.findUnique({
      where: {
        projectId_pluginId: {
          projectId,
          pluginId
        }
      }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Plugin is already installed' },
        { status: 400 }
      );
    }

    // Install plugin
    const installedPlugin = await prisma.installedPlugin.create({
      data: {
        projectId,
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
            type: true,
            manifest: true,
            schema: true
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
      data: installedPlugin,
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
