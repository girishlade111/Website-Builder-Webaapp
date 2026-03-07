// Mock Data for Demo Purposes (No Backend Required)
// This allows the website builder to work without a database

import type { Project, Template, ProjectPage } from '@/types/backend';

// Simulate network delay for realistic feel
const simulateDelay = (ms: number = 300) =>
  new Promise(resolve => setTimeout(resolve, ms));

// Fixed IDs for demo projects (so they persist across reloads)
const DEMO_PROJECT_1_ID = 'demo-project-1';
const DEMO_PROJECT_2_ID = 'demo-project-2';

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// Create demo templates
export const demoTemplates: Template[] = [
  {
    id: generateId(),
    name: 'Business Landing',
    description: 'Professional landing page for businesses',
    category: 'business',
    thumbnail: '',
    tags: ['business', 'landing', 'professional'],
    schema: { pages: [] },
    isPremium: false,
    rating: 0,
    installs: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: generateId(),
    name: 'Portfolio',
    description: 'Clean portfolio template for creatives',
    category: 'portfolio',
    thumbnail: '',
    tags: ['portfolio', 'creative', 'personal'],
    schema: { pages: [] },
    isPremium: false,
    rating: 0,
    installs: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: generateId(),
    name: 'E-commerce Store',
    description: 'Modern online store template',
    category: 'ecommerce',
    thumbnail: '',
    tags: ['shop', 'ecommerce', 'store'],
    schema: { pages: [] },
    isPremium: true,
    rating: 0,
    installs: 0,
    price: 29.99,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: generateId(),
    name: 'Blog',
    description: 'Simple and elegant blog template',
    category: 'blog',
    thumbnail: '',
    tags: ['blog', 'writing', 'content'],
    schema: { pages: [] },
    isPremium: false,
    rating: 0,
    installs: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Create demo pages for a project
const createDemoPages = (projectId: string): ProjectPage[] => {
  const pageId = generateId();
  
  return [
    {
      id: pageId,
      name: 'Home',
      slug: '/',
      path: '/',
      isHome: true,
      schema: {
        components: [
          {
            id: generateId(),
            type: 'navbar',
            category: 'navigation',
            name: 'Navbar',
            styles: {
              width: '100%',
              padding: '16px 24px',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            },
            content: {
              links: [
                { label: 'Home', href: '/' },
                { label: 'About', href: '/about' },
                { label: 'Services', href: '/services' },
                { label: 'Contact', href: '/contact' },
              ],
            },
          },
          {
            id: generateId(),
            type: 'container',
            category: 'layout',
            name: 'Hero Container',
            styles: {
              width: '100%',
              maxWidth: '1200px',
              padding: '80px 20px',
              margin: '0 auto',
              textAlign: 'center',
            },
            content: {},
            children: [
              {
                id: generateId(),
                type: 'heading',
                category: 'text',
                name: 'Main Heading',
                styles: {
                  fontSize: '56px',
                  fontWeight: 'bold',
                  color: '#1a1a1a',
                  marginBottom: '24px',
                },
                content: {
                  text: 'Build Amazing Websites',
                  level: 1,
                },
              },
              {
                id: generateId(),
                type: 'paragraph',
                category: 'text',
                name: 'Subheading',
                styles: {
                  fontSize: '20px',
                  lineHeight: '1.6',
                  color: '#666666',
                  marginBottom: '32px',
                  maxWidth: '600px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                },
                content: {
                  text: 'Create beautiful, responsive websites with our easy-to-use drag-and-drop builder. No coding required.',
                },
              },
              {
                id: generateId(),
                type: 'button' as any,
                category: 'advanced',
                name: 'CTA Button',
                styles: {
                  padding: '14px 32px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#ffffff',
                  backgroundColor: '#3b82f6',
                  borderRadius: '8px',
                  border: 'none',
                },
                content: {
                  text: 'Get Started',
                  href: '#',
                },
              },
            ],
          },
        ],
      },
      metaTitle: 'Home - My Website',
      metaDescription: 'Welcome to my amazing website',
      isPublished: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateId(),
      name: 'About',
      slug: '/about',
      path: '/about',
      isHome: false,
      schema: {
        components: [
          {
            id: generateId(),
            type: 'navbar',
            category: 'navigation',
            name: 'Navbar',
            styles: {
              width: '100%',
              padding: '16px 24px',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            },
            content: {
              links: [
                { label: 'Home', href: '/' },
                { label: 'About', href: '/about' },
                { label: 'Services', href: '/services' },
                { label: 'Contact', href: '/contact' },
              ],
            },
          },
          {
            id: generateId(),
            type: 'container',
            category: 'layout',
            name: 'About Container',
            styles: {
              width: '100%',
              maxWidth: '800px',
              padding: '60px 20px',
              margin: '0 auto',
            },
            content: {},
            children: [
              {
                id: generateId(),
                type: 'heading',
                category: 'text',
                name: 'About Heading',
                styles: {
                  fontSize: '42px',
                  fontWeight: 'bold',
                  color: '#1a1a1a',
                  marginBottom: '24px',
                },
                content: {
                  text: 'About Us',
                  level: 1,
                },
              },
              {
                id: generateId(),
                type: 'paragraph',
                category: 'text',
                name: 'About Paragraph',
                styles: {
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: '#4a4a4a',
                  marginBottom: '20px',
                },
                content: {
                  text: 'We are a passionate team dedicated to creating amazing digital experiences.',
                },
              },
            ],
          },
        ],
      },
      metaTitle: 'About - My Website',
      metaDescription: 'Learn more about us',
      isPublished: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
};

// Create demo projects
export const demoProjects: Project[] = [
  {
    id: DEMO_PROJECT_1_ID,
    name: 'My First Website',
    description: 'A beautiful website built with Website Builder',
    slug: 'my-first-website',
    thumbnail: undefined,
    status: 'DRAFT',
    settings: {
      seo: {},
    },
    deploymentConfig: {},
    deployedUrl: undefined,
    lastDeployedAt: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    ownerId: 'demo-user',
    pages: createDemoPages(DEMO_PROJECT_1_ID),
  },
  {
    id: DEMO_PROJECT_2_ID,
    name: 'Business Site',
    description: 'Professional business landing page',
    slug: 'business-site',
    thumbnail: undefined,
    status: 'DRAFT',
    settings: {
      seo: {},
    },
    deploymentConfig: {},
    deployedUrl: undefined,
    lastDeployedAt: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    ownerId: 'demo-user',
    pages: createDemoPages(DEMO_PROJECT_2_ID),
  },
];

// In-memory storage for user-created projects (demo projects are separate)
let projects: Project[] = [];
let projectCounter = 100; // Start counter high to avoid ID conflicts

// Helper to get all projects (demo + user-created, no duplicates)
const getAllProjects = () => [
  ...demoProjects,
  ...projects.filter(p => !p.id.startsWith('demo-'))
];

// Mock API functions
export const mockProjectsApi = {
  list: async (params?: { status?: string; page?: number; pageSize?: number }) => {
    await simulateDelay();
    let filtered = getAllProjects();

    if (params?.status) {
      filtered = filtered.filter(p => p.status === params.status);
    }

    const pageSize = params?.pageSize || 10;
    const page = params?.page || 1;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      success: true,
      data: {
        items: filtered.slice(start, end),
        total: filtered.length,
        page,
        pageSize,
        totalPages: Math.ceil(filtered.length / pageSize),
      },
    };
  },

  getById: async (id: string) => {
    await simulateDelay();
    const project = getAllProjects().find(p => p.id === id);
    if (!project) {
      return { success: false, error: 'Project not found' };
    }
    return { success: true, data: project };
  },

  create: async (data: { name: string; description?: string; templateId?: string }) => {
    await simulateDelay();
    projectCounter++;
    const newProject: Project = {
      id: `project-${projectCounter}`,
      name: data.name,
      description: data.description || '',
      slug: data.name.toLowerCase().replace(/\s+/g, '-'),
      thumbnail: undefined,
      status: 'DRAFT',
      settings: {
        seo: {},
      },
      deploymentConfig: {},
      deployedUrl: undefined,
      lastDeployedAt: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: 'demo-user',
      pages: [],
    };
    projects.push(newProject);
    return { success: true, data: newProject };
  },

  update: async (id: string, data: any) => {
    await simulateDelay();
    // Demo projects cannot be modified
    if (id.startsWith('demo-')) {
      return { success: false, error: 'Demo projects cannot be modified' };
    }
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) {
      return { success: false, error: 'Project not found' };
    }
    projects[index] = { ...projects[index], ...data, updatedAt: new Date() };
    return { success: true, data: projects[index] };
  },

  delete: async (id: string) => {
    await simulateDelay();
    // Demo projects cannot be deleted
    if (id.startsWith('demo-')) {
      return { success: false, error: 'Demo projects cannot be deleted' };
    }
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) {
      return { success: false, error: 'Project not found' };
    }
    projects.splice(index, 1);
    return { success: true, message: 'Project deleted successfully' };
  },
};

export const mockTemplatesApi = {
  list: async (params?: { category?: string; tag?: string; search?: string; premium?: boolean }) => {
    await simulateDelay();
    let filtered = [...demoTemplates];
    
    if (params?.category) {
      filtered = filtered.filter(t => t.category === params.category);
    }
    if (params?.tag) {
      filtered = filtered.filter(t => t.tags?.includes(params.tag!));
    }
    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(search) || 
        t.description?.toLowerCase().includes(search)
      );
    }
    if (params?.premium !== undefined) {
      filtered = filtered.filter(t => t.isPremium === params.premium);
    }
    
    const categories = [...new Set(demoTemplates.map(t => t.category))];
    
    return {
      success: true,
      data: {
        items: filtered,
        categories,
      },
    };
  },
};
