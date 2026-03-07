// Deployment Service - Handle Vercel deployments

import prisma from '@/lib/prisma';

const VERCEL_API_URL = 'https://api.vercel.com';
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

export interface DeploymentOptions {
  environment: 'development' | 'staging' | 'production';
  skipTests?: boolean;
  force?: boolean;
}

export interface DeploymentStatus {
  id: string;
  status: 'pending' | 'building' | 'deploying' | 'ready' | 'error' | 'cancelled';
  url?: string;
  alias?: string[];
  createdAt: number;
  readyAt?: number;
  errorCode?: string;
  errorMessage?: string;
}

// Create a new deployment on Vercel
export async function createVercelDeployment(
  projectId: string,
  files: Array<{ file: string; data: string }>,
  options: DeploymentOptions = { environment: 'production' }
): Promise<DeploymentStatus> {
  if (!VERCEL_TOKEN) {
    throw new Error('Vercel token is not configured');
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { pages: true }
  });

  if (!project) {
    throw new Error('Project not found');
  }

  // Create deployment via Vercel API
  const response = await fetch(`${VERCEL_API_URL}/v13/deployments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: project.slug,
      files,
      project: VERCEL_PROJECT_ID ? { id: VERCEL_PROJECT_ID } : { name: project.slug },
      target: options.environment === 'production' ? 'production' : 'preview',
      ...(VERCEL_TEAM_ID && { teamId: VERCEL_TEAM_ID }),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Vercel API error: ${error}`);
  }

  const deployment = await response.json();

  return {
    id: deployment.id,
    status: deployment.state,
    url: deployment.url,
    alias: deployment.alias,
    createdAt: deployment.createdAt,
    readyAt: deployment.readyAt,
    errorCode: deployment.errorCode,
    errorMessage: deployment.errorMessage,
  };
}

// Get deployment status from Vercel
export async function getVercelDeploymentStatus(
  deploymentId: string
): Promise<DeploymentStatus> {
  if (!VERCEL_TOKEN) {
    throw new Error('Vercel token is not configured');
  }

  const response = await fetch(
    `${VERCEL_API_URL}/v13/deployments/${deploymentId}`,
    {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Vercel API error: ${error}`);
  }

  const deployment = await response.json();

  return {
    id: deployment.id,
    status: deployment.state,
    url: deployment.url,
    alias: deployment.alias,
    createdAt: deployment.createdAt,
    readyAt: deployment.readyAt,
    errorCode: deployment.errorCode,
    errorMessage: deployment.errorMessage,
  };
}

// Cancel a deployment
export async function cancelVercelDeployment(
  deploymentId: string
): Promise<void> {
  if (!VERCEL_TOKEN) {
    throw new Error('Vercel token is not configured');
  }

  const response = await fetch(
    `${VERCEL_API_URL}/v13/deployments/${deploymentId}/cancel`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Vercel API error: ${error}`);
  }
}

// Get deployment logs
export async function getVercelDeploymentLogs(
  deploymentId: string
): Promise<string> {
  if (!VERCEL_TOKEN) {
    throw new Error('Vercel token is not configured');
  }

  const response = await fetch(
    `${VERCEL_API_URL}/v13/deployments/${deploymentId}/logs`,
    {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Vercel API error: ${error}`);
  }

  const logs = await response.json();
  return logs.map((log: any) => `[${log.timestamp}] ${log.message}`).join('\n');
}

// Create or update Vercel project
export async function createVercelProject(
  name: string,
  framework = 'nextjs'
): Promise<{ id: string; name: string }> {
  if (!VERCEL_TOKEN) {
    throw new Error('Vercel token is not configured');
  }

  // Check if project exists
  const listResponse = await fetch(
    `${VERCEL_API_URL}/v9/projects`,
    {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        ...(VERCEL_TEAM_ID && { 'x-vercel-team-id': VERCEL_TEAM_ID }),
      },
    }
  );

  if (listResponse.ok) {
    const projects = await listResponse.json();
    const existing = projects.projects?.find((p: any) => p.name === name);
    
    if (existing) {
      return { id: existing.id, name: existing.name };
    }
  }

  // Create new project
  const response = await fetch(`${VERCEL_API_URL}/v9/projects`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
      ...(VERCEL_TEAM_ID && { 'x-vercel-team-id': VERCEL_TEAM_ID }),
    },
    body: JSON.stringify({
      name,
      framework,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Vercel API error: ${error}`);
  }

  const project = await response.json();
  return { id: project.id, name: project.name };
}

// Set environment variables on Vercel project
export async function setVercelEnvironmentVariables(
  projectId: string,
  envVars: Record<string, string>
): Promise<void> {
  if (!VERCEL_TOKEN) {
    throw new Error('Vercel token is not configured');
  }

  for (const [key, value] of Object.entries(envVars)) {
    const response = await fetch(
      `${VERCEL_API_URL}/v9/projects/${projectId}/env`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key,
          value,
          target: ['production', 'preview', 'development'],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to set env var ${key}: ${error}`);
    }
  }
}

// Add custom domain to Vercel project
export async function addVercelDomain(
  projectId: string,
  domain: string
): Promise<void> {
  if (!VERCEL_TOKEN) {
    throw new Error('Vercel token is not configured');
  }

  const response = await fetch(
    `${VERCEL_API_URL}/v9/projects/${projectId}/domains`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: domain }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to add domain: ${error}`);
  }
}

// Verify domain configuration
export async function verifyVercelDomain(
  domain: string
): Promise<{ configured: boolean; records: any[] }> {
  if (!VERCEL_TOKEN) {
    throw new Error('Vercel token is not configured');
  }

  const response = await fetch(
    `${VERCEL_API_URL}/v6/domains/${domain}/verify`,
    {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to verify domain: ${error}`);
  }

  const result = await response.json();
  return {
    configured: result.configured,
    records: result.misconfigured ? [] : result.records,
  };
}
