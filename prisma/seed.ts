// Database Seed Script - Populate with default templates and plugins

import prisma from '../src/lib/prisma';

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user if not exists
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User'
    }
  });

  console.log('✓ Created demo user');

  // ============================================
  // TEMPLATES
  // ============================================

  const templates = [
    {
      name: 'Business Landing Page',
      description: 'A professional landing page template for businesses',
      category: 'Business',
      tags: ['landing', 'business', 'professional', 'modern'],
      schema: {
        pages: [
          {
            name: 'Home',
            path: '/',
            isHome: true,
            schema: {
              components: [
                {
                  id: 'nav-1',
                  type: 'navbar',
                  category: 'navigation',
                  name: 'Navigation',
                  styles: { className: 'bg-white shadow-sm' },
                  content: {
                    logo: 'Company',
                    links: [
                      { label: 'Home', href: '/' },
                      { label: 'About', href: '/about' },
                      { label: 'Services', href: '/services' },
                      { label: 'Contact', href: '/contact' }
                    ]
                  }
                },
                {
                  id: 'hero-1',
                  type: 'hero',
                  category: 'layout',
                  name: 'Hero Section',
                  styles: { 
                    className: 'py-20 bg-gradient-to-r from-blue-500 to-purple-600 text-white',
                    textAlign: 'center'
                  },
                  content: {
                    title: 'Welcome to Our Business',
                    subtitle: 'We provide the best solutions for your needs',
                    ctaText: 'Get Started',
                    ctaLink: '/contact'
                  }
                },
                {
                  id: 'features-1',
                  type: 'cards',
                  category: 'layout',
                  name: 'Features',
                  styles: { className: 'py-16' },
                  content: {
                    cards: [
                      {
                        title: 'Fast Delivery',
                        description: 'Get your projects completed on time, every time.',
                        icon: 'zap'
                      },
                      {
                        title: 'Quality Work',
                        description: 'We never compromise on quality.',
                        icon: 'star'
                      },
                      {
                        title: '24/7 Support',
                        description: 'Our team is always here to help.',
                        icon: 'headphones'
                      }
                    ]
                  }
                },
                {
                  id: 'footer-1',
                  type: 'footer',
                  category: 'navigation',
                  name: 'Footer',
                  styles: { className: 'bg-gray-900 text-white py-8' },
                  content: {
                    text: '© 2024 Company Name. All rights reserved.'
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      name: 'Portfolio Website',
      description: 'A clean portfolio template for creatives and developers',
      category: 'Portfolio',
      tags: ['portfolio', 'personal', 'creative', 'minimal'],
      schema: {
        pages: [
          {
            name: 'Home',
            path: '/',
            isHome: true,
            schema: {
              components: [
                {
                  id: 'nav-1',
                  type: 'navbar',
                  category: 'navigation',
                  name: 'Navigation',
                  styles: { className: 'bg-transparent absolute w-full' },
                  content: {
                    logo: 'John Doe',
                    links: [
                      { label: 'Work', href: '#work' },
                      { label: 'About', href: '#about' },
                      { label: 'Contact', href: '#contact' }
                    ]
                  }
                },
                {
                  id: 'hero-1',
                  type: 'hero',
                  category: 'layout',
                  name: 'Hero',
                  styles: { 
                    className: 'min-h-screen flex items-center justify-center',
                    background: '#1a1a1a',
                    color: 'white'
                  },
                  content: {
                    title: "I'm John Doe",
                    subtitle: 'A Creative Developer based in San Francisco',
                    ctaText: 'View My Work',
                    ctaLink: '#work'
                  }
                },
                {
                  id: 'gallery-1',
                  type: 'grid',
                  category: 'layout',
                  name: 'Work Gallery',
                  styles: { className: 'py-16' },
                  content: {
                    items: [
                      { image: '/project1.jpg', title: 'Project 1' },
                      { image: '/project2.jpg', title: 'Project 2' },
                      { image: '/project3.jpg', title: 'Project 3' }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      name: 'E-commerce Store',
      description: 'A modern e-commerce template with product listings',
      category: 'E-commerce',
      tags: ['ecommerce', 'shop', 'products', 'store'],
      schema: {
        pages: [
          {
            name: 'Home',
            path: '/',
            isHome: true,
            schema: {
              components: [
                {
                  id: 'nav-1',
                  type: 'navbar',
                  category: 'navigation',
                  name: 'Navigation',
                  styles: { className: 'bg-white shadow-sm' },
                  content: {
                    logo: 'Shop',
                    links: [
                      { label: 'Home', href: '/' },
                      { label: 'Products', href: '/products' },
                      { label: 'Cart', href: '/cart' }
                    ]
                  }
                },
                {
                  id: 'hero-1',
                  type: 'hero',
                  category: 'layout',
                  name: 'Hero Banner',
                  styles: { className: 'py-16 bg-blue-600 text-white' },
                  content: {
                    title: 'Summer Sale',
                    subtitle: 'Up to 50% off on selected items',
                    ctaText: 'Shop Now',
                    ctaLink: '/products'
                  }
                },
                {
                  id: 'products-1',
                  type: 'productGrid',
                  category: 'ecommerce',
                  name: 'Featured Products',
                  styles: { className: 'py-16' },
                  content: {
                    products: [
                      { name: 'Product 1', price: 29.99, image: '/p1.jpg' },
                      { name: 'Product 2', price: 49.99, image: '/p2.jpg' },
                      { name: 'Product 3', price: 19.99, image: '/p3.jpg' },
                      { name: 'Product 4', price: 39.99, image: '/p4.jpg' }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      name: 'Blog Template',
      description: 'A clean blog template for content creators',
      category: 'Blog',
      tags: ['blog', 'articles', 'content', 'writing'],
      schema: {
        pages: [
          {
            name: 'Home',
            path: '/',
            isHome: true,
            schema: {
              components: [
                {
                  id: 'nav-1',
                  type: 'navbar',
                  category: 'navigation',
                  name: 'Navigation',
                  styles: { className: 'bg-white border-b' },
                  content: {
                    logo: 'My Blog',
                    links: [
                      { label: 'Home', href: '/' },
                      { label: 'Articles', href: '/articles' },
                      { label: 'About', href: '/about' }
                    ]
                  }
                },
                {
                  id: 'header-1',
                  type: 'section',
                  category: 'layout',
                  name: 'Header',
                  styles: { className: 'py-12 text-center' },
                  content: {
                    title: 'Welcome to My Blog',
                    subtitle: 'Thoughts, stories and ideas'
                  }
                },
                {
                  id: 'posts-1',
                  type: 'grid',
                  category: 'layout',
                  name: 'Recent Posts',
                  styles: { className: 'py-12' },
                  content: {
                    posts: [
                      { title: 'Post Title 1', excerpt: 'Lorem ipsum dolor sit amet...', date: '2024-01-15' },
                      { title: 'Post Title 2', excerpt: 'Consectetur adipiscing elit...', date: '2024-01-10' },
                      { title: 'Post Title 3', excerpt: 'Sed do eiusmod tempor...', date: '2024-01-05' }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      name: 'SaaS Landing',
      description: 'A conversion-focused SaaS landing page template',
      category: 'Business',
      tags: ['saas', 'landing', 'startup', 'app'],
      schema: {
        pages: [
          {
            name: 'Home',
            path: '/',
            isHome: true,
            schema: {
              components: [
                {
                  id: 'nav-1',
                  type: 'navbar',
                  category: 'navigation',
                  name: 'Navigation',
                  styles: { className: 'bg-white' },
                  content: {
                    logo: 'SaaS App',
                    links: [
                      { label: 'Features', href: '#features' },
                      { label: 'Pricing', href: '#pricing' },
                      { label: 'Contact', href: '#contact' }
                    ],
                    cta: { text: 'Start Free Trial', href: '/signup' }
                  }
                },
                {
                  id: 'hero-1',
                  type: 'hero',
                  category: 'layout',
                  name: 'Hero',
                  styles: { className: 'py-24 bg-gradient-to-br from-indigo-500 to-purple-600 text-white' },
                  content: {
                    title: 'Build Better Products Faster',
                    subtitle: 'The all-in-one platform for modern teams',
                    ctaText: 'Start Free Trial',
                    ctaLink: '/signup'
                  }
                },
                {
                  id: 'features-1',
                  type: 'cards',
                  category: 'layout',
                  name: 'Features',
                  styles: { className: 'py-20' },
                  content: {
                    cards: [
                      { title: 'Analytics', description: 'Real-time insights into your business', icon: 'chart' },
                      { title: 'Automation', description: 'Automate repetitive tasks', icon: 'zap' },
                      { title: 'Collaboration', description: 'Work together seamlessly', icon: 'users' }
                    ]
                  }
                },
                {
                  id: 'pricing-1',
                  type: 'cards',
                  category: 'layout',
                  name: 'Pricing',
                  styles: { className: 'py-20 bg-gray-50' },
                  content: {
                    cards: [
                      { title: 'Starter', price: '$0', description: 'For individuals', features: ['1 user', '5 projects', 'Basic support'] },
                      { title: 'Pro', price: '$29', description: 'For small teams', features: ['5 users', 'Unlimited projects', 'Priority support'] },
                      { title: 'Enterprise', price: '$99', description: 'For large teams', features: ['Unlimited users', 'Custom integrations', '24/7 support'] }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  ];

  for (const templateData of templates) {
    const existing = await prisma.template.findFirst({
      where: { name: templateData.name }
    });
    
    if (existing) {
      await prisma.template.update({
        where: { id: existing.id },
        data: templateData as any
      });
    } else {
      await prisma.template.create({
        data: templateData as any
      });
    }
    console.log(`✓ Created template: ${templateData.name}`);
  }

  // ============================================
  // PLUGINS
  // ============================================

  const plugins = [
    {
      name: 'Google Analytics',
      description: 'Add Google Analytics tracking to your website',
      type: 'ANALYTICS',
      version: '1.0.0',
      manifest: {
        name: 'Google Analytics',
        version: '1.0.0',
        settings: {
          trackingId: {
            type: 'string',
            label: 'Tracking ID',
            default: 'G-XXXXXXXXXX'
          }
        },
        inject: {
          head: `
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id={{trackingId}}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '{{trackingId}}');
</script>
`
        }
      }
    },
    {
      name: 'Contact Form',
      description: 'Add a contact form component to your pages',
      type: 'COMPONENT',
      version: '1.0.0',
      manifest: {
        name: 'Contact Form',
        version: '1.0.0',
        component: {
          type: 'contactForm',
          category: 'forms',
          props: {
            action: { type: 'string', default: '/api/contact' },
            fields: { 
              type: 'array', 
              default: ['name', 'email', 'message'] 
            },
            submitText: { type: 'string', default: 'Send Message' }
          }
        }
      },
      schema: {
        type: 'contactForm',
        category: 'forms',
        name: 'Contact Form',
        styles: { className: 'max-w-md mx-auto' },
        content: {
          fields: [
            { name: 'name', label: 'Name', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'message', label: 'Message', type: 'textarea', required: true }
          ],
          submitText: 'Send Message'
        }
      }
    },
    {
      name: 'Stripe Payment',
      description: 'Accept payments with Stripe integration',
      type: 'INTEGRATION',
      version: '1.0.0',
      manifest: {
        name: 'Stripe Payment',
        version: '1.0.0',
        settings: {
          publishableKey: { type: 'string', label: 'Publishable Key' },
          secretKey: { type: 'string', label: 'Secret Key', secret: true }
        },
        apiRoutes: [
          {
            path: '/api/create-checkout-session',
            method: 'POST',
            handler: 'stripe'
          }
        ]
      }
    },
    {
      name: 'SEO Meta Tags',
      description: 'Advanced SEO meta tag management',
      type: 'FEATURE',
      version: '1.0.0',
      manifest: {
        name: 'SEO Meta Tags',
        version: '1.0.0',
        features: [
          'Open Graph tags',
          'Twitter Card tags',
          'JSON-LD structured data',
          'Canonical URLs',
          'Robots meta'
        ],
        settings: {
          defaultTitle: { type: 'string', label: 'Default Title' },
          defaultDescription: { type: 'string', label: 'Default Description' },
          defaultImage: { type: 'string', label: 'Default OG Image' },
          twitterHandle: { type: 'string', label: 'Twitter Handle' }
        }
      }
    },
    {
      name: 'Newsletter Signup',
      description: 'Email newsletter subscription component',
      type: 'COMPONENT',
      version: '1.0.0',
      manifest: {
        name: 'Newsletter Signup',
        version: '1.0.0',
        component: {
          type: 'newsletter',
          category: 'forms',
          props: {
            provider: { 
              type: 'select', 
              options: ['mailchimp', 'convertkit', 'custom'],
              default: 'mailchimp'
            },
            apiUrl: { type: 'string', label: 'API URL' },
            placeholder: { type: 'string', default: 'Enter your email' }
          }
        }
      },
      schema: {
        type: 'newsletter',
        category: 'forms',
        name: 'Newsletter Signup',
        styles: { className: 'max-w-sm' },
        content: {
          title: 'Subscribe to our newsletter',
          description: 'Get the latest updates and news',
          placeholder: 'Enter your email',
          buttonText: 'Subscribe'
        }
      }
    },
    {
      name: 'Live Chat',
      description: 'Add live chat support to your website',
      type: 'INTEGRATION',
      version: '1.0.0',
      manifest: {
        name: 'Live Chat',
        version: '1.0.0',
        settings: {
          provider: {
            type: 'select',
            options: ['intercom', 'zendesk', 'crisp', 'custom'],
            default: 'crisp'
          },
          widgetId: { type: 'string', label: 'Widget ID' }
        },
        inject: {
          body: `
<!-- Live Chat Widget -->
<script>
  window.CRISP_WEBSITE_ID = "{{widgetId}}";
  (function() {
    var d = document;
    var s = d.createElement("script");
    s.src = "https://client.crisp.chat/l.js";
    s.async = 1;
    d.getElementsByTagName("head")[0].appendChild(s);
  })();
</script>
`
        }
      }
    },
    {
      name: 'Image Gallery',
      description: 'Beautiful image gallery with lightbox',
      type: 'COMPONENT',
      version: '1.0.0',
      manifest: {
        name: 'Image Gallery',
        version: '1.0.0',
        component: {
          type: 'gallery',
          category: 'media',
          props: {
            layout: { 
              type: 'select', 
              options: ['grid', 'masonry', 'carousel'],
              default: 'grid'
            },
            columns: { type: 'number', default: 3 },
            lightbox: { type: 'boolean', default: true }
          }
        }
      },
      schema: {
        type: 'gallery',
        category: 'media',
        name: 'Image Gallery',
        styles: { className: 'grid grid-cols-3 gap-4' },
        content: {
          images: [],
          layout: 'grid',
          lightbox: true
        }
      }
    },
    {
      name: 'Testimonials',
      description: 'Customer testimonials and reviews component',
      type: 'COMPONENT',
      version: '1.0.0',
      manifest: {
        name: 'Testimonials',
        version: '1.0.0',
        component: {
          type: 'testimonials',
          category: 'content',
          props: {
            layout: { 
              type: 'select', 
              options: ['grid', 'carousel', 'list'],
              default: 'grid'
            },
            showRatings: { type: 'boolean', default: true }
          }
        }
      },
      schema: {
        type: 'testimonials',
        category: 'content',
        name: 'Testimonials',
        styles: { className: 'py-16' },
        content: {
          testimonials: [
            { 
              name: 'John D.', 
              role: 'CEO, Company', 
              text: 'Amazing product! Highly recommended.',
              rating: 5,
              image: '/avatar1.jpg'
            }
          ],
          showRatings: true
        }
      }
    }
  ];

  for (const pluginData of plugins) {
    const existing = await prisma.plugin.findFirst({
      where: { name: pluginData.name }
    });
    
    if (existing) {
      await prisma.plugin.update({
        where: { id: existing.id },
        data: pluginData as any
      });
    } else {
      await prisma.plugin.create({
        data: pluginData as any
      });
    }
    console.log(`✓ Created plugin: ${pluginData.name}`);
  }

  console.log('✅ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
