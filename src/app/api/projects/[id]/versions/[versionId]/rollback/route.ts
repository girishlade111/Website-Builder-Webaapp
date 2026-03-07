// API: Rollback to Version
// POST /api/projects/:id/versions/:versionId/rollback - Rollback project to specific version

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id, versionId } = await params;

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

    // Get the version to rollback to
    const version = await prisma.projectVersion.findFirst({
      where: {
        id: versionId,
        projectId: id
      }
    });

    if (!version) {
      return NextResponse.json(
        { success: false, error: 'Version not found' },
        { status: 404 }
      );
    }

    const snapshot = version.snapshot as any;

    // Update project with snapshot data
    await prisma.project.update({
      where: { id },
      data: {
        name: snapshot.project?.name || project.name,
        description: snapshot.project?.description,
        settings: snapshot.project?.settings,
        deploymentConfig: snapshot.project?.deploymentConfig
      }
    });

    // Delete current pages
    await prisma.page.deleteMany({
      where: { projectId: id }
    });

    // Restore pages from snapshot
    if (snapshot.pages && Array.isArray(snapshot.pages)) {
      for (const pageData of snapshot.pages) {
        await prisma.page.create({
          data: {
            projectId: id,
            name: pageData.name,
            slug: pageData.slug || pageData.name.toLowerCase().replace(/\s+/g, '-'),
            path: pageData.path,
            isHome: pageData.isHome || false,
            schema: pageData.schema,
            metaTitle: pageData.metaTitle,
            metaDescription: pageData.metaDescription
          }
        });
      }
    }

    // Create new version for the rollback
    const latestVersion = await prisma.projectVersion.findFirst({
      where: { projectId: id },
      orderBy: { version: 'desc' }
    });

    await prisma.projectVersion.create({
      data: {
        projectId: id,
        version: (latestVersion?.version || 0) + 1,
        message: `Rollback to version ${version.version}`,
        snapshot: version.snapshot as any,
        createdById: user.id
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully rolled back to version ${version.version}`
    });
  } catch (error) {
    console.error('Error rolling back:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to rollback to version' },
      { status: 500 }
    );
  }
}
