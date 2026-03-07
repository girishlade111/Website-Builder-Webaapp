// API: Project Pages - List and Create
// GET /api/projects/[id]/pages - List all pages for a project
// POST /api/projects/[id]/pages - Create a new page

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId } = await params;

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check access
    if (project.ownerId !== user.id) {
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

    const pages = await prisma.page.findMany({
      where: { projectId },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: pages
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
    const { id: projectId } = await params;
    const body = await request.json();

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check access
    if (project.ownerId !== user.id) {
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

    const { name, path, schema, metaTitle, metaDescription, ogImage } = body;

    if (!name || !path) {
      return NextResponse.json(
        { success: false, error: 'Name and path are required' },
        { status: 400 }
      );
    }

    // Check if path already exists
    const existing = await prisma.page.findFirst({
      where: { projectId, path }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Page path already exists' },
        { status: 400 }
      );
    }

    // Generate slug from path
    const slug = path.replace(/^\//, '').replace(/\//g, '-') || nanoid(6);

    // Create page
    const page = await prisma.page.create({
      data: {
        projectId,
        name,
        slug,
        path,
        isHome: path === '/',
        schema: schema || { components: [], styles: {}, settings: {} },
        metaTitle: metaTitle || name,
        metaDescription: metaDescription || '',
        ogImage: ogImage || null
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
