// API: API Integration by ID - Get, Update, Delete, Test
// GET /api/projects/:id/api-integrations/:integrationId - Get integration
// PUT /api/projects/:id/api-integrations/:integrationId - Update integration
// DELETE /api/projects/:id/api-integrations/:integrationId - Delete integration
// POST /api/projects/:id/api-integrations/:integrationId/test - Test integration

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  executeApiRequest,
  getApiIntegration,
  updateApiIntegration,
  deleteApiIntegration
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
  { params }: { params: Promise<{ id: string; integrationId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id, integrationId } = await params;

    const project = await checkProjectAccess(id, user.id);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    const integration = await getApiIntegration(id, integrationId);

    if (!integration) {
      return NextResponse.json(
        { success: false, error: 'Integration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: integration
    });
  } catch (error) {
    console.error('Error fetching integration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch integration' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; integrationId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id, integrationId } = await params;
    const body = await request.json();

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

    const integration = await updateApiIntegration(id, integrationId, body);

    if (!integration) {
      return NextResponse.json(
        { success: false, error: 'Integration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: integration,
      message: 'Integration updated successfully'
    });
  } catch (error) {
    console.error('Error updating integration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update integration' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; integrationId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id, integrationId } = await params;

    const project = await checkProjectAccess(id, user.id);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    if (project.role !== 'OWNER' && project.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const deleted = await deleteApiIntegration(id, integrationId);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Integration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Integration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting integration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete integration' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; integrationId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id, integrationId } = await params;
    const body = await request.json();
    const { testParams, testBody } = body;

    const project = await checkProjectAccess(id, user.id);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    const integration = await getApiIntegration(id, integrationId);

    if (!integration) {
      return NextResponse.json(
        { success: false, error: 'Integration not found' },
        { status: 404 }
      );
    }

    // Execute test request
    const result = await executeApiRequest(integration, {
      params: testParams,
      body: testBody
    });

    return NextResponse.json({
      success: true,
      data: {
        request: {
          endpoint: integration.endpoint,
          method: integration.method,
          params: testParams,
          body: testBody
        },
        response: result
      }
    });
  } catch (error: any) {
    console.error('Error testing integration:', error);
    return NextResponse.json(
      {
        success: true,
        data: {
          request: {},
          response: {
            success: false,
            error: error.message || 'Test failed'
          }
        }
      }
    );
  }
}
