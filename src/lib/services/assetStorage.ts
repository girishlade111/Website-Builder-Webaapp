// Asset Storage Service - Support for local, S3, and Cloudinary storage

import prisma from '@/lib/prisma';

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

export interface AssetUploadResult {
  url: string;
  thumbnailUrl?: string;
  storageProvider: 'local' | 's3' | 'cloudinary';
  storageKey: string;
  width?: number;
  height?: number;
}

export interface AssetMetadata {
  name: string;
  type: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
}

// Get the configured storage provider
export function getStorageProvider(): 'local' | 's3' | 'cloudinary' {
  if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY) {
    return 'cloudinary';
  }
  if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && AWS_S3_BUCKET) {
    return 's3';
  }
  return 'local';
}

// Upload file to configured storage provider
export async function uploadAsset(
  projectId: string,
  file: Buffer,
  fileName: string,
  mimeType: string
): Promise<AssetUploadResult> {
  const provider = getStorageProvider();

  switch (provider) {
    case 'cloudinary':
      return uploadToCloudinary(file, fileName, mimeType);
    case 's3':
      return uploadToS3(file, fileName, mimeType);
    case 'local':
    default:
      return uploadToLocal(projectId, file, fileName);
  }
}

// Upload to local storage
async function uploadToLocal(
  projectId: string,
  file: Buffer,
  fileName: string
): Promise<AssetUploadResult> {
  const { mkdir, writeFile } = await import('fs/promises');
  const { join } = await import('path');
  const { existsSync } = await import('fs');
  const { nanoid } = await import('nanoid');

  // Ensure storage directory exists
  const storageDir = join(process.cwd(), 'public', 'uploads', projectId);
  if (!existsSync(storageDir)) {
    await mkdir(storageDir, { recursive: true });
  }

  // Generate unique filename
  const uniqueName = `${nanoid()}-${fileName}`;
  const filePath = join(storageDir, uniqueName);

  // Save file
  await writeFile(filePath, file);

  // Generate URL
  const url = `/uploads/${projectId}/${uniqueName}`;

  return {
    url,
    storageProvider: 'local',
    storageKey: `assets/${projectId}/${uniqueName}`,
  };
}

// Upload to AWS S3
async function uploadToS3(
  file: Buffer,
  fileName: string,
  mimeType: string
): Promise<AssetUploadResult> {
  let S3Client: any, PutObjectCommand: any;
  try {
    // @ts-ignore - AWS SDK is optional
    const s3Module = await import('@aws-sdk/client-s3');
    S3Client = s3Module.S3Client;
    PutObjectCommand = s3Module.PutObjectCommand;
  } catch {
    throw new Error('AWS SDK not installed. Install @aws-sdk/client-s3 for S3 support.');
  }

  const { nanoid } = await import('nanoid');

  if (!AWS_S3_BUCKET) {
    throw new Error('S3 bucket not configured');
  }

  const s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID!,
      secretAccessKey: AWS_SECRET_ACCESS_KEY!,
    },
  });

  const key = `assets/${nanoid()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: AWS_S3_BUCKET,
    Key: key,
    Body: file,
    ContentType: mimeType,
    ACL: 'public-read',
  });

  await s3Client.send(command);

  const url = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;

  return {
    url,
    storageProvider: 's3',
    storageKey: key,
  };
}

// Upload to Cloudinary
async function uploadToCloudinary(
  file: Buffer,
  fileName: string,
  mimeType: string
): Promise<AssetUploadResult> {
  let cloudinary: any;
  try {
    // @ts-ignore - Cloudinary SDK is optional
    const cloudinaryModule = await import('cloudinary');
    cloudinary = cloudinaryModule.v2;
  } catch {
    throw new Error('Cloudinary SDK not installed. Install cloudinary for Cloudinary support.');
  }

  const { nanoid } = await import('nanoid');

  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary not configured');
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  // Convert buffer to base64 for upload
  const base64Data = file.toString('base64');
  const dataUri = `data:${mimeType};base64,${base64Data}`;

  // Determine resource type
  let resourceType = 'image';
  if (mimeType.startsWith('video/')) {
    resourceType = 'video';
  } else if (mimeType.includes('font')) {
    resourceType = 'raw';
  }

  const uniqueId = nanoid();
  const publicId = `assets/${uniqueId}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    public_id: publicId,
    resource_type: resourceType,
    folder: 'website-builder',
  });

  return {
    url: result.secure_url,
    thumbnailUrl: resourceType === 'image' ? result.thumbnail_url : undefined,
    storageProvider: 'cloudinary',
    storageKey: result.public_id,
    width: result.width,
    height: result.height,
  };
}

// Delete asset from storage provider
export async function deleteAsset(
  storageProvider: string,
  storageKey: string
): Promise<void> {
  switch (storageProvider) {
    case 'cloudinary':
      await deleteFromCloudinary(storageKey);
      break;
    case 's3':
      await deleteFromS3(storageKey);
      break;
    case 'local':
      await deleteLocal(storageKey);
      break;
  }
}

// Delete from local storage
async function deleteLocal(storageKey: string): Promise<void> {
  const { unlink } = await import('fs/promises');
  const { join } = await import('path');

  const filePath = join(process.cwd(), 'public', storageKey);
  try {
    await unlink(filePath);
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

// Delete from S3
async function deleteFromS3(storageKey: string): Promise<void> {
  let S3Client: any, DeleteObjectCommand: any;
  try {
    // @ts-ignore - AWS SDK is optional
    const s3Module = await import('@aws-sdk/client-s3');
    S3Client = s3Module.S3Client;
    DeleteObjectCommand = s3Module.DeleteObjectCommand;
  } catch {
    throw new Error('AWS SDK not installed. Install @aws-sdk/client-s3 for S3 support.');
  }

  if (!AWS_S3_BUCKET) {
    throw new Error('S3 bucket not configured');
  }

  const s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID!,
      secretAccessKey: AWS_SECRET_ACCESS_KEY!,
    },
  });

  const command = new DeleteObjectCommand({
    Bucket: AWS_S3_BUCKET,
    Key: storageKey,
  });

  await s3Client.send(command);
}

// Delete from Cloudinary
async function deleteFromCloudinary(storageKey: string): Promise<void> {
  let cloudinary: any;
  try {
    // @ts-ignore - Cloudinary SDK is optional
    const cloudinaryModule = await import('cloudinary');
    cloudinary = cloudinaryModule.v2;
  } catch {
    // Cloudinary not configured, skip deletion
    return;
  }

  if (!CLOUDINARY_CLOUD_NAME) {
    return;
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  await cloudinary.uploader.destroy(storageKey);
}

// Get image dimensions
export async function getImageDimensions(
  file: Buffer,
  mimeType: string
): Promise<{ width: number; height: number } | null> {
  try {
    // For local development, we can use sharp if available
    // In production, cloudinary/s3 already provide dimensions
    let sharp: any;
    try {
      // @ts-ignore - sharp is optional
      const sharpModule = await import('sharp');
      sharp = sharpModule.default;
    } catch {
      // sharp not available
      return null;
    }
    const metadata = await sharp(file).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
    };
  } catch {
    // sharp not available, return null
    return null;
  }
}

// Create asset record in database
export async function createAssetRecord(
  projectId: string,
  uploadedById: string,
  name: string,
  type: string,
  mimeType: string,
  size: number,
  uploadResult: AssetUploadResult,
  dimensions?: { width: number; height: number }
) {
  return prisma.asset.create({
    data: {
      projectId,
      name,
      type: type as any,
      url: uploadResult.url,
      thumbnailUrl: uploadResult.thumbnailUrl,
      size,
      mimeType,
      width: dimensions?.width,
      height: dimensions?.height,
      storageProvider: uploadResult.storageProvider,
      storageKey: uploadResult.storageKey,
      uploadedById,
    },
    include: {
      uploadedBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

// Get asset URL with transformations (for cloudinary)
export function getTransformedAssetUrl(
  asset: {
    url: string;
    storageProvider: string;
    storageKey: string;
  },
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  }
): string {
  if (asset.storageProvider === 'cloudinary' && options) {
    try {
      const { v2: cloudinary } = require('cloudinary');
      return cloudinary.url(asset.storageKey, {
        transformations: [
          options.width ? { width: options.width } : {},
          options.height ? { height: options.height } : {},
          options.quality ? { quality: options.quality } : {},
          options.format ? { fetch_format: options.format } : {},
        ],
      });
    } catch {
      // Cloudinary not available
    }
  }

  return asset.url;
}

// List assets with pagination
export async function listAssets(
  projectId: string,
  options?: {
    type?: string;
    page?: number;
    pageSize?: number;
  }
) {
  const { type = undefined, page = 1, pageSize = 20 } = options || {};

  const where: any = { projectId };
  if (type) {
    where.type = type;
  }

  const [assets, total] = await Promise.all([
    prisma.asset.findMany({
      where,
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.asset.count({ where }),
  ]);

  return {
    items: assets,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// Search assets by name
export async function searchAssets(
  projectId: string,
  query: string
) {
  return prisma.asset.findMany({
    where: {
      projectId,
      name: {
        contains: query,
        mode: 'insensitive',
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
}
