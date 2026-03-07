// API: Project Versions - List and Create
// GET /api/projects/[id]/versions - List all versions
// POST /api/projects/[id]/versions - Create a new version

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
    const { message } = body || {};

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        pages: true
      }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get the latest version number
    const latestVersion = await prisma.projectVersion.findFirst({
      where: { projectId },
      orderBy: { version: 'desc' },
      select: { version: true }
    });

    const newVersionNumber = (latestVersion?.version || 0) + 1;

    // Create version snapshot
    const version = await prisma.projectVersion.create({
      data: {
        projectId,
        version: newVersionNumber,
        message: message || `Version ${newVersionNumber}`,
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
