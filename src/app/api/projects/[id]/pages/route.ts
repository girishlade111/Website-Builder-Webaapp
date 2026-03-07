// API: Project Pages - List and Create
// GET /api/projects/[id]/pages - List all pages in project
// POST /api/projects/[id]/pages - Create a new page

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId } = await params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        pages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: project.pages
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
    const { name, path, schema, metaTitle, metaDescription } = body;

    if (!name || !path) {
      return NextResponse.json(
        { success: false, error: 'Name and path are required' },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if path already exists
    const existing = await prisma.page.findFirst({
      where: {
        projectId,
        path
      }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A page with this path already exists' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const page = await prisma.page.create({
      data: {
        projectId,
        name,
        slug,
        path,
        isHome: path === '/',
        schema: schema || { components: [], styles: {}, settings: {} },
        metaTitle,
        metaDescription
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
