// API: Rollback to Version
// POST /api/projects/[id]/versions/[versionId]/rollback - Rollback project to a specific version

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId, versionId } = await params;

    // Check access
    const access = await checkProjectAccess(projectId, user.id);
    if (!access.allowed) {
      return NextResponse.json(
        { success: false, error: access.reason },
        { status: 403 }
      );
    }

    // Check if user has admin permission
    if (access.role !== 'OWNER' && access.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Rollback permission denied' },
        { status: 403 }
      );
    }

    // Get the version to rollback to
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

    // Start a transaction to restore project state
    await prisma.$transaction(async (tx) => {
      // Update project settings
      await tx.project.update({
        where: { id: projectId },
        data: {
          name: snapshot.project?.name,
          description: snapshot.project?.description,
          settings: snapshot.project?.settings
        }
      });

      // Get current pages
      const currentPages = await tx.page.findMany({
        where: { projectId }
      });

      const snapshotPages = snapshot.pages || [];
      const snapshotPageIds = snapshotPages.map((p: any) => p.id);

      // Delete pages that don't exist in snapshot
      const pagesToDelete = currentPages.filter(
        p => !snapshotPageIds.includes(p.id)
      );

      for (const page of pagesToDelete) {
        await tx.page.delete({
          where: { id: page.id }
        });
      }

      // Update or create pages from snapshot
      for (const snapshotPage of snapshotPages) {
        const existingPage = currentPages.find(p => p.id === snapshotPage.id);

        if (existingPage) {
          // Update existing page
          await tx.page.update({
            where: { id: snapshotPage.id },
            data: {
              name: snapshotPage.name,
              path: snapshotPage.path,
              schema: snapshotPage.schema
            }
          });
        } else {
          // Create new page
          await tx.page.create({
            data: {
              id: snapshotPage.id,
              projectId,
              name: snapshotPage.name,
              path: snapshotPage.path,
              slug: snapshotPage.path.substring(1).replace(/\//g, '-'),
              isHome: snapshotPage.path === '/',
              schema: snapshotPage.schema
            }
          });
        }
      }
    });

    // Create a new version for the rollback
    const versionCount = await prisma.projectVersion.count({
      where: { projectId }
    });

    await prisma.projectVersion.create({
      data: {
        projectId,
        version: versionCount + 1,
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
    console.error('Error rolling back:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to rollback to version' },
      { status: 500 }
    );
  }
}
