// Layout Components - Hero, Cards, Tabs, Accordion, Feature Grid, Testimonial, Pricing Table

import type { ComponentDefinition } from '@/types/builder';
import { useState } from 'react';

// ============================================================================
// HERO
// ============================================================================

export const HeroComponent: ComponentDefinition = {
  type: 'hero',
  name: 'Hero Section',
  category: 'layout',
  description: 'A hero section with title, subtitle, and CTA',
  icon: 'star',
  defaultProps: {
    title: 'Welcome to Our Website',
    subtitle: 'Build beautiful websites with our powerful builder',
    buttonText: 'Get Started',
    buttonHref: '#',
    showButton: true,
    backgroundImage: '',
  },
  defaultStyles: {
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
  meta: {
    isDroppable: true,
    allowedChildren: ['container'],
    description: 'Hero section with CTA',
  },
  render: ({ node, styles }) => {
    const title = (node.props.title as string) || 'Hero Title';
    const subtitle = (node.props.subtitle as string) || 'Hero subtitle';
    const buttonText = (node.props.buttonText as string) || 'Get Started';
    const buttonHref = (node.props.buttonHref as string) || '#';
    const showButton = node.props.showButton as boolean;
    const backgroundImage = node.props.backgroundImage as string;
    
    return (
      <section 
        style={{ 
          ...styles, 
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px', color: 'inherit' }}>
          {title}
        </h1>
        <p style={{ fontSize: '18px', opacity: 0.9, maxWidth: '600px', marginBottom: '24px', color: 'inherit' }}>
          {subtitle}
        </p>
        {showButton && (
          <a
            href={buttonHref}
            style={{
              padding: '14px 32px',
              fontSize: '16px',
              backgroundColor: '#ffffff',
              color: '#1a1a2e',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              display: 'inline-block',
            }}
          >
            {buttonText}
          </a>
        )}
      </section>
    );
  },
};

// ============================================================================
// CARDS
// ============================================================================

export const CardsComponent: ComponentDefinition = {
  type: 'cards',
  name: 'Cards Grid',
  category: 'layout',
  description: 'A grid of cards with images, titles, and descriptions',
  icon: 'credit-card',
  defaultProps: {
    cardData: [
      { title: 'Card 1', description: 'Description for card 1', image: 'https://via.placeholder.com/300x200' },
      { title: 'Card 2', description: 'Description for card 2', image: 'https://via.placeholder.com/300x200' },
      { title: 'Card 3', description: 'Description for card 3', image: 'https://via.placeholder.com/300x200' },
    ],
    columns: 3,
    showImage: true,
    showDescription: true,
  },
  defaultStyles: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    width: '100%',
  },
  meta: {
    isDroppable: false,
    description: 'Card grid layout',
  },
  render: ({ node, styles }) => {
    const cardData = (node.props.cardData as Array<{ title: string; description?: string; image?: string; href?: string }>) || [];
    const columns = (node.props.columns as number) || 3;
    const showImage = node.props.showImage as boolean;
    const showDescription = node.props.showDescription as boolean;
    
    return (
      <div style={{ ...styles, gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {cardData.map((card, index) => (
          <div
            key={index}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {showImage && card.image && (
              <img
                src={card.image}
                alt={card.title}
                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
              />
            )}
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                {card.title}
              </h3>
              {showDescription && card.description && (
                <p style={{ fontSize: '14px', color: '#6b7280', flex: 1 }}>{card.description}</p>
              )}
              {card.href && (
                <a
                  href={card.href}
                  style={{
                    marginTop: '12px',
                    color: '#3b82f6',
                    textDecoration: 'none',
                    fontWeight: '500',
                  }}
                >
                  Learn more →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  },
};

// ============================================================================
// TABS
// ============================================================================

export const TabsComponent: ComponentDefinition = {
  type: 'tabs',
  name: 'Tabs',
  category: 'layout',
  description: 'Tabbed content sections',
  icon: 'folder',
  defaultProps: {
    tabs: [
      { label: 'Tab 1', content: 'Content for tab 1' },
      { label: 'Tab 2', content: 'Content for tab 2' },
      { label: 'Tab 3', content: 'Content for tab 3' },
    ],
    defaultTab: 0,
  },
  defaultStyles: {
    width: '100%',
  },
  meta: {
    isDroppable: false,
    description: 'Tabbed content interface',
  },
  render: ({ node, styles }) => {
    const tabs = (node.props.tabs as Array<{ label: string; content: string; icon?: string }>) || [];
    const defaultTab = (node.props.defaultTab as number) || 0;
    
    // Note: In a real implementation, this would use useState for interactivity
    // For now, we'll render all tabs with the first one visible
    const [activeTab] = useState(defaultTab);
    
    return (
      <div style={styles}>
        <div style={{ display: 'flex', borderBottom: '2px solid #e5e5e5', marginBottom: '16px', flexWrap: 'wrap' }}>
          {tabs.map((tab, index) => (
            <button
              key={index}
              style={{
                padding: '12px 24px',
                backgroundColor: index === activeTab ? '#3b82f6' : 'transparent',
                color: index === activeTab ? '#ffffff' : '#4a4a4a',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                borderBottom: index === activeTab ? '2px solid #3b82f6' : '2px solid transparent',
                marginBottom: '-2px',
              }}
            >
              {tab.icon && <span style={{ marginRight: '8px' }}>{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ padding: '16px' }}>
          {tabs[activeTab]?.content}
        </div>
      </div>
    );
  },
};

// ============================================================================
// ACCORDION
// ============================================================================

export const AccordionComponent: ComponentDefinition = {
  type: 'accordion',
  name: 'Accordion',
  category: 'layout',
  description: 'Collapsible accordion sections (FAQ style)',
  icon: 'chevrons-up',
  defaultProps: {
    accordionItems: [
      { title: 'Section 1', content: 'Content for section 1', expanded: false },
      { title: 'Section 2', content: 'Content for section 2', expanded: false },
      { title: 'Section 3', content: 'Content for section 3', expanded: false },
    ],
    allowMultiple: false,
  },
  defaultStyles: {
    width: '100%',
  },
  meta: {
    isDroppable: false,
    description: 'Collapsible FAQ accordion',
  },
  render: ({ node, styles }) => {
    const items = (node.props.accordionItems as Array<{ title: string; content: string; expanded?: boolean }>) || [];
    const allowMultiple = node.props.allowMultiple as boolean;
    
    return (
      <div style={styles}>
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              marginBottom: '8px',
              overflow: 'hidden',
            }}
          >
            <button
              style={{
                width: '100%',
                padding: '16px',
                textAlign: 'left',
                backgroundColor: '#f8fafc',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {item.title}
              <span>{item.expanded ? '−' : '+'}</span>
            </button>
            {item.expanded && (
              <div style={{ padding: '16px', borderTop: '1px solid #e5e5e5' }}>
                {item.content}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  },
};

// ============================================================================
// FEATURE GRID
// ============================================================================

export const FeatureGridComponent: ComponentDefinition = {
  type: 'featureGrid',
  name: 'Feature Grid',
  category: 'layout',
  description: 'Grid of features with icons',
  icon: 'grid',
  defaultProps: {
    title: 'Our Features',
    subtitle: 'Everything you need to succeed',
    features: [
      { icon: '⚡', title: 'Fast', description: 'Lightning fast performance' },
      { icon: '🔒', title: 'Secure', description: 'Enterprise-grade security' },
      { icon: '📱', title: 'Responsive', description: 'Works on all devices' },
      { icon: '🎨', title: 'Customizable', description: 'Make it your own' },
    ],
    columns: 4,
  },
  defaultStyles: {
    width: '100%',
    padding: '60px 20px',
  },
  meta: {
    isDroppable: false,
    description: 'Feature showcase grid',
  },
  render: ({ node, styles }) => {
    const title = (node.props.title as string) || 'Features';
    const subtitle = (node.props.subtitle as string) || '';
    const features = (node.props.features as Array<{ icon: string; title: string; description: string }>) || [];
    const columns = (node.props.columns as number) || 4;
    
    return (
      <div style={styles}>
        {title && (
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px' }}>
            {title}
          </h2>
        )}
        {subtitle && (
          <p style={{ fontSize: '16px', textAlign: 'center', color: '#6b7280', marginBottom: '40px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
            {subtitle}
          </p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '32px' }}>
          {features.map((feature, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{feature.title}</h3>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

// ============================================================================
// TESTIMONIAL
// ============================================================================

export const TestimonialComponent: ComponentDefinition = {
  type: 'testimonial',
  name: 'Testimonial',
  category: 'layout',
  description: 'Customer testimonial or review',
  icon: 'quote',
  defaultProps: {
    quote: 'This product changed my life. I highly recommend it to anyone looking for a solution.',
    author: 'John Doe',
    role: 'CEO, Company',
    avatar: 'https://via.placeholder.com/80',
    rating: 5,
  },
  defaultStyles: {
    maxWidth: '600px',
    padding: '32px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    textAlign: 'center',
  },
  meta: {
    isDroppable: false,
    description: 'Customer testimonial card',
  },
  render: ({ node, styles }) => {
    const quote = (node.props.quote as string) || '';
    const author = (node.props.author as string) || '';
    const role = (node.props.role as string) || '';
    const avatar = (node.props.avatar as string) || '';
    const rating = (node.props.rating as number) || 5;
    
    return (
      <div style={styles}>
        <div style={{ fontSize: '24px', marginBottom: '16px' }}>
          {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
        </div>
        <blockquote style={{ fontSize: '18px', fontStyle: 'italic', marginBottom: '24px', color: '#1a1a1a' }}>
          "{quote}"
        </blockquote>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          {avatar && (
            <img
              src={avatar}
              alt={author}
              style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
            />
          )}
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: '600' }}>{author}</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>{role}</div>
          </div>
        </div>
      </div>
    );
  },
};

// ============================================================================
// PRICING TABLE
// ============================================================================

export const PricingTableComponent: ComponentDefinition = {
  type: 'pricingTable',
  name: 'Pricing Table',
  category: 'layout',
  description: 'Pricing plans comparison table',
  icon: 'dollar-sign',
  defaultProps: {
    title: 'Simple Pricing',
    subtitle: 'Choose the plan that works for you',
    plans: [
      { name: 'Basic', price: '$9', period: '/month', features: ['5 Projects', '10GB Storage', 'Email Support'], cta: 'Get Started', popular: false },
      { name: 'Pro', price: '$29', period: '/month', features: ['Unlimited Projects', '100GB Storage', 'Priority Support', 'Analytics'], cta: 'Get Started', popular: true },
      { name: 'Enterprise', price: '$99', period: '/month', features: ['Everything in Pro', 'Unlimited Storage', '24/7 Support', 'Custom Integrations'], cta: 'Contact Us', popular: false },
    ],
  },
  defaultStyles: {
    width: '100%',
    padding: '60px 20px',
  },
  meta: {
    isDroppable: false,
    description: 'Pricing plans display',
  },
  render: ({ node, styles }) => {
    const title = (node.props.title as string) || 'Pricing';
    const subtitle = (node.props.subtitle as string) || '';
    const plans = (node.props.plans as Array<{ name: string; price: string; period: string; features: string[]; cta: string; popular: boolean }>) || [];
    
    return (
      <div style={styles}>
        {title && (
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px' }}>
            {title}
          </h2>
        )}
        {subtitle && (
          <p style={{ fontSize: '16px', textAlign: 'center', color: '#6b7280', marginBottom: '40px' }}>
            {subtitle}
          </p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
          {plans.map((plan, index) => (
            <div
              key={index}
              style={{
                padding: '32px',
                borderRadius: '12px',
                border: plan.popular ? '2px solid #3b82f6' : '1px solid #e5e5e5',
                backgroundColor: '#ffffff',
                position: 'relative',
                boxShadow: plan.popular ? '0 8px 16px rgba(59, 130, 246, 0.2)' : 'none',
              }}
            >
              {plan.popular && (
                <span style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600',
                }}>
                  Popular
                </span>
              )}
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>{plan.name}</h3>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '36px', fontWeight: 'bold' }}>{plan.price}</span>
                <span style={{ color: '#6b7280' }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '24px' }}>
                {plan.features.map((feature, i) => (
                  <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                    ✓ {feature}
                  </li>
                ))}
              </ul>
              <button
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: plan.popular ? '#3b82f6' : '#f1f5f9',
                  color: plan.popular ? '#ffffff' : '#1a1a1a',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

// Export all layout components
export const layoutComponents: ComponentDefinition[] = [
  HeroComponent,
  CardsComponent,
  TabsComponent,
  AccordionComponent,
  FeatureGridComponent,
  TestimonialComponent,
  PricingTableComponent,
];
