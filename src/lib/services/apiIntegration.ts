// API Integration Service - Handle API connections and data fetching

import prisma from '@/lib/prisma';

export interface ApiIntegrationConfig {
  id: string;
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  authType?: 'NONE' | 'API_KEY' | 'OAUTH2' | 'BEARER' | 'BASIC';
  authConfig?: ApiAuthConfig;
  responseMapping?: ResponseMapping;
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
  dataPath?: string;
  itemMapping?: Record<string, string>;
}

export interface ApiRequestOptions {
  endpoint?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
  timeout?: number;
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  status?: number;
  headers?: Record<string, string>;
}

// Execute API request with integration config
export async function executeApiRequest(
  config: ApiIntegrationConfig,
  options?: ApiRequestOptions
): Promise<ApiResponse> {
  try {
    const {
      endpoint = config.endpoint,
      method = config.method,
      headers = {},
      body,
      params,
      timeout = 30000,
    } = options || {};

    // Build URL with query params
    let url = endpoint;
    if (params && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(params).toString();
      url += (url.includes('?') ? '&' : '?') + queryString;
    }

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers,
      ...headers,
    };

    // Add authentication
    if (config.authType && config.authConfig) {
      const authHeaders = await getAuthHeaders(config.authType, config.authConfig);
      Object.assign(requestHeaders, authHeaders);
    }

    // Prepare request options
    const fetchOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    // Add body for non-GET requests
    if (method !== 'GET' && method !== 'HEAD' && body) {
      fetchOptions.body = JSON.stringify(body);
    }

    // Execute request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Parse response
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
        headers: responseHeaders,
      };
    }

    // Apply response mapping if configured
    if (config.responseMapping) {
      data = applyResponseMapping(data, config.responseMapping);
    }

    return {
      success: true,
      data,
      status: response.status,
      headers: responseHeaders,
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timeout',
      };
    }

    return {
      success: false,
      error: error.message || 'Request failed',
    };
  }
}

// Get authentication headers based on auth type
async function getAuthHeaders(
  authType: string,
  authConfig: ApiAuthConfig
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};

  switch (authType) {
    case 'API_KEY':
      if (authConfig.apiKey) {
        headers['Authorization'] = `Bearer ${authConfig.apiKey}`;
        // Or use custom header based on API requirements
        headers['X-API-Key'] = authConfig.apiKey;
      }
      break;

    case 'BEARER':
      if (authConfig.accessToken) {
        headers['Authorization'] = `Bearer ${authConfig.accessToken}`;
      }
      break;

    case 'BASIC':
      if (authConfig.username && authConfig.password) {
        const credentials = Buffer.from(
          `${authConfig.username}:${authConfig.password}`
        ).toString('base64');
        headers['Authorization'] = `Basic ${credentials}`;
      }
      break;

    case 'OAUTH2':
      if (authConfig.accessToken) {
        headers['Authorization'] = `Bearer ${authConfig.accessToken}`;
      } else if (authConfig.clientId && authConfig.clientSecret) {
        // Try to get access token
        const tokenResponse = await getOAuth2Token(authConfig);
        if (tokenResponse.access_token) {
          headers['Authorization'] = `Bearer ${tokenResponse.access_token}`;
        }
      }
      break;

    case 'NONE':
    default:
      break;
  }

  return headers;
}

// Get OAuth2 access token
async function getOAuth2Token(authConfig: ApiAuthConfig): Promise<{
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
}> {
  if (!authConfig.tokenUrl) {
    return {};
  }

  try {
    const response = await fetch(authConfig.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: authConfig.clientId || '',
        client_secret: authConfig.clientSecret || '',
        ...(authConfig.refreshToken && {
          grant_type: 'refresh_token',
          refresh_token: authConfig.refreshToken,
        }),
      }),
    });

    if (!response.ok) {
      throw new Error(`OAuth2 token request failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('OAuth2 token error:', error);
    return {};
  }
}

// Apply response mapping to transform API data
function applyResponseMapping(data: any, mapping: ResponseMapping): any {
  if (!mapping) return data;

  let result = data;

  // Extract data from nested path
  if (mapping.dataPath) {
    const pathParts = mapping.dataPath.split('.');
    for (const part of pathParts) {
      if (result && typeof result === 'object') {
        result = result[part];
      } else {
        break;
      }
    }
  }

  // Map fields if itemMapping is provided
  if (mapping.itemMapping && Array.isArray(result)) {
    result = result.map((item: any) => mapItemFields(item, mapping.itemMapping!));
  } else if (mapping.itemMapping && result && typeof result === 'object') {
    result = mapItemFields(result, mapping.itemMapping);
  }

  return result;
}

// Map item fields based on mapping configuration
function mapItemFields(
  item: Record<string, any>,
  mapping: Record<string, string>
): Record<string, any> {
  const mapped: Record<string, any> = {};

  for (const [newKey, sourcePath] of Object.entries(mapping)) {
    const value = getNestedValue(item, sourcePath);
    if (value !== undefined) {
      mapped[newKey] = value;
    }
  }

  return mapped;
}

// Get nested value from object using dot notation
function getNestedValue(obj: any, path: string): any {
  const parts = path.split('.');
  let result = obj;

  for (const part of parts) {
    if (result && typeof result === 'object') {
      result = result[part];
    } else {
      return undefined;
    }
  }

  return result;
}

// Get API integration from database
export async function getApiIntegration(
  projectId: string,
  integrationId: string
): Promise<ApiIntegrationConfig | null> {
  const integration = await prisma.apiIntegration.findFirst({
    where: {
      id: integrationId,
      projectId,
    },
  });

  if (!integration) {
    return null;
  }

  return {
    id: integration.id,
    name: integration.name,
    endpoint: integration.endpoint,
    method: integration.method as any,
    headers: integration.headers as Record<string, string>,
    authType: integration.authType as any,
    authConfig: integration.authConfig as ApiAuthConfig,
    responseMapping: integration.responseMapping as ResponseMapping,
  };
}

// List all API integrations for a project
export async function listApiIntegrations(projectId: string): Promise<ApiIntegrationConfig[]> {
  const integrations = await prisma.apiIntegration.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
  });

  return integrations.map((integration) => ({
    id: integration.id,
    name: integration.name,
    endpoint: integration.endpoint,
    method: integration.method as any,
    headers: integration.headers as Record<string, string>,
    authType: integration.authType as any,
    authConfig: integration.authConfig as ApiAuthConfig,
    responseMapping: integration.responseMapping as ResponseMapping,
  }));
}

// Create API integration
export async function createApiIntegration(
  projectId: string,
  data: {
    name: string;
    endpoint: string;
    method: string;
    headers?: Record<string, string>;
    authType?: string;
    authConfig?: ApiAuthConfig;
    responseMapping?: ResponseMapping;
  }
): Promise<ApiIntegrationConfig> {
  const integration = await prisma.apiIntegration.create({
    data: {
      projectId,
      name: data.name,
      endpoint: data.endpoint,
      method: data.method as any,
      headers: data.headers || {},
      authType: data.authType as any,
      authConfig: data.authConfig as any,
      responseMapping: data.responseMapping as any,
    },
  });

  return {
    id: integration.id,
    name: integration.name,
    endpoint: integration.endpoint,
    method: integration.method as any,
    headers: integration.headers as Record<string, string>,
    authType: integration.authType as any,
    authConfig: integration.authConfig as ApiAuthConfig,
    responseMapping: integration.responseMapping as ResponseMapping,
  };
}

// Update API integration
export async function updateApiIntegration(
  projectId: string,
  integrationId: string,
  data: Partial<{
    name: string;
    endpoint: string;
    method: string;
    headers?: Record<string, string>;
    authType?: string;
    authConfig?: ApiAuthConfig;
    responseMapping?: ResponseMapping;
  }>
): Promise<ApiIntegrationConfig | null> {
  const integration = await prisma.apiIntegration.updateMany({
    where: {
      id: integrationId,
      projectId,
    },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.endpoint && { endpoint: data.endpoint }),
      ...(data.method && { method: data.method as any }),
      ...(data.headers && { headers: data.headers }),
      ...(data.authType && { authType: data.authType as any }),
      ...(data.authConfig && { authConfig: data.authConfig as any }),
      ...(data.responseMapping && { responseMapping: data.responseMapping as any }),
    },
  });

  if (integration.count === 0) {
    return null;
  }

  return getApiIntegration(projectId, integrationId);
}

// Delete API integration
export async function deleteApiIntegration(
  projectId: string,
  integrationId: string
): Promise<boolean> {
  const result = await prisma.apiIntegration.deleteMany({
    where: {
      id: integrationId,
      projectId,
    },
  });

  return result.count > 0;
}
