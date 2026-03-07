// Backend Types for Website Builder Platform

import { BuilderComponent, Page as BuilderPage } from '@/types';

// ============================================
// PROJECT TYPES
// ============================================

export interface Project {
  id: string;
  name: string;
  description?: string;
  slug: string;
  thumbnail?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  settings: ProjectSettings;
  deploymentConfig?: DeploymentConfig;
  deployedUrl?: string;
  lastDeployedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  pages: ProjectPage[];
}

export interface ProjectSettings {
  seo: SEOSettings;
  domain?: DomainSettings;
  favicon?: string;
  analytics?: AnalyticsSettings;
  customScripts?: CustomScripts;
}

export interface SEOSettings {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterCard?: string;
  canonicalUrl?: string;
}

export interface DomainSettings {
  customDomain?: string;
  subdomain?: string;
  sslEnabled?: boolean;
}

export interface AnalyticsSettings {
  googleAnalyticsId?: string;
  plausibleDomain?: string;
  customScript?: string;
}

export interface CustomScripts {
  head?: string;
  body?: string;
}

export interface DeploymentConfig {
  autoDeploy?: boolean;
  buildCommand?: string;
  outputDirectory?: string;
  nodeVersion?: string;
  environmentVariables?: Record<string, string>;
}

export interface ProjectPage {
  id: string;
  name: string;
  slug: string;
  path: string;
  isHome: boolean;
  schema: PageSchema;
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// PAGE SCHEMA TYPES
// ============================================

export interface PageSchema {
  components: BuilderComponent[];
  styles?: PageStyles;
  settings?: PageSettings;
}

export interface PageStyles {
  backgroundColor?: string;
  backgroundImage?: string;
  fontFamily?: string;
  customCSS?: string;
}

export interface PageSettings {
  layout?: 'full-width' | 'boxed' | 'fluid';
  headerEnabled?: boolean;
  footerEnabled?: boolean;
  sidebarEnabled?: boolean;
}

// ============================================
// VERSION TYPES
// ============================================

export interface ProjectVersion {
  id: string;
  version: number;
  message?: string;
  snapshot: ProjectSnapshot;
  createdAt: Date;
  createdById?: string;
}

export interface ProjectSnapshot {
  project: Partial<Project>;
  pages: ProjectPage[];
  settings: ProjectSettings;
}

export interface PageVersion {
  id: string;
  version: number;
  message?: string;
  schema: PageSchema;
  createdAt: Date;
  createdById?: string;
}

// ============================================
// COLLABORATION TYPES
// ============================================

export type CollaborationRole = 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';

export interface Collaboration {
  id: string;
  userId: string;
  projectId: string;
  role: CollaborationRole;
  acceptedAt?: Date;
  user?: {
    id: string;
    name?: string;
    email: string;
    image?: string;
  };
}

export interface CollaborationSession {
  id: string;
  projectId: string;
  yjsState?: Uint8Array;
  cursors?: CursorState[];
  updatedAt: Date;
}

export interface CursorState {
  userId: string;
  userName: string;
  color: string;
  x: number;
  y: number;
  selection?: {
    start: number;
    end: number;
    path?: string;
  };
}

// ============================================
// ASSET TYPES
// ============================================

export type AssetType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'FONT' | 'OTHER';
export type StorageProvider = 'local' | 's3' | 'cloudinary' | 'uploadcare';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  url: string;
  thumbnailUrl?: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  storageProvider: StorageProvider;
  storageKey?: string;
  createdAt: Date;
  updatedAt: Date;
  projectId?: string;
  uploadedById?: string;
}

export interface AssetUploadResponse {
  asset: Asset;
  uploadUrl?: string; // For direct uploads
}

// ============================================
// TEMPLATE TYPES
// ============================================

export interface Template {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  category?: string;
  tags: string[];
  schema: TemplateSchema;
  isPremium: boolean;
  price?: number;
  installs: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateSchema {
  pages: TemplatePage[];
  settings?: ProjectSettings;
  components?: BuilderComponent[];
}

export interface TemplatePage {
  name: string;
  slug: string;
  path: string;
  isHome: boolean;
  schema: PageSchema;
  metaTitle?: string;
  metaDescription?: string;
}

// ============================================
// PLUGIN TYPES
// ============================================

export type PluginType = 'COMPONENT' | 'FEATURE' | 'INTEGRATION' | 'THEME' | 'ANALYTICS';

export interface Plugin {
  id: string;
  name: string;
  description?: string;
  version: string;
  type: PluginType;
  manifest: PluginManifest;
  code?: string;
  schema?: PageSchema;
  isPublished: boolean;
  isPremium: boolean;
  price?: number;
  installs: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PluginManifest {
  name: string;
  version: string;
  description?: string;
  author?: string;
  components?: PluginComponent[];
  dependencies?: string[];
  permissions?: string[];
  settings?: PluginSetting[];
}

export interface PluginComponent {
  type: string;
  name: string;
  icon?: string;
  category: string;
  schema: BuilderComponent;
}

export interface PluginSetting {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'color';
  default?: any;
  options?: { label: string; value: any }[];
  required?: boolean;
}

export interface InstalledPlugin {
  id: string;
  pluginId: string;
  projectId: string;
  settings?: Record<string, any>;
  installedAt: Date;
  plugin: Plugin;
}

// ============================================
// API INTEGRATION TYPES
// ============================================

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type ApiAuthType = 'NONE' | 'API_KEY' | 'OAUTH2' | 'BEARER' | 'BASIC';

export interface ApiIntegration {
  id: string;
  name: string;
  description?: string;
  endpoint: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  authType?: ApiAuthType;
  authConfig?: ApiAuthConfig;
  responseMapping?: ResponseMapping;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
}

export interface ApiAuthConfig {
  apiKey?: string;
  tokenUrl?: string;
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  username?: string;
  password?: string;
}

export interface ResponseMapping {
  dataPath?: string; // JSON path to data array
  itemMapping?: Record<string, string>; // Map API fields to component props
}

// ============================================
// DEPLOYMENT TYPES
// ============================================

export type DeploymentStatus = 'PENDING' | 'BUILDING' | 'DEPLOYING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
export type DeploymentEnvironment = 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';

export interface Deployment {
  id: string;
  projectId: string;
  status: DeploymentStatus;
  environment: DeploymentEnvironment;
  vercelId?: string;
  vercelUrl?: string;
  vercelError?: string;
  buildLog?: string;
  buildOutput?: any;
  createdAt: Date;
  updatedAt: Date;
  triggeredById?: string;
}

export interface VercelDeployment {
  id: string;
  url: string;
  alias?: string[];
  state: 'INITIALIZING' | 'BUILDING' | 'DEPLOYING' | 'READY' | 'ERROR' | 'CANCELED';
  createdAt: number;
  readyAt?: number;
  errorCode?: string;
  errorMessage?: string;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  templateId?: string;
  slug?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  settings?: Partial<ProjectSettings>;
  deploymentConfig?: Partial<DeploymentConfig>;
}

export interface CreatePageInput {
  name: string;
  path: string;
  schema?: PageSchema;
  metaTitle?: string;
  metaDescription?: string;
}

export interface UpdatePageInput {
  name?: string;
  path?: string;
  schema?: Partial<PageSchema>;
  metaTitle?: string;
  metaDescription?: string;
  isPublished?: boolean;
}

export interface CreateVersionInput {
  message?: string;
}

export interface InviteCollaboratorInput {
  email: string;
  role: CollaborationRole;
}

// ============================================
// EXPORT TYPES
// ============================================

export interface ExportOptions {
  format: 'static' | 'nextjs' | 'vercel';
  includeAssets?: boolean;
  minify?: boolean;
}

export interface ExportResult {
  success: boolean;
  downloadUrl?: string;
  files?: ExportedFile[];
  error?: string;
}

export interface ExportedFile {
  path: string;
  content: string;
  size: number;
}

// ============================================
// REAL-TIME EVENTS
// ============================================

export type RealtimeEventType =
  | 'page:update'
  | 'component:add'
  | 'component:update'
  | 'component:remove'
  | 'cursor:update'
  | 'presence:update'
  | 'version:create';

export interface RealtimeEvent {
  type: RealtimeEventType;
  projectId: string;
  pageId?: string;
  userId: string;
  userName: string;
  data: any;
  timestamp: number;
}
