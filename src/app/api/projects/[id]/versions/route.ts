// API: Project Versions - List and Create
// GET /api/projects/[id]/versions - List all versions
// POST /api/projects/[id]/versions - Create new version

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
      where: { id: projectId }
    });

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

    const versions = await prisma.projectVersion.findMany({
      where: { projectId },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { version: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: versions
    });
  } catch (error) {
    console.error('Error fetching versions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch versions' },
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

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { pages: true }
    });

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

    const { message } = body;

    // Get latest version
    const latestVersion = await prisma.projectVersion.findFirst({
      where: { projectId },
      orderBy: { version: 'desc' }
    });

    // Create new version
    const version = await prisma.projectVersion.create({
      data: {
        projectId,
        version: (latestVersion?.version || 0) + 1,
        message: message || 'Manual version save',
        snapshot: {
          project: {
            id: project.id,
            name: project.name,
            description: project.description,
            settings: project.settings
          },
          pages: project.pages.map(p => ({
            id: p.id,
            name: p.name,
            path: p.path,
            schema: p.schema
          }))
        },
        createdById: user.id
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: version,
      message: 'Version created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating version:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create version' },
      { status: 500 }
    );
  }
}
