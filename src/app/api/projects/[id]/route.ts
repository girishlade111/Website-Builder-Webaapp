// API: Project by ID - Get, Update, Delete
// GET /api/projects/:id - Get project by ID
// PUT /api/projects/:id - Update project
// DELETE /api/projects/:id - Delete project

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { deleteVercelProject } from '@/lib/services/deployment';

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

    return NextResponse.json({
      success: true,
      data: { project }
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
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

    const { name, description, slug, thumbnail, status, settings, deploymentConfig } = body;

    // Check slug uniqueness if changed
    if (slug && slug !== project.slug) {
      const existing = await prisma.project.findUnique({
        where: { slug }
      });
      if (existing && existing.id !== id) {
        return NextResponse.json(
          { success: false, error: 'Project slug already exists' },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(slug && { slug }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(status && { status }),
        ...(settings && { settings }),
        ...(deploymentConfig && { deploymentConfig })
      }
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    if (project.role !== 'OWNER') {
      return NextResponse.json(
        { success: false, error: 'Only owner can delete project' },
        { status: 403 }
      );
    }

    // Delete from Vercel if deployed
    const deploymentConfig = project.deploymentConfig as any;
    if (deploymentConfig?.vercelId && process.env.VERCEL_TOKEN) {
      try {
        await deleteVercelProject(deploymentConfig.vercelId);
      } catch (error) {
        console.error('Failed to delete Vercel project:', error);
      }
    }

    await prisma.project.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
