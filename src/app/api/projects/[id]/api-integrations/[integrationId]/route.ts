// API: API Integration - Update, Delete, and Test
// GET /api/projects/[id]/api-integrations/[integrationId] - Get integration
// PUT /api/projects/[id]/api-integrations/[integrationId] - Update integration
// DELETE /api/projects/[id]/api-integrations/[integrationId] - Delete integration
// POST /api/projects/[id]/api-integrations/[integrationId]/test - Test integration

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { 
  getApiIntegration, 
  updateApiIntegration, 
  deleteApiIntegration,
  executeApiRequest 
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; integrationId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId, integrationId } = await params;

    const integration = await getApiIntegration(projectId, integrationId);

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
    console.error('Error fetching API integration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch API integration' },
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
    const { id: projectId, integrationId } = await params;
    const body = await request.json();

    const project = await prisma.project.findUnique({ where: { id: projectId } });
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

    const integration = await updateApiIntegration(projectId, integrationId, body);

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
    console.error('Error updating API integration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update API integration' },
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
    const { id: projectId, integrationId } = await params;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
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

    const deleted = await deleteApiIntegration(projectId, integrationId);

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
    console.error('Error deleting API integration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete API integration' },
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
    const { id: projectId, integrationId } = await params;
    const body = await request.json();

    const project = await prisma.project.findUnique({ where: { id: projectId } });
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

    const integration = await getApiIntegration(projectId, integrationId);

    if (!integration) {
      return NextResponse.json(
        { success: false, error: 'Integration not found' },
        { status: 404 }
      );
    }

    // Execute test request
    const result = await executeApiRequest(integration, body);

    return NextResponse.json({
      success: result.success,
      data: result.data,
      error: result.error,
      status: result.status
    });
  } catch (error: any) {
    console.error('Error testing API integration:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to test API integration' 
      },
      { status: 500 }
    );
  }
}
