// API: Test API Integration
// POST /api/projects/:id/api-integrations/:integrationId/test - Test integration

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; integrationId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id, integrationId } = await params;
    const body = await request.json();
    const { testParams, testBody } = body || {};

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

    // Execute test request
    const result = await executeApiRequest(
      {
        id: integration.id,
        name: integration.name,
        endpoint: integration.endpoint,
        method: integration.method as any,
        headers: integration.headers as Record<string, string>,
        authType: integration.authType as any,
        authConfig: integration.authConfig as any,
        responseMapping: integration.responseMapping as any
      },
      {
        params: testParams,
        body: testBody
      }
    );

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
  } catch (error) {
    console.error('Error testing integration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test integration' },
      { status: 500 }
    );
  }
}
