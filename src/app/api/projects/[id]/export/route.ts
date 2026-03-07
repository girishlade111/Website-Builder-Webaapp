// API: Project Export
// POST /api/projects/[id]/export - Export project as static site or Next.js project

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateNextJsProject, generateStaticExport } from '@/lib/services/codeGeneration';
import archiver from 'archiver';
import { Readable } from 'stream';

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'nextjs';

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { pages: true }
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

    if (!['static', 'nextjs', 'vercel'].includes(format)) {
      return NextResponse.json(
        { success: false, error: 'Invalid format. Use: static, nextjs, or vercel' },
        { status: 400 }
      );
    }

    // Generate files based on format
    let files: Array<{ path: string; content: string }>;

    if (format === 'static') {
      files = generateStaticExport(project as any);
    } else {
      files = generateNextJsProject(project as any, {
        typescript: true,
        tailwind: true,
        exportType: format === 'vercel' ? 'standalone' : 'server'
      });
    }

    // Create ZIP archive
    const zipBuffer = await createZipArchive(files, project.slug);

    // Return ZIP file
    return new NextResponse(zipBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${project.slug}-${format}-export.zip"`
      }
    });
  } catch (error: any) {
    console.error('Error exporting project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export project' },
      { status: 500 }
    );
  }
}

async function createZipArchive(
  files: Array<{ path: string; content: string }>,
  projectName: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('data', (chunk) => chunks.push(chunk));
    
    archive.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    archive.on('error', (err) => {
      reject(err);
    });

    // Add files to archive
    for (const file of files) {
      archive.append(file.content, { name: file.path });
    }

    archive.finalize();
  });
}
