// API: Version Rollback
// POST /api/projects/[id]/versions/[versionId]/rollback - Rollback to version

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId, versionId } = await params;

    const version = await prisma.projectVersion.findFirst({
      where: { id: versionId, projectId }
    });

    if (!version) {
      return NextResponse.json(
        { success: false, error: 'Version not found' },
        { status: 404 }
      );
    }

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

    const snapshot = version.snapshot as any;

    // Update project with snapshot data
    await prisma.project.update({
      where: { id: projectId },
      data: {
        name: snapshot.project.name,
        description: snapshot.project.description,
        settings: snapshot.project.settings
      }
    });

    // Restore pages
    for (const pageData of snapshot.pages) {
      const existingPage = await prisma.page.findUnique({
        where: { id: pageData.id }
      });

      if (existingPage) {
        await prisma.page.update({
          where: { id: pageData.id },
          data: {
            name: pageData.name,
            path: pageData.path,
            schema: pageData.schema
          }
        });
      } else {
        await prisma.page.create({
          data: {
            id: pageData.id,
            projectId,
            name: pageData.name,
            slug: pageData.path.replace(/^\//, '').replace(/\//g, '-') || pageData.id.slice(0, 6),
            path: pageData.path,
            isHome: pageData.path === '/',
            schema: pageData.schema
          }
        });
      }
    }

    // Create new version for rollback
    const latestVersion = await prisma.projectVersion.findFirst({
      where: { projectId },
      orderBy: { version: 'desc' }
    });

    await prisma.projectVersion.create({
      data: {
        projectId,
        version: (latestVersion?.version || 0) + 1,
        message: `Rolled back to version ${version.version}`,
        snapshot: version.snapshot as any,
        createdById: user.id
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully rolled back to version ${version.version}`
    });
  } catch (error) {
    console.error('Error rolling back version:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to rollback version' },
      { status: 500 }
    );
  }
}
