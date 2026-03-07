// API: Project Versions - List and Create
// GET /api/projects/:id/versions - List all versions
// POST /api/projects/:id/versions - Create new version

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

    const versions = await prisma.projectVersion.findMany({
      where: { projectId: id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { version: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: { versions }
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
    const { id } = await params;
    const body = await request.json();
    const { message } = body;

    const project = await checkProjectAccess(id, user.id);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Get current project state
    const pages = await prisma.page.findMany({
      where: { projectId: id }
    });

    // Get latest version number
    const latestVersion = await prisma.projectVersion.findFirst({
      where: { projectId: id },
      orderBy: { version: 'desc' }
    });

    const version = await prisma.projectVersion.create({
      data: {
        projectId: id,
        version: (latestVersion?.version || 0) + 1,
        message: message || 'Manual version save',
        snapshot: {
          project: {
            id,
            name: project.name,
            description: project.description,
            settings: project.settings,
            deploymentConfig: project.deploymentConfig
          },
          pages: pages.map(p => ({
            id: p.id,
            name: p.name,
            path: p.path,
            schema: p.schema as any,
            metaTitle: p.metaTitle,
            metaDescription: p.metaDescription
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
