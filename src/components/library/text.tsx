// Text Components - Heading, Paragraph, Subheading, List, Quote, Text

import type { ComponentDefinition } from '@/types/builder';
import React, { createElement } from 'react';

// ============================================================================
// HEADING
// ============================================================================

export const HeadingComponent: ComponentDefinition = {
  type: 'heading',
  name: 'Heading',
  category: 'text',
  description: 'A heading element (H1-H6)',
  icon: 'heading',
  defaultProps: {
    text: 'Your Heading Here',
    level: 1,
  },
  defaultStyles: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: '16px',
  },
  meta: {
    isDroppable: false,
    description: 'Heading text element H1-H6',
  },
  render: ({ node, styles }) => {
    const level = (node.props.level as 1 | 2 | 3 | 4 | 5 | 6) || 1;
    const text = (node.props.text as string) || 'Heading';
    const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
    return createElement(Tag, { style: styles }, text);
  },
};

// ============================================================================
// PARAGRAPH
// ============================================================================

export const ParagraphComponent: ComponentDefinition = {
  type: 'paragraph',
  name: 'Paragraph',
  category: 'text',
  description: 'A paragraph of text',
  icon: 'pilcrow',
  defaultProps: {
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  defaultStyles: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#4a4a4a',
    marginBottom: '16px',
  },
  meta: {
    isDroppable: false,
    description: 'Body text paragraph',
  },
  render: ({ node, styles }) => (
    <p style={styles}>
      {node.props.text || 'Paragraph text'}
    </p>
  ),
};

// ============================================================================
// SUBHEADING
// ============================================================================

export const SubheadingComponent: ComponentDefinition = {
  type: 'subheading',
  name: 'Subheading',
  category: 'text',
  description: 'A subheading element (H2-H6)',
  icon: 'heading',
  defaultProps: {
    text: 'Your Subheading Here',
    level: 2,
  },
  defaultStyles: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#2a2a2a',
    marginBottom: '12px',
  },
  meta: {
    isDroppable: false,
    description: 'Subheading text element',
  },
  render: ({ node, styles }) => {
    const level = (node.props.level as 1 | 2 | 3 | 4 | 5 | 6) || 2;
    const text = (node.props.text as string) || 'Subheading';
    const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
    return createElement(Tag, { style: styles }, text);
  },
};

// ============================================================================
// LIST
// ============================================================================

export const ListComponent: ComponentDefinition = {
  type: 'list',
  name: 'List',
  category: 'text',
  description: 'An ordered or unordered list',
  icon: 'list',
  defaultProps: {
    items: ['Item 1', 'Item 2', 'Item 3'],
    ordered: false,
  },
  defaultStyles: {
    paddingLeft: '20px',
    marginBottom: '16px',
  },
  meta: {
    isDroppable: false,
    description: 'Bulleted or numbered list',
  },
  render: ({ node, styles }) => {
    const items = (node.props.items as string[]) || [];
    const ordered = node.props.ordered as boolean;
    
    if (ordered) {
      return (
        <ol style={styles}>
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ol>
      );
    }
    
    return (
      <ul style={styles}>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  },
};

// ============================================================================
// QUOTE
// ============================================================================

export const QuoteComponent: ComponentDefinition = {
  type: 'quote',
  name: 'Quote',
  category: 'text',
  description: 'A blockquote element',
  icon: 'quote',
  defaultProps: {
    text: 'This is a beautiful quote that will inspire your visitors.',
    cite: '',
  },
  defaultStyles: {
    padding: '20px',
    borderLeft: '4px solid #3b82f6',
    backgroundColor: '#f8fafc',
    fontStyle: 'italic',
    marginBottom: '16px',
  },
  meta: {
    isDroppable: false,
    description: 'Blockquote for citations',
  },
  render: ({ node, styles }) => {
    const text = node.props.text as string;
    const cite = node.props.cite as string;
    
    return (
      <blockquote style={styles}>
        {text}
        {cite && (
          <cite style={{ display: 'block', marginTop: '12px', fontStyle: 'normal', fontWeight: '500' }}>
            — {cite}
          </cite>
        )}
      </blockquote>
    );
  },
};

// ============================================================================
// TEXT SPAN
// ============================================================================

export const TextSpanComponent: ComponentDefinition = {
  type: 'text',
  name: 'Text',
  category: 'text',
  description: 'Inline text span',
  icon: 'type',
  defaultProps: {
    text: 'Inline text',
  },
  defaultStyles: {
    fontSize: '16px',
    color: '#1a1a1a',
  },
  meta: {
    isDroppable: false,
    description: 'Inline text element',
  },
  render: ({ node, styles }) => (
    <span style={styles}>
      {node.props.text || 'Text'}
    </span>
  ),
};

// ============================================================================
// CODE
// ============================================================================

export const CodeComponent: ComponentDefinition = {
  type: 'code',
  name: 'Code',
  category: 'text',
  description: 'Inline or block code',
  icon: 'code',
  defaultProps: {
    text: 'console.log("Hello World")',
    inline: false,
  },
  defaultStyles: {
    fontFamily: 'monospace',
    fontSize: '14px',
    backgroundColor: '#f1f5f9',
    padding: '2px 6px',
    borderRadius: '4px',
    color: '#dc2626',
  },
  meta: {
    isDroppable: false,
    description: 'Code snippet element',
  },
  render: ({ node, styles }) => {
    const inline = node.props.inline as boolean;
    const text = (node.props.text as string) || '';
    
    if (inline) {
      return <code style={styles}>{text}</code>;
    }
    
    return (
      <pre style={{ ...styles, padding: '16px', overflowX: 'auto' }}>
        <code>{text}</code>
      </pre>
    );
  },
};

// ============================================================================
// LINK
// ============================================================================

export const LinkComponent: ComponentDefinition = {
  type: 'link',
  name: 'Link',
  category: 'text',
  description: 'A clickable text link',
  icon: 'link',
  defaultProps: {
    text: 'Click here',
    href: '#',
    target: '_self',
  },
  defaultStyles: {
    color: '#3b82f6',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  meta: {
    isDroppable: false,
    description: 'Hyperlink element',
  },
  render: ({ node, styles }) => {
    const text = (node.props.text as string) || 'Link';
    const href = (node.props.href as string) || '#';
    const target = (node.props.target as string) || '_self';
    
    return (
      <a href={href} target={target} style={styles}>
        {text}
      </a>
    );
  },
};

// Export all text components
export const textComponents: ComponentDefinition[] = [
  HeadingComponent,
  ParagraphComponent,
  SubheadingComponent,
  ListComponent,
  QuoteComponent,
  TextSpanComponent,
  CodeComponent,
  LinkComponent,
];
