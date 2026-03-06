/**
 * Plugin System for Website Builder
 * 
 * This folder contains the plugin architecture for extending the builder.
 * Plugins can add:
 * - New components
 * - Custom toolbar actions
 * - Additional sidebars
 * - Property panel extensions
 * - Build/deployment hooks
 * 
 * Example plugin structure:
 * 
 * /plugins/my-plugin/
 *   ├── index.ts          # Plugin entry point
 *   ├── components/       # Custom components
 *   ├── hooks/           # Custom hooks
 *   └── package.json     # Plugin metadata
 */

import { Plugin, BuilderComponent, Page } from '@/types';

// Plugin Registry
class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map();
  
  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin "${plugin.id}" is already registered`);
      return;
    }
    this.plugins.set(plugin.id, plugin);
    console.log(`Plugin "${plugin.name}" v${plugin.version} registered`);
  }
  
  unregister(pluginId: string): void {
    this.plugins.delete(pluginId);
  }
  
  get(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }
  
  getAll(): Plugin[] {
    return Array.from(this.plugins.values());
  }
  
  // Get all components from all plugins
  getPluginComponents() {
    const components: Plugin['components'] = [];
    for (const plugin of this.plugins.values()) {
      if (plugin.components) {
        components.push(...plugin.components);
      }
    }
    return components;
  }
  
  // Trigger hooks
  triggerHook<T extends keyof NonNullable<Plugin['hooks']>>(
    hookName: T,
    ...args: Parameters<Exclude<NonNullable<Plugin['hooks']>[T], undefined>>
  ): void {
    for (const plugin of this.plugins.values()) {
      const hook = plugin.hooks?.[hookName];
      if (hook && typeof hook === 'function') {
        try {
          (hook as Function)(...args);
        } catch (error) {
          console.error(`Error in plugin "${plugin.name}" hook "${hookName}":`, error);
        }
      }
    }
  }
}

// Global plugin registry instance
export const pluginRegistry = new PluginRegistry();

// Base plugin class for easier plugin creation
export abstract class BasePlugin implements Plugin {
  abstract id: string;
  abstract name: string;
  abstract version: string;
  abstract description: string;
  components?: Plugin['components'];
  hooks?: Plugin['hooks'];
  
  register(): void {
    pluginRegistry.register(this);
  }
  
  unregister(): void {
    pluginRegistry.unregister(this.id);
  }
}

// Example plugin
export class ExamplePlugin extends BasePlugin {
  id = 'example-plugin';
  name = 'Example Plugin';
  version = '1.0.0';
  description = 'An example plugin demonstrating the plugin system';

  components = [
    {
      type: 'html' as const,
      category: 'advanced' as const,
      name: 'Custom HTML',
      description: 'A custom HTML component from a plugin',
      icon: 'star',
      defaultStyles: {
        padding: '20px',
        backgroundColor: '#f0f0f0',
      },
      defaultContent: {
        html: '<div>Hello from plugin!</div>',
      },
    },
  ];

  hooks = {
    onComponentAdd: (component: BuilderComponent) => {
      console.log('Component added:', component);
    },
    onPageSave: (page: Page) => {
      console.log('Page saved:', page.name);
    },
  };
}

// Auto-register example plugin (remove in production)
// new ExamplePlugin().register();

export default pluginRegistry;
