import { Template } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const templates: Template[] = [
  {
    id: 'blank',
    name: 'Blank Template',
    description: 'Start with a completely blank canvas',
    thumbnail: '/templates/blank.svg',
    category: 'General',
    pages: [
      {
        id: uuidv4(),
        name: 'Home',
        slug: '/',
        sections: [
          {
            id: uuidv4(),
            name: 'Header',
            components: [],
          },
          {
            id: uuidv4(),
            name: 'Main Content',
            components: [],
          },
          {
            id: uuidv4(),
            name: 'Footer',
            components: [],
          },
        ],
        meta: {
          title: 'My Website',
          description: 'A new website',
        },
      },
    ],
  },
  {
    id: 'landing-page',
    name: 'Landing Page',
    description: 'A modern landing page with hero section and CTA',
    thumbnail: '/templates/landing.svg',
    category: 'Marketing',
    pages: [
      {
        id: uuidv4(),
        name: 'Home',
        slug: '/',
        sections: [
          {
            id: uuidv4(),
            name: 'Hero Section',
            components: [
              {
                id: uuidv4(),
                type: 'hero',
                category: 'layout',
                name: 'Hero',
                styles: {
                  width: '100%',
                  minHeight: '600px',
                  padding: '100px 20px',
                  backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  textAlign: 'center',
                },
                content: {
                  text: 'Build Something Amazing',
                },
              },
            ],
          },
          {
            id: uuidv4(),
            name: 'Features',
            components: [
              {
                id: uuidv4(),
                type: 'grid',
                category: 'layout',
                name: 'Features Grid',
                styles: {
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '32px',
                  width: '100%',
                  maxWidth: '1200px',
                  margin: '0 auto',
                  padding: '80px 20px',
                },
                content: {
                  columns: 3,
                },
              },
            ],
          },
        ],
        meta: {
          title: 'Landing Page',
          description: 'A beautiful landing page',
        },
      },
    ],
  },
  {
    id: 'business',
    name: 'Business Website',
    description: 'Professional business website with multiple sections',
    thumbnail: '/templates/business.svg',
    category: 'Business',
    pages: [
      {
        id: uuidv4(),
        name: 'Home',
        slug: '/',
        sections: [
          {
            id: uuidv4(),
            name: 'Header',
            components: [
              {
                id: uuidv4(),
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
            ],
          },
          {
            id: uuidv4(),
            name: 'Hero',
            components: [
              {
                id: uuidv4(),
                type: 'section',
                category: 'basic',
                name: 'Hero Section',
                styles: {
                  width: '100%',
                  padding: '100px 20px',
                  backgroundColor: '#f8fafc',
                  textAlign: 'center',
                },
                content: {},
                children: [
                  {
                    id: uuidv4(),
                    type: 'heading',
                    category: 'text',
                    name: 'Heading',
                    styles: {
                      fontSize: '48px',
                      fontWeight: 'bold',
                      color: '#1a1a1a',
                      marginBottom: '16px',
                    },
                    content: {
                      text: 'Welcome to Our Business',
                      level: 1,
                    },
                  },
                  {
                    id: uuidv4(),
                    type: 'paragraph',
                    category: 'text',
                    name: 'Paragraph',
                    styles: {
                      fontSize: '18px',
                      color: '#4a4a4a',
                      maxWidth: '600px',
                      margin: '0 auto 32px',
                    },
                    content: {
                      text: 'We provide excellent services to help your business grow.',
                    },
                  },
                ],
              },
            ],
          },
          {
            id: uuidv4(),
            name: 'Services',
            components: [
              {
                id: uuidv4(),
                type: 'cards',
                category: 'layout',
                name: 'Services Cards',
                styles: {
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '24px',
                  width: '100%',
                  maxWidth: '1200px',
                  margin: '0 auto',
                  padding: '80px 20px',
                },
                content: {
                  cardData: [
                    { title: 'Service 1', description: 'Description of service 1', image: 'https://via.placeholder.com/400x250' },
                    { title: 'Service 2', description: 'Description of service 2', image: 'https://via.placeholder.com/400x250' },
                    { title: 'Service 3', description: 'Description of service 3', image: 'https://via.placeholder.com/400x250' },
                  ],
                },
              },
            ],
          },
          {
            id: uuidv4(),
            name: 'Footer',
            components: [
              {
                id: uuidv4(),
                type: 'section',
                category: 'basic',
                name: 'Footer',
                styles: {
                  width: '100%',
                  padding: '40px 20px',
                  backgroundColor: '#1a1a2e',
                  color: '#ffffff',
                  textAlign: 'center',
                },
                content: {},
              },
            ],
          },
        ],
        meta: {
          title: 'Business Website',
          description: 'Professional business website',
        },
      },
    ],
  },
  {
    id: 'blog',
    name: 'Blog',
    description: 'Clean and modern blog template',
    thumbnail: '/templates/blog.svg',
    category: 'Content',
    pages: [
      {
        id: uuidv4(),
        name: 'Home',
        slug: '/',
        sections: [
          {
            id: uuidv4(),
            name: 'Header',
            components: [
              {
                id: uuidv4(),
                type: 'navbar',
                category: 'navigation',
                name: 'Navbar',
                styles: {
                  width: '100%',
                  padding: '16px 24px',
                  backgroundColor: '#ffffff',
                  borderBottom: '1px solid #e5e5e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                },
                content: {
                  links: [
                    { label: 'Home', href: '/' },
                    { label: 'Blog', href: '/blog' },
                    { label: 'About', href: '/about' },
                    { label: 'Contact', href: '/contact' },
                  ],
                },
              },
            ],
          },
          {
            id: uuidv4(),
            name: 'Featured Posts',
            components: [
              {
                id: uuidv4(),
                type: 'section',
                category: 'basic',
                name: 'Featured Section',
                styles: {
                  width: '100%',
                  padding: '60px 20px',
                  backgroundColor: '#ffffff',
                },
                content: {},
                children: [
                  {
                    id: uuidv4(),
                    type: 'heading',
                    category: 'text',
                    name: 'Heading',
                    styles: {
                      fontSize: '36px',
                      fontWeight: 'bold',
                      color: '#1a1a1a',
                      marginBottom: '40px',
                      textAlign: 'center',
                    },
                    content: {
                      text: 'Featured Posts',
                      level: 2,
                    },
                  },
                  {
                    id: uuidv4(),
                    type: 'grid',
                    category: 'layout',
                    name: 'Posts Grid',
                    styles: {
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '32px',
                      maxWidth: '1200px',
                      margin: '0 auto',
                    },
                    content: {
                      columns: 3,
                    },
                  },
                ],
              },
            ],
          },
        ],
        meta: {
          title: 'My Blog',
          description: 'A modern blog',
        },
      },
    ],
  },
  {
    id: 'ecommerce',
    name: 'Ecommerce Store',
    description: 'Full-featured ecommerce store template',
    thumbnail: '/templates/ecommerce.svg',
    category: 'Ecommerce',
    pages: [
      {
        id: uuidv4(),
        name: 'Home',
        slug: '/',
        sections: [
          {
            id: uuidv4(),
            name: 'Header',
            components: [
              {
                id: uuidv4(),
                type: 'navbar',
                category: 'navigation',
                name: 'Navbar',
                styles: {
                  width: '100%',
                  padding: '16px 24px',
                  backgroundColor: '#1a1a2e',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                },
                content: {
                  links: [
                    { label: 'Home', href: '/' },
                    { label: 'Shop', href: '/shop' },
                    { label: 'Categories', href: '/categories' },
                    { label: 'Cart', href: '/cart' },
                  ],
                },
              },
            ],
          },
          {
            id: uuidv4(),
            name: 'Hero Banner',
            components: [
              {
                id: uuidv4(),
                type: 'section',
                category: 'basic',
                name: 'Hero Banner',
                styles: {
                  width: '100%',
                  minHeight: '400px',
                  padding: '60px 20px',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                content: {},
                children: [
                  {
                    id: uuidv4(),
                    type: 'heading',
                    category: 'text',
                    name: 'Heading',
                    styles: {
                      fontSize: '42px',
                      fontWeight: 'bold',
                      color: '#1a1a1a',
                      marginBottom: '16px',
                    },
                    content: {
                      text: 'Summer Sale - Up to 50% Off',
                      level: 1,
                    },
                  },
                ],
              },
            ],
          },
          {
            id: uuidv4(),
            name: 'Products',
            components: [
              {
                id: uuidv4(),
                type: 'productGrid',
                category: 'ecommerce',
                name: 'Product Grid',
                styles: {
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '24px',
                  width: '100%',
                  maxWidth: '1400px',
                  margin: '0 auto',
                  padding: '60px 20px',
                },
                content: {
                  columns: 4,
                },
              },
            ],
          },
        ],
        meta: {
          title: 'Ecommerce Store',
          description: 'Shop the best products',
        },
      },
    ],
  },
];

export const getTemplateById = (id: string): Template | undefined => {
  return templates.find((t) => t.id === id);
};

export const getTemplatesByCategory = (category: string): Template[] => {
  return templates.filter((t) => t.category === category);
};

export const getAllCategories = (): string[] => {
  const categories = new Set(templates.map((t) => t.category));
  return Array.from(categories);
};
