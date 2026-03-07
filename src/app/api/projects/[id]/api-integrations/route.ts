// API: API Integrations - List, Create, Update, Delete, Test
// GET /api/projects/[id]/api-integrations - List all API integrations
// POST /api/projects/[id]/api-integrations - Create API integration
// PUT /api/projects/[id]/api-integrations/[integrationId] - Update integration
// DELETE /api/projects/[id]/api-integrations/[integrationId] - Delete integration
// POST /api/projects/[id]/api-integrations/[integrationId]/test - Test integration

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  executeApiRequest,
  createApiIntegration as createIntegration,
  updateApiIntegration as updateIntegration,
  deleteApiIntegration as deleteIntegration,
  listApiIntegrations
} from '@/lib/services/apiIntegration';

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

    const {
      name,
      endpoint,
      method = 'GET',
      headers = {},
      authType = 'NONE',
      authConfig = {},
      responseMapping = {}
    } = body;

    if (!name || !endpoint) {
      return NextResponse.json(
        { success: false, error: 'Name and endpoint are required' },
        { status: 400 }
      );
    }

    const integration = await createIntegration(projectId, {
      name,
      endpoint,
      method,
      headers,
      authType: authType as any,
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
