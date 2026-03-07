// Database Seed Script - Add default templates and plugins

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default templates
  const templates = [
    {
      name: 'Business Landing Page',
      description: 'A professional landing page template for businesses',
      category: 'Business',
      tags: ['business', 'landing', 'professional', 'corporate'],
      schema: {
        pages: [
          {
            name: 'Home',
            slug: 'home',
            path: '/',
            isHome: true,
            schema: {
              components: [
                {
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
                  type: 'hero',
                  category: 'layout',
                  name: 'Hero Section',
                  styles: {
                    width: '100%',
                    minHeight: '500px',
                    padding: '80px 20px',
                    backgroundColor: '#1a1a2e',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    textAlign: 'center',
                  },
                  content: {
                    text: 'Welcome to Our Business',
                  },
                },
              ],
              styles: {},
              settings: {},
            },
            metaTitle: 'Business Landing Page',
            metaDescription: 'Professional business landing page',
          },
        ],
      },
      isPremium: false,
      price: 0,
    },
    {
      name: 'Portfolio Template',
      description: 'A clean portfolio template for creatives and developers',
      category: 'Content',
      tags: ['portfolio', 'creative', 'personal', 'gallery'],
      schema: {
        pages: [
          {
            name: 'Home',
            slug: 'home',
            path: '/',
            isHome: true,
            schema: {
              components: [
                {
                  type: 'navbar',
                  category: 'navigation',
                  name: 'Navbar',
                  styles: {
                    width: '100%',
                    padding: '16px 24px',
                    backgroundColor: '#1a1a1a',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  },
                  content: {
                    links: [
                      { label: 'Work', href: '/work' },
                      { label: 'About', href: '/about' },
                      { label: 'Contact', href: '/contact' },
                    ],
                  },
                },
                {
                  type: 'heading',
                  category: 'text',
                  name: 'Heading',
                  styles: {
                    fontSize: '56px',
                    fontWeight: 'bold',
                    color: '#1a1a1a',
                    marginBottom: '16px',
                    textAlign: 'center',
                  },
                  content: {
                    text: 'Creative Portfolio',
                    level: 1,
                  },
                },
                {
                  type: 'gallery',
                  category: 'media',
                  name: 'Gallery',
                  styles: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '16px',
                    width: '100%',
                    padding: '40px 20px',
                  },
                  content: {
                    images: [
                      'https://via.placeholder.com/400x300',
                      'https://via.placeholder.com/400x300',
                      'https://via.placeholder.com/400x300',
                    ],
                  },
                },
              ],
              styles: {},
              settings: {},
            },
            metaTitle: 'Portfolio',
            metaDescription: 'Creative portfolio showcase',
          },
        ],
      },
      isPremium: false,
      price: 0,
    },
    {
      name: 'E-commerce Store',
      description: 'A modern e-commerce template with product listings',
      category: 'Ecommerce',
      tags: ['ecommerce', 'store', 'shop', 'products'],
      schema: {
        pages: [
          {
            name: 'Home',
            slug: 'home',
            path: '/',
            isHome: true,
            schema: {
              components: [
                {
                  type: 'navbar',
                  category: 'navigation',
                  name: 'Navbar',
                  styles: {
                    width: '100%',
                    padding: '16px 24px',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  },
                  content: {
                    links: [
                      { label: 'Shop', href: '/shop' },
                      { label: 'Categories', href: '/categories' },
                      { label: 'About', href: '/about' },
                    ],
                  },
                },
                {
                  type: 'productGrid',
                  category: 'ecommerce',
                  name: 'Product Grid',
                  styles: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '24px',
                    width: '100%',
                    padding: '40px 20px',
                  },
                  content: {
                    columns: 3,
                  },
                },
              ],
              styles: {},
              settings: {},
            },
            metaTitle: 'E-commerce Store',
            metaDescription: 'Shop the latest products',
          },
        ],
      },
      isPremium: true,
      price: 29.99,
    },
    {
      name: 'Blog Template',
      description: 'A clean and readable blog template',
      category: 'Content',
      tags: ['blog', 'articles', 'writing', 'content'],
      schema: {
        pages: [
          {
            name: 'Home',
            slug: 'home',
            path: '/',
            isHome: true,
            schema: {
              components: [
                {
                  type: 'heading',
                  category: 'text',
                  name: 'Heading',
                  styles: {
                    fontSize: '48px',
                    fontWeight: 'bold',
                    color: '#1a1a1a',
                    marginBottom: '32px',
                    textAlign: 'center',
                  },
                  content: {
                    text: 'Latest Articles',
                    level: 1,
                  },
                },
                {
                  type: 'cards',
                  category: 'layout',
                  name: 'Cards',
                  styles: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '24px',
                    width: '100%',
                    padding: '0 20px',
                  },
                  content: {
                    cardData: [
                      {
                        title: 'Article Title 1',
                        description: 'Brief description of the article...',
                        image: 'https://via.placeholder.com/600x400',
                      },
                      {
                        title: 'Article Title 2',
                        description: 'Brief description of the article...',
                        image: 'https://via.placeholder.com/600x400',
                      },
                    ],
                  },
                },
              ],
              styles: {},
              settings: {},
            },
            metaTitle: 'Blog',
            metaDescription: 'Read our latest articles',
          },
        ],
      },
      isPremium: false,
      price: 0,
    },
  ];

  for (const template of templates) {
    const templateId = template.name.toLowerCase().replace(/\s+/g, '-');
    
    // Check if template exists
    const existing = await prisma.template.findUnique({ where: { id: templateId } });
    
    if (existing) {
      await prisma.template.update({
        where: { id: templateId },
        data: {
          name: template.name,
          description: template.description,
          category: template.category,
          tags: template.tags,
          schema: template.schema as any,
          isPremium: template.isPremium,
          price: template.price,
        },
      });
    } else {
      await prisma.template.create({
        data: {
          id: templateId,
          name: template.name,
          description: template.description,
          category: template.category,
          tags: template.tags,
          schema: template.schema as any,
          isPremium: template.isPremium,
          price: template.price,
        },
      });
    }
    console.log(`✅ Template: ${template.name}`);
  }

  // Create default plugins
  const plugins = [
    {
      name: 'Google Analytics',
      description: 'Add Google Analytics tracking to your website',
      version: '1.0.0',
      type: 'ANALYTICS',
      manifest: {
        name: 'Google Analytics',
        version: '1.0.0',
        description: 'Track your website analytics with Google Analytics',
        settings: [
          {
            key: 'trackingId',
            label: 'Tracking ID',
            type: 'string',
            required: true,
          },
        ],
      },
      isPublished: true,
      isPremium: false,
      price: 0,
    },
    {
      name: 'Contact Form',
      description: 'Add a contact form with email notifications',
      version: '1.0.0',
      type: 'FEATURE',
      manifest: {
        name: 'Contact Form',
        version: '1.0.0',
        description: 'Contact form with email notifications',
        settings: [
          {
            key: 'emailRecipient',
            label: 'Email Recipient',
            type: 'string',
            required: true,
          },
          {
            key: 'successMessage',
            label: 'Success Message',
            type: 'string',
            default: 'Thank you for your message!',
          },
        ],
      },
      isPublished: true,
      isPremium: false,
      price: 0,
    },
    {
      name: 'SEO Meta Tags',
      description: 'Advanced SEO meta tag management',
      version: '1.0.0',
      type: 'FEATURE',
      manifest: {
        name: 'SEO Meta Tags',
        version: '1.0.0',
        description: 'Manage SEO meta tags for better search rankings',
        settings: [
          {
            key: 'enableOpenGraph',
            label: 'Enable Open Graph',
            type: 'boolean',
            default: true,
          },
          {
            key: 'enableTwitter',
            label: 'Enable Twitter Cards',
            type: 'boolean',
            default: true,
          },
        ],
      },
      isPublished: true,
      isPremium: false,
      price: 0,
    },
    {
      name: 'Stripe Payment',
      description: 'Accept payments with Stripe',
      version: '1.0.0',
      type: 'INTEGRATION',
      manifest: {
        name: 'Stripe Payment',
        version: '1.0.0',
        description: 'Accept credit card payments with Stripe',
        settings: [
          {
            key: 'publishableKey',
            label: 'Publishable Key',
            type: 'string',
            required: true,
          },
          {
            key: 'secretKey',
            label: 'Secret Key',
            type: 'string',
            required: true,
          },
        ],
      },
      isPublished: true,
      isPremium: true,
      price: 19.99,
    },
  ];

  for (const plugin of plugins) {
    const pluginId = plugin.name.toLowerCase().replace(/\s+/g, '-');
    
    // Check if plugin exists
    const existing = await prisma.plugin.findUnique({ where: { id: pluginId } });
    
    if (existing) {
      await prisma.plugin.update({
        where: { id: pluginId },
        data: {
          name: plugin.name,
          description: plugin.description,
          version: plugin.version,
          type: plugin.type as any,
          manifest: plugin.manifest as any,
          isPublished: plugin.isPublished,
          isPremium: plugin.isPremium,
          price: plugin.price,
        },
      });
    } else {
      await prisma.plugin.create({
        data: {
          id: pluginId,
          name: plugin.name,
          description: plugin.description,
          version: plugin.version,
          type: plugin.type as any,
          manifest: plugin.manifest as any,
          isPublished: plugin.isPublished,
          isPremium: plugin.isPremium,
          price: plugin.price,
        },
      });
    }
    console.log(`✅ Plugin: ${plugin.name}`);
  }

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
