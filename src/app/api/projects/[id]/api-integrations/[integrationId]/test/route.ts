// API: Test API Integration
// POST /api/projects/[id]/api-integrations/[integrationId]/test - Test integration

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; integrationId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId, integrationId } = await params;
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

      if (!collaboration) {
        return NextResponse.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // Get integration
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
      success: true,
      data: result,
      message: result.success ? 'Test successful' : 'Test failed'
    });
  } catch (error) {
    console.error('Error testing API integration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test API integration' },
      { status: 500 }
    );
  }
}
