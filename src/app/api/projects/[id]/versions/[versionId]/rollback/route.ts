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

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check access - only owner or admin can rollback
    if (project.ownerId !== user.id) {
      const collaboration = await prisma.collaboration.findFirst({
        where: { userId: user.id, projectId }
      });

      if (!collaboration || (collaboration.role !== 'OWNER' && collaboration.role !== 'ADMIN')) {
        return NextResponse.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // Get version to rollback to
    const version = await prisma.projectVersion.findFirst({
      where: { id: versionId, projectId }
    });

    if (!version) {
      return NextResponse.json(
        { success: false, error: 'Version not found' },
        { status: 404 }
      );
    }

    const snapshot = version.snapshot as any;

    // Start transaction to restore project state
    await prisma.$transaction(async (tx) => {
      // Update project settings
      if (snapshot.project?.settings) {
        await tx.project.update({
          where: { id: projectId },
          data: { settings: snapshot.project.settings }
        });
      }

      // Get current pages
      const currentPages = await tx.page.findMany({
        where: { projectId }
      });

      // Delete pages not in snapshot
      const snapshotPageIds = snapshot.pages?.map((p: any) => p.id) || [];
      const pagesToDelete = currentPages.filter(p => !snapshotPageIds.includes(p.id));

      for (const page of pagesToDelete) {
        await tx.page.delete({ where: { id: page.id } });
      }

      // Restore or update pages from snapshot
      if (snapshot.pages) {
        for (const pageSnapshot of snapshot.pages) {
          const existingPage = currentPages.find(p => p.id === pageSnapshot.id);

          if (existingPage) {
            // Update existing page
            await tx.page.update({
              where: { id: pageSnapshot.id },
              data: {
                name: pageSnapshot.name,
                path: pageSnapshot.path,
                schema: pageSnapshot.schema,
                metaTitle: pageSnapshot.metaTitle,
                metaDescription: pageSnapshot.metaDescription
              }
            });
          } else {
            // Create new page from snapshot
            await tx.page.create({
              data: {
                id: pageSnapshot.id,
                projectId,
                name: pageSnapshot.name,
                slug: pageSnapshot.path.replace(/^\//, '').replace(/\//g, '-') || pageSnapshot.id.substring(0, 8),
                path: pageSnapshot.path,
                isHome: pageSnapshot.path === '/',
                schema: pageSnapshot.schema,
                metaTitle: pageSnapshot.metaTitle,
                metaDescription: pageSnapshot.metaDescription
              }
            });
          }
        }
      }

      // Create new version for rollback
      const latestVersion = await tx.projectVersion.findFirst({
        where: { projectId },
        orderBy: { version: 'desc' }
      });

      await tx.projectVersion.create({
        data: {
          projectId,
          version: (latestVersion?.version || 0) + 1,
          message: `Rolled back to version ${version.version}`,
          snapshot: version.snapshot as any,
          createdById: user.id
        }
      });
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
