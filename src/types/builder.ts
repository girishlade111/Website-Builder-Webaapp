// Core Builder Types - Professional Website Builder Architecture

import type { CSSProperties, ReactNode } from 'react';

// ============================================================================
// COMPONENT TREE STRUCTURE
// ============================================================================

/**
 * Base interface for all component nodes in the tree
 */
export interface ComponentNode {
  id: string;
  type: string;
  name: string;
  props: ComponentProps;
  styles: ResponsiveStyles;
  children?: ComponentNode[];
  meta?: ComponentMeta;
}

/**
 * Component metadata for editor-only information
 */
export interface ComponentMeta {
  locked?: boolean;
  hidden?: boolean;
  lockedReason?: string;
  isDraggable?: boolean;
  isDroppable?: boolean;
  allowedChildren?: string[];
  maxChildren?: number;
  description?: string;
  thumbnail?: string;
}

/**
 * Component props (content/data)
 */
export interface ComponentProps {
  // Text content
  text?: string;
  html?: string;
  src?: string;
  alt?: string;
  href?: string;
  placeholder?: string;
  label?: string;
  name?: string;
  value?: string;
  type?: string;
  options?: SelectOption[];
  checked?: boolean;
  required?: boolean;
  disabled?: boolean;
  
  // Heading
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  
  // Media
  images?: string[];
  image?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  poster?: string;
  
  // List
  items?: string[] | CartItem[];
  ordered?: boolean;
  
  // Forms
  formAction?: string;
  formMethod?: 'GET' | 'POST';
  
  // Product
  price?: string;
  productName?: string;
  description?: string;
  sku?: string;
  
  // Code
  code?: string;
  language?: 'html' | 'css' | 'javascript' | 'jsx' | 'typescript';
  
  // Navigation
  links?: NavLink[];
  
  // Tabs
  tabs?: TabItem[];
  
  // Accordion
  accordionItems?: AccordionItem[];
  
  // Cards
  cardData?: CardData[];
  
  // Grid/Columns
  columns?: number | FooterColumn[];
  gap?: string;
  
  // API
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  
  // Custom
  className?: string;
  id?: string;

  // Any additional props
  [key: string]: unknown;
}

/**
 * Helper types for props
 */
export interface SelectOption {
  label: string;
  value: string;
}

export interface NavLink {
  label: string;
  href: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  icon?: string;
  children?: NavLink[];
}

export interface TabItem {
  label: string;
  content: string;
  icon?: string;
}

export interface AccordionItem {
  title: string;
  content: string;
  expanded?: boolean;
  icon?: string;
}

export interface CardData {
  title: string;
  description?: string;
  image?: string;
  href?: string;
  price?: string;
  badge?: string;
  [key: string]: unknown;
}

export interface CartItem {
  name: string;
  price: number;
  quantity: number;
  image: string;
  [key: string]: unknown;
}

export interface FooterColumn {
  title: string;
  links: Array<{ label: string; href: string }>;
  [key: string]: unknown;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: string;
  [key: string]: unknown;
}

// ============================================================================
// RESPONSIVE STYLES SYSTEM
// ============================================================================

/**
 * Responsive styles - different values per device
 */
export interface ResponsiveStyles {
  base: CSSProperties;
  tablet?: CSSProperties;
  mobile?: CSSProperties;
}

/**
 * Device type for responsive preview
 */
export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export interface DevicePreset {
  type: DeviceType;
  label: string;
  width: number;
  height: number;
  icon: string;
}

export const DEVICE_PRESETS: Record<DeviceType, DevicePreset> = {
  desktop: { type: 'desktop', label: 'Desktop', width: 1440, height: 900, icon: 'monitor' },
  tablet: { type: 'tablet', label: 'Tablet', width: 768, height: 1024, icon: 'tablet' },
  mobile: { type: 'mobile', label: 'Mobile', width: 375, height: 812, icon: 'smartphone' },
};

// ============================================================================
// PAGE STRUCTURE
// ============================================================================

/**
 * A page contains a root component node
 */
export interface Page {
  id: string;
  name: string;
  slug: string;
  root: ComponentNode;
  meta?: PageMeta;
  settings?: PageSettings;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PageMeta {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

export interface PageSettings {
  customHead?: string;
  customBody?: string;
  layout?: string;
  template?: string;
}

// ============================================================================
// COMPONENT REGISTRY
// ============================================================================

export type ComponentCategory = 
  | 'basic'
  | 'text'
  | 'media'
  | 'layout'
  | 'forms'
  | 'ecommerce'
  | 'navigation'
  | 'advanced'
  | 'custom';

export interface ComponentDefinition {
  type: string;
  name: string;
  category: ComponentCategory;
  description: string;
  icon: string;
  thumbnail?: string;
  defaultProps: ComponentProps;
  defaultStyles: CSSProperties;
  meta?: ComponentMeta;
  render: (props: ComponentRenderProps) => ReactNode;
}

export interface ComponentRenderProps {
  node: ComponentNode;
  styles: CSSProperties;
  children?: ReactNode;
  isSelected?: boolean;
  isPreviewMode?: boolean;
  onSelect?: (id: string) => void;
}

/**
 * Component registry type
 */
export type ComponentRegistry = Map<string, ComponentDefinition>;

// ============================================================================
// TEMPLATES
// ============================================================================

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  tags: string[];
  pages: Page[];
  isPremium?: boolean;
  price?: number;
  author?: string;
  downloads?: number;
  rating?: number;
}

// ============================================================================
// PROJECT STRUCTURE
// ============================================================================

export interface Project {
  id: string;
  name: string;
  description?: string;
  slug: string;
  pages: Page[];
  templates?: Template[];
  assets: Asset[];
  settings: ProjectSettings;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  status: 'draft' | 'published' | 'archived';
}

export interface ProjectSettings {
  siteName?: string;
  siteDescription?: string;
  favicon?: string;
  customDomain?: string;
  analytics?: AnalyticsConfig;
  seo?: SEOConfig;
  colors?: ColorPalette;
  fonts?: FontConfig;
}

export interface AnalyticsConfig {
  googleAnalyticsId?: string;
  plausibleDomain?: string;
  customScript?: string;
}

export interface SEOConfig {
  defaultTitle?: string;
  defaultDescription?: string;
  defaultOgImage?: string;
  twitterHandle?: string;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
}

export interface FontConfig {
  heading?: string;
  body?: string;
  mono?: string;
}

// ============================================================================
// ASSETS
// ============================================================================

export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'font' | 'other';
  url: string;
  storageKey: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  createdAt: Date;
  updatedAt: Date;
  alt?: string;
  tags?: string[];
}

// ============================================================================
// HISTORY & VERSIONING
// ============================================================================

export interface HistoryEntry {
  id: string;
  projectId: string;
  pageId?: string;
  action: HistoryAction;
  timestamp: Date;
  snapshot: unknown;
  description?: string;
}

export type HistoryAction =
  | 'create_page'
  | 'delete_page'
  | 'update_page'
  | 'add_component'
  | 'remove_component'
  | 'update_component'
  | 'move_component'
  | 'duplicate_component'
  | 'update_styles'
  | 'update_props'
  | 'publish'
  | 'unpublish';

// ============================================================================
// PLUGIN SYSTEM
// ============================================================================

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
  
  // Register components
  components?: ComponentDefinition[];
  
  // Register templates
  templates?: Template[];
  
  // Lifecycle hooks
  hooks?: {
    onInit?: () => void | Promise<void>;
    onComponentAdd?: (node: ComponentNode) => void;
    onComponentUpdate?: (node: ComponentNode) => void;
    onComponentRemove?: (nodeId: string) => void;
    onPageSave?: (page: Page) => void;
    onPagePublish?: (page: Page) => void;
    onProjectExport?: (project: Project) => void;
  };
  
  // UI Extensions
  extensions?: {
    toolbar?: ReactNode;
    sidebar?: ReactNode;
    propertiesPanel?: ReactNode;
    settingsPanel?: ReactNode;
  };
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type ExportFormat = 'nextjs' | 'static' | 'react' | 'html';

export interface ExportOptions {
  format: ExportFormat;
  includeAssets: boolean;
  minify: boolean;
  optimize: boolean;
}

export interface ExportResult {
  success: boolean;
  url?: string;
  files?: ExportedFile[];
  error?: string;
}

export interface ExportedFile {
  path: string;
  content: string;
  size: number;
}

// ============================================================================
// DEPLOYMENT
// ============================================================================

export interface DeploymentConfig {
  provider: 'vercel' | 'netlify' | 'cloudflare' | 'custom';
  projectName: string;
  environment: 'production' | 'preview' | 'development';
  customDomain?: string;
  envVars?: Record<string, string>;
}

export interface Deployment {
  id: string;
  projectId: string;
  status: 'pending' | 'building' | 'ready' | 'error';
  url?: string;
  previewUrl?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  triggeredBy: string;
}

// ============================================================================
// BUILDER STATE
// ============================================================================

export interface BuilderState {
  // Current context
  project: Project | null;
  currentPage: Page | null;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  
  // UI State
  deviceType: DeviceType;
  isPreviewMode: boolean;
  isCodeEditorOpen: boolean;
  codeEditorTab: 'jsx' | 'css' | 'json';
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  leftSidebarTab: 'components' | 'assets' | 'pages';
  rightSidebarTab: 'properties' | 'styles' | 'advanced';
  
  // History
  history: HistoryEntry[];
  historyIndex: number;
  
  // Drag state
  draggedNode: ComponentNode | null;
  dragOverId: string | null;
  dragPosition: 'before' | 'after' | 'inside' | null;
  
  // Clipboard
  clipboard: ComponentNode | null;
  
  // Settings
  showGrid: boolean;
  showGuides: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P];
};

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends (infer U)[]
    ? readonly DeepReadonly<U>[]
    : T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};
