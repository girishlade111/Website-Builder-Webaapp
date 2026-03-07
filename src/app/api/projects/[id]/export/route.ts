// API: Project Export - Export as Next.js or Static site
// POST /api/projects/:id/export - Export project

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    const body = await request.json();
    const { format = 'nextjs' } = body;

    const project = await checkProjectAccess(id, user.id);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Get project with pages
    const fullProject = await prisma.project.findUnique({
      where: { id },
      include: {
        pages: {
          orderBy: { path: 'asc' }
        }
      }
    });

    if (!fullProject) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Generate files based on format
    let files;
    let filename;

    if (format === 'static') {
      files = generateStaticExport(fullProject);
      filename = `${fullProject.slug}-static-export.zip`;
    } else {
      files = generateNextJsProject(fullProject);
      filename = `${fullProject.slug}-nextjs-export.zip`;
    }

    // Create zip archive
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    const chunks: Buffer[] = [];

    archive.on('data', (chunk) => {
      chunks.push(chunk);
    });

    // Add files to archive
    for (const file of files) {
      archive.append(file.content, { name: file.path });
    }

    await archive.finalize();

    // Wait for archive to complete
    const buffer = await new Promise<Buffer>((resolve, reject) => {
      archive.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      archive.on('error', reject);
    });

    // Return as downloadable file
    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString()
      }
    });
  } catch (error) {
    console.error('Error exporting project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export project' },
      { status: 500 }
    );
  }
}
