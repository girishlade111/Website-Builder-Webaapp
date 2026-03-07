// API: Test API Integration
// POST /api/projects/[id]/api-integrations/[integrationId]/test - Test the API integration

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { executeApiRequest, getApiIntegration } from '@/lib/services/apiIntegration';

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

  return { allowed: true };
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; integrationId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId, integrationId } = await params;
    const body = await request.json();
    const { testParams, testBody } = body || {};

    // Check access
    const access = await checkProjectAccess(projectId, user.id);
    if (!access.allowed) {
      return NextResponse.json(
        { success: false, error: access.reason },
        { status: 403 }
      );
    }

    // Get integration config
    const integration = await getApiIntegration(projectId, integrationId);

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
          url: integration.endpoint,
          method: integration.method,
          headers: integration.headers
        },
        response: {
          success: result.success,
          status: result.status,
          data: result.data,
          error: result.error
        }
      },
      message: result.success ? 'Test successful' : 'Test failed'
    });
  } catch (error: any) {
    console.error('Error testing API integration:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to test API integration',
        details: error.message
      },
      { status: 500 }
    );
  }
}
