// API: Project Assets - List and Upload
// GET /api/projects/[id]/assets - List all assets
// POST /api/projects/[id]/assets - Upload a new asset

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { mkdir, writeFile } from 'fs/promises';
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

const checkProjectAccess = async (projectId: string, userId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { collaborations: true }
  });

  if (!project) return { allowed: false, reason: 'Project not found' };

  const isOwner = project.ownerId === userId;
  const isCollaborator = project.collaborations.some(
    c => c.userId === userId && c.acceptedAt !== null
  );

  if (!isOwner && !isCollaborator) {
    return { allowed: false, reason: 'Access denied' };
  }

  const role = isOwner ? 'OWNER' : project.collaborations.find(c => c.userId === userId)?.role;

  return { allowed: true, role };
};

// Get asset type from MIME type
function getAssetTypeFromMimeType(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  if (mimeType.startsWith('audio/')) return 'AUDIO';
  if (mimeType.includes('font')) return 'FONT';
  if (mimeType.includes('pdf') || mimeType.includes('text')) return 'DOCUMENT';
  return 'OTHER';
}

// Get file extension from MIME type
function getExtensionFromMimeType(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'audio/mp3': 'mp3',
    'audio/wav': 'wav',
    'application/pdf': 'pdf',
    'text/plain': 'txt',
    'font/woff2': 'woff2',
    'font/woff': 'woff',
  };
  return extensions[mimeType] || 'bin';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId } = await params;

    // Check access
    const access = await checkProjectAccess(projectId, user.id);
    if (!access.allowed) {
      return NextResponse.json(
        { success: false, error: access.reason },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');

    const where: any = { projectId };
    if (type) {
      where.type = type;
    }

    const assets = await prisma.asset.findMany({
      where,
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true }
        }
      },
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

    // Check access
    const access = await checkProjectAccess(projectId, user.id);
    if (!access.allowed) {
      return NextResponse.json(
        { success: false, error: access.reason },
        { status: 403 }
      );
    }

    // Check if user has upload permission
    if (access.role !== 'OWNER' && access.role !== 'ADMIN' && access.role !== 'EDITOR') {
      return NextResponse.json(
        { success: false, error: 'Upload permission denied' },
        { status: 403 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Get file info
    const mimeType = file.type || 'application/octet-stream';
    const assetType = getAssetTypeFromMimeType(mimeType);
    const extension = getExtensionFromMimeType(mimeType);
    const fileName = name || file.name || `asset-${nanoid()}.${extension}`;

    // Generate unique storage path
    const storageKey = `assets/${projectId}/${nanoid()}-${fileName}`;
    
    // Ensure storage directory exists
    const storageDir = join(process.cwd(), 'public', 'uploads', projectId);
    if (!existsSync(storageDir)) {
      await mkdir(storageDir, { recursive: true });
    }

    // Save file to local storage
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const filePath = join(storageDir, `${nanoid()}-${fileName}`);
    await writeFile(filePath, fileBuffer);

    // Generate URLs
    const url = `/uploads/${projectId}/${nanoid()}-${fileName}`;
    const thumbnailUrl = assetType === 'IMAGE' ? url : null;

    // Create asset record
    const asset = await prisma.asset.create({
      data: {
        projectId,
        name: fileName,
        type: assetType as any,
        url,
        thumbnailUrl,
        size: file.size,
        mimeType,
        storageProvider: 'local',
        storageKey,
        uploadedById: user.id
      },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true }
        }
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
