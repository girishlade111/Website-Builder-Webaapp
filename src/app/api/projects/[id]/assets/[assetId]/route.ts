// API: Asset Delete
// DELETE /api/projects/[id]/assets/[assetId] - Delete asset

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { deleteAsset } from '@/lib/services/assetStorage';

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; assetId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId, assetId } = await params;

    const asset = await prisma.asset.findFirst({
      where: { id: assetId, projectId }
    });

    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

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

    // Delete from storage provider (storageKey might be null for local storage)
    if (asset.storageKey) {
      await deleteAsset(asset.storageProvider, asset.storageKey);
    }

    // Delete from database
    await prisma.asset.delete({
      where: { id: assetId }
    });

    return NextResponse.json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete asset' },
      { status: 500 }
    );
  }
}
