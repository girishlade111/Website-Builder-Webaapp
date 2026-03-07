// API: Project Assets - List and Upload
// GET /api/projects/[id]/assets - List all assets
// POST /api/projects/[id]/assets - Upload new asset

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { 
  uploadAsset, 
  createAssetRecord, 
  listAssets as listAssetsService,
  deleteAsset 
} from '@/lib/services/assetStorage';

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

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const result = await listAssetsService(projectId, { type, page, pageSize });

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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const mimeType = file.type;
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'video/mp4', 'video/webm',
      'audio/mp3', 'audio/wav',
      'application/pdf', 'application/json', 'text/plain',
      'font/woff', 'font/woff2', 'font/ttf', 'font/otf'
    ];

    if (!allowedTypes.includes(mimeType)) {
      return NextResponse.json(
        { success: false, error: 'File type not allowed' },
        { status: 400 }
      );
    }

    // Determine asset type
    let assetType = 'OTHER';
    if (mimeType.startsWith('image/')) assetType = 'IMAGE';
    else if (mimeType.startsWith('video/')) assetType = 'VIDEO';
    else if (mimeType.startsWith('audio/')) assetType = 'AUDIO';
    else if (mimeType.includes('font')) assetType = 'FONT';
    else if (['application/pdf', 'application/json', 'text/plain'].includes(mimeType)) assetType = 'DOCUMENT';

    // Read file as buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload file
    const uploadResult = await uploadAsset(
      projectId,
      buffer,
      file.name,
      mimeType
    );

    // Create asset record
    const asset = await createAssetRecord(
      projectId,
      user.id,
      name || file.name,
      assetType,
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
