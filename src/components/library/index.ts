// Component Library - Main Export & Registry

import { componentRegistry } from '@/lib/component-registry';
import type { ComponentDefinition } from '@/types/builder';

// Import all component categories
import { basicComponents } from './basic';
import { textComponents } from './text';
import { mediaComponents } from './media';
import { layoutComponents } from './layout';
import { formComponents } from './forms';
import { navigationComponents } from './navigation';
import { ecommerceComponents } from './ecommerce';
import { advancedComponents } from './advanced';

// ============================================================================
// ALL COMPONENTS
// ============================================================================

export const allComponents: ComponentDefinition[] = [
  ...basicComponents,
  ...textComponents,
  ...mediaComponents,
  ...layoutComponents,
  ...formComponents,
  ...navigationComponents,
  ...ecommerceComponents,
  ...advancedComponents,
];

// ============================================================================
// REGISTER ALL COMPONENTS
// ============================================================================

export function registerAllComponents(): void {
  componentRegistry.registerMany(allComponents);
}

// Auto-register on import (for convenience)
if (typeof window !== 'undefined') {
  registerAllComponents();
}

// ============================================================================
// EXPORTS BY CATEGORY
// ============================================================================

export { basicComponents } from './basic';
export { textComponents } from './text';
export { mediaComponents } from './media';
export { layoutComponents } from './layout';
export { formComponents } from './forms';
export { navigationComponents } from './navigation';
export { ecommerceComponents } from './ecommerce';
export { advancedComponents } from './advanced';

// Individual component exports
export * from './basic';
export * from './text';
export * from './media';
export * from './layout';
export * from './forms';
export * from './navigation';
export * from './ecommerce';
export * from './advanced';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all components by category
 */
export function getComponentsByCategory(category: string): ComponentDefinition[] {
  return allComponents.filter((comp) => comp.category === category);
}

/**
 * Get a single component by type
 */
export function getComponentByType(type: string): ComponentDefinition | undefined {
  return allComponents.find((comp) => comp.type === type);
}

/**
 * Search components by name or description
 */
export function searchComponents(query: string): ComponentDefinition[] {
  const q = query.toLowerCase();
  return allComponents.filter(
    (comp) =>
      comp.name.toLowerCase().includes(q) ||
      comp.description.toLowerCase().includes(q) ||
      comp.type.toLowerCase().includes(q)
  );
}

/**
 * Get all categories with their component counts
 */
export function getCategories(): { id: string; name: string; count: number; icon: string }[] {
  const categoryMap: Record<string, { name: string; count: number; icon: string }> = {
    basic: { name: 'Basic', count: 0, icon: 'box' },
    text: { name: 'Text', count: 0, icon: 'type' },
    media: { name: 'Media', count: 0, icon: 'image' },
    layout: { name: 'Layout', count: 0, icon: 'layout-template' },
    forms: { name: 'Forms', count: 0, icon: 'form-input' },
    navigation: { name: 'Navigation', count: 0, icon: 'navigation' },
    ecommerce: { name: 'Ecommerce', count: 0, icon: 'shopping-cart' },
    advanced: { name: 'Advanced', count: 0, icon: 'cpu' },
  };

  allComponents.forEach((comp) => {
    if (categoryMap[comp.category]) {
      categoryMap[comp.category].count++;
    }
  });

  return Object.entries(categoryMap).map(([id, data]) => ({
    id,
    ...data,
  }));
}

// ============================================================================
// COMPONENT COUNT
// ============================================================================

export const COMPONENT_COUNT = allComponents.length;
