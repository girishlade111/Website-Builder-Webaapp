// API: Version Rollback
// POST /api/projects/[id]/versions/[versionId]/rollback - Rollback to a specific version

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

    // Get the version to rollback to
    const version = await prisma.projectVersion.findFirst({
      where: {
        id: versionId,
        projectId
      }
    });

    if (!version) {
      return NextResponse.json(
        { success: false, error: 'Version not found' },
        { status: 404 }
      );
    }

    const snapshot = version.snapshot as any;

    // Start a transaction to restore the project
    await prisma.$transaction(async (tx) => {
      // Update project settings
      if (snapshot.project?.settings) {
        await tx.project.update({
          where: { id: projectId },
          data: {
            settings: snapshot.project.settings
          }
        });
      }

      // Delete current pages
      await tx.page.deleteMany({
        where: { projectId }
      });

      // Restore pages from snapshot
      if (snapshot.pages && Array.isArray(snapshot.pages)) {
        for (const pageData of snapshot.pages) {
          await tx.page.create({
            data: {
              projectId,
              name: pageData.name,
              slug: pageData.path.replace(/^\//, '').replace(/\//g, '-') || 'home',
              path: pageData.path,
              isHome: pageData.path === '/',
              schema: pageData.schema
            }
          });
        }
      }
    });

    // Create a new version for the rollback
    const latestVersion = await prisma.projectVersion.findFirst({
      where: { projectId },
      orderBy: { version: 'desc' },
      select: { version: true }
    });

    const newVersionNumber = (latestVersion?.version || 0) + 1;

    const rollbackVersion = await prisma.projectVersion.create({
      data: {
        projectId,
        version: newVersionNumber,
        message: `Rollback to version ${version.version}`,
        snapshot: version.snapshot as any,
        createdById: user.id
      }
    });

    return NextResponse.json({
      success: true,
      data: rollbackVersion,
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
