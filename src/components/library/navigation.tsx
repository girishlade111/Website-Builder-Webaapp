// Navigation Components - Navbar, Sidebar Nav, Breadcrumbs, Footer Nav

import type { ComponentDefinition } from '@/types/builder';

// ============================================================================
// NAVBAR
// ============================================================================

export const NavbarComponent: ComponentDefinition = {
  type: 'navbar',
  name: 'Navbar',
  category: 'navigation',
  description: 'Navigation bar with logo and links',
  icon: 'menu',
  defaultProps: {
    logo: 'Logo',
    logoHref: '/',
    links: [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' },
      { label: 'Services', href: '/services' },
      { label: 'Contact', href: '/contact' },
    ],
    ctaText: 'Get Started',
    ctaHref: '#',
    showCta: true,
    sticky: false,
  },
  defaultStyles: {
    width: '100%',
    padding: '16px 24px',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  meta: {
    isDroppable: false,
    description: 'Top navigation bar',
  },
  render: ({ node, styles }) => {
    const logo = (node.props.logo as string) || 'Logo';
    const logoHref = (node.props.logoHref as string) || '/';
    const links = (node.props.links as Array<{ label: string; href: string }>) || [];
    const ctaText = (node.props.ctaText as string) || 'Get Started';
    const ctaHref = (node.props.ctaHref as string) || '#';
    const showCta = node.props.showCta as boolean;
    const sticky = node.props.sticky as boolean;
    
    return (
      <nav style={{ ...styles, position: sticky ? 'sticky' : 'static' }}>
        <a href={logoHref} style={{ fontSize: '20px', fontWeight: 'bold', textDecoration: 'none', color: '#1a1a1a' }}>
          {logo}
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              style={{ textDecoration: 'none', color: '#4a4a4a', fontWeight: '500' }}
            >
              {link.label}
            </a>
          ))}
          {showCta && (
            <a
              href={ctaHref}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '600',
              }}
            >
              {ctaText}
            </a>
          )}
        </div>
      </nav>
    );
  },
};

// ============================================================================
// SIDEBAR NAV
// ============================================================================

export const SidebarNavComponent: ComponentDefinition = {
  type: 'sidebarNav',
  name: 'Sidebar Navigation',
  category: 'navigation',
  description: 'Vertical sidebar navigation',
  icon: 'sidebar',
  defaultProps: {
    title: 'Menu',
    links: [
      { label: 'Dashboard', href: '/dashboard', icon: '📊' },
      { label: 'Profile', href: '/profile', icon: '👤' },
      { label: 'Settings', href: '/settings', icon: '⚙️' },
      { label: 'Help', href: '/help', icon: '❓' },
    ],
    showIcons: true,
  },
  defaultStyles: {
    width: '250px',
    padding: '24px',
    backgroundColor: '#1a1a2e',
    color: '#ffffff',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  meta: {
    isDroppable: false,
    description: 'Vertical sidebar navigation',
  },
  render: ({ node, styles }) => {
    const title = (node.props.title as string) || 'Menu';
    const links = (node.props.links as Array<{ label: string; href: string; icon?: string }>) || [];
    const showIcons = node.props.showIcons as boolean;
    
    return (
      <aside style={styles}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {title}
        </h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              style={{
                padding: '12px 16px',
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                opacity: 0.8,
              }}
            >
              {showIcons && link.icon && <span>{link.icon}</span>}
              {link.label}
            </a>
          ))}
        </nav>
      </aside>
    );
  },
};

// ============================================================================
// BREADCRUMBS
// ============================================================================

export const BreadcrumbsComponent: ComponentDefinition = {
  type: 'breadcrumbs',
  name: 'Breadcrumbs',
  category: 'navigation',
  description: 'Breadcrumb navigation trail',
  icon: 'chevron-right',
  defaultProps: {
    links: [
      { label: 'Home', href: '/' },
      { label: 'Category', href: '/category' },
      { label: 'Current Page', href: '#' },
    ],
    separator: '/',
  },
  defaultStyles: {
    padding: '12px 0',
    fontSize: '14px',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  meta: {
    isDroppable: false,
    description: 'Breadcrumb navigation',
  },
  render: ({ node, styles }) => {
    const links = (node.props.links as Array<{ label: string; href: string }>) || [];
    const separator = (node.props.separator as string) || '/';
    
    return (
      <nav style={styles} aria-label="Breadcrumb">
        {links.map((link, index) => (
          <span key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {index > 0 && <span style={{ color: '#9ca3af' }}>{separator}</span>}
            {index === links.length - 1 ? (
              <span style={{ color: '#1a1a1a', fontWeight: '500' }}>{link.label}</span>
            ) : (
              <a href={link.href} style={{ color: '#3b82f6', textDecoration: 'none' }}>
                {link.label}
              </a>
            )}
          </span>
        ))}
      </nav>
    );
  },
};

// ============================================================================
// FOOTER NAV
// ============================================================================

export const FooterNavComponent: ComponentDefinition = {
  type: 'footerNav',
  name: 'Footer Navigation',
  category: 'navigation',
  description: 'Footer with links and copyright',
  icon: 'layout-footer',
  defaultProps: {
    logo: 'Company',
    description: 'Building amazing products since 2024.',
    columns: [
      {
        title: 'Product',
        links: [
          { label: 'Features', href: '/features' },
          { label: 'Pricing', href: '/pricing' },
          { label: 'Documentation', href: '/docs' },
        ],
      },
      {
        title: 'Company',
        links: [
          { label: 'About', href: '/about' },
          { label: 'Blog', href: '/blog' },
          { label: 'Careers', href: '/careers' },
        ],
      },
      {
        title: 'Legal',
        links: [
          { label: 'Privacy', href: '/privacy' },
          { label: 'Terms', href: '/terms' },
        ],
      },
    ] as Array<{ title: string; links: Array<{ label: string; href: string }> }>,
    socialLinks: [
      { label: 'Twitter', href: 'https://twitter.com', icon: '🐦' },
      { label: 'GitHub', href: 'https://github.com', icon: '🐙' },
      { label: 'LinkedIn', href: 'https://linkedin.com', icon: '💼' },
    ] as Array<{ label: string; href: string; icon: string }>,
    copyright: '© 2024 Company. All rights reserved.',
  },
  defaultStyles: {
    width: '100%',
    padding: '60px 24px 32px',
    backgroundColor: '#1a1a2e',
    color: '#ffffff',
  },
  meta: {
    isDroppable: false,
    description: 'Footer navigation',
  },
  render: ({ node, styles }) => {
    const logo = (node.props.logo as string) || 'Company';
    const description = (node.props.description as string) || '';
    const columns = ((node.props.columns as Array<{ title: string; links: Array<{ label: string; href: string }> }>) || []) as Array<{ title: string; links: Array<{ label: string; href: string }> }>;
    const socialLinks = ((node.props.socialLinks as Array<{ label: string; href: string; icon: string }>) || []) as Array<{ label: string; href: string; icon: string }>;
    const copyright = (node.props.copyright as string) || '';
    
    return (
      <footer style={styles}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr repeat(3, 1fr)', gap: '48px', marginBottom: '48px' }}>
            {/* Logo & Description */}
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>{logo}</h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.6' }}>{description}</p>
              {/* Social Links */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '24px', textDecoration: 'none' }}
                    title={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
            
            {/* Link Columns */}
            {columns.map((column, colIndex) => (
              <div key={colIndex}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', color: '#9ca3af' }}>
                  {column.title}
                </h4>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {column.links.map((link, linkIndex) => (
                    <a
                      key={linkIndex}
                      href={link.href}
                      style={{ color: '#ffffff', textDecoration: 'none', opacity: 0.8 }}
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
              </div>
            ))}
          </div>
          
          {/* Copyright */}
          <div style={{ paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', color: '#9ca3af' }}>
            {copyright}
          </div>
        </div>
      </footer>
    );
  },
};

// ============================================================================
// MOBILE MENU
// ============================================================================

export const MobileMenuComponent: ComponentDefinition = {
  type: 'mobileMenu',
  name: 'Mobile Menu',
  category: 'navigation',
  description: 'Mobile hamburger menu',
  icon: 'menu',
  defaultProps: {
    logo: 'Logo',
    links: [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' },
      { label: 'Services', href: '/services' },
      { label: 'Contact', href: '/contact' },
    ],
    ctaText: 'Get Started',
    ctaHref: '#',
  },
  defaultStyles: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  meta: {
    isDroppable: false,
    description: 'Mobile navigation menu',
  },
  render: ({ node, styles }) => {
    const logo = (node.props.logo as string) || 'Logo';
    const links = (node.props.links as Array<{ label: string; href: string }>) || [];
    const ctaText = (node.props.ctaText as string) || 'Get Started';
    const ctaHref = (node.props.ctaHref as string) || '#';
    
    return (
      <nav style={styles}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ fontSize: '20px', fontWeight: 'bold', textDecoration: 'none', color: '#1a1a1a' }}>
            {logo}
          </a>
          <button
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </nav>
    );
  },
};

// Export all navigation components
export const navigationComponents: ComponentDefinition[] = [
  NavbarComponent,
  SidebarNavComponent,
  BreadcrumbsComponent,
  FooterNavComponent,
  MobileMenuComponent,
];
