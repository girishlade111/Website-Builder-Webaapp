// API: API Integrations - List and Create
// GET /api/projects/[id]/api-integrations - List integrations
// POST /api/projects/[id]/api-integrations - Create integration

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { executeApiRequest, listApiIntegrations, createApiIntegration } from '@/lib/services/apiIntegration';

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

    const integrations = await listApiIntegrations(projectId);

    return NextResponse.json({
      success: true,
      data: integrations
    });
  } catch (error) {
    console.error('Error fetching API integrations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch API integrations' },
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

    const { name, endpoint, method, headers, authType, authConfig, responseMapping } = body;

    if (!name || !endpoint) {
      return NextResponse.json(
        { success: false, error: 'Name and endpoint are required' },
        { status: 400 }
      );
    }

    // Validate method
    const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    if (method && !validMethods.includes(method)) {
      return NextResponse.json(
        { success: false, error: 'Invalid HTTP method' },
        { status: 400 }
      );
    }

    const integration = await createApiIntegration(projectId, {
      name,
      endpoint,
      method: method || 'GET',
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
    console.error('Error creating API integration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create API integration' },
      { status: 500 }
    );
  }
}
