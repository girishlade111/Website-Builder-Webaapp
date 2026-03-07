// API: Plugins
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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const published = searchParams.get('published');

    const where: any = {};
    
    if (type) {
      where.type = type;
    }
    
    if (published === 'true') {
      where.isPublished = true;
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

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { name, description, version, type, manifest, code, schema, isPremium, price } = body;

    if (!name || !type || !manifest) {
      return NextResponse.json(
        { success: false, error: 'Name, type, and manifest are required' },
        { status: 400 }
      );
    }

    const plugin = await prisma.plugin.create({
      data: {
        name,
        description,
        version: version || '1.0.0',
        type,
        manifest,
        code: code || null,
        schema: schema || null,
        isPremium: isPremium || false,
        price: price || 0,
        isPublished: false
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
