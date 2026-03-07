// Seed data for templates and plugins

import prisma from '@/lib/prisma';

async function main() {
  console.log('🌱 Seeding templates and plugins...');

  // ============================================
  // TEMPLATES
  // ============================================

  // Business Template
  await prisma.template.upsert({
    where: { id: 'template-business-1' },
    update: {},
    create: {
      id: 'template-business-1',
      name: 'Modern Business',
      description: 'A professional template for business websites with hero section, features, and contact form.',
      thumbnail: '/templates/business-modern.jpg',
      category: 'Business',
      tags: ['business', 'professional', 'corporate', 'modern'],
      isPublished: true,
      isPremium: false,
      schema: {
        pages: [
          {
            name: 'Home',
            path: '/',
            schema: {
              components: [
                {
                  id: 'hero-1',
                  type: 'hero',
                  name: 'Hero Section',
                  content: {
                    title: 'Build Your Business Online',
                    subtitle: 'Professional solutions for modern businesses',
                    ctaText: 'Get Started',
                    ctaLink: '/contact'
                  },
                  styles: { className: 'hero-section' }
                },
                {
                  id: 'features-1',
                  type: 'cards',
                  name: 'Features',
                  content: {
                    cards: [
                      { title: 'Analytics', description: 'Track your business metrics' },
                      { title: 'Automation', description: 'Automate your workflows' },
                      { title: 'Integration', description: 'Connect with your tools' }
                    ]
                  },
                  styles: { className: 'features-section' }
                }
              ]
            }
          },
          {
            name: 'About',
            path: '/about',
            schema: {
              components: [
                {
                  id: 'heading-1',
                  type: 'heading',
                  content: { level: 1, text: 'About Us' },
                  styles: {}
                },
                {
                  id: 'paragraph-1',
                  type: 'paragraph',
                  content: { text: 'We are a team of professionals dedicated to helping businesses succeed.' },
                  styles: {}
                }
              ]
            }
          },
          {
            name: 'Contact',
            path: '/contact',
            schema: {
              components: [
                {
                  id: 'heading-1',
                  type: 'heading',
                  content: { level: 1, text: 'Contact Us' },
                  styles: {}
                },
                {
                  id: 'form-1',
                  type: 'contactForm',
                  content: {},
                  styles: {}
                }
              ]
            }
          }
        ]
      }
    }
  });

  // Portfolio Template
  await prisma.template.upsert({
    where: { id: 'template-portfolio-1' },
    update: {},
    create: {
      id: 'template-portfolio-1',
      name: 'Creative Portfolio',
      description: 'Showcase your work with this beautiful portfolio template.',
      thumbnail: '/templates/portfolio-creative.jpg',
      category: 'Portfolio',
      tags: ['portfolio', 'creative', 'personal', 'gallery'],
      isPublished: true,
      isPremium: false,
      schema: {
        pages: [
          {
            name: 'Home',
            path: '/',
            schema: {
              components: [
                {
                  id: 'hero-1',
                  type: 'hero',
                  name: 'Hero',
                  content: {
                    title: 'John Doe',
                    subtitle: 'Creative Designer & Developer',
                    ctaText: 'View My Work',
                    ctaLink: '/projects'
                  },
                  styles: {}
                },
                {
                  id: 'gallery-1',
                  type: 'gallery',
                  name: 'Project Gallery',
                  content: {
                    images: [
                      { src: '/project1.jpg', alt: 'Project 1' },
                      { src: '/project2.jpg', alt: 'Project 2' },
                      { src: '/project3.jpg', alt: 'Project 3' }
                    ]
                  },
                  styles: {}
                }
              ]
            }
          },
          {
            name: 'Projects',
            path: '/projects',
            schema: {
              components: [
                {
                  id: 'heading-1',
                  type: 'heading',
                  content: { level: 1, text: 'My Projects' },
                  styles: {}
                },
                {
                  id: 'grid-1',
                  type: 'grid',
                  content: {},
                  styles: {}
                }
              ]
            }
          }
        ]
      }
    }
  });

  // E-commerce Template
  await prisma.template.upsert({
    where: { id: 'template-ecommerce-1' },
    update: {},
    create: {
      id: 'template-ecommerce-1',
      name: 'E-commerce Store',
      description: 'Full-featured e-commerce template with product listings and cart.',
      thumbnail: '/templates/ecommerce-store.jpg',
      category: 'E-commerce',
      tags: ['ecommerce', 'store', 'shop', 'products'],
      isPublished: true,
      isPremium: true,
      price: 29.99,
      schema: {
        pages: [
          {
            name: 'Home',
            path: '/',
            schema: {
              components: [
                {
                  id: 'hero-1',
                  type: 'hero',
                  name: 'Hero Banner',
                  content: {
                    title: 'Summer Sale',
                    subtitle: 'Up to 50% off on selected items',
                    ctaText: 'Shop Now',
                    ctaLink: '/products'
                  },
                  styles: {}
                },
                {
                  id: 'products-1',
                  type: 'productGrid',
                  name: 'Featured Products',
                  content: {},
                  styles: {}
                }
              ]
            }
          },
          {
            name: 'Products',
            path: '/products',
            schema: {
              components: [
                {
                  id: 'heading-1',
                  type: 'heading',
                  content: { level: 1, text: 'All Products' },
                  styles: {}
                },
                {
                  id: 'productGrid-1',
                  type: 'productGrid',
                  name: 'Product Grid',
                  content: {},
                  styles: {}
                }
              ]
            }
          },
          {
            name: 'Cart',
            path: '/cart',
            schema: {
              components: [
                {
                  id: 'heading-1',
                  type: 'heading',
                  content: { level: 1, text: 'Shopping Cart' },
                  styles: {}
                },
                {
                  id: 'cart-1',
                  type: 'shoppingCart',
                  name: 'Cart',
                  content: {},
                  styles: {}
                }
              ]
            }
          }
        ]
      }
    }
  });

  // Blog Template
  await prisma.template.upsert({
    where: { id: 'template-blog-1' },
    update: {},
    create: {
      id: 'template-blog-1',
      name: 'Minimal Blog',
      description: 'Clean and minimal blog template for writers and creators.',
      thumbnail: '/templates/blog-minimal.jpg',
      category: 'Blog',
      tags: ['blog', 'minimal', 'writing', 'content'],
      isPublished: true,
      isPremium: false,
      schema: {
        pages: [
          {
            name: 'Home',
            path: '/',
            schema: {
              components: [
                {
                  id: 'heading-1',
                  type: 'heading',
                  content: { level: 1, text: 'My Blog' },
                  styles: {}
                },
                {
                  id: 'posts-1',
                  type: 'blogPosts',
                  name: 'Blog Posts',
                  content: {},
                  styles: {}
                }
              ]
            }
          },
          {
            name: 'Post',
            path: '/blog/[slug]',
            schema: {
              components: [
                {
                  id: 'heading-1',
                  type: 'heading',
                  content: { level: 1, text: 'Post Title' },
                  styles: {}
                },
                {
                  id: 'content-1',
                  type: 'paragraph',
                  content: { text: 'Blog post content...' },
                  styles: {}
                }
              ]
            }
          }
        ]
      }
    }
  });

  // Landing Page Template
  await prisma.template.upsert({
    where: { id: 'template-landing-1' },
    update: {},
    create: {
      id: 'template-landing-1',
      name: 'Product Landing',
      description: 'High-converting landing page template for product launches.',
      thumbnail: '/templates/landing-product.jpg',
      category: 'Landing Page',
      tags: ['landing', 'product', 'launch', 'conversion'],
      isPublished: true,
      isPremium: true,
      price: 19.99,
      schema: {
        pages: [
          {
            name: 'Home',
            path: '/',
            schema: {
              components: [
                {
                  id: 'hero-1',
                  type: 'hero',
                  name: 'Hero',
                  content: {
                    title: 'Introducing Product X',
                    subtitle: 'The future of innovation',
                    ctaText: 'Pre-order Now',
                    ctaLink: '#order'
                  },
                  styles: {}
                },
                {
                  id: 'features-1',
                  type: 'cards',
                  name: 'Features',
                  content: {
                    cards: [
                      { title: 'Feature 1', description: 'Description here' },
                      { title: 'Feature 2', description: 'Description here' },
                      { title: 'Feature 3', description: 'Description here' }
                    ]
                  },
                  styles: {}
                },
                {
                  id: 'testimonials-1',
                  type: 'cards',
                  name: 'Testimonials',
                  content: {
                    cards: [
                      { title: 'John D.', description: 'Amazing product!' },
                      { title: 'Sarah M.', description: 'Highly recommended!' }
                    ]
                  },
                  styles: {}
                }
              ]
            }
          }
        ]
      }
    }
  });

  // ============================================
  // PLUGINS
  // ============================================

  // Google Analytics Plugin
  await prisma.plugin.upsert({
    where: { id: 'plugin-analytics-ga' },
    update: {},
    create: {
      id: 'plugin-analytics-ga',
      name: 'Google Analytics',
      description: 'Add Google Analytics tracking to your website.',
      version: '1.0.0',
      type: 'ANALYTICS',
      isPublished: true,
      isPremium: false,
      manifest: {
        name: 'Google Analytics',
        version: '1.0.0',
        settings: {
          trackingId: {
            type: 'string',
            label: 'Tracking ID',
            placeholder: 'G-XXXXXXXXXX',
            required: true
          }
        },
        inject: {
          head: '<script async src="https://www.googletagmanager.com/gtag/js?id={{trackingId}}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","{{trackingId}}");</script>'
        }
      }
    }
  });

  // Contact Form Plugin
  await prisma.plugin.upsert({
    where: { id: 'plugin-form-contact' },
    update: {},
    create: {
      id: 'plugin-form-contact',
      name: 'Contact Form',
      description: 'Add a contact form component to your pages.',
      version: '1.0.0',
      type: 'COMPONENT',
      isPublished: true,
      isPremium: false,
      manifest: {
        name: 'Contact Form',
        category: 'Forms'
      },
      schema: {
        name: 'Contact Form',
        type: 'contactForm',
        category: 'Forms',
        props: {
          submitUrl: { type: 'string', label: 'Submit URL' },
          successMessage: { type: 'string', label: 'Success Message', default: 'Message sent!' },
          fields: {
            type: 'array',
            label: 'Fields',
            items: {
              name: { type: 'string' },
              type: { type: 'select', options: ['text', 'email', 'textarea'] },
              required: { type: 'boolean' }
            }
          }
        }
      }
    }
  });

  // Stripe Payment Plugin
  await prisma.plugin.upsert({
    where: { id: 'plugin-payment-stripe' },
    update: {},
    create: {
      id: 'plugin-payment-stripe',
      name: 'Stripe Payments',
      description: 'Accept payments with Stripe integration.',
      version: '1.0.0',
      type: 'INTEGRATION',
      isPublished: true,
      isPremium: true,
      price: 9.99,
      manifest: {
        name: 'Stripe Payments',
        version: '1.0.0',
        settings: {
          publishableKey: { type: 'string', label: 'Publishable Key', required: true },
          secretKey: { type: 'string', label: 'Secret Key', required: true, secret: true }
        }
      }
    }
  });

  // SEO Meta Plugin
  await prisma.plugin.upsert({
    where: { id: 'plugin-seo-meta' },
    update: {},
    create: {
      id: 'plugin-seo-meta',
      name: 'SEO Meta Tags',
      description: 'Advanced SEO meta tag management.',
      version: '1.0.0',
      type: 'FEATURE',
      isPublished: true,
      isPremium: false,
      manifest: {
        name: 'SEO Meta Tags',
        version: '1.0.0',
        features: ['openGraph', 'twitterCards', 'schema.org', 'canonical'],
        settings: {
          autoGenerateSitemap: { type: 'boolean', label: 'Auto-generate sitemap', default: true },
          robotsTxt: { type: 'boolean', label: 'Generate robots.txt', default: true }
        }
      }
    }
  });

  // Newsletter Plugin
  await prisma.plugin.upsert({
    where: { id: 'plugin-newsletter' },
    update: {},
    create: {
      id: 'plugin-newsletter',
      name: 'Newsletter Signup',
      description: 'Email newsletter subscription component.',
      version: '1.0.0',
      type: 'COMPONENT',
      isPublished: true,
      isPremium: false,
      manifest: {
        name: 'Newsletter Signup',
        category: 'Forms'
      },
      schema: {
        name: 'Newsletter Signup',
        type: 'newsletter',
        category: 'Forms',
        props: {
          provider: { type: 'select', options: ['mailchimp', 'convertkit', 'custom'], label: 'Provider' },
          formAction: { type: 'string', label: 'Form Action URL' },
          placeholder: { type: 'string', label: 'Email Placeholder', default: 'Enter your email' }
        }
      }
    }
  });

  // Social Share Plugin
  await prisma.plugin.upsert({
    where: { id: 'plugin-social-share' },
    update: {},
    create: {
      id: 'plugin-social-share',
      name: 'Social Share Buttons',
      description: 'Add social media sharing buttons.',
      version: '1.0.0',
      type: 'COMPONENT',
      isPublished: true,
      isPremium: false,
      manifest: {
        name: 'Social Share Buttons',
        category: 'Social'
      },
      schema: {
        name: 'Social Share',
        type: 'socialShare',
        category: 'Social',
        props: {
          platforms: { type: 'array', label: 'Platforms', default: ['twitter', 'facebook', 'linkedin'] },
          layout: { type: 'select', options: ['horizontal', 'vertical'], default: 'horizontal' }
        }
      }
    }
  });

  // Cookie Consent Plugin
  await prisma.plugin.upsert({
    where: { id: 'plugin-cookie-consent' },
    update: {},
    create: {
      id: 'plugin-cookie-consent',
      name: 'Cookie Consent',
      description: 'GDPR-compliant cookie consent banner.',
      version: '1.0.0',
      type: 'FEATURE',
      isPublished: true,
      isPremium: false,
      manifest: {
        name: 'Cookie Consent',
        version: '1.0.0',
        settings: {
          message: { type: 'string', label: 'Banner Message', default: 'We use cookies to improve your experience.' },
          acceptText: { type: 'string', label: 'Accept Button Text', default: 'Accept' },
          declineText: { type: 'string', label: 'Decline Button Text', default: 'Decline' }
        }
      }
    }
  });

  // Live Chat Plugin
  await prisma.plugin.upsert({
    where: { id: 'plugin-live-chat' },
    update: {},
    create: {
      id: 'plugin-live-chat',
      name: 'Live Chat Widget',
      description: 'Add live chat support to your website.',
      version: '1.0.0',
      type: 'INTEGRATION',
      isPublished: true,
      isPremium: true,
      price: 14.99,
      manifest: {
        name: 'Live Chat Widget',
        version: '1.0.0',
        providers: ['intercom', 'zendesk', 'crisp', 'custom'],
        settings: {
          provider: { type: 'select', options: ['intercom', 'zendesk', 'crisp', 'custom'], label: 'Provider' },
          apiKey: { type: 'string', label: 'API Key', required: true }
        }
      }
    }
  });

  console.log('✅ Seeding completed!');
  console.log('📦 Templates created: 5');
  console.log('🔌 Plugins created: 8');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
