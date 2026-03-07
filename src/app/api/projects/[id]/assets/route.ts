// API: Project Assets - List and Upload
// GET /api/projects/[id]/assets - List all assets
// POST /api/projects/[id]/assets - Upload a new asset

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

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

const getAssetType = (mimeType: string): any => {
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  if (mimeType.startsWith('audio/')) return 'AUDIO';
  if (mimeType.includes('pdf') || mimeType.includes('document')) return 'DOCUMENT';
  if (mimeType.includes('font')) return 'FONT';
  return 'OTHER';
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId } = await params;

    const assets = await prisma.asset.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: assets
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

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Create assets directory if it doesn't exist
    const assetsDir = join(process.cwd(), 'public', 'assets', projectId);
    if (!existsSync(assetsDir)) {
      await mkdir(assetsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}-${randomStr}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = join(assetsDir, fileName);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Get image dimensions for images
    let width: number | undefined;
    let height: number | undefined;

    if (file.type.startsWith('image/')) {
      try {
        // Simple dimension extraction for common image formats
        const view = new DataView(bytes);
        if (file.type === 'image/jpeg') {
          // JPEG dimension parsing
          let offset = 2;
          while (offset < view.byteLength) {
            const marker = view.getUint16(offset, false);
            offset += 2;
            if (marker >= 0xFFC0 && marker <= 0xFFC3) {
              offset += 5;
              height = view.getUint16(offset, false);
              width = view.getUint16(offset + 2, false);
              break;
            }
            const length = view.getUint16(offset, false);
            offset += length;
          }
        } else if (file.type === 'image/png') {
          width = view.getUint32(16, false);
          height = view.getUint32(20, false);
        }
      } catch (e) {
        console.log('Could not extract image dimensions');
      }
    }

    // Create asset record
    const asset = await prisma.asset.create({
      data: {
        name: file.name,
        type: getAssetType(file.type),
        url: `/assets/${projectId}/${fileName}`,
        size: file.size,
        mimeType: file.type,
        width,
        height,
        storageProvider: 'local',
        storageKey: fileName,
        projectId,
        uploadedById: user.id
      }
    });

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
