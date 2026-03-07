// API: Single API Integration - Get, Update, Delete, Test
// GET /api/projects/[id]/api-integrations/[integrationId] - Get integration
// PUT /api/projects/[id]/api-integrations/[integrationId] - Update integration
// DELETE /api/projects/[id]/api-integrations/[integrationId] - Delete integration
// POST /api/projects/[id]/api-integrations/[integrationId]/test - Test integration

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  executeApiRequest,
  updateApiIntegration as updateIntegration,
  deleteApiIntegration as deleteIntegration,
  getApiIntegration
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
  { params }: { params: Promise<{ id: string; integrationId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId, integrationId } = await params;

    // Check access
    const access = await checkProjectAccess(projectId, user.id);
    if (!access.allowed) {
      return NextResponse.json(
        { success: false, error: access.reason },
        { status: 403 }
      );
    }

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

    const integration = await updateIntegration(projectId, integrationId, body);

    if (!integration) {
      return NextResponse.json(
        { success: false, error: 'Integration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: integration,
      message: 'API integration updated successfully'
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

    // Check access
    const access = await checkProjectAccess(projectId, user.id);
    if (!access.allowed) {
      return NextResponse.json(
        { success: false, error: access.reason },
        { status: 403 }
      );
    }

    // Check if user has admin permission
    if (access.role !== 'OWNER' && access.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Delete permission denied' },
        { status: 403 }
      );
    }

    const deleted = await deleteIntegration(projectId, integrationId);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Integration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'API integration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting API integration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete API integration' },
      { status: 500 }
    );
  }
}
