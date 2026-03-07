// API: API Integration by ID - Get, Update, Delete, Test
// GET /api/projects/:id/api-integrations/:integrationId - Get integration
// PUT /api/projects/:id/api-integrations/:integrationId - Update integration
// DELETE /api/projects/:id/api-integrations/:integrationId - Delete integration

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { executeApiRequest } from '@/lib/services/apiIntegration';

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

    const integration = await prisma.apiIntegration.findFirst({
      where: {
        id: integrationId,
        projectId: id
      }
    });

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

    const integration = await prisma.apiIntegration.updateMany({
      where: {
        id: integrationId,
        projectId: id
      },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.endpoint && { endpoint: body.endpoint }),
        ...(body.method && { method: body.method }),
        ...(body.headers && { headers: body.headers }),
        ...(body.authType && { authType: body.authType }),
        ...(body.authConfig && { authConfig: body.authConfig }),
        ...(body.responseMapping && { responseMapping: body.responseMapping })
      }
    });

    if (integration.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Integration not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.apiIntegration.findUnique({
      where: { id: integrationId }
    });

    return NextResponse.json({
      success: true,
      data: updated,
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

    await prisma.apiIntegration.deleteMany({
      where: {
        id: integrationId,
        projectId: id
      }
    });

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
    const { action, testParams } = body || {};

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

    const integration = await prisma.apiIntegration.findFirst({
      where: { id: integrationId, projectId: id }
    });

    if (!integration) {
      return NextResponse.json(
        { success: false, error: 'Integration not found' },
        { status: 404 }
      );
    }

    // Handle test action
    if (action === 'test') {
      const result = await executeApiRequest({
        id: integration.id,
        name: integration.name,
        endpoint: integration.endpoint,
        method: integration.method as any,
        headers: integration.headers as Record<string, string>,
        authType: integration.authType as any,
        authConfig: integration.authConfig as any,
        responseMapping: integration.responseMapping as any
      }, testParams);

      return NextResponse.json({
        success: result.success,
        data: result.data,
        error: result.error,
        status: result.status,
        message: result.success ? 'API test successful' : 'API test failed'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Unknown action'
    }, { status: 400 });
  } catch (error) {
    console.error('Error testing integration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test integration' },
      { status: 500 }
    );
  }
}
