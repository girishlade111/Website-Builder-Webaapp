// Component Registry - Central registration system for all builder components

import type { ComponentDefinition, ComponentRegistry, ComponentNode, ComponentProps, ComponentRenderProps } from '@/types/builder';
import { createElement, ReactNode } from 'react';

// ============================================================================
// COMPONENT REGISTRY CLASS
// ============================================================================

export class ComponentRegistryManager {
  private registry: ComponentRegistry = new Map();
  private fallbackComponent: ComponentDefinition | null = null;

  /**
   * Register a single component
   */
  register(definition: ComponentDefinition): void {
    if (this.registry.has(definition.type)) {
      console.warn(`Component "${definition.type}" is already registered. Overwriting.`);
    }
    this.registry.set(definition.type, definition);
  }

  /**
   * Register multiple components at once
   */
  registerMany(definitions: ComponentDefinition[]): void {
    definitions.forEach(def => this.register(def));
  }

  /**
   * Get a component definition by type
   */
  get(type: string): ComponentDefinition | undefined {
    return this.registry.get(type);
  }

  /**
   * Get all component definitions
   */
  getAll(): ComponentDefinition[] {
    return Array.from(this.registry.values());
  }

  /**
   * Get components by category
   */
  getByCategory(category: string): ComponentDefinition[] {
    return this.getAll().filter(def => def.category === category);
  }

  /**
   * Check if a component is registered
   */
  has(type: string): boolean {
    return this.registry.has(type);
  }

  /**
   * Unregister a component
   */
  unregister(type: string): boolean {
    return this.registry.delete(type);
  }

  /**
   * Set fallback component for unknown types
   */
  setFallback(component: ComponentDefinition): void {
    this.fallbackComponent = component;
  }

  /**
   * Get fallback component
   */
  getFallback(): ComponentDefinition | null {
    return this.fallbackComponent;
  }

  /**
   * Render a component node
   */
  render(node: ComponentNode, props: Omit<ComponentRenderProps, 'node' | 'styles'>): ReactNode {
    const definition = this.registry.get(node.type);
    
    if (!definition) {
      if (this.fallbackComponent) {
        return this.fallbackComponent.render({
          node,
          styles: this.mergeStyles(node.styles),
          ...props,
        });
      }
      
      // Default fallback
      return (
        <div style={{ 
          padding: '20px', 
          border: '2px dashed #ef4444', 
          backgroundColor: '#fef2f2',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#dc2626', fontWeight: '600', marginBottom: '8px' }}>
            Unknown Component: {node.type}
          </p>
          <p style={{ color: '#991b1b', fontSize: '14px' }}>
            This component type is not registered in the component registry.
          </p>
        </div>
      );
    }

    return definition.render({
      node,
      styles: this.mergeStyles(node.styles),
      ...props,
    });
  }

  /**
   * Merge responsive styles based on current device
   */
  private mergeStyles(styles: ComponentNode['styles']): React.CSSProperties {
    const { base, tablet, mobile } = styles;
    // For now, just return base - responsive merging happens in the renderer
    return base;
  }

  /**
   * Clear all registered components
   */
  clear(): void {
    this.registry.clear();
  }

  /**
   * Get registry size
   */
  size(): number {
    return this.registry.size;
  }

  /**
   * Export registry as JSON (for plugins)
   */
  export(): Record<string, unknown> {
    const exportData: Record<string, unknown> = {};
    
    this.registry.forEach((def, type) => {
      exportData[type] = {
        type: def.type,
        name: def.name,
        category: def.category,
        description: def.description,
        icon: def.icon,
        defaultProps: def.defaultProps,
        defaultStyles: def.defaultStyles,
        meta: def.meta,
      };
    });

    return exportData;
  }
}

// ============================================================================
// GLOBAL REGISTRY INSTANCE
// ============================================================================

export const componentRegistry = new ComponentRegistryManager();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a component definition with sensible defaults
 */
export function createComponentDefinition(
  config: Omit<ComponentDefinition, 'render'> & {
    render: (props: ComponentRenderProps) => ReactNode;
  }
): ComponentDefinition {
  return {
    type: config.type,
    name: config.name,
    category: config.category,
    description: config.description,
    icon: config.icon,
    thumbnail: config.thumbnail,
    defaultProps: config.defaultProps,
    defaultStyles: config.defaultStyles,
    meta: {
      isDraggable: true,
      isDroppable: true,
      allowedChildren: [],
      ...config.meta,
    },
    render: config.render,
  };
}

/**
 * Default fallback component
 */
export const FallbackComponent: ComponentDefinition = {
  type: 'unknown',
  name: 'Unknown Component',
  category: 'basic',
  description: 'Fallback for unregistered components',
  icon: 'alert-circle',
  defaultProps: {},
  defaultStyles: {
    padding: '20px',
    border: '2px dashed #ef4444',
    backgroundColor: '#fef2f2',
    borderRadius: '8px',
  },
  render: ({ node }) => (
    <div style={{ 
      padding: '20px', 
      border: '2px dashed #ef4444', 
      backgroundColor: '#fef2f2',
      borderRadius: '8px',
      textAlign: 'center'
    }}>
      <p style={{ color: '#dc2626', fontWeight: '600', marginBottom: '8px' }}>
        Unknown Component: {node.type}
      </p>
      <p style={{ color: '#991b1b', fontSize: '14px' }}>
        Component type "{node.type}" is not registered.
      </p>
    </div>
  ),
};

// Set as default fallback
componentRegistry.setFallback(FallbackComponent);
