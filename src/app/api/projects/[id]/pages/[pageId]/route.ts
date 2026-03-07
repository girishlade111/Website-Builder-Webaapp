// API: Page by ID - Get, Update, Delete
// GET /api/projects/:id/pages/:pageId - Get page by ID
// PUT /api/projects/:id/pages/:pageId - Update page
// DELETE /api/projects/:id/pages/:pageId - Delete page

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
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id, pageId } = await params;

    const project = await checkProjectAccess(id, user.id);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        projectId: id
      },
      include: {
        versions: {
          select: {
            id: true,
            version: true,
            message: true,
            schema: true,
            createdAt: true,
            createdBy: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { version: 'desc' }
        }
      }
    });

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { page }
    });
  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id, pageId } = await params;
    const body = await request.json();
    const {
      name,
      slug,
      path,
      schema,
      metaTitle,
      metaDescription,
      metaKeywords,
      ogImage,
      isPublished,
      versionMessage
    } = body;

    const project = await checkProjectAccess(id, user.id);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    if (project.role !== 'OWNER' && project.role !== 'ADMIN' && project.role !== 'EDITOR') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Check path uniqueness if changed
    if (path) {
      const existing = await prisma.page.findFirst({
        where: {
          projectId: id,
          path,
          NOT: { id: pageId }
        }
      });
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Page path already exists' },
          { status: 400 }
        );
      }
    }

    // Get current page for version tracking
    const currentPage = await prisma.page.findFirst({
      where: { id: pageId, projectId: id }
    });

    const updateData: any = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (path) updateData.path = path;
    if (schema !== undefined) updateData.schema = schema;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    if (metaKeywords !== undefined) updateData.metaKeywords = metaKeywords;
    if (ogImage !== undefined) updateData.ogImage = ogImage;
    if (isPublished !== undefined) {
      updateData.isPublished = isPublished;
      updateData.publishedAt = isPublished ? new Date() : null;
    }

    const updated = await prisma.page.update({
      where: { id: pageId },
      data: updateData
    });

    // Create new version if schema changed
    if (schema && currentPage && JSON.stringify(currentPage.schema) !== JSON.stringify(schema)) {
      const latestVersion = await prisma.pageVersion.findFirst({
        where: { pageId },
        orderBy: { version: 'desc' }
      });

      await prisma.pageVersion.create({
        data: {
          pageId,
          version: (latestVersion?.version || 0) + 1,
          message: versionMessage || 'Page update',
          schema: schema as any,
          createdById: user.id
        }
      });

      // Also create project version
      const projectLatestVersion = await prisma.projectVersion.findFirst({
        where: { projectId: id },
        orderBy: { version: 'desc' }
      });

      const allPages = await prisma.page.findMany({
        where: { projectId: id }
      });

      await prisma.projectVersion.create({
        data: {
          projectId: id,
          version: (projectLatestVersion?.version || 0) + 1,
          message: versionMessage || `Updated page: ${name || pageId}`,
          snapshot: {
            project: {
              id,
              name: project.name,
              settings: project.settings
            },
            pages: allPages.map(p => ({
              id: p.id,
              name: p.name,
              path: p.path,
              schema: p.schema as any
            }))
          },
          createdById: user.id
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Page updated successfully'
    });
  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update page' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id, pageId } = await params;

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

    const page = await prisma.page.findFirst({
      where: { id: pageId, projectId: id }
    });

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }

    // Cannot delete home page
    if (page.isHome) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete home page' },
        { status: 400 }
      );
    }

    await prisma.page.delete({
      where: { id: pageId }
    });

    return NextResponse.json({
      success: true,
      message: 'Page deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete page' },
      { status: 500 }
    );
  }
}
