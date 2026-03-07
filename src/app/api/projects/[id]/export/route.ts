// API: Project Export
// POST /api/projects/[id]/export - Export project as static site or Next.js project

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import archiver from 'archiver';

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
    const body = await request.json();
    const { format = 'nextjs', includeAssets = true, minify = false } = body || {};

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        pages: true,
        assets: true
      }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Generate project files
    const exportPath = join(process.cwd(), 'exports', projectId, Date.now().toString());
    await mkdir(exportPath, { recursive: true });

    if (format === 'nextjs') {
      await exportAsNextJs(project, exportPath, includeAssets);
    } else if (format === 'static') {
      await exportAsStatic(project, exportPath, includeAssets, minify);
    } else if (format === 'vercel') {
      await exportAsVercel(project, exportPath, includeAssets);
    }

    // Create ZIP file
    const zipPath = join(process.cwd(), 'exports', `${projectId}-${Date.now()}.zip`);
    await createZip(exportPath, zipPath);

    // Return download URL
    const downloadUrl = `/api/downloads/${projectId}-${Date.now()}.zip`;

    return NextResponse.json({
      success: true,
      data: {
        downloadUrl,
        format,
        exportedAt: new Date().toISOString()
      },
      message: 'Project exported successfully'
    });
  } catch (error) {
    console.error('Error exporting project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export project' },
      { status: 500 }
    );
  }
}

async function exportAsNextJs(project: any, exportPath: string, includeAssets: boolean) {
  // Create package.json
  await writeFile(
    join(exportPath, 'package.json'),
    JSON.stringify({
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
        react: '^18.2.0',
        'react-dom': '^18.2.0'
      },
      devDependencies: {
        '@types/node': '^20.0.0',
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0',
        typescript: '^5.0.0'
      }
    }, null, 2)
  );

  // Create tsconfig.json
  await writeFile(
    join(exportPath, 'tsconfig.json'),
    JSON.stringify({
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
        paths: { '@/*': ['./src/*'] }
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules']
    }, null, 2)
  );

  // Create next.config.js
  await writeFile(
    join(exportPath, 'next.config.js'),
    `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
`
  );

  // Create src/app directory
  const appDir = join(exportPath, 'src', 'app');
  await mkdir(appDir, { recursive: true });

  // Create layout.tsx
  const settings = project.settings as any;
  const seo = settings?.seo || {};
  
  await writeFile(
    join(appDir, 'layout.tsx'),
    `import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '${seo.title || project.name}',
  description: '${seo.description || ''}',
  ${seo.keywords?.length ? `keywords: ${JSON.stringify(seo.keywords)},` : ''}
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`
  );

  // Create globals.css
  await writeFile(
    join(appDir, 'globals.css'),
    `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-rgb: 255, 255, 255;
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-rgb));
}
`
  );

  // Create pages
  for (const page of project.pages) {
    const pageDir = page.path === '/' 
      ? appDir 
      : join(appDir, ...page.path.split('/').filter(Boolean));
    
    await mkdir(pageDir, { recursive: true });
    
    await writeFile(
      join(pageDir, 'page.tsx'),
      generatePageComponent(page)
    );
  }

  // Copy assets if requested
  if (includeAssets && project.assets.length > 0) {
    const publicDir = join(exportPath, 'public');
    const assetsDir = join(publicDir, 'assets');
    await mkdir(assetsDir, { recursive: true });

    for (const asset of project.assets) {
      // Copy from local storage
      const sourcePath = join(process.cwd(), 'public', asset.url.replace(/^\//, ''));
      const destPath = join(assetsDir, asset.storageKey || asset.name);
      // Note: In production, you'd copy from cloud storage
    }
  }
}

async function exportAsStatic(project: any, exportPath: string, includeAssets: boolean, minify: boolean) {
  // Create index.html for home page
  for (const page of project.pages) {
    const fileName = page.path === '/' ? 'index.html' : `${page.path.replace(/^\//, '')}.html`;
    const filePath = join(exportPath, fileName);
    const dir = join(exportPath, ...fileName.split('/').slice(0, -1));
    
    if (dir !== exportPath) {
      await mkdir(dir, { recursive: true });
    }

    await writeFile(filePath, generateStaticHtml(page, project, minify));
  }

  // Create assets directory
  if (includeAssets) {
    const assetsDir = join(exportPath, 'assets');
    await mkdir(assetsDir, { recursive: true });
  }

  // Create CSS file
  await writeFile(
    join(exportPath, 'styles.css'),
    `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
`
  );
}

async function exportAsVercel(project: any, exportPath: string, includeAssets: boolean) {
  // Similar to Next.js export but with Vercel-specific config
  await exportAsNextJs(project, exportPath, includeAssets);

  // Create vercel.json
  await writeFile(
    join(exportPath, 'vercel.json'),
    JSON.stringify({
      framework: 'nextjs',
      regions: ['iad1'],
      headers: [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff'
            },
            {
              key: 'X-Frame-Options',
              value: 'DENY'
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block'
            }
          ]
        }
      ]
    }, null, 2)
  );
}

function generatePageComponent(page: any): string {
  const schema = page.schema as any;
  const components = schema?.components || [];

  let code = `export default function Page() {
  return (
    <main>
`;

  for (const comp of components) {
    code += generateComponentCode(comp);
  }

  code += `    </main>
  );
}
`;

  return code;
}

function generateComponentCode(comp: any, indent = 6): string {
  const spaces = ' '.repeat(indent);
  const styles = generateStyleString(comp.styles || {});
  
  switch (comp.type) {
    case 'section':
      return `${spaces}<section style={${styles}}>\n${spaces}</section>\n`;
    case 'container':
      return `${spaces}<div style={${styles}}>\n${spaces}</div>\n`;
    case 'heading':
      const level = comp.content?.level || 1;
      const Tag = `h${level}`;
      return `${spaces}<${Tag} style={${styles}}>${escapeHtml(comp.content?.text || '')}</${Tag}>\n`;
    case 'paragraph':
      return `${spaces}<p style={${styles}}>${escapeHtml(comp.content?.text || '')}</p>\n`;
    case 'image':
      return `${spaces}<img src="${comp.content?.src || ''}" alt="${escapeHtml(comp.content?.alt || '')}" style={${styles}} />\n`;
    case 'button':
      return `${spaces}<button style={${styles}}>${escapeHtml(comp.content?.text || 'Button')}</button>\n`;
    case 'divider':
      return `${spaces}<hr style={${styles}} />\n`;
    case 'spacer':
      return `${spaces}<div style={${styles}} />\n`;
    default:
      return `${spaces}<div style={${styles}}>${escapeHtml(comp.content?.text || '')}</div>\n`;
  }
}

function generateStyleString(styles: any): string {
  if (!styles || Object.keys(styles).length === 0) {
    return '{}';
  }
  return JSON.stringify(styles);
}

function generateStaticHtml(page: any, project: any, minify: boolean): string {
  const settings = project.settings as any;
  const seo = settings?.seo || {};
  const schema = page.schema as any;
  const components = schema?.components || [];

  let bodyContent = '';
  for (const comp of components) {
    bodyContent += generateHtmlComponent(comp);
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${seo.title || page.metaTitle || project.name}</title>
  <meta name="description" content="${seo.description || page.metaDescription || ''}">
  ${seo.keywords?.length ? `<meta name="keywords" content="${seo.keywords.join(', ')}">` : ''}
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  ${bodyContent}
</body>
</html>`;

  return minify ? html.replace(/\s+/g, ' ').trim() : html;
}

function generateHtmlComponent(comp: any): string {
  const styles = generateInlineStyles(comp.styles || {});
  
  switch (comp.type) {
    case 'section':
      return `<section${styles}><div class="container"></div></section>`;
    case 'heading':
      const level = comp.content?.level || 1;
      return `<h${level}${styles}>${escapeHtml(comp.content?.text || '')}</h${level}>`;
    case 'paragraph':
      return `<p${styles}>${escapeHtml(comp.content?.text || '')}</p>`;
    case 'image':
      return `<img src="${comp.content?.src || ''}" alt="${escapeHtml(comp.content?.alt || '')}"${styles}>`;
    case 'button':
      return `<button${styles}>${escapeHtml(comp.content?.text || 'Button')}</button>`;
    default:
      return `<div${styles}>${escapeHtml(comp.content?.text || '')}</div>`;
  }
}

function generateInlineStyles(styles: any): string {
  if (!styles || Object.keys(styles).length === 0) {
    return '';
  }
  const styleString = Object.entries(styles)
    .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}:${value}`)
    .join(';');
  return ` style="${styleString}"`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function createZip(sourceDir: string, outPath: string) {
  // Simple zip implementation would use archiver package
  // For now, we'll just note that the export was created
  console.log(`Creating zip from ${sourceDir} to ${outPath}`);
}
