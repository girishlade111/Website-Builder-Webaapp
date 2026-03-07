// API: Single Page - Get, Update, Delete
// GET /api/projects/[id]/pages/[pageId] - Get page by ID
// PUT /api/projects/[id]/pages/[pageId] - Update page
// DELETE /api/projects/[id]/pages/[pageId] - Delete page

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId, pageId } = await params;

    // Check access
    const access = await checkProjectAccess(projectId, user.id);
    if (!access.allowed) {
      return NextResponse.json(
        { success: false, error: access.reason },
        { status: 403 }
      );
    }

    const page = await prisma.page.findFirst({
      where: { id: pageId, projectId },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 10
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
      data: page
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
    const { id: projectId, pageId } = await params;
    const body = await request.json();

    // Check access
    const access = await checkProjectAccess(projectId, user.id);
    if (!access.allowed) {
      return NextResponse.json(
        { success: false, error: access.reason },
        { status: 403 }
      );
    }

    // Check if user has edit permission
    if (access.role !== 'OWNER' && access.role !== 'ADMIN' && access.role !== 'EDITOR') {
      return NextResponse.json(
        { success: false, error: 'Edit permission denied' },
        { status: 403 }
      );
    }

    const page = await prisma.page.findFirst({
      where: { id: pageId, projectId }
    });

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }

    const {
      name,
      slug,
      path,
      schema,
      metaTitle,
      metaDescription,
      metaKeywords,
      ogImage,
      isPublished
    } = body;

    // Validate path uniqueness within project
    if (path && path !== page.path) {
      const existing = await prisma.page.findFirst({
        where: { projectId, path, id: { not: pageId } }
      });

      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Path already exists in this project' },
          { status: 400 }
        );
      }
    }

    // Update page
    const updated = await prisma.page.update({
      where: { id: pageId },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(path && { path }),
        ...(schema && { schema }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        ...(metaKeywords !== undefined && { metaKeywords }),
        ...(ogImage !== undefined && { ogImage }),
        ...(isPublished !== undefined && { 
          isPublished,
          publishedAt: isPublished ? new Date() : null
        })
      }
    });

    // Create version if schema changed
    if (schema) {
      const versionCount = await prisma.pageVersion.count({
        where: { pageId }
      });

      await prisma.pageVersion.create({
        data: {
          pageId,
          version: versionCount + 1,
          message: body.versionMessage || 'Manual update',
          schema,
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
    const { id: projectId, pageId } = await params;

    // Check access
    const access = await checkProjectAccess(projectId, user.id);
    if (!access.allowed) {
      return NextResponse.json(
        { success: false, error: access.reason },
        { status: 403 }
      );
    }

    // Check if user has delete permission
    if (access.role !== 'OWNER' && access.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Delete permission denied' },
        { status: 403 }
      );
    }

    const page = await prisma.page.findFirst({
      where: { id: pageId, projectId }
    });

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }

    // Prevent deleting home page
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
