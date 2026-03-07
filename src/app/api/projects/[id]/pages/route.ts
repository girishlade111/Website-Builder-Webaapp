// API: Project Pages - List and Create
// GET /api/projects/:id/pages - List all pages for a project
// POST /api/projects/:id/pages - Create a new page

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    const project = await checkProjectAccess(id, user.id);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    const pages = await prisma.page.findMany({
      where: { projectId: id },
      include: {
        versions: {
          select: {
            id: true,
            version: true,
            message: true,
            createdAt: true
          },
          orderBy: { version: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: { pages }
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    const body = await request.json();
    const { name, slug, path, schema, metaTitle, metaDescription, metaKeywords, ogImage } = body;

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

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Page name is required' },
        { status: 400 }
      );
    }

    // Generate slug and path if not provided
    const pageSlug = slug || name.toLowerCase().replace(/\s+/g, '-');
    const pagePath = path || `/${pageSlug}`;

    // Check path uniqueness
    const existing = await prisma.page.findFirst({
      where: {
        projectId: id,
        path: pagePath
      }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Page path already exists' },
        { status: 400 }
      );
    }

    const page = await prisma.page.create({
      data: {
        projectId: id,
        name,
        slug: pageSlug,
        path: pagePath,
        isHome: false,
        schema: schema || { components: [], styles: {}, settings: {} },
        metaTitle,
        metaDescription,
        metaKeywords,
        ogImage
      }
    });

    // Create initial version
    await prisma.pageVersion.create({
      data: {
        pageId: page.id,
        version: 1,
        message: 'Initial page creation',
        schema: page.schema as any,
        createdById: user.id
      }
    });

    return NextResponse.json({
      success: true,
      data: page,
      message: 'Page created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create page' },
      { status: 500 }
    );
  }
}
