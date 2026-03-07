// Code Generation Service - Generate Next.js code from page schema

import { Project, Page } from '@prisma/client';

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface GenerationOptions {
  typescript?: boolean;
  tailwind?: boolean;
  exportType?: 'static' | 'server' | 'standalone';
  includeApiRoutes?: boolean;
}

// Generate complete Next.js project structure
export function generateNextJsProject(
  project: Project & { pages: Page[] },
  options: GenerationOptions = {}
): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const {
    typescript = true,
    tailwind = true,
    exportType = 'server',
    includeApiRoutes = false
  } = options;

  const settings = (project.settings as any) || {};
  const seo = settings.seo || {};

  // Generate package.json
  files.push({
    path: 'package.json',
    content: generatePackageJson(project.slug, typescript)
  });

  // Generate next.config.js
  files.push({
    path: 'next.config.js',
    content: generateNextConfig(exportType)
  });

  // Generate tsconfig.json if TypeScript
  if (typescript) {
    files.push({
      path: 'tsconfig.json',
      content: generateTsconfig()
    });
  }

  // Generate tailwind config if enabled
  if (tailwind) {
    files.push({
      path: 'tailwind.config.js',
      content: generateTailwindConfig(typescript)
    });
    files.push({
      path: 'postcss.config.js',
      content: generatePostcssConfig()
    });
  }

  // Generate layout
  files.push({
    path: 'src/app/layout.tsx',
    content: generateLayout(seo, typescript)
  });

  // Generate globals.css
  files.push({
    path: 'src/app/globals.css',
    content: generateGlobalsCss(tailwind)
  });

  // Generate pages
  for (const page of project.pages) {
    const pagePath = page.path === '/' ? 'src/app/page.tsx' : `src/app${page.path}/page.tsx`;
    files.push({
      path: pagePath,
      content: generatePageComponent(page, typescript, tailwind)
    });
  }

  // Generate API routes if enabled
  if (includeApiRoutes) {
    files.push({
      path: 'src/app/api/contact/route.ts',
      content: generateContactApiRoute()
    });
  }

  // Generate .gitignore
  files.push({
    path: '.gitignore',
    content: generateGitignore()
  });

  // Generate README
  files.push({
    path: 'README.md',
    content: generateReadme(project)
  });

  return files;
}

function generatePackageJson(slug: string, typescript: boolean): string {
  return JSON.stringify({
    name: slug,
    version: '1.0.0',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'next lint'
    },
    dependencies: {
      next: '14.1.0',
      react: '18.2.0',
      'react-dom': '18.2.0'
    },
    devDependencies: typescript ? {
      '@types/node': '20.11.0',
      '@types/react': '18.2.0',
      '@types/react-dom': '18.2.0',
      typescript: '5.3.0'
    } : {}
  }, null, 2);
}

function generateNextConfig(exportType: string): string {
  const isStatic = exportType === 'static';
  return `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: '${isStatic ? 'export' : 'standalone'}',
  images: {
    unoptimized: ${isStatic}
  }
}

module.exports = nextConfig
`;
}

function generateTsconfig(): string {
  return JSON.stringify({
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
}

function generateTailwindConfig(typescript: boolean): string {
  const ext = typescript ? 'ts' : 'js';
  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
`;
}

function generatePostcssConfig(): string {
  return `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
}

function generateLayout(seo: any, typescript: boolean): string {
  return `import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${seo.title || 'Website'}',
  description: '${seo.description || ''}',
  keywords: ${JSON.stringify(seo.keywords || [])},
  ${seo.ogImage ? `openGraph: {
    images: ['${seo.ogImage}'],
    title: '${seo.title || 'Website'}',
    description: '${seo.description || ''}',
  },` : ''}
  ${seo.favicon ? `icons: {
    icon: '${seo.favicon}',
  },` : ''}
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
`;
}

function generateGlobalsCss(tailwind: boolean): string {
  if (tailwind) {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 255, 255, 255;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-start-rgb));
}
`;
  }
  return `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
}
`;
}

function generatePageComponent(page: Page, typescript: boolean, tailwind: boolean): string {
  const schema = (page.schema as any) || { components: [] };
  const components = schema.components || [];

  return `export default function Page() {
  return (
    <main className="min-h-screen">
      ${components.map((comp: any) => generateComponentCode(comp, 6, tailwind)).join('\n')}
    </main>
  );
}
`;
}

function generateComponentCode(comp: any, indent: number, tailwind: boolean): string {
  const spaces = ' '.repeat(indent);
  const styles = comp.styles || {};
  const className = styles.className || '';
  const styleProps = Object.fromEntries(
    Object.entries(styles).filter(([key]) => key !== 'className')
  );
  const styleString = Object.keys(styleProps).length > 0 
    ? ` style={${JSON.stringify(styleProps)}}` 
    : '';

  switch (comp.type) {
    case 'section':
      return `${spaces}<section className="${className}"${styleString}>\n${spaces}</section>\n`;
    case 'container':
    case 'div':
      return `${spaces}<div className="${className}"${styleString}>\n${spaces}</div>\n`;
    case 'heading':
      const level = comp.content?.level || 1;
      const Tag = `h${level}`;
      const text = comp.content?.text || '';
      return `${spaces}<${Tag} className="${className}"${styleString}>${text}</${Tag}>\n`;
    case 'paragraph':
      return `${spaces}<p className="${className}"${styleString}>${comp.content?.text || ''}</p>\n`;
    case 'image':
      return `${spaces}<img src="${comp.content?.src || ''}" alt="${comp.content?.alt || ''}" className="${className}"${styleString} />\n`;
    case 'button':
      return `${spaces}<button className="${className}"${styleString}>${comp.content?.text || 'Button'}</button>\n`;
    case 'link':
      return `${spaces}<a href="${comp.content?.href || '#'}" className="${className}"${styleString}>${comp.content?.text || 'Link'}</a>\n`;
    case 'text':
      return `${spaces}<span className="${className}"${styleString}>${comp.content?.text || ''}</span>\n`;
    case 'navbar':
      return generateNavbarComponent(indent, tailwind);
    case 'footer':
      return generateFooterComponent(indent, tailwind);
    case 'hero':
      return generateHeroComponent(comp, indent, tailwind);
    case 'cards':
      return generateCardsComponent(comp, indent, tailwind);
    default:
      return `${spaces}<div className="${className}"${styleString}>${comp.content?.text || ''}</div>\n`;
  }
}

function generateNavbarComponent(indent: number, tailwind: boolean): string {
  const spaces = ' '.repeat(indent);
  if (tailwind) {
    return `${spaces}<nav className="bg-white shadow-sm">
${spaces}  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
${spaces}    <div className="flex justify-between h-16">
${spaces}      <div className="flex items-center">
${spaces}        <span className="text-xl font-bold">Logo</span>
${spaces}      </div>
${spaces}      <div className="flex items-center space-x-4">
${spaces}        <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
${spaces}        <a href="/about" className="text-gray-600 hover:text-gray-900">About</a>
${spaces}        <a href="/contact" className="text-gray-600 hover:text-gray-900">Contact</a>
${spaces}      </div>
${spaces}    </div>
${spaces}  </div>
${spaces}</nav>\n`;
  }
  return `${spaces}<nav style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>\n${spaces}  <span>Logo</span>\n${spaces}</nav>\n`;
}

function generateFooterComponent(indent: number, tailwind: boolean): string {
  const spaces = ' '.repeat(indent);
  if (tailwind) {
    return `${spaces}<footer className="bg-gray-900 text-white py-8">
${spaces}  <div className="max-w-7xl mx-auto px-4 text-center">
${spaces}    <p>&copy; 2024 Company Name. All rights reserved.</p>
${spaces}  </div>
${spaces}</footer>\n`;
  }
  return `${spaces}<footer style={{ padding: '2rem', textAlign: 'center', background: '#1a1a1a', color: 'white' }}>\n${spaces}  <p>© 2024 Company Name</p>\n${spaces}</footer>\n`;
}

function generateHeroComponent(comp: any, indent: number, tailwind: boolean): string {
  const spaces = ' '.repeat(indent);
  const title = comp.content?.title || 'Welcome';
  const subtitle = comp.content?.subtitle || '';
  const ctaText = comp.content?.ctaText || 'Get Started';
  const ctaLink = comp.content?.ctaLink || '#';

  if (tailwind) {
    return `${spaces}<section className="py-20 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
${spaces}  <div className="max-w-7xl mx-auto px-4 text-center">
${spaces}    <h1 className="text-5xl font-bold mb-4">${title}</h1>
${spaces}    ${subtitle ? `<p className="text-xl mb-8">${subtitle}</p>` : ''}
${spaces}    <a href="${ctaLink}" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">${ctaText}</a>
${spaces}  </div>
${spaces}</section>\n`;
  }
  return `${spaces}<section style={{ padding: '4rem 2rem', textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
${spaces}  <h1>${title}</h1>
${spaces}  ${subtitle ? `<p>${subtitle}</p>` : ''}
${spaces}  <a href="${ctaLink}">${ctaText}</a>
${spaces}</section>\n`;
}

function generateCardsComponent(comp: any, indent: number, tailwind: boolean): string {
  const spaces = ' '.repeat(indent);
  const cards = comp.content?.cards || [];

  if (tailwind) {
    return `${spaces}<section className="py-16">
${spaces}  <div className="max-w-7xl mx-auto px-4">
${spaces}    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
${cards.map((card: any) => `${spaces}      <div className="bg-white rounded-lg shadow-lg p-6">
${spaces}        <h3 className="text-xl font-semibold mb-2">${card.title || 'Card Title'}</h3>
${spaces}        <p className="text-gray-600">${card.description || 'Card description'}</p>
${spaces}      </div>`).join('\n')}
${spaces}    </div>
${spaces}  </div>
${spaces}</section>\n`;
  }
  return `${spaces}<section style={{ padding: '2rem' }}>
${spaces}  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
${spaces}    ${cards.map((card: any) => `<div style={{ padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}><h3>${card.title || 'Card'}</h3><p>${card.description || ''}</p></div>`).join('\n')}
${spaces}  </div>
${spaces}</section>\n`;
}

function generateContactApiRoute(): string {
  return `import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // TODO: Send email or save to database
    console.log('Contact form submission:', { name, email, message });

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
`;
}

function generateGitignore(): string {
  return `# dependencies
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
}

function generateReadme(project: Project): string {
  return `# ${project.name}

Generated with Website Builder

## Getting Started

First, install dependencies:

\`\`\`bash
npm install
\`\`\`

Run the development server:

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

\`\`\`bash
npm run build
npm start
\`\`\`

## Deploy

The easiest way to deploy is to use [Vercel](https://vercel.com).

## License

MIT
`;
}

// Generate static HTML export
export function generateStaticExport(
  project: Project & { pages: Page[] }
): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const settings = (project.settings as any) || {};
  const seo = settings.seo || {};

  for (const page of project.pages) {
    const htmlPath = page.path === '/' ? 'index.html' : `${page.path}/index.html`;
    files.push({
      path: htmlPath,
      content: generateStaticHtml(page, project, seo)
    });
  }

  // Add basic CSS
  files.push({
    path: 'styles.css',
    content: generateStaticCss()
  });

  return files;
}

function generateStaticHtml(page: Page, project: Project, seo: any): string {
  const schema = (page.schema as any) || { components: [] };
  const components = schema.components || [];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.metaTitle || seo.title || project.name}</title>
  <meta name="description" content="${page.metaDescription || seo.description || ''}">
  <meta name="keywords" content="${(seo.keywords || []).join(', ')}">
  ${seo.ogImage ? `<meta property="og:image" content="${seo.ogImage}">` : ''}
  <link rel="stylesheet" href="/styles.css">
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

function generateStaticCss(): string {
  return `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}

main {
  min-height: 100vh;
}

img {
  max-width: 100%;
  height: auto;
}

a {
  color: #0070f3;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

button {
  cursor: pointer;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #0070f3;
  color: white;
}

button:hover {
  background: #0051cc;
}
`;
}
