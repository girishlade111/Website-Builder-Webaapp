// API: Project Assets - List and Upload
// GET /api/projects/[id]/assets - List all assets
// POST /api/projects/[id]/assets - Upload new asset

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { uploadAsset, createAssetRecord, listAssets } from '@/lib/services/assetStorage';

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

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const result = await listAssets(projectId, { type, page, pageSize });

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assets' },
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

      if (!collaboration || collaboration.role === 'VIEWER') {
        return NextResponse.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string || file?.name || 'unnamed';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 50MB limit' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine asset type from MIME type
    const mimeType = file.type;
    let type: string = 'OTHER';
    
    if (mimeType.startsWith('image/')) type = 'IMAGE';
    else if (mimeType.startsWith('video/')) type = 'VIDEO';
    else if (mimeType.startsWith('audio/')) type = 'AUDIO';
    else if (mimeType.includes('font') || mimeType.endsWith('woff') || mimeType.endsWith('ttf')) type = 'FONT';
    else if (mimeType.includes('pdf') || mimeType.includes('document')) type = 'DOCUMENT';

    // Upload file
    const uploadResult = await uploadAsset(projectId, buffer, file.name, mimeType);

    // Create asset record
    const asset = await createAssetRecord(
      projectId,
      user.id,
      name,
      type,
      mimeType,
      file.size,
      uploadResult
    );

    return NextResponse.json({
      success: true,
      data: asset,
      message: 'Asset uploaded successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error uploading asset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload asset' },
      { status: 500 }
    );
  }
}
