// API: Project Deployments
// GET /api/projects/[id]/deployments - List all deployments
// POST /api/projects/[id]/deployments - Create a new deployment

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const VERCEL_API_URL = 'https://api.vercel.com';
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

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

    const deployments = await prisma.deployment.findMany({
      where: { projectId },
      include: {
        triggeredBy: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: deployments
    });
  } catch (error) {
    console.error('Error fetching deployments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch deployments' },
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
    const body = await request.json();
    const { environment = 'PRODUCTION' } = body || {};

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        pages: true
      }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Create deployment record
    const deployment = await prisma.deployment.create({
      data: {
        projectId,
        status: 'PENDING',
        environment,
        triggeredById: user.id
      }
    });

    // Start deployment process (async)
    triggerDeployment(projectId, deployment.id).catch(console.error);

    return NextResponse.json({
      success: true,
      data: deployment,
      message: 'Deployment started'
    }, { status: 202 });
  } catch (error) {
    console.error('Error creating deployment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create deployment' },
      { status: 500 }
    );
  }
}

// Async deployment trigger function
async function triggerDeployment(projectId: string, deploymentId: string) {
  try {
    // Update status to BUILDING
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: { status: 'BUILDING' }
    });

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { pages: true }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Generate Next.js project structure
    const generatedFiles = await generateNextJsProject(project);

    // Deploy to Vercel
    if (VERCEL_TOKEN) {
      const vercelDeployment = await deployToVercel(generatedFiles, project);
      
      await prisma.deployment.update({
        where: { id: deploymentId },
        data: {
          status: 'SUCCESS',
          vercelId: vercelDeployment.id,
          vercelUrl: vercelDeployment.url,
          buildOutput: vercelDeployment
        }
      });

      // Update project with deployed URL
      await prisma.project.update({
        where: { id: projectId },
        data: {
          deployedUrl: vercelDeployment.url,
          lastDeployedAt: new Date(),
          status: 'PUBLISHED'
        }
      });
    } else {
      // Demo mode - simulate deployment
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const demoUrl = `https://${project.slug}.demo.vercel.app`;
      
      await prisma.deployment.update({
        where: { id: deploymentId },
        data: {
          status: 'SUCCESS',
          vercelUrl: demoUrl,
          buildLog: 'Demo deployment successful\nBuild completed in 3.2s'
        }
      });

      await prisma.project.update({
        where: { id: projectId },
        data: {
          deployedUrl: demoUrl,
          lastDeployedAt: new Date(),
          status: 'PUBLISHED'
        }
      });
    }
  } catch (error: any) {
    console.error('Deployment failed:', error);
    
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        status: 'FAILED',
        vercelError: error.message
      }
    });
  }
}

// Generate Next.js project files from schema
async function generateNextJsProject(project: any) {
  const files: Record<string, string> = {};

  // Generate package.json
  files['package.json'] = JSON.stringify({
    name: project.slug,
    version: '1.0.0',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start'
    },
    dependencies: {
      next: 'latest',
      react: 'latest',
      'react-dom': 'latest'
    }
  }, null, 2);

  // Generate next.config.js
  files['next.config.js'] = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
`;

  // Generate pages from schema
  for (const page of project.pages) {
    const pagePath = page.path === '/' ? '/page.tsx' : `${page.path}/page.tsx`;
    files[`src/app${pagePath}`] = generatePageComponent(page);
  }

  // Generate layout
  files['src/app/layout.tsx'] = generateLayout(project);

  return files;
}

// Generate React component from page schema
function generatePageComponent(page: any): string {
  const schema = page.schema as any;
  const components = schema?.components || [];

  let componentCode = `export default function Page() {
  return (
    <main className="min-h-screen">
`;

  for (const comp of components) {
    componentCode += generateComponentCode(comp);
  }

  componentCode += `    </main>
  );
}
`;

  return componentCode;
}

function generateComponentCode(comp: any, indent = 6): string {
  const spaces = ' '.repeat(indent);
  const styles = generateStyleString(comp.styles || {});
  
  switch (comp.type) {
    case 'section':
      return `${spaces}<section style={${styles}}>\n${spaces}</section>\n`;
    case 'heading':
      const level = comp.content?.level || 1;
      const Tag = `h${level}`;
      return `${spaces}<${Tag} style={${styles}}>${comp.content?.text || ''}</${Tag}>\n`;
    case 'paragraph':
      return `${spaces}<p style={${styles}}>${comp.content?.text || ''}</p>\n`;
    case 'image':
      return `${spaces}<img src="${comp.content?.src || ''}" alt="${comp.content?.alt || ''}" style={${styles}} />\n`;
    case 'button':
      return `${spaces}<button style={${styles}}>${comp.content?.text || 'Button'}</button>\n`;
    default:
      return `${spaces}<div style={${styles}}>${comp.content?.text || ''}</div>\n`;
  }
}

function generateStyleString(styles: any): string {
  if (!styles || Object.keys(styles).length === 0) {
    return '{}';
  }
  return JSON.stringify(styles);
}

function generateLayout(project: any): string {
  const settings = project.settings as any;
  const seo = settings?.seo || {};

  return `import './globals.css';

export const metadata = {
  title: '${seo.title || project.name}',
  description: '${seo.description || ''}',
  keywords: ${JSON.stringify(seo.keywords || [])},
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;
}

// Deploy to Vercel API
async function deployToVercel(files: Record<string, string>, project: any) {
  if (!VERCEL_TOKEN) {
    throw new Error('Vercel token not configured');
  }

  // Create Vercel deployment
  const response = await fetch(`${VERCEL_API_URL}/v13/deployments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: project.slug,
      files: Object.entries(files).map(([name, content]) => ({
        file: name,
        data: content
      })),
      project: {
        name: project.slug
      },
      ...(VERCEL_TEAM_ID && { teamId: VERCEL_TEAM_ID })
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Vercel API error: ${error}`);
  }

  return response.json();
}
