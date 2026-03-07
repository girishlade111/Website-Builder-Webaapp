// API Client - Frontend utilities for calling backend APIs

import { Project, ProjectPage as Page, Asset, Template, Plugin, Deployment, Collaboration } from '@/types/backend';

const API_BASE = '/api';

// Generic API response type
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Generic fetch wrapper
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Request failed',
      };
    }

    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error',
    };
  }
}

// ============================================
// PROJECTS API
// ============================================

export const projectsApi = {
  // List all projects
  list: async (params?: { status?: string; page?: number; pageSize?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());
    
    const query = searchParams.toString();
    return fetchApi<{ items: Project[]; total: number; page: number; totalPages: number }>(
      `/projects${query ? `?${query}` : ''}`
    );
  },

  // Get single project
  get: async (id: string) => {
    return fetchApi<Project>(`/projects/${id}`);
  },

  // Create project
  create: async (data: { name: string; description?: string; templateId?: string; slug?: string }) => {
    return fetchApi<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update project
  update: async (id: string, data: Partial<{ name: string; description?: string; settings?: any }>) => {
    return fetchApi<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete project
  delete: async (id: string) => {
    return fetchApi<void>(`/projects/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// PAGES API
// ============================================

export const pagesApi = {
  // List pages in project
  list: async (projectId: string) => {
    return fetchApi<Page[]>(`/projects/${projectId}/pages`);
  },

  // Get single page
  get: async (projectId: string, pageId: string) => {
    return fetchApi<Page>(`/projects/${projectId}/pages/${pageId}`);
  },

  // Create page
  create: async (projectId: string, data: { name: string; path: string; schema?: any; metaTitle?: string; metaDescription?: string }) => {
    return fetchApi<Page>(`/projects/${projectId}/pages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update page
  update: async (projectId: string, pageId: string, data: Partial<{ name: string; path: string; schema: any; metaTitle?: string; metaDescription?: string; isPublished?: boolean }>) => {
    return fetchApi<Page>(`/projects/${projectId}/pages/${pageId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete page
  delete: async (projectId: string, pageId: string) => {
    return fetchApi<void>(`/projects/${projectId}/pages/${pageId}`, {
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
    return fetchApi<any[]>(`/projects/${projectId}/versions`);
  },

  // Create version
  create: async (projectId: string, data?: { message?: string }) => {
    return fetchApi<any>(`/projects/${projectId}/versions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Rollback to version
  rollback: async (projectId: string, versionId: string) => {
    return fetchApi<any>(`/projects/${projectId}/versions/${versionId}/rollback`, {
      method: 'POST',
    });
  },
};

// ============================================
// ASSETS API
// ============================================

export const assetsApi = {
  // List assets
  list: async (projectId: string) => {
    return fetchApi<Asset[]>(`/projects/${projectId}/assets`);
  },

  // Upload asset
  upload: async (projectId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE}/projects/${projectId}/assets`, {
        method: 'POST',
        body: formData,
      });

      return response.json();
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Upload failed',
      };
    }
  },

  // Delete asset
  delete: async (projectId: string, assetId: string) => {
    return fetchApi<void>(`/projects/${projectId}/assets/${assetId}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// COLLABORATORS API
// ============================================

export const collaboratorsApi = {
  // List collaborators
  list: async (projectId: string) => {
    return fetchApi<Collaboration[]>(`/projects/${projectId}/collaborators`);
  },

  // Invite collaborator
  invite: async (projectId: string, email: string, role: 'ADMIN' | 'EDITOR' | 'VIEWER') => {
    return fetchApi<Collaboration>(`/projects/${projectId}/collaborators`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  },

  // Update collaborator role
  updateRole: async (projectId: string, userId: string, role: 'ADMIN' | 'EDITOR' | 'VIEWER') => {
    return fetchApi<Collaboration>(`/projects/${projectId}/collaborators/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  // Remove collaborator
  remove: async (projectId: string, userId: string) => {
    return fetchApi<void>(`/projects/${projectId}/collaborators/${userId}`, {
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
    return fetchApi<Deployment[]>(`/projects/${projectId}/deployments`);
  },

  // Create deployment
  create: async (projectId: string, environment?: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION') => {
    return fetchApi<Deployment>(`/projects/${projectId}/deployments`, {
      method: 'POST',
      body: JSON.stringify({ environment }),
    });
  },

  // Get deployment status
  getStatus: async (deploymentId: string) => {
    return fetchApi<Deployment>(`/deployments/${deploymentId}`);
  },
};

// ============================================
// EXPORT API
// ============================================

export const exportApi = {
  // Export project
  export: async (projectId: string, options: { format: 'static' | 'nextjs' | 'vercel'; includeAssets?: boolean; minify?: boolean }) => {
    return fetchApi<{ downloadUrl: string; format: string }>(`/projects/${projectId}/export`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
  },
};

// ============================================
// TEMPLATES API
// ============================================

export const templatesApi = {
  // List templates
  list: async (params?: { category?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    
    const query = searchParams.toString();
    return fetchApi<Template[]>(`/templates${query ? `?${query}` : ''}`);
  },

  // Get template
  get: async (id: string) => {
    return fetchApi<Template>(`/templates/${id}`);
  },
};

// ============================================
// PLUGINS API
// ============================================

export const pluginsApi = {
  // List plugins
  list: async (params?: { type?: string; published?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    if (params?.published !== undefined) searchParams.set('published', params.published.toString());
    
    const query = searchParams.toString();
    return fetchApi<Plugin[]>(`/plugins${query ? `?${query}` : ''}`);
  },

  // Install plugin
  install: async (projectId: string, pluginId: string) => {
    return fetchApi<any>(`/projects/${projectId}/plugins`, {
      method: 'POST',
      body: JSON.stringify({ pluginId }),
    });
  },

  // Uninstall plugin
  uninstall: async (projectId: string, pluginId: string) => {
    return fetchApi<void>(`/projects/${projectId}/plugins/${pluginId}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// COLLABORATION API
// ============================================

export const collaborationApi = {
  // Get collaboration state
  getState: async (projectId: string) => {
    return fetchApi<any>(`/collaboration/${projectId}`);
  },

  // Update collaboration state
  updateState: async (projectId: string, data: { yjsState?: number[]; cursors?: any[] }) => {
    return fetchApi<any>(`/collaboration/${projectId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============================================
// SETTINGS API
// ============================================

export const settingsApi = {
  // Get project settings
  get: async (projectId: string) => {
    return fetchApi<any>(`/projects/${projectId}/settings`);
  },

  // Update project settings
  update: async (projectId: string, settings: any) => {
    return fetchApi<any>(`/projects/${projectId}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  // Update SEO settings
  updateSeo: async (projectId: string, seo: any) => {
    return fetchApi<any>(`/projects/${projectId}/settings/seo`, {
      method: 'PUT',
      body: JSON.stringify(seo),
    });
  },

  // Update domain settings
  updateDomain: async (projectId: string, domain: any) => {
    return fetchApi<any>(`/projects/${projectId}/settings/domain`, {
      method: 'PUT',
      body: JSON.stringify(domain),
    });
  },

  // Update analytics settings
  updateAnalytics: async (projectId: string, analytics: any) => {
    return fetchApi<any>(`/projects/${projectId}/settings/analytics`, {
      method: 'PUT',
      body: JSON.stringify(analytics),
    });
  },
};
