// API: Project Deployments - List and Create
// GET /api/projects/[id]/deployments - List all deployments
// POST /api/projects/[id]/deployments - Create new deployment

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId } = await params;

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

      if (!collaboration) {
        return NextResponse.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    const deployments = await getDeploymentHistory(projectId, 20);

    return NextResponse.json({
      success: true,
      data: deployments
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
    const { id: projectId } = await params;
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

    const { environment = 'production', customDomain } = body;

    const validEnvironments = ['development', 'staging', 'production'];
    if (!validEnvironments.includes(environment)) {
      return NextResponse.json(
        { success: false, error: 'Invalid environment' },
        { status: 400 }
      );
    }

    // Create deployment record
    const deployment = await prisma.deployment.create({
      data: {
        projectId,
        environment: environment.toUpperCase() as 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION',
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
    triggerDeploymentPipeline(
      projectId,
      deployment.id,
      { 
        environment: environment as 'development' | 'staging' | 'production',
        customDomain 
      }
    ).catch(err => {
      console.error('Deployment pipeline failed:', err);
    });

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
