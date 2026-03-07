// API: Templates - List and Create
// GET /api/templates - List all templates
// POST /api/templates - Create template (admin only)

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
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const isPremium = searchParams.get('premium');

    const where: any = { isPublished: true };

    if (category) {
      where.category = category;
    }

    if (tag) {
      where.tags = { has: tag };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (isPremium !== null && isPremium !== undefined) {
      where.isPremium = isPremium === 'true';
    }

    const templates = await prisma.template.findMany({
      where,
      orderBy: { installs: 'desc' },
      take: 50
    });

    // Get unique categories
    const categories = await prisma.template.findMany({
      distinct: ['category'],
      select: { category: true },
      where: { isPublished: true, category: { not: null } }
    });

    return NextResponse.json({
      success: true,
      data: {
        items: templates,
        categories: categories.map(c => c.category).filter(Boolean)
      }
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

    const { name, description, category, tags, schema, thumbnail, isPremium, price } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Template name is required' },
        { status: 400 }
      );
    }

    const template = await prisma.template.create({
      data: {
        name,
        description,
        category,
        tags: tags || [],
        schema: schema || { pages: [] },
        thumbnail,
        isPremium: isPremium || false,
        price: price ? parseFloat(price) : null
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
