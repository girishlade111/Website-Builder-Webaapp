// API: Version by ID - Get and Rollback
// GET /api/projects/[id]/versions/[versionId] - Get version details
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId, versionId } = await params;

    const version = await prisma.projectVersion.findFirst({
      where: { id: versionId, projectId },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!version) {
      return NextResponse.json(
        { success: false, error: 'Version not found' },
        { status: 404 }
      );
    }

    // Check access
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (project?.ownerId !== user.id) {
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

    return NextResponse.json({
      success: true,
      data: version
    });
  } catch (error) {
    console.error('Error fetching version:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch version' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId, versionId } = await params;
    const body = await request.json();
    const { action } = body || {};

    const version = await prisma.projectVersion.findFirst({
      where: { id: versionId, projectId },
      include: {
        project: {
          include: { pages: true }
        }
      }
    });

    if (!version) {
      return NextResponse.json(
        { success: false, error: 'Version not found' },
        { status: 404 }
      );
    }

    // Check access - only owner or admin can rollback
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (project?.ownerId !== user.id) {
      const collaboration = await prisma.collaboration.findFirst({
        where: { userId: user.id, projectId }
      });

      if (!collaboration || (collaboration.role !== 'OWNER' && collaboration.role !== 'ADMIN')) {
        return NextResponse.json(
          { success: false, error: 'Access denied - only owner or admin can rollback' },
          { status: 403 }
        );
      }
    }

    // Handle rollback action
    if (action === 'rollback') {
      const snapshot = version.snapshot as any;

      // Get current project data for fallback
      const currentProject = await prisma.project.findUnique({
        where: { id: projectId }
      });

      if (!currentProject) {
        return NextResponse.json(
          { success: false, error: 'Project not found' },
          { status: 404 }
        );
      }

      // Update project from snapshot
      await prisma.project.update({
        where: { id: projectId },
        data: {
          name: snapshot.project?.name || currentProject.name,
          description: snapshot.project?.description || currentProject.description,
          settings: snapshot.project?.settings || currentProject.settings
        }
      });

      // Update or create pages from snapshot
      if (snapshot.pages && Array.isArray(snapshot.pages)) {
        for (const pageData of snapshot.pages) {
          const existingPage = await prisma.page.findFirst({
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
            // Page was deleted, recreate it
            await prisma.page.create({
              data: {
                id: pageData.id,
                projectId,
                name: pageData.name,
                slug: pageData.path.replace(/^\//, '').replace(/\//g, '-') || pageData.id.substring(0, 6),
                path: pageData.path,
                isHome: pageData.path === '/',
                schema: pageData.schema
              }
            });
          }
        }
      }

      // Create a new version for the rollback
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
    }

    // Default: just return version details
    return NextResponse.json({
      success: true,
      data: version
    });
  } catch (error) {
    console.error('Error handling version:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to handle version' },
      { status: 500 }
    );
  }
}
