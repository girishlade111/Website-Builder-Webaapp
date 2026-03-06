'use client';

import React, { createElement } from 'react';
import { BuilderComponent } from '@/types';

interface ComponentRendererProps {
  component: BuilderComponent;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  isPreviewMode?: boolean;
}

// Helper to convert styles to CSS
const stylesToCSS = (styles: Record<string, string | number | boolean | undefined>): React.CSSProperties => {
  const cssProperties: Record<string, string | number> = {};

  for (const [key, value] of Object.entries(styles)) {
    if (value === undefined || value === null || value === '') continue;

    // Convert camelCase to kebab-case for CSS
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();

    if (typeof value === 'number' && !cssKey.includes('opacity')) {
      cssProperties[cssKey] = `${value}px`;
    } else if (typeof value === 'boolean') {
      cssProperties[cssKey] = value ? 'true' : 'false';
    } else {
      cssProperties[cssKey] = value as string | number;
    }
  }

  return cssProperties as React.CSSProperties;
};

// Individual component renderers
const renderComponent = (component: BuilderComponent): React.ReactNode => {
  const style = stylesToCSS(component.styles as Record<string, string | number | boolean | undefined>);
  
  switch (component.type) {
    case 'section':
      return (
        <section style={style}>
          {component.children?.map((child) => (
            <div key={child.id}>{renderComponent(child)}</div>
          ))}
        </section>
      );
      
    case 'container':
      return (
        <div style={style}>
          {component.children?.map((child) => (
            <div key={child.id}>{renderComponent(child)}</div>
          ))}
        </div>
      );
      
    case 'divider':
      return <hr style={style} />;
      
    case 'spacer':
      return <div style={style} />;

    case 'heading': {
      const level = component.content.level || 1;
      return createElement(`h${level}` as keyof React.JSX.IntrinsicElements, { style }, component.content.text);
    }

    case 'paragraph':
      return <p style={style}>{component.content.text}</p>;

    case 'subheading': {
      const level = component.content.level || 2;
      return createElement(`h${level}` as keyof React.JSX.IntrinsicElements, { style }, component.content.text);
    }
      
    case 'list':
      if (component.content.ordered) {
        return (
          <ol style={style}>
            {component.content.items?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ol>
        );
      }
      return (
        <ul style={style}>
          {component.content.items?.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
      
    case 'quote':
      return <blockquote style={style}>{component.content.text}</blockquote>;
      
    case 'image':
      return <img src={component.content.src} alt={component.content.alt} style={style} />;
      
    case 'video':
      if (component.content.src?.includes('youtube')) {
        return (
          <iframe
            src={component.content.src}
            style={style}
            allowFullScreen
            title="Video"
          />
        );
      }
      return (
        <video src={component.content.src} style={style} controls={component.content.controls}>
          Your browser does not support the video tag.
        </video>
      );
      
    case 'gallery':
      return (
        <div style={style}>
          {component.content.images?.map((img, index) => (
            <img key={index} src={img} alt={`Gallery image ${index + 1}`} style={{ width: '100%', borderRadius: '8px' }} />
          ))}
        </div>
      );
      
    case 'backgroundVideo':
      return (
        <div style={style}>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              zIndex: 0,
            }}
          >
            {component.content.src && (
              <iframe
                src={`${component.content.src}?autoplay=1&mute=1&loop=1&playlist=${component.content.src.split('/').pop()}`}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '300%',
                  height: '300%',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                }}
                title="Background Video"
              />
            )}
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            {component.children?.map((child) => (
              <div key={child.id}>{renderComponent(child)}</div>
            ))}
          </div>
        </div>
      );
      
    case 'hero':
      return (
        <section style={style}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px' }}>
            {component.content.text}
          </h1>
          <p style={{ fontSize: '18px', opacity: 0.9, maxWidth: '600px' }}>
            Create stunning websites with our powerful builder
          </p>
          <button
            style={{
              marginTop: '24px',
              padding: '12px 32px',
              fontSize: '16px',
              backgroundColor: '#ffffff',
              color: '#1a1a2e',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Get Started
          </button>
        </section>
      );
      
    case 'grid':
      return (
        <div style={style}>
          {component.children?.map((child) => (
            <div key={child.id}>{renderComponent(child)}</div>
          ))}
        </div>
      );
      
    case 'columns':
      const columns = component.content.columns || 2;
      return (
        <div style={{ ...style, display: 'flex', gap: component.content.gap || '20px' }}>
          {Array.from({ length: columns }).map((_, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                padding: '20px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                minHeight: '150px',
              }}
            >
              Column {index + 1}
            </div>
          ))}
        </div>
      );
      
    case 'cards':
      return (
        <div style={style}>
          {component.content.cardData?.map((card, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s',
              }}
            >
              {card.image && (
                <img
                  src={card.image}
                  alt={card.title}
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                />
              )}
              <div style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      );
      
    case 'tabs':
      return (
        <div style={style}>
          <div style={{ display: 'flex', borderBottom: '2px solid #e5e5e5', marginBottom: '16px' }}>
            {component.content.tabs?.map((tab, index) => (
              <button
                key={index}
                style={{
                  padding: '12px 24px',
                  backgroundColor: index === 0 ? '#3b82f6' : 'transparent',
                  color: index === 0 ? '#ffffff' : '#4a4a4a',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div style={{ padding: '16px' }}>
            {component.content.tabs?.[0]?.content}
          </div>
        </div>
      );
      
    case 'accordion':
      return (
        <div style={style}>
          {component.content.accordionItems?.map((item, index) => (
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
      
    case 'input':
      return (
        <div style={{ marginBottom: '16px' }}>
          {component.content.label && (
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              {component.content.label}
            </label>
          )}
          <input
            type={component.content.type || 'text'}
            placeholder={component.content.placeholder}
            name={component.content.name}
            required={component.content.required}
            style={style}
          />
        </div>
      );
      
    case 'textarea':
      return (
        <div style={{ marginBottom: '16px' }}>
          {component.content.label && (
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              {component.content.label}
            </label>
          )}
          <textarea
            placeholder={component.content.placeholder}
            name={component.content.name}
            required={component.content.required}
            style={style}
          />
        </div>
      );
      
    case 'select':
      return (
        <div style={{ marginBottom: '16px' }}>
          {component.content.label && (
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              {component.content.label}
            </label>
          )}
          <select name={component.content.name} style={style}>
            {component.content.options?.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
      
    case 'checkbox':
      return (
        <label style={style}>
          <input
            type="checkbox"
            name={component.content.name}
            checked={component.content.checked}
          />
          {component.content.label}
        </label>
      );
      
    case 'loginForm':
      return (
        <form style={style}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>
            Login
          </h2>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Login
          </button>
        </form>
      );
      
    case 'signupForm':
      return (
        <form style={style}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>
            Sign Up
          </h2>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Password</label>
            <input
              type="password"
              placeholder="Create a password"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Sign Up
          </button>
        </form>
      );
      
    case 'contactForm':
      return (
        <form style={style}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>
            Contact Us
          </h2>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Name</label>
            <input
              type="text"
              placeholder="Your name"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Email</label>
            <input
              type="email"
              placeholder="Your email"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Message</label>
            <textarea
              placeholder="Your message"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                minHeight: '120px',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Send Message
          </button>
        </form>
      );
      
    case 'productCard':
      return (
        <div style={style}>
          <img
            src={component.content.image}
            alt={component.content.productName}
            style={{ width: '100%', height: '250px', objectFit: 'cover' }}
          />
          <div style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
              {component.content.productName}
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
              {component.content.description}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a' }}>
                {component.content.price}
              </span>
              <button
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      );
      
    case 'productGrid':
      return (
        <div style={style}>
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            >
              <img
                src={`https://via.placeholder.com/300x300?text=Product+${index + 1}`}
                alt={`Product ${index + 1}`}
                style={{ width: '100%', height: '250px', objectFit: 'cover' }}
              />
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                  Product {index + 1}
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                  Product description goes here.
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a' }}>
                    ${(Math.random() * 100 + 10).toFixed(2)}
                  </span>
                  <button
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
      
    case 'shoppingCart':
      return (
        <div style={style}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Shopping Cart</h2>
          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img
                  src="https://via.placeholder.com/80x80"
                  alt="Product"
                  style={{ width: '80px', height: '80px', borderRadius: '8px' }}
                />
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Product Name</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>Quantity: 1</p>
                </div>
              </div>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>$99.99</span>
            </div>
          </div>
          <div style={{ borderTop: '2px solid #e5e5e5', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Subtotal</span>
              <span>$99.99</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span>Shipping</span>
              <span>$9.99</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px' }}>
              <span>Total</span>
              <span>$109.98</span>
            </div>
          </div>
          <button
            style={{
              width: '100%',
              marginTop: '24px',
              padding: '16px',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Proceed to Checkout
          </button>
        </div>
      );
      
    case 'checkout':
      return (
        <div style={style}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Checkout</h2>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Shipping Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <input
                type="text"
                placeholder="First Name"
                style={{
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              />
              <input
                type="text"
                placeholder="Last Name"
                style={{
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              />
            </div>
            <input
              type="text"
              placeholder="Address"
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          </div>
          <button
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Place Order
          </button>
        </div>
      );
      
    case 'paymentBlock':
      return (
        <div style={style}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Payment Method</h3>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <button
              style={{
                flex: 1,
                padding: '16px',
                border: '2px solid #3b82f6',
                backgroundColor: '#eff6ff',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Credit Card
            </button>
            <button
              style={{
                flex: 1,
                padding: '16px',
                border: '2px solid #e5e5e5',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              PayPal
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ padding: '8px 16px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e5e5e5' }}>
              💳 Visa
            </span>
            <span style={{ padding: '8px 16px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e5e5e5' }}>
              💳 Mastercard
            </span>
            <span style={{ padding: '8px 16px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e5e5e5' }}>
              💳 Amex
            </span>
          </div>
        </div>
      );
      
    case 'navbar':
      return (
        <nav style={style}>
          <div style={{ fontWeight: 'bold', fontSize: '20px' }}>Logo</div>
          <div style={{ display: 'flex', gap: '24px' }}>
            {component.content.links?.map((link, index) => (
              <a
                key={index}
                href={link.href}
                style={{
                  color: '#4a4a4a',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'color 0.2s',
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      );
      
    case 'sidebarNav':
      return (
        <nav style={style}>
          <div style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '32px' }}>Menu</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {component.content.links?.map((link, index) => (
              <a
                key={index}
                href={link.href}
                style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  transition: 'backgroundColor 0.2s',
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      );
      
    case 'breadcrumbs':
      return (
        <nav style={style}>
          {component.content.links?.map((link, index, arr) => (
            <span key={index}>
              <a
                href={link.href}
                style={{
                  color: index === arr.length - 1 ? '#4a4a4a' : '#3b82f6',
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </a>
              {index < arr.length - 1 && <span style={{ margin: '0 8px' }}> / </span>}
            </span>
          ))}
        </nav>
      );
      
    case 'html':
      return <div style={style} dangerouslySetInnerHTML={{ __html: component.content.html || '' }} />;
      
    case 'customCode':
      return (
        <div style={style}>
          <pre
            style={{
              backgroundColor: '#1a1a2e',
              color: '#ffffff',
              padding: '16px',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '14px',
            }}
          >
            {component.content.code}
          </pre>
        </div>
      );
      
    case 'apiComponent':
      return (
        <div style={style}>
          <div
            style={{
              padding: '24px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e5e5e5',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>API Component</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
              Endpoint: {component.content.endpoint}
            </p>
            <div
              style={{
                padding: '12px',
                backgroundColor: '#ffffff',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '12px',
              }}
            >
              {component.content.method} {component.content.endpoint}
            </div>
          </div>
        </div>
      );
      
    default:
      return <div style={style}>Unknown component: {component.type}</div>;
  }
};

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  component,
  isSelected,
  onSelect,
  isPreviewMode,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (isPreviewMode) return;
    e.stopPropagation();
    onSelect?.(component.id);
  };
  
  const renderedComponent = renderComponent(component);
  
  return (
    <div
      onClick={handleClick}
      style={{
        position: 'relative',
        cursor: isPreviewMode ? 'default' : 'pointer',
        outline: isSelected && !isPreviewMode ? '2px solid #3b82f6' : 'none',
        outlineOffset: '2px',
      }}
      data-component-id={component.id}
      data-component-type={component.type}
    >
      {renderedComponent}
      {isSelected && !isPreviewMode && (
        <div
          style={{
            position: 'absolute',
            top: '-24px',
            right: '0',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            padding: '2px 8px',
            fontSize: '12px',
            borderRadius: '4px 4px 0 0',
            zIndex: 10,
          }}
        >
          {component.name}
        </div>
      )}
    </div>
  );
};

export default ComponentRenderer;
