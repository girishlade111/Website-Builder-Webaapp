// Basic Components - Section, Container, Grid, Columns, Divider, Spacer

import type { ComponentDefinition } from '@/types/builder';
import { ReactNode } from 'react';

// ============================================================================
// SECTION
// ============================================================================

export const SectionComponent: ComponentDefinition = {
  type: 'section',
  name: 'Section',
  category: 'basic',
  description: 'A container section for grouping content',
  icon: 'layout-template',
  defaultProps: {},
  defaultStyles: {
    width: '100%',
    minHeight: '200px',
    padding: '40px 20px',
    backgroundColor: '#ffffff',
  },
  meta: {
    isDroppable: true,
    allowedChildren: ['container', 'grid', 'columns', 'heading', 'paragraph', 'image', 'button'],
    description: 'Full-width section container',
  },
  render: ({ styles, children }) => (
    <section style={styles}>
      {children}
    </section>
  ),
};

// ============================================================================
// CONTAINER
// ============================================================================

export const ContainerComponent: ComponentDefinition = {
  type: 'container',
  name: 'Container',
  category: 'basic',
  description: 'A constrained container for content',
  icon: 'box',
  defaultProps: {},
  defaultStyles: {
    width: '100%',
    maxWidth: '1200px',
    padding: '20px',
    margin: '0 auto',
  },
  meta: {
    isDroppable: true,
    allowedChildren: ['grid', 'columns', 'heading', 'paragraph', 'image', 'button', 'card'],
    description: 'Centered content container with max-width',
  },
  render: ({ styles, children }) => (
    <div style={styles}>
      {children}
    </div>
  ),
};

// ============================================================================
// GRID
// ============================================================================

export const GridComponent: ComponentDefinition = {
  type: 'grid',
  name: 'Grid',
  category: 'basic',
  description: 'A responsive grid layout',
  icon: 'grid',
  defaultProps: {
    columns: 3,
    gap: '20px',
  },
  defaultStyles: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    width: '100%',
  },
  meta: {
    isDroppable: true,
    allowedChildren: ['container', 'card', 'image', 'text'],
    description: 'Responsive grid with configurable columns',
  },
  render: ({ node, styles, children }) => {
    const columns = (node.props.columns as number) || 3;
    return (
      <div style={{ ...styles, gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {children}
      </div>
    );
  },
};

// ============================================================================
// COLUMNS
// ============================================================================

export const ColumnsComponent: ComponentDefinition = {
  type: 'columns',
  name: 'Columns',
  category: 'basic',
  description: 'Multi-column flexbox layout',
  icon: 'columns',
  defaultProps: {
    columns: 2,
    gap: '20px',
  },
  defaultStyles: {
    display: 'flex',
    gap: '20px',
    width: '100%',
  },
  meta: {
    isDroppable: true,
    allowedChildren: ['container', 'column'],
    description: 'Flexbox columns layout',
  },
  render: ({ node, styles, children }) => {
    const columns = (node.props.columns as number) || 2;
    const gap = (node.props.gap as string) || '20px';
    return (
      <div style={{ ...styles, gap }}>
        {children || Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              padding: '20px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              minHeight: '150px',
            }}
          >
            Column {i + 1}
          </div>
        ))}
      </div>
    );
  },
};

// ============================================================================
// COLUMN (for use inside Columns)
// ============================================================================

export const ColumnComponent: ComponentDefinition = {
  type: 'column',
  name: 'Column',
  category: 'basic',
  description: 'A single column inside a Columns layout',
  icon: 'column',
  defaultProps: {},
  defaultStyles: {
    flex: 1,
    padding: '20px',
  },
  meta: {
    isDroppable: true,
    allowedChildren: ['heading', 'paragraph', 'image', 'button', 'card'],
    description: 'Single column container',
  },
  render: ({ styles, children }) => (
    <div style={styles}>
      {children}
    </div>
  ),
};

// ============================================================================
// DIVIDER
// ============================================================================

export const DividerComponent: ComponentDefinition = {
  type: 'divider',
  name: 'Divider',
  category: 'basic',
  description: 'A horizontal line divider',
  icon: 'minus',
  defaultProps: {},
  defaultStyles: {
    width: '100%',
    margin: '20px 0',
    borderTop: '1px solid #e5e5e5',
  },
  meta: {
    isDroppable: false,
    description: 'Horizontal dividing line',
  },
  render: ({ styles }) => (
    <hr style={styles} />
  ),
};

// ============================================================================
// SPACER
// ============================================================================

export const SpacerComponent: ComponentDefinition = {
  type: 'spacer',
  name: 'Spacer',
  category: 'basic',
  description: 'Add vertical or horizontal spacing',
  icon: 'arrow-down-up',
  defaultProps: {
    size: '40px',
  },
  defaultStyles: {
    width: '100%',
    height: '40px',
  },
  meta: {
    isDroppable: false,
    description: 'Invisible spacing element',
  },
  render: ({ node, styles }) => {
    const size = (node.props.size as string) || styles.height || '40px';
    return (
      <div 
        style={{ 
          ...styles, 
          height: size,
          width: '100%',
        }} 
      />
    );
  },
};

// ============================================================================
// WRAPPER
// ============================================================================

export const WrapperComponent: ComponentDefinition = {
  type: 'wrapper',
  name: 'Wrapper',
  category: 'basic',
  description: 'A generic wrapper div for grouping',
  icon: 'box',
  defaultProps: {},
  defaultStyles: {
    width: '100%',
  },
  meta: {
    isDroppable: true,
    allowedChildren: [],
    description: 'Generic wrapper element',
  },
  render: ({ styles, children }) => (
    <div style={styles}>
      {children}
    </div>
  ),
};

// Export all basic components
export const basicComponents: ComponentDefinition[] = [
  SectionComponent,
  ContainerComponent,
  GridComponent,
  ColumnsComponent,
  ColumnComponent,
  DividerComponent,
  SpacerComponent,
  WrapperComponent,
];
