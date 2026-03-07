// API: Projects - List and Create
// GET /api/projects - List all projects for current user
// POST /api/projects - Create a new project

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';

// For demo purposes - in production, get from auth session
const getCurrentUser = async () => {
  // TODO: Implement proper authentication
  // For now, return a demo user or create one
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

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const where: any = { ownerId: user.id };
    if (status) {
      where.status = status;
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          pages: {
            select: {
              id: true,
              name: true,
              path: true,
              isHome: true,
              isPublished: true
            }
          },
          collaborations: {
            include: {
              user: {
                select: { id: true, name: true, email: true, image: true }
              }
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.project.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: projects,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { name, description, templateId, slug } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Project name is required' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const projectSlug = slug || `${name.toLowerCase().replace(/\s+/g, '-')}-${nanoid(4)}`;

    // Check if slug already exists
    const existing = await prisma.project.findUnique({
      where: { slug: projectSlug }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Project slug already exists' },
        { status: 400 }
      );
    }

    // Create project with default home page
    const project = await prisma.project.create({
      data: {
        name,
        description,
        slug: projectSlug,
        ownerId: user.id,
        templateId: templateId || null,
        settings: {
          seo: {
            title: name,
            description: description || ''
          }
        },
        pages: {
          create: {
            name: 'Home',
            slug: 'home',
            path: '/',
            isHome: true,
            schema: {
              components: [],
              styles: {},
              settings: {}
            }
          }
        }
      },
      include: {
        pages: true
      }
    });

    // Create initial version
    await prisma.projectVersion.create({
      data: {
        projectId: project.id,
        version: 1,
        message: 'Initial project creation',
        snapshot: {
          project: {
            id: project.id,
            name: project.name,
            settings: project.settings
          },
          pages: project.pages.map(p => ({
            id: p.id,
            name: p.name,
            path: p.path,
            schema: p.schema as any
          }))
        },
        createdById: user.id
      }
    });

    return NextResponse.json({
      success: true,
      data: project,
      message: 'Project created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
