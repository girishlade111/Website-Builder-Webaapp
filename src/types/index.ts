// ============================================================================
// LEGACY TYPES (for backward compatibility)
// New architecture uses types from ./builder.ts
// ============================================================================

// Component Categories
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

// Export new builder types
export * from './builder';

// Component Types
export type ComponentType =
  // Basic
  | 'section'
  | 'container'
  | 'divider'
  | 'spacer'
  // Text
  | 'heading'
  | 'paragraph'
  | 'subheading'
  | 'list'
  | 'quote'
  // Media
  | 'image'
  | 'video'
  | 'gallery'
  | 'backgroundVideo'
  // Layout
  | 'hero'
  | 'grid'
  | 'columns'
  | 'cards'
  | 'tabs'
  | 'accordion'
  // Forms
  | 'input'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'loginForm'
  | 'signupForm'
  | 'contactForm'
  // Ecommerce
  | 'productCard'
  | 'productGrid'
  | 'shoppingCart'
  | 'checkout'
  | 'paymentBlock'
  // Navigation
  | 'navbar'
  | 'sidebarNav'
  | 'breadcrumbs'
  // Advanced
  | 'html'
  | 'customCode'
  | 'apiComponent';

// Style Properties
export interface StyleProperties {
  // Layout
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  display?: 'block' | 'inline' | 'inline-block' | 'flex' | 'grid' | 'none';
  alignItems?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: string;
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridColumn?: string;
  gridRow?: string;
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number;
  
  // Style
  backgroundColor?: string;
  color?: string;
  fontSize?: string;
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontFamily?: string;
  fontStyle?: 'normal' | 'italic' | 'oblique';
  fontVariant?: 'normal' | 'small-caps';
  textDecoration?: 'none' | 'underline' | 'overline' | 'line-through';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: string;
  letterSpacing?: string;
  border?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderColor?: string;
  borderWidth?: string;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
  borderRadius?: string;
  borderTopLeftRadius?: string;
  borderTopRightRadius?: string;
  borderBottomLeftRadius?: string;
  borderBottomRightRadius?: string;
  boxShadow?: string;
  opacity?: number;
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowX?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowY?: 'visible' | 'hidden' | 'scroll' | 'auto';
  
  // Advanced
  customCSS?: string;
  className?: string;
  id?: string;
  
  // Responsive visibility
  hideOnDesktop?: boolean;
  hideOnTablet?: boolean;
  hideOnMobile?: boolean;
}

// Content Properties (varies by component type)
export interface ContentProperties {
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
  options?: { label: string; value: string }[];
  checked?: boolean;
  required?: boolean;
  disabled?: boolean;

  // Heading
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  
  // Image/Media
  images?: string[];
  image?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  
  // List
  items?: string[];
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
  links?: { label: string; href: string }[];
  
  // Tabs
  tabs?: { label: string; content: string }[];
  
  // Accordion
  accordionItems?: { title: string; content: string; expanded?: boolean }[];
  
  // Cards
  cardData?: { title: string; description: string; image?: string; href?: string }[];
  
  // Grid/Columns
  columns?: number;
  gap?: string;
  
  // API
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
}

// Base Component Interface
export interface BuilderComponent {
  id: string;
  type: ComponentType;
  category: ComponentCategory;
  name: string;
  styles: StyleProperties;
  content: ContentProperties;
  children?: BuilderComponent[];
  locked?: boolean;
  hidden?: boolean;
}

// Page Structure
export interface PageSection {
  id: string;
  name: string;
  components: BuilderComponent[];
  styles?: StyleProperties;
}

export interface Page {
  id: string;
  name: string;
  slug: string;
  sections: PageSection[];
  meta?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

// Template
export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  pages: Page[];
}

// Device Types
export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export interface DevicePreset {
  type: DeviceType;
  width: number;
  height: number;
  label: string;
  icon: string;
}

// Builder State
export interface BuilderState {
  currentPage: Page | null;
  selectedComponentId: string | null;
  selectedSectionId: string | null;
  deviceType: DeviceType;
  isPreviewMode: boolean;
  isCodeEditorOpen: boolean;
  codeEditorTab: 'html' | 'css' | 'jsx';
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  history: Page[];
  historyIndex: number;
  draggedComponent: BuilderComponent | null;
}

// Component Library Item
export interface ComponentLibraryItem {
  type: ComponentType;
  category: ComponentCategory;
  name: string;
  description: string;
  icon: string;
  defaultStyles: StyleProperties;
  defaultContent: ContentProperties;
}

// Action Types
export type BuilderAction =
  | { type: 'SET_PAGE'; payload: Page }
  | { type: 'SELECT_COMPONENT'; payload: string | null }
  | { type: 'SELECT_SECTION'; payload: string | null }
  | { type: 'SET_DEVICE_TYPE'; payload: DeviceType }
  | { type: 'TOGGLE_PREVIEW_MODE'; payload?: boolean }
  | { type: 'TOGGLE_CODE_EDITOR'; payload?: boolean }
  | { type: 'SET_CODE_EDITOR_TAB'; payload: 'html' | 'css' | 'jsx' }
  | { type: 'TOGGLE_LEFT_SIDEBAR'; payload?: boolean }
  | { type: 'TOGGLE_RIGHT_SIDEBAR'; payload?: boolean }
  | { type: 'UPDATE_COMPONENT_STYLES'; payload: { componentId: string; styles: Partial<StyleProperties> } }
  | { type: 'UPDATE_COMPONENT_CONTENT'; payload: { componentId: string; content: Partial<ContentProperties> } }
  | { type: 'ADD_COMPONENT'; payload: { component: BuilderComponent; sectionId: string; index?: number } }
  | { type: 'REMOVE_COMPONENT'; payload: { componentId: string } }
  | { type: 'MOVE_COMPONENT'; payload: { componentId: string; toSectionId: string; index: number } }
  | { type: 'DUPLICATE_COMPONENT'; payload: { componentId: string } }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_DRAGGED_COMPONENT'; payload: BuilderComponent | null }
  | { type: 'SAVE_PAGE' }
  | { type: 'PUBLISH_PAGE' };

// Plugin Interface (for future extension)
export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  components?: ComponentLibraryItem[];
  hooks?: {
    onComponentAdd?: (component: BuilderComponent) => void;
    onComponentRemove?: (componentId: string) => void;
    onComponentUpdate?: (component: BuilderComponent) => void;
    onPageSave?: (page: Page) => void;
    onPagePublish?: (page: Page) => void;
  };
}

// Extension Point
export interface ExtensionPoint {
  id: string;
  name: string;
  description: string;
  type: 'component' | 'toolbar' | 'sidebar' | 'panel' | 'menu';
  render: () => React.ReactNode;
}
