// Recursive Canvas Renderer - Core of the visual builder

'use client';

import React, { memo, useCallback, useMemo } from 'react';
import type { ComponentNode, ComponentRenderProps } from '@/types/builder';
import { componentRegistry } from '@/lib/component-registry';

// ============================================================================
// STYLE UTILITIES
// ============================================================================

/**
 * Merge responsive styles based on device type
 */
export function mergeResponsiveStyles(
  base: React.CSSProperties,
  tablet?: React.CSSProperties,
  mobile?: React.CSSProperties,
  deviceType: 'desktop' | 'tablet' | 'mobile' = 'desktop'
): React.CSSProperties {
  if (deviceType === 'desktop') {
    return base;
  }
  if (deviceType === 'tablet') {
    return { ...base, ...tablet };
  }
  return { ...base, ...tablet, ...mobile };
}

/**
 * Convert component styles to CSS properties
 */
export function stylesToCSS(styles: React.CSSProperties): React.CSSProperties {
  const cssProperties: React.CSSProperties = {};

  for (const [key, value] of Object.entries(styles)) {
    if (value === undefined || value === null || value === '') continue;
    cssProperties[key as keyof React.CSSProperties] = value;
  }

  return cssProperties;
}

// ============================================================================
// COMPONENT NODE RENDERER (RECURSIVE)
// ============================================================================

interface ComponentNodeRendererProps {
  node: ComponentNode;
  deviceType?: 'desktop' | 'tablet' | 'mobile';
  isSelected?: boolean;
  isPreviewMode?: boolean;
  onSelect?: (id: string) => void;
  onHover?: (id: string | null) => void;
  depth?: number;
}

export const ComponentNodeRenderer: React.FC<ComponentNodeRendererProps> = memo(({
  node,
  deviceType = 'desktop',
  isSelected = false,
  isPreviewMode = false,
  onSelect,
  onHover,
  depth = 0,
}) => {
  // Merge responsive styles
  const mergedStyles = useMemo(() => {
    return mergeResponsiveStyles(
      node.styles?.base || {},
      node.styles?.tablet,
      node.styles?.mobile,
      deviceType
    );
  }, [node.styles, deviceType]);

  // Handle selection
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isPreviewMode) return;
    e.stopPropagation();
    onSelect?.(node.id);
  }, [isPreviewMode, onSelect, node.id]);

  // Handle hover
  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    if (isPreviewMode) return;
    e.stopPropagation();
    onHover?.(node.id);
  }, [isPreviewMode, onHover, node.id]);

  const handleMouseLeave = useCallback(() => {
    if (isPreviewMode) return;
    onHover?.(null);
  }, [isPreviewMode, onHover]);

  // Render children recursively
  const renderChildren = useCallback(() => {
    if (!node.children || node.children.length === 0) return null;

    return node.children.map((child) => (
      <ComponentNodeRenderer
        key={child.id}
        node={child}
        deviceType={deviceType}
        isSelected={false}
        isPreviewMode={isPreviewMode}
        onSelect={onSelect}
        onHover={onHover}
        depth={depth + 1}
      />
    ));
  }, [node.children, deviceType, isPreviewMode, onSelect, onHover, depth]);

  // Get component definition and render
  const renderedContent = useMemo(() => {
    const renderProps: ComponentRenderProps = {
      node,
      styles: mergedStyles,
      children: renderChildren(),
      isSelected,
      isPreviewMode,
      onSelect,
    };

    return componentRegistry.render(node, renderProps);
  }, [node, mergedStyles, renderChildren, isSelected, isPreviewMode, onSelect]);

  // Wrap with selection/hover handlers if not in preview mode
  if (isPreviewMode) {
    return <>{renderedContent}</>;
  }

  return (
    <div
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        outline: isSelected ? '2px solid #3b82f6' : 'none',
        outlineOffset: isSelected ? '-2px' : '0',
        transition: 'outline 0.15s ease',
      }}
      data-component-id={node.id}
      data-component-type={node.type}
      data-depth={depth}
    >
      {renderedContent}
      
      {/* Selection indicator */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            outline: '2px solid #3b82f6',
            outlineOffset: '-2px',
            borderRadius: '4px',
          }}
        />
      )}
    </div>
  );
});

ComponentNodeRenderer.displayName = 'ComponentNodeRenderer';

// ============================================================================
// CANVAS RENDERER (ROOT)
// ============================================================================

interface CanvasRendererProps {
  rootNode: ComponentNode;
  deviceType?: 'desktop' | 'tablet' | 'mobile';
  selectedNodeId?: string | null;
  isPreviewMode?: boolean;
  onSelectNode?: (id: string) => void;
  onHoverNode?: (id: string | null) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({
  rootNode,
  deviceType = 'desktop',
  selectedNodeId,
  isPreviewMode = false,
  onSelectNode,
  onHoverNode,
  className,
  style,
}) => {
  return (
    <div
      className={className}
      style={{
        width: '100%',
        minHeight: '100%',
        backgroundColor: '#ffffff',
        ...style,
      }}
    >
      <ComponentNodeRenderer
        node={rootNode}
        deviceType={deviceType}
        isSelected={selectedNodeId === rootNode.id}
        isPreviewMode={isPreviewMode}
        onSelect={onSelectNode}
        onHover={onHoverNode}
      />
    </div>
  );
};

// ============================================================================
// DROP ZONE COMPONENT
// ============================================================================

interface DropZoneProps {
  targetId: string;
  position: 'before' | 'after' | 'inside';
  isOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  children?: React.ReactNode;
}

export const DropZone: React.FC<DropZoneProps> = ({
  targetId,
  position,
  isOver,
  onDragOver,
  onDragLeave,
  onDrop,
  children,
}) => {
  const dropZoneStyle: React.CSSProperties = {
    position: position === 'inside' ? 'absolute' : 'relative',
    ...(position === 'inside' && {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: isOver ? 'auto' : 'none',
      zIndex: 50,
    }),
    ...(position !== 'inside' && {
      height: '4px',
      margin: position === 'before' ? '-4px 0 0 0' : '0 0 -4px 0',
    }),
    backgroundColor: isOver ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
    border: isOver ? '2px dashed #3b82f6' : '2px dashed transparent',
    borderRadius: '4px',
    transition: 'all 0.15s ease',
  };

  return (
    <div
      data-drop-target={targetId}
      data-drop-position={position}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={dropZoneStyle}
    >
      {children}
    </div>
  );
};

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

interface EmptyStateProps {
  message?: string;
  submessage?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'Drop components here',
  submessage = 'Start building your page by dragging components from the sidebar',
  icon,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
        color: '#6b7280',
      }}
    >
      {icon || (
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          style={{ marginBottom: '16px', opacity: 0.5 }}
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      )}
      <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
        {message}
      </p>
      <p style={{ fontSize: '14px', opacity: 0.8 }}>
        {submessage}
      </p>
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default ComponentNodeRenderer;
