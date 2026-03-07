// API: API Integrations - List and Create
// GET /api/projects/:id/api-integrations - List all integrations
// POST /api/projects/:id/api-integrations - Create integration

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { executeApiRequest, createApiIntegration, listApiIntegrations } from '@/lib/services/apiIntegration';

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

    const integrations = await listApiIntegrations(id);

    return NextResponse.json({
      success: true,
      data: integrations
    });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch integrations' },
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
    const { name, endpoint, method = 'GET', headers, authType, authConfig, responseMapping } = body;

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

    if (!name || !endpoint) {
      return NextResponse.json(
        { success: false, error: 'Name and endpoint are required' },
        { status: 400 }
      );
    }

    const integration = await createApiIntegration(id, {
      name,
      endpoint,
      method,
      headers,
      authType,
      authConfig,
      responseMapping
    });

    return NextResponse.json({
      success: true,
      data: integration,
      message: 'API integration created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating integration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create integration' },
      { status: 500 }
    );
  }
}
