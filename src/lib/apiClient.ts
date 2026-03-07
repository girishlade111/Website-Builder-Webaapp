// API Client - Frontend integration for all backend endpoints

const API_BASE = '/api';

// Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  slug: string;
  thumbnail?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  settings?: any;
  deploymentConfig?: any;
  deployedUrl?: string;
  lastDeployedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  pages?: Page[];
  collaborations?: Collaboration[];
  assets?: Asset[];
}

export interface Page {
  id: string;
  name: string;
  slug: string;
  path: string;
  isHome: boolean;
  schema: any;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
  versions?: PageVersion[];
}

export interface PageVersion {
  id: string;
  version: number;
  message?: string;
  schema: any;
  createdAt: Date;
  pageId: string;
  createdById?: string;
}

export interface ProjectVersion {
  id: string;
  version: number;
  message?: string;
  snapshot: any;
  createdAt: Date;
  projectId: string;
  createdById?: string;
}

export interface Collaboration {
  id: string;
  role: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';
  invitedAt: Date;
  acceptedAt?: Date;
  userId: string;
  projectId: string;
  user?: User;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'FONT' | 'OTHER';
  url: string;
  thumbnailUrl?: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  storageProvider: string;
  storageKey?: string;
  createdAt: Date;
  updatedAt: Date;
  projectId?: string;
  uploadedById?: string;
  uploadedBy?: User;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  category?: string;
  tags: string[];
  schema: any;
  isPublished: boolean;
  isPremium: boolean;
  price?: number;
  installs: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Plugin {
  id: string;
  name: string;
  description?: string;
  version: string;
  type: 'COMPONENT' | 'FEATURE' | 'INTEGRATION' | 'THEME' | 'ANALYTICS';
  manifest?: any;
  code?: string;
  schema?: any;
  isPublished: boolean;
  isPremium: boolean;
  price?: number;
  installs: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiIntegration {
  id: string;
  name: string;
  description?: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  authType?: 'NONE' | 'API_KEY' | 'OAUTH2' | 'BEARER' | 'BASIC';
  authConfig?: any;
  responseMapping?: any;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
}

export interface Deployment {
  id: string;
  status: 'PENDING' | 'BUILDING' | 'DEPLOYING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  environment: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
  vercelId?: string;
  vercelUrl?: string;
  vercelError?: string;
  buildLog?: string;
  buildOutput?: any;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
  triggeredById?: string;
  triggeredBy?: User;
}

export interface ProjectSettings {
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
    ogTitle?: string;
    ogDescription?: string;
    twitterCard?: 'summary' | 'summary_large_image';
    robots?: string;
    canonical?: string;
    favicon?: string;
  };
  domain: {
    customDomain?: string;
    redirectWww?: boolean;
    forceHttps?: boolean;
  };
  analytics: {
    googleAnalyticsId?: string;
    plausibleDomain?: string;
    umamiWebsiteId?: string;
    customScript?: string;
  };
  scripts: {
    headScripts?: string[];
    bodyScripts?: string[];
  };
  social: {
    twitterHandle?: string;
    facebookAppId?: string;
    linkedInInsightId?: string;
  };
}

// API Response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Helper functions
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  
  return data;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  return handleResponse<T>(response);
}

// ============================================
// PROJECTS API
// ============================================

export const projectsApi = {
  // List projects
  list: async (params?: {
    status?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
    
    const query = searchParams.toString();
    return request<{ items: Project[]; total: number; page: number; totalPages: number }>(
      `/projects${query ? `?${query}` : ''}`
    );
  },

  // Get project by ID
  getById: async (id: string) => {
    return request<{ project: Project }>(`/projects/${id}`);
  },

  // Create project
  create: async (data: {
    name: string;
    description?: string;
    templateId?: string;
    slug?: string;
  }) => {
    return request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update project
  update: async (id: string, data: Partial<Project>) => {
    return request<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete project
  delete: async (id: string) => {
    return request(`/projects/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// PAGES API
// ============================================

export const pagesApi = {
  // List pages
  list: async (projectId: string) => {
    return request<Page[]>(`/projects/${projectId}/pages`);
  },

  // Get page by ID
  getById: async (projectId: string, pageId: string) => {
    return request<Page>(`/projects/${projectId}/pages/${pageId}`);
  },

  // Create page
  create: async (projectId: string, data: {
    name: string;
    slug?: string;
    path?: string;
    schema?: any;
    metaTitle?: string;
    metaDescription?: string;
  }) => {
    return request<Page>(`/projects/${projectId}/pages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update page
  update: async (projectId: string, pageId: string, data: Partial<Page> & { versionMessage?: string }) => {
    return request<Page>(`/projects/${projectId}/pages/${pageId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete page
  delete: async (projectId: string, pageId: string) => {
    return request(`/projects/${projectId}/pages/${pageId}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// VERSIONS API
// ============================================

export const versionsApi = {
  // List versions
  list: async (projectId: string) => {
    return request<ProjectVersion[]>(`/projects/${projectId}/versions`);
  },

  // Create version
  create: async (projectId: string, message?: string) => {
    return request<ProjectVersion>(`/projects/${projectId}/versions`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  // Rollback to version
  rollback: async (projectId: string, versionId: string) => {
    return request(`/projects/${projectId}/versions/${versionId}/rollback`, {
      method: 'POST',
    });
  },
};

// ============================================
// ASSETS API
// ============================================

export const assetsApi = {
  // List assets
  list: async (projectId: string, type?: string) => {
    const query = type ? `?type=${type}` : '';
    return request<Asset[]>(`/projects/${projectId}/assets${query}`);
  },

  // Upload asset
  upload: async (projectId: string, file: File, name?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);

    const response = await fetch(`${API_BASE}/projects/${projectId}/assets`, {
      method: 'POST',
      body: formData,
    });

    return handleResponse<Asset>(response);
  },

  // Delete asset (not implemented yet, would need a DELETE endpoint)
  delete: async (projectId: string, assetId: string) => {
    // TODO: Implement delete endpoint
    throw new Error('Not implemented');
  },
};

// ============================================
// COLLABORATORS API
// ============================================

export const collaboratorsApi = {
  // List collaborators
  list: async (projectId: string) => {
    return request<{ user: User; role: string; invitedAt: Date; acceptedAt?: Date }[]>(
      `/projects/${projectId}/collaborators`
    );
  },

  // Invite collaborator
  invite: async (projectId: string, email: string, role: 'EDITOR' | 'VIEWER' | 'ADMIN' = 'EDITOR') => {
    return request<Collaboration>(`/projects/${projectId}/collaborators`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  },

  // Update role
  updateRole: async (projectId: string, userId: string, role: string) => {
    return request<Collaboration>(`/projects/${projectId}/collaborators/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  // Remove collaborator
  remove: async (projectId: string, userId: string) => {
    return request(`/projects/${projectId}/collaborators/${userId}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// DEPLOYMENTS API
// ============================================

export const deploymentsApi = {
  // List deployments
  list: async (projectId: string) => {
    return request<Deployment[]>(`/projects/${projectId}/deployments`);
  },

  // Create deployment
  create: async (projectId: string, environment: 'PRODUCTION' | 'STAGING' | 'DEVELOPMENT' = 'PRODUCTION') => {
    return request<Deployment>(`/projects/${projectId}/deployments`, {
      method: 'POST',
      body: JSON.stringify({ environment }),
    });
  },
};

// ============================================
// EXPORT API
// ============================================

export const exportApi = {
  // Export project
  export: async (projectId: string, format: 'nextjs' | 'static' = 'nextjs') => {
    const response = await fetch(`${API_BASE}/projects/${projectId}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ format }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Export failed');
    }

    // Return blob for download
    const blob = await response.blob();
    return {
      blob,
      filename: response.headers.get('content-disposition')?.split('filename=')[1] || `${projectId}-export.zip`,
    };
  },
};

// ============================================
// TEMPLATES API
// ============================================

export const templatesApi = {
  // List templates
  list: async (params?: {
    category?: string;
    tags?: string[];
    premium?: boolean;
    search?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.tags) searchParams.set('tags', params.tags.join(','));
    if (params?.premium !== undefined) searchParams.set('premium', String(params.premium));
    if (params?.search) searchParams.set('search', params.search);

    const query = searchParams.toString();
    return request<Template[]>(`/templates${query ? `?${query}` : ''}`);
  },

  // Create template
  create: async (data: {
    name: string;
    description?: string;
    thumbnail?: string;
    category?: string;
    tags?: string[];
    schema: any;
    isPremium?: boolean;
    price?: number;
  }) => {
    return request<Template>('/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============================================
// PLUGINS API
// ============================================

export const pluginsApi = {
  // List plugins
  list: async (params?: {
    type?: string;
    premium?: boolean;
    search?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    if (params?.premium !== undefined) searchParams.set('premium', String(params.premium));
    if (params?.search) searchParams.set('search', params.search);

    const query = searchParams.toString();
    return request<Plugin[]>(`/plugins${query ? `?${query}` : ''}`);
  },

  // Create plugin
  create: async (data: {
    name: string;
    description?: string;
    version?: string;
    type: string;
    manifest?: any;
    code?: string;
    schema?: any;
    isPremium?: boolean;
    price?: number;
  }) => {
    return request<Plugin>('/plugins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============================================
// COLLABORATION API
// ============================================

export const collaborationApi = {
  // Get collaboration state
  getState: async (projectId: string) => {
    return request<{
      sessionId?: string;
      yjsState?: number[];
      cursors: Record<string, any>;
      collaborators: any[];
    }>(`/collaboration/${projectId}`);
  },

  // Update collaboration state
  updateState: async (projectId: string, data: {
    yjsUpdate?: number[];
    cursor?: { x: number; y: number; selection?: any };
    presence?: any;
  }) => {
    return request<{
      sessionId: string;
      cursors: Record<string, any>;
      timestamp: number;
    }>(`/collaboration/${projectId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============================================
// API INTEGRATIONS API
// ============================================

export const apiIntegrationsApi = {
  // List integrations
  list: async (projectId: string) => {
    return request<ApiIntegration[]>(`/projects/${projectId}/api-integrations`);
  },

  // Get integration
  getById: async (projectId: string, integrationId: string) => {
    return request<ApiIntegration>(`/projects/${projectId}/api-integrations/${integrationId}`);
  },

  // Create integration
  create: async (projectId: string, data: {
    name: string;
    endpoint: string;
    method?: string;
    headers?: Record<string, string>;
    authType?: string;
    authConfig?: any;
    responseMapping?: any;
  }) => {
    return request<ApiIntegration>(`/projects/${projectId}/api-integrations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update integration
  update: async (projectId: string, integrationId: string, data: Partial<ApiIntegration>) => {
    return request<ApiIntegration>(`/projects/${projectId}/api-integrations/${integrationId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete integration
  delete: async (projectId: string, integrationId: string) => {
    return request(`/projects/${projectId}/api-integrations/${integrationId}`, {
      method: 'DELETE',
    });
  },

  // Test integration
  test: async (projectId: string, integrationId: string, testParams?: any, testBody?: any) => {
    return request<{
      request: any;
      response: {
        success: boolean;
        status?: number;
        data?: any;
        error?: string;
      };
    }>(`/projects/${projectId}/api-integrations/${integrationId}/test`, {
      method: 'POST',
      body: JSON.stringify({ testParams, testBody }),
    });
  },
};

// ============================================
// PROJECT SETTINGS API
// ============================================

export const projectSettingsApi = {
  // Get settings
  get: async (projectId: string) => {
    return request<ProjectSettings>(`/projects/${projectId}/settings`);
  },

  // Update settings
  update: async (projectId: string, settings: Partial<ProjectSettings>) => {
    return request<ProjectSettings>(`/projects/${projectId}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  // Update SEO settings
  updateSeo: async (projectId: string, seo: Partial<ProjectSettings['seo']>) => {
    return request<ProjectSettings['seo']>(`/projects/${projectId}/settings/seo`, {
      method: 'PUT',
      body: JSON.stringify({ seo }),
    });
  },

  // Update domain settings
  updateDomain: async (projectId: string, domain: Partial<ProjectSettings['domain']>) => {
    return request<ProjectSettings['domain']>(`/projects/${projectId}/settings/domain`, {
      method: 'PUT',
      body: JSON.stringify({ domain }),
    });
  },

  // Update analytics settings
  updateAnalytics: async (projectId: string, analytics: Partial<ProjectSettings['analytics']>) => {
    return request<ProjectSettings['analytics']>(`/projects/${projectId}/settings/analytics`, {
      method: 'PUT',
      body: JSON.stringify({ analytics }),
    });
  },
};

// Export all APIs as default
export default {
  projects: projectsApi,
  pages: pagesApi,
  versions: versionsApi,
  assets: assetsApi,
  collaborators: collaboratorsApi,
  deployments: deploymentsApi,
  export: exportApi,
  templates: templatesApi,
  plugins: pluginsApi,
  collaboration: collaborationApi,
  apiIntegrations: apiIntegrationsApi,
  projectSettings: projectSettingsApi,
};
