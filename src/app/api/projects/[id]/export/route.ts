// API: Project Export
// POST /api/projects/[id]/export - Export project as static site or Next.js

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateNextJsProject, generateStaticExport } from '@/lib/services/codeGeneration';
import archiver from 'archiver';
import { Writable } from 'stream';

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
    const { searchParams } = new URL(request.url);
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

      if (!collaboration) {
        return NextResponse.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // Validate format
    const validFormats = ['nextjs', 'static'];
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { success: false, error: 'Invalid format. Use "nextjs" or "static"' },
        { status: 400 }
      );
    }

    // Generate files based on format
    let files: Array<{ path: string; content: string }>;

    if (format === 'static') {
      files = generateStaticExport(project);
    } else {
      files = generateNextJsProject(project, {
        typescript: true,
        tailwind: true,
        exportType: 'standalone'
      });
    }

    // Create ZIP archive
    const chunks: Buffer[] = [];
    const stream = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(Buffer.from(chunk));
        callback();
      }
    });

    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    // Pipe archive to our stream
    archive.pipe(stream);

    // Add files to archive
    for (const file of files) {
      archive.append(file.content, { name: file.path });
    }

    await archive.finalize();

    // Wait for stream to finish
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    const buffer = Buffer.concat(chunks);
    const base64Zip = buffer.toString('base64');

    return NextResponse.json({
      success: true,
      data: {
        format,
        fileCount: files.length,
        downloadUrl: `data:application/zip;base64,${base64Zip}`,
        files: files.map(f => ({ path: f.path, size: f.content.length }))
      },
      message: `Project exported as ${format}`
    });
  } catch (error) {
    console.error('Error exporting project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export project' },
      { status: 500 }
    );
  }
}
