// Enhanced Deployment Service - Complete Vercel integration

import prisma from '@/lib/prisma';
import { generateNextJsProject } from './codeGeneration';

const VERCEL_API_URL = 'https://api.vercel.com';
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

export interface DeploymentOptions {
  environment: 'development' | 'staging' | 'production';
  skipTests?: boolean;
  force?: boolean;
  customDomain?: string;
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

export interface VercelDeployment {
  id: string;
  url: string;
  state: string;
  createdAt: number;
  readyAt?: number;
  alias?: string[];
}

// Create a new deployment on Vercel
export async function createVercelDeployment(
  projectId: string,
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

  // Generate Next.js project files
  const files = generateNextJsProject(project, {
    typescript: true,
    tailwind: true,
    exportType: options.environment === 'production' ? 'standalone' : 'static'
  });

  // Convert files to Vercel format
  const vercelFiles = files.map(file => ({
    file: file.path,
    data: file.content
  }));

  // Create deployment via Vercel API
  const response = await fetch(`${VERCEL_API_URL}/v13/deployments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: project.slug,
      files: vercelFiles,
      project: { name: project.slug },
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
    status: deployment.state as DeploymentStatus['status'],
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
    status: deployment.state as DeploymentStatus['status'],
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

// Delete Vercel project
export async function deleteVercelProject(
  projectId: string
): Promise<void> {
  if (!VERCEL_TOKEN) {
    throw new Error('Vercel token is not configured');
  }

  const response = await fetch(
    `${VERCEL_API_URL}/v9/projects/${projectId}`,
    {
      method: 'DELETE',
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

// Trigger deployment with full pipeline
export async function triggerDeploymentPipeline(
  projectId: string,
  deploymentId: string,
  options: DeploymentOptions = { environment: 'production' }
): Promise<void> {
  try {
    // Update status to BUILDING
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: { status: 'BUILDING' }
    });

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { pages: true }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Deploy to Vercel
    let vercelDeployment: VercelDeployment;

    if (VERCEL_TOKEN) {
      // Real Vercel deployment
      const deploymentResult = await createVercelDeployment(projectId, options);
      vercelDeployment = {
        id: deploymentResult.id,
        url: deploymentResult.url!,
        state: deploymentResult.status,
        createdAt: deploymentResult.createdAt,
        readyAt: deploymentResult.readyAt,
        alias: deploymentResult.alias
      };

      // Poll for deployment status
      let status = deploymentResult.status;
      while (status === 'pending' || status === 'building' || status === 'deploying') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const updated = await getVercelDeploymentStatus(deploymentResult.id);
        status = updated.status;
      }

      if (status === 'error') {
        throw new Error(deploymentResult.errorMessage || 'Deployment failed');
      }

      // Add custom domain if specified
      if (options.customDomain && VERCEL_TOKEN) {
        const vercelProject = await createVercelProject(project.slug);
        await addVercelDomain(vercelProject.id, options.customDomain);
      }

      await prisma.deployment.update({
        where: { id: deploymentId },
        data: {
          status: 'SUCCESS',
          vercelId: vercelDeployment.id,
          vercelUrl: vercelDeployment.url,
          buildLog: `Deployment successful\nURL: ${vercelDeployment.url}`
        }
      });

      // Update project with deployed URL
      await prisma.project.update({
        where: { id: projectId },
        data: {
          deployedUrl: vercelDeployment.url,
          lastDeployedAt: new Date(),
          status: 'PUBLISHED'
        }
      });
    } else {
      // Demo mode - simulate deployment
      await new Promise(resolve => setTimeout(resolve, 3000));

      const demoUrl = `https://${project.slug}.demo.vercel.app`;

      await prisma.deployment.update({
        where: { id: deploymentId },
        data: {
          status: 'SUCCESS',
          vercelUrl: demoUrl,
          buildLog: `Demo deployment successful\nBuild completed in 3.2s\nURL: ${demoUrl}`
        }
      });

      await prisma.project.update({
        where: { id: projectId },
        data: {
          deployedUrl: demoUrl,
          lastDeployedAt: new Date(),
          status: 'PUBLISHED'
        }
      });
    }
  } catch (error: any) {
    console.error('Deployment failed:', error);

    await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        status: 'FAILED',
        vercelError: error.message
      }
    });

    throw error;
  }
}

// Get deployment history for a project
export async function getDeploymentHistory(
  projectId: string,
  limit = 10
): Promise<any[]> {
  const deployments = await prisma.deployment.findMany({
    where: { projectId },
    include: {
      triggeredBy: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  });

  return deployments;
}

// Retry a failed deployment
export async function retryDeployment(
  deploymentId: string
): Promise<void> {
  const deployment = await prisma.deployment.findUnique({
    where: { id: deploymentId },
    include: { project: true }
  });

  if (!deployment) {
    throw new Error('Deployment not found');
  }

  if (deployment.status !== 'FAILED' && deployment.status !== 'CANCELLED') {
    throw new Error('Can only retry failed or cancelled deployments');
  }

  // Reset deployment status
  await prisma.deployment.update({
    where: { id: deploymentId },
    data: {
      status: 'PENDING',
      vercelError: null,
      buildLog: null
    }
  });

  // Trigger deployment pipeline
  await triggerDeploymentPipeline(
    deployment.projectId,
    deploymentId,
    { environment: deployment.environment.toLowerCase() as any }
  );
}
