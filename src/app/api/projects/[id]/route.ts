// API: Single Project - Get, Update, Delete
// GET /api/projects/[id] - Get project by ID
// PUT /api/projects/[id] - Update project
// DELETE /api/projects/[id] - Delete project

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        pages: {
          orderBy: { createdAt: 'asc' }
        },
        collaborations: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true }
            }
          }
        },
        assets: {
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        versions: {
          orderBy: { version: 'desc' },
          take: 10
        },
        installedPlugins: {
          include: {
            plugin: true
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check access
    const isOwner = project.ownerId === user.id;
    const isCollaborator = project.collaborations.some(c => c.userId === user.id);
    
    if (!isOwner && !isCollaborator) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: project
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

    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (project.ownerId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    const { name, description, settings, deploymentConfig, status } = body;

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(settings && { settings }),
        ...(deploymentConfig && { deploymentConfig }),
        ...(status && { status })
      },
      include: {
        pages: true
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

    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (project.ownerId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
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
