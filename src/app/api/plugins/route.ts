// API: Plugins - List and Create
// GET /api/plugins - List all plugins
// POST /api/plugins - Create a new plugin

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
    const type = searchParams.get('type');
    const isPremium = searchParams.get('premium');
    const search = searchParams.get('search');

    const where: any = { isPublished: true };

    if (type) {
      where.type = type;
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

    const plugins = await prisma.plugin.findMany({
      where,
      orderBy: { installs: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: plugins
    });
  } catch (error) {
    console.error('Error fetching plugins:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch plugins' },
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
      version = '1.0.0',
      type,
      manifest,
      code,
      schema,
      isPremium = false,
      price = 0
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Plugin name is required' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Plugin type is required' },
        { status: 400 }
      );
    }

    const plugin = await prisma.plugin.create({
      data: {
        name,
        description,
        version,
        type: type as any,
        manifest: manifest || {},
        code,
        schema,
        isPremium,
        price: typeof price === 'number' ? price : 0,
        isPublished: false // Default to unpublished
      }
    });

    return NextResponse.json({
      success: true,
      data: plugin,
      message: 'Plugin created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating plugin:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create plugin' },
      { status: 500 }
    );
  }
}
