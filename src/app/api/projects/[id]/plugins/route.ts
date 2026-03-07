// API: Project Plugins - List and Install
// GET /api/projects/[id]/plugins - List installed plugins
// POST /api/projects/[id]/plugins - Install plugin

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

      if (!collaboration) {
        return NextResponse.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    const installedPlugins = await prisma.installedPlugin.findMany({
      where: { projectId },
      include: {
        plugin: true
      },
      orderBy: { installedAt: 'desc' }
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
    const { id: projectId } = await params;
    const body = await request.json();

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

    const { pluginId, settings } = body;

    if (!pluginId) {
      return NextResponse.json(
        { success: false, error: 'Plugin ID is required' },
        { status: 400 }
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
      where: { projectId, pluginId }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Plugin already installed' },
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
        plugin: true
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
