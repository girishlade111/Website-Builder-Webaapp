// API: Project Export
// POST /api/projects/[id]/export - Export project as static site or Next.js project

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createWriteStream } from 'fs';
import { join } from 'path';
import archiver from 'archiver';
import { pipeline } from 'stream/promises';
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

  return { allowed: true };
};

// Generate Next.js project files
function generateNextJsProject(project: any, pages: any[]) {
  const files: Record<string, string> = {};

  // package.json
  files['package.json'] = JSON.stringify({
    name: project.slug,
    version: '1.0.0',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'next lint'
    },
    dependencies: {
      next: '14.0.0',
      react: '18.2.0',
      'react-dom': '18.2.0'
    },
    devDependencies: {
      '@types/node': '20.0.0',
      '@types/react': '18.2.0',
      '@types/react-dom': '18.2.0',
      typescript: '5.0.0'
    }
  }, null, 2);

  // next.config.js
  files['next.config.js'] = `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: '${project.settings?.exportType === 'static' ? 'export' : 'standalone'}',
  images: {
    unoptimized: ${project.settings?.exportType === 'static' ? 'true' : 'false'}
  }
}

module.exports = nextConfig
`;

  // tsconfig.json
  files['tsconfig.json'] = JSON.stringify({
    compilerOptions: {
      target: 'es5',
      lib: ['dom', 'dom.iterable', 'esnext'],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: 'esnext',
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'preserve',
      incremental: true,
      plugins: [{ name: 'next' }],
      paths: {
        '@/*': ['./src/*']
      }
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
    exclude: ['node_modules']
  }, null, 2);

  // .gitignore
  files['.gitignore'] = `# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
`;

  // Generate layout
  const settings = project.settings as any;
  const seo = settings?.seo || {};
  
  files['src/app/layout.tsx'] = `import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${seo.title || project.name}',
  description: '${seo.description || ''}',
  keywords: ${JSON.stringify(seo.keywords || [])},
  ${seo.ogImage ? `openGraph: {
    images: ['${seo.ogImage}']
  },` : ''}
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

  // globals.css
  files['src/app/globals.css'] = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}
`;

  // Generate pages
  for (const page of pages) {
    const pagePath = page.path === '/' ? '/page.tsx' : `${page.path}/page.tsx`;
    files[`src/app${pagePath}`] = generatePageComponent(page);
  }

  // tailwind.config.ts
  files['tailwind.config.ts'] = `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config
`;

  return files;
}

// Generate React component from page schema
function generatePageComponent(page: any): string {
  const schema = page.schema as any;
  const components = schema?.components || [];
  const metaTitle = page.metaTitle || page.name;
  const metaDescription = page.metaDescription || '';

  let componentCode = `import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${metaTitle}',
  description: '${metaDescription}',
};

export default function Page() {
  return (
    <main className="min-h-screen p-8">
`;

  for (const comp of components) {
    componentCode += generateComponentCode(comp, 6);
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
  const className = comp.styles?.className || '';

  switch (comp.type) {
    case 'section':
      return `${spaces}<section className="${className}" style={${styles}}>\n${spaces}</section>\n`;
    case 'container':
    case 'div':
      return `${spaces}<div className="${className}" style={${styles}}>\n${spaces}</div>\n`;
    case 'heading':
      const level = comp.content?.level || 1;
      const Tag = `h${level}`;
      return `${spaces}<${Tag} className="${className}" style={${styles}}>${comp.content?.text || ''}</${Tag}>\n`;
    case 'paragraph':
      return `${spaces}<p className="${className}" style={${styles}}>${comp.content?.text || ''}</p>\n`;
    case 'image':
      return `${spaces}<img src="${comp.content?.src || ''}" alt="${comp.content?.alt || ''}" className="${className}" style={${styles}} />\n`;
    case 'button':
      return `${spaces}<button className="${className}" style={${styles}}>${comp.content?.text || 'Button'}</button>\n`;
    case 'link':
      return `${spaces}<a href="${comp.content?.href || '#'}" className="${className}" style={${styles}}>${comp.content?.text || 'Link'}</a>\n`;
    case 'text':
      return `${spaces}<span className="${className}" style={${styles}}>${comp.content?.text || ''}</span>\n`;
    default:
      return `${spaces}<div className="${className}" style={${styles}}>${comp.content?.text || ''}</div>\n`;
  }
}

function generateStyleString(styles: any): string {
  if (!styles || Object.keys(styles).length === 0) {
    return '{}';
  }
  // Filter out className from styles
  const { className, ...rest } = styles;
  return JSON.stringify(rest);
}

// Generate static HTML export
function generateStaticExport(project: any, pages: any[]) {
  const files: Record<string, string> = {};

  const settings = project.settings as any;
  const seo = settings?.seo || {};

  // Generate index.html for each page
  for (const page of pages) {
    const htmlPath = page.path === '/' ? 'index.html' : `${page.path}/index.html`;
    files[htmlPath] = generateStaticHtml(page, project, seo);
  }

  return files;
}

function generateStaticHtml(page: any, project: any, seo: any): string {
  const schema = page.schema as any;
  const components = schema?.components || [];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.metaTitle || seo.title || project.name}</title>
  <meta name="description" content="${page.metaDescription || seo.description || ''}">
  <meta name="keywords" content="${(seo.keywords || []).join(', ')}">
  ${seo.ogImage ? `<meta property="og:image" content="${seo.ogImage}">` : ''}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  </style>
</head>
<body>
  <main>
    ${components.map((comp: any) => generateStaticHtmlComponent(comp)).join('\n    ')}
  </main>
</body>
</html>`;
}

function generateStaticHtmlComponent(comp: any): string {
  const styles = Object.entries(comp.styles || {})
    .filter(([key]) => key !== 'className')
    .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
    .join('; ');

  switch (comp.type) {
    case 'heading':
      const level = comp.content?.level || 1;
      return `<h${level} style="${styles}">${comp.content?.text || ''}</h${level}>`;
    case 'paragraph':
      return `<p style="${styles}">${comp.content?.text || ''}</p>`;
    case 'image':
      return `<img src="${comp.content?.src || ''}" alt="${comp.content?.alt || ''}" style="${styles}" />`;
    case 'button':
      return `<button style="${styles}">${comp.content?.text || 'Button'}</button>`;
    case 'link':
      return `<a href="${comp.content?.href || '#'}" style="${styles}">${comp.content?.text || 'Link'}</a>`;
    case 'section':
      return `<section style="${styles}"></section>`;
    default:
      return `<div style="${styles}">${comp.content?.text || ''}</div>`;
  }
}

// Create ZIP archive from files
async function createZipArchive(files: Record<string, string>): Promise<Buffer> {
  const chunks: Buffer[] = [];
  
  const archive = archiver('zip', {
    zlib: { level: 9 }
  });

  const streamPromise = new Promise<Buffer>((resolve, reject) => {
    archive.on('data', (chunk) => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', reject);
  });

  // Add files to archive
  for (const [path, content] of Object.entries(files)) {
    archive.append(content, { name: path });
  }

  await archive.finalize();
  return streamPromise;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: projectId } = await params;
    const body = await request.json();
    const { format = 'nextjs' } = body || {};

    // Check access
    const access = await checkProjectAccess(projectId, user.id);
    if (!access.allowed) {
      return NextResponse.json(
        { success: false, error: access.reason },
        { status: 403 }
      );
    }

    // Get project with pages
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

    // Generate files based on format
    let files: Record<string, string>;
    let filename: string;

    if (format === 'static') {
      files = generateStaticExport(project, project.pages);
      filename = `${project.slug}-static-export.zip`;
    } else {
      files = generateNextJsProject(project, project.pages);
      filename = `${project.slug}-nextjs-export.zip`;
    }

    // Create ZIP archive
    const zipBuffer = await createZipArchive(files);

    // Return as downloadable file
    return new NextResponse(zipBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`
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
