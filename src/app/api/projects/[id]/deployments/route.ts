// API: Project Deployments - List and Create
// GET /api/projects/:id/deployments - List all deployments
// POST /api/projects/:id/deployments - Create new deployment

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { triggerDeploymentPipeline, getDeploymentHistory } from '@/lib/services/deployment';

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

    const deployments = await getDeploymentHistory(id, 20);

    return NextResponse.json({
      success: true,
      data: { deployments }
    });
  } catch (error) {
    console.error('Error fetching deployments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch deployments' },
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
    const { environment = 'PRODUCTION' } = body;

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

    // Validate environment
    const validEnvironments = ['DEVELOPMENT', 'STAGING', 'PRODUCTION'];
    if (!validEnvironments.includes(environment)) {
      return NextResponse.json(
        { success: false, error: 'Invalid environment' },
        { status: 400 }
      );
    }

    // Create deployment record
    const deployment = await prisma.deployment.create({
      data: {
        projectId: id,
        environment: environment as any,
        status: 'PENDING',
        triggeredById: user.id
      },
      include: {
        triggeredBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Trigger deployment pipeline (async)
    triggerDeploymentPipeline(id, deployment.id, {
      environment: environment.toLowerCase() as any
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      data: deployment,
      message: 'Deployment started'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating deployment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create deployment' },
      { status: 500 }
    );
  }
}
