/**
 * Extension Points for Website Builder
 * 
 * Extension points allow you to add custom functionality to the builder
 * without modifying the core codebase.
 * 
 * Available extension points:
 * - toolbar: Add buttons to the top toolbar
 * - sidebar: Add panels to the left or right sidebar
 * - panel: Add sections to the properties panel
 * - menu: Add items to context menus
 * - component: Register new component types
 */

import { ReactNode } from 'react';

export type ExtensionType = 'component' | 'toolbar' | 'sidebar' | 'panel' | 'menu';

export interface ExtensionPoint {
  id: string;
  name: string;
  description: string;
  type: ExtensionType;
  location?: string; // e.g., 'toolbar-left', 'sidebar-right', etc.
  render: () => ReactNode;
  order?: number; // For sorting extensions
}

// Extension Registry
class ExtensionRegistry {
  private extensions: Map<string, ExtensionPoint[]> = new Map();
  
  register(extension: ExtensionPoint): void {
    const type = extension.type;
    if (!this.extensions.has(type)) {
      this.extensions.set(type, []);
    }
    const list = this.extensions.get(type)!;
    list.push(extension);
    list.sort((a, b) => (a.order || 0) - (b.order || 0));
  }
  
  unregister(extensionId: string): void {
    for (const [, list] of this.extensions) {
      const index = list.findIndex((e) => e.id === extensionId);
      if (index !== -1) {
        list.splice(index, 1);
        break;
      }
    }
  }
  
  getByType(type: ExtensionType): ExtensionPoint[] {
    return this.extensions.get(type) || [];
  }
  
  getByLocation(location: string): ExtensionPoint[] {
    const all: ExtensionPoint[] = [];
    for (const [, list] of this.extensions) {
      all.push(...list.filter((e) => e.location === location));
    }
    return all.sort((a, b) => (a.order || 0) - (b.order || 0));
  }
  
  getAll(): ExtensionPoint[] {
    const all: ExtensionPoint[] = [];
    for (const [, list] of this.extensions) {
      all.push(...list);
    }
    return all;
  }
}

// Global extension registry instance
export const extensionRegistry = new ExtensionRegistry();

// Example: Toolbar extension
export const createToolbarExtension = (
  id: string,
  name: string,
  render: () => ReactNode,
  order = 0
): ExtensionPoint => ({
  id,
  name,
  description: `Toolbar extension: ${name}`,
  type: 'toolbar',
  location: 'toolbar-right',
  render,
  order,
});

// Example: Sidebar extension
export const createSidebarExtension = (
  id: string,
  name: string,
  render: () => ReactNode,
  location: 'left' | 'right' = 'right',
  order = 0
): ExtensionPoint => ({
  id,
  name,
  description: `Sidebar extension: ${name}`,
  type: 'sidebar',
  location: `sidebar-${location}`,
  render,
  order,
});

// Example: Panel extension
export const createPanelExtension = (
  id: string,
  name: string,
  render: () => ReactNode,
  order = 0
): ExtensionPoint => ({
  id,
  name,
  description: `Panel extension: ${name}`,
  type: 'panel',
  location: 'properties-panel',
  render,
  order,
});

export default extensionRegistry;
