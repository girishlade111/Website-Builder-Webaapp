// API: Page by ID - Get, Update, Delete
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId, pageId } = await params;

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

    const page = await prisma.page.findFirst({
      where: { id: pageId, projectId }
    });

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
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

      if (!collaboration || collaboration.role === 'VIEWER') {
        return NextResponse.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    const { name, path, schema, metaTitle, metaDescription, ogImage, isPublished } = body;

    // Check path uniqueness if changed
    if (path && path !== page.path) {
      const existing = await prisma.page.findFirst({
        where: { projectId, path, id: { not: pageId } }
      });

      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Page path already exists' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (path !== undefined) updateData.path = path;
    if (schema !== undefined) updateData.schema = schema;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
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
    if (schema) {
      const latestVersion = await prisma.pageVersion.findFirst({
        where: { pageId },
        orderBy: { version: 'desc' }
      });

      await prisma.pageVersion.create({
        data: {
          pageId,
          version: (latestVersion?.version || 0) + 1,
          message: body.versionMessage || 'Page update',
          schema: schema,
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

    const page = await prisma.page.findFirst({
      where: { id: pageId, projectId }
    });

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }

    // Check access
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (project?.ownerId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Only owner can delete pages' },
        { status: 403 }
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
