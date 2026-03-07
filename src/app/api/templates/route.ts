// API: Templates
// GET /api/templates - List all templates
// POST /api/templates - Create a new template

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { templates as defaultTemplates } from '@/templates';

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // Get templates from database
    let dbTemplates = await prisma.template.findMany({
      where: { isPublished: true }
    });

    // Combine with default templates
    const allTemplates = [
      ...defaultTemplates.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        thumbnail: t.thumbnail,
        category: t.category,
        tags: [],
        isPremium: false,
        isBuiltIn: true,
        pages: t.pages
      })),
      ...dbTemplates.map(t => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString()
      }))
    ];

    // Filter by category
    let filtered = allTemplates;
    if (category && category !== 'All') {
      filtered = filtered.filter(t => t.category === category);
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchLower) ||
        t.description?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { name, description, category, tags, schema, isPremium, price } = body;

    if (!name || !schema) {
      return NextResponse.json(
        { success: false, error: 'Name and schema are required' },
        { status: 400 }
      );
    }

    const template = await prisma.template.create({
      data: {
        name,
        description,
        category,
        tags: tags || [],
        schema,
        isPremium: isPremium || false,
        price: price || 0
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
