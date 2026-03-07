// API Client for Frontend Integration
// Provides type-safe methods for all backend endpoints
// Falls back to mock data when backend is not available

import type {
  Project,
  ProjectVersion,
  Collaboration,
  Asset,
  Template,
  Plugin,
  InstalledPlugin,
  ApiIntegration,
  Deployment,
  ProjectSettings,
  ApiResponse,
  PaginatedResponse,
  CreateProjectInput,
  UpdateProjectInput,
  CreatePageInput,
  UpdatePageInput,
  ExportOptions,
  ExportResult,
  BuilderPage as Page
} from '@/types/backend';

// Import mock data for demo mode (no backend required)
import { mockProjectsApi, mockTemplatesApi } from './mockData';

// Check if backend is available
let backendAvailable: boolean | null = null;

async function checkBackendAvailability(): Promise<boolean> {
  if (backendAvailable !== null) {
    return backendAvailable;
  }
  
  try {
    // Try to reach the backend API
    const response = await fetch('/api/health', { method: 'HEAD' });
    backendAvailable = response.ok;
  } catch {
    backendAvailable = false;
  }
  
  return backendAvailable;
}

// Re-export types for convenience
export type {
  Project,
  Page,
  ProjectVersion,
  Collaboration,
  Asset,
  Template,
  Plugin,
  InstalledPlugin,
  ApiIntegration,
  Deployment,
  ProjectSettings,
  ApiResponse,
  PaginatedResponse,
  CreateProjectInput,
  UpdateProjectInput,
  CreatePageInput,
  UpdatePageInput,
  ExportOptions,
  ExportResult
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

// Helper function for API requests
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Helper for file uploads
async function uploadFile<T>(
  endpoint: string,
  file: File,
  additionalData?: Record<string, any>
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`;

  const formData = new FormData();
  formData.append('file', file);

  if (additionalData) {
    for (const [key, value] of Object.entries(additionalData)) {
      formData.append(key, value);
    }
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    return data;
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
}

// ============================================
// PROJECTS API
// ============================================

export const projectsApi = {
  // List all projects
  list: async (params?: { status?: string; page?: number; pageSize?: number }) => {
    const hasBackend = await checkBackendAvailability();
    
    if (!hasBackend) {
      return mockProjectsApi.list(params);
    }
    
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());

    const query = searchParams.toString();
    return request<PaginatedResponse<Project>>(`/projects${query ? `?${query}` : ''}`);
  },

  // Get project by ID
  getById: async (id: string) => {
    const hasBackend = await checkBackendAvailability();
    
    if (!hasBackend) {
      return mockProjectsApi.getById(id);
    }
    
    return request<Project>(`/projects/${id}`);
  },

  // Create project
  create: async (data: CreateProjectInput) => {
    const hasBackend = await checkBackendAvailability();
    
    if (!hasBackend) {
      return mockProjectsApi.create(data);
    }
    
    return request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update project
  update: async (id: string, data: UpdateProjectInput) => {
    const hasBackend = await checkBackendAvailability();
    
    if (!hasBackend) {
      return mockProjectsApi.update(id, data);
    }
    
    return request<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete project
  delete: async (id: string) => {
    const hasBackend = await checkBackendAvailability();
    
    if (!hasBackend) {
      return mockProjectsApi.delete(id);
    }
    
    return request<{ success: boolean; message: string }>(`/projects/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// PAGES API
// ============================================

export const pagesApi = {
  // List pages for project
  list: (projectId: string) => {
    return request<Page[]>(`/projects/${projectId}/pages`);
  },

  // Get page by ID
  getById: (projectId: string, pageId: string) => {
    return request<Page>(`/projects/${projectId}/pages/${pageId}`);
  },

  // Create page
  create: (projectId: string, data: CreatePageInput) => {
    return request<Page>(`/projects/${projectId}/pages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update page
  update: (projectId: string, pageId: string, data: UpdatePageInput) => {
    return request<Page>(`/projects/${projectId}/pages/${pageId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete page
  delete: (projectId: string, pageId: string) => {
    return request<{ success: boolean; message: string }>(
      `/projects/${projectId}/pages/${pageId}`,
      { method: 'DELETE' }
    );
  },
};

// ============================================
// VERSIONS API
// ============================================

export const versionsApi = {
  // List versions
  list: (projectId: string) => {
    return request<ProjectVersion[]>(`/projects/${projectId}/versions`);
  },

  // Create version
  create: (projectId: string, message?: string) => {
    return request<ProjectVersion>(`/projects/${projectId}/versions`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  // Rollback to version
  rollback: (projectId: string, versionId: string) => {
    return request<{ success: boolean; message: string }>(
      `/projects/${projectId}/versions/${versionId}/rollback`,
      { method: 'POST' }
    );
  },
};

// ============================================
// ASSETS API
// ============================================

export const assetsApi = {
  // List assets
  list: (projectId: string, params?: { type?: string; page?: number; pageSize?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());

    const query = searchParams.toString();
    return request<PaginatedResponse<Asset>>(
      `/projects/${projectId}/assets${query ? `?${query}` : ''}`
    );
  },

  // Upload asset
  upload: (projectId: string, file: File, name?: string) => {
    return uploadFile<Asset>(`/projects/${projectId}/assets`, file, { name });
  },

  // Delete asset
  delete: (projectId: string, assetId: string) => {
    return request<{ success: boolean; message: string }>(
      `/projects/${projectId}/assets/${assetId}`,
      { method: 'DELETE' }
    );
  },
};

// ============================================
// COLLABORATORS API
// ============================================

export const collaboratorsApi = {
  // List collaborators
  list: (projectId: string) => {
    return request<Collaboration[]>(`/projects/${projectId}/collaborators`);
  },

  // Invite collaborator
  invite: (projectId: string, email: string, role: string) => {
    return request<Collaboration>(`/projects/${projectId}/collaborators`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  },

  // Update role
  updateRole: (projectId: string, userId: string, role: string) => {
    return request<Collaboration>(`/projects/${projectId}/collaborators/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  // Remove collaborator
  remove: (projectId: string, userId: string) => {
    return request<{ success: boolean; message: string }>(
      `/projects/${projectId}/collaborators/${userId}`,
      { method: 'DELETE' }
    );
  },
};

// ============================================
// DEPLOYMENTS API
// ============================================

export const deploymentsApi = {
  // List deployments
  list: (projectId: string) => {
    return request<Deployment[]>(`/projects/${projectId}/deployments`);
  },

  // Create deployment
  create: (projectId: string, environment?: string, customDomain?: string) => {
    return request<Deployment>(`/projects/${projectId}/deployments`, {
      method: 'POST',
      body: JSON.stringify({ environment, customDomain }),
    });
  },
};

// ============================================
// SETTINGS API
// ============================================

export const settingsApi = {
  // Get settings
  get: (projectId: string) => {
    return request<ProjectSettings>(`/projects/${projectId}/settings`);
  },

  // Update settings
  update: (projectId: string, settings: Partial<ProjectSettings>) => {
    return request<ProjectSettings>(`/projects/${projectId}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  // Update SEO
  updateSeo: (projectId: string, seo: any) => {
    return request<ProjectSettings>(`/projects/${projectId}/settings`, {
      method: 'PUT',
      body: JSON.stringify({ seo }),
    });
  },

  // Update domain
  updateDomain: (projectId: string, domain: any) => {
    return request<ProjectSettings>(`/projects/${projectId}/settings`, {
      method: 'PUT',
      body: JSON.stringify({ domain }),
    });
  },

  // Update analytics
  updateAnalytics: (projectId: string, analytics: any) => {
    return request<ProjectSettings>(`/projects/${projectId}/settings`, {
      method: 'PUT',
      body: JSON.stringify({ analytics }),
    });
  },
};

// ============================================
// PLUGINS API
// ============================================

export const pluginsApi = {
  // List marketplace plugins
  list: (params?: { type?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    if (params?.search) searchParams.set('search', params.search);

    const query = searchParams.toString();
    return request<Plugin[]>(`/plugins${query ? `?${query}` : ''}`);
  },

  // List installed plugins
  listInstalled: (projectId: string) => {
    return request<InstalledPlugin[]>(`/projects/${projectId}/plugins`);
  },

  // Install plugin
  install: (projectId: string, pluginId: string, settings?: Record<string, any>) => {
    return request<InstalledPlugin>(`/projects/${projectId}/plugins`, {
      method: 'POST',
      body: JSON.stringify({ pluginId, settings }),
    });
  },

  // Uninstall plugin
  uninstall: (projectId: string, pluginId: string) => {
    return request<{ success: boolean; message: string }>(
      `/projects/${projectId}/plugins/${pluginId}`,
      { method: 'DELETE' }
    );
  },
};

// ============================================
// TEMPLATES API
// ============================================

export const templatesApi = {
  // List templates
  list: async (params?: { category?: string; tag?: string; search?: string; premium?: boolean }) => {
    const hasBackend = await checkBackendAvailability();
    
    if (!hasBackend) {
      return mockTemplatesApi.list(params);
    }
    
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.tag) searchParams.set('tag', params.tag);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.premium !== undefined) searchParams.set('premium', params.premium.toString());

    const query = searchParams.toString();
    return request<{ items: Template[]; categories: string[] }>(
      `/templates${query ? `?${query}` : ''}`
    );
  },
};

// ============================================
// API INTEGRATIONS API
// ============================================

export const apiIntegrationsApi = {
  // List integrations
  list: (projectId: string) => {
    return request<ApiIntegration[]>(`/projects/${projectId}/api-integrations`);
  },

  // Create integration
  create: (projectId: string, data: Partial<ApiIntegration>) => {
    return request<ApiIntegration>(`/projects/${projectId}/api-integrations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update integration
  update: (projectId: string, integrationId: string, data: Partial<ApiIntegration>) => {
    return request<ApiIntegration>(
      `/projects/${projectId}/api-integrations/${integrationId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  // Delete integration
  delete: (projectId: string, integrationId: string) => {
    return request<{ success: boolean; message: string }>(
      `/projects/${projectId}/api-integrations/${integrationId}`,
      { method: 'DELETE' }
    );
  },

  // Test integration
  test: (projectId: string, integrationId: string, options?: any) => {
    return request<any>(
      `/projects/${projectId}/api-integrations/${integrationId}/test`,
      {
        method: 'POST',
        body: JSON.stringify(options),
      }
    );
  },
};

// ============================================
// EXPORT API
// ============================================

export const exportApi = {
  // Export project
  export: (projectId: string, options: ExportOptions) => {
    const searchParams = new URLSearchParams();
    searchParams.set('format', options.format);

    return request<ExportResult>(
      `/projects/${projectId}/export?${searchParams.toString()}`,
      { method: 'POST' }
    );
  },
};

// ============================================
// COLLABORATION API
// ============================================

export const collaborationApi = {
  // Get collaboration session
  getSession: (projectId: string) => {
    return request<{ projectId: string; sessionId: string; wsUrl: string }>(
      `/collaboration/${projectId}`
    );
  },
};

// ============================================
// AUTH API
// ============================================

export const authApi = {
  // Login
  login: (email: string, password?: string) => {
    return request<any>('/auth?action=login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Register
  register: (email: string, password: string, name?: string) => {
    return request<any>('/auth?action=register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },

  // Logout
  logout: () => {
    return request<any>('/auth?action=logout', { method: 'POST' });
  },

  // Get current user
  me: () => {
    return request<any>('/auth/me');
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
  settings: settingsApi,
  plugins: pluginsApi,
  templates: templatesApi,
  apiIntegrations: apiIntegrationsApi,
  export: exportApi,
  collaboration: collaborationApi,
  auth: authApi,
};
