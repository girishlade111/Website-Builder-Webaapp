// API: Pages - List and Create
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId } = await params;

    // Check access
    const access = await checkProjectAccess(projectId, user.id);
    if (!access.allowed) {
      return NextResponse.json(
        { success: false, error: access.reason },
        { status: 403 }
      );
    }

    const pages = await prisma.page.findMany({
      where: { projectId },
      orderBy: [{ isHome: 'desc' }, { createdAt: 'asc' }]
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

    const { name, slug, path, schema, metaTitle, metaDescription } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Page name is required' },
        { status: 400 }
      );
    }

    // Generate path if not provided
    const pagePath = path || `/${slug || name.toLowerCase().replace(/\s+/g, '-')}`;
    const pageSlug = slug || name.toLowerCase().replace(/\s+/g, '-');

    // Check if path already exists
    const existing = await prisma.page.findFirst({
      where: { projectId, path: pagePath }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Path already exists in this project' },
        { status: 400 }
      );
    }

    // Create page
    const page = await prisma.page.create({
      data: {
        projectId,
        name,
        slug: pageSlug,
        path: pagePath,
        schema: schema || {
          components: [],
          styles: {},
          settings: {}
        },
        metaTitle: metaTitle || name,
        metaDescription: metaDescription || ''
      },
      include: {
        versions: true
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
