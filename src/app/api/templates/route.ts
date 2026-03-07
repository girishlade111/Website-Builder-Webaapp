// API: Templates - List and Create
// GET /api/templates - List all templates
// POST /api/templates - Create a new template

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
  request: NextRequest
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const isPremium = searchParams.get('premium');
    const search = searchParams.get('search');

    const where: any = { isPublished: true };

    if (category) {
      where.category = category;
    }

    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags
      };
    }

    if (isPremium !== null && isPremium !== undefined) {
      where.isPremium = isPremium === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const templates = await prisma.template.findMany({
      where,
      orderBy: { installs: 'desc' },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            thumbnail: true
          },
          take: 3
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    const {
      name,
      description,
      thumbnail,
      category,
      tags = [],
      schema,
      isPremium = false,
      price = 0
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Template name is required' },
        { status: 400 }
      );
    }

    if (!schema) {
      return NextResponse.json(
        { success: false, error: 'Template schema is required' },
        { status: 400 }
      );
    }

    const template = await prisma.template.create({
      data: {
        name,
        description,
        thumbnail,
        category,
        tags,
        schema,
        isPremium,
        price: typeof price === 'number' ? price : 0,
        isPublished: false // Default to unpublished, requires admin approval
      }
    });

    return NextResponse.json({
      success: true,
      data: template,
      message: 'Template created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
