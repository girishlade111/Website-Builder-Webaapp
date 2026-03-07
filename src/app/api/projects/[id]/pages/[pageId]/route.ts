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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId, pageId } = await params;

    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        projectId
      },
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
    const { name, path, schema, metaTitle, metaDescription, isPublished } = body;

    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        projectId
      }
    });

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }

    // Check if new path conflicts with existing pages
    if (path && path !== page.path) {
      const existing = await prisma.page.findFirst({
        where: {
          projectId,
          path,
          id: { not: pageId }
        }
      });

      if (existing) {
        return NextResponse.json(
          { success: false, error: 'A page with this path already exists' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (path) {
      updateData.path = path;
      updateData.slug = path.replace(/^\//, '').replace(/\//g, '-') || 'home';
      updateData.isHome = path === '/';
    }
    if (schema) updateData.schema = schema;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    if (isPublished !== undefined) {
      updateData.isPublished = isPublished;
      if (isPublished && !page.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const updated = await prisma.page.update({
      where: { id: pageId },
      data: updateData
    });

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
      where: {
        id: pageId,
        projectId
      }
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
        { success: false, error: 'Cannot delete the home page' },
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
