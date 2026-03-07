// Project Settings Service - Handle SEO, domain, analytics, and custom scripts

import prisma from '@/lib/prisma';
import { ProjectSettings, SEOSettings, DomainSettings, AnalyticsSettings, CustomScripts } from '@/types/backend';

// Get project settings
export async function getProjectSettings(projectId: string): Promise<ProjectSettings> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { settings: true },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  return (project.settings as any as ProjectSettings) || getDefaultSettings();
}

// Update project settings
export async function updateProjectSettings(
  projectId: string,
  settings: Partial<ProjectSettings>
): Promise<ProjectSettings> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const currentSettings = (project.settings as any as ProjectSettings) || getDefaultSettings();
  
  const updatedSettings = {
    ...currentSettings,
    ...settings,
    seo: { ...currentSettings.seo, ...settings.seo },
    domain: { ...currentSettings.domain, ...settings.domain },
    analytics: { ...currentSettings.analytics, ...settings.analytics },
    customScripts: { ...currentSettings.customScripts, ...settings.customScripts },
  };

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: { settings: updatedSettings },
  });

  return updated.settings as any as ProjectSettings;
}

// Get default settings
function getDefaultSettings(): ProjectSettings {
  return {
    seo: {
      title: '',
      description: '',
      keywords: [],
      ogImage: '',
      ogTitle: '',
      ogDescription: '',
      twitterCard: 'summary_large_image',
      canonicalUrl: '',
    },
    domain: {
      customDomain: '',
      subdomain: '',
      sslEnabled: true,
    },
    analytics: {
      googleAnalyticsId: '',
      plausibleDomain: '',
      customScript: '',
    },
    customScripts: {
      head: '',
      body: '',
    },
  };
}

// Update SEO settings
export async function updateSeoSettings(
  projectId: string,
  seo: Partial<SEOSettings>
): Promise<SEOSettings> {
  const settings = await getProjectSettings(projectId);
  const updated = await updateProjectSettings(projectId, { seo });
  return updated.seo || getDefaultSettings().seo;
}

// Update domain settings
export async function updateDomainSettings(
  projectId: string,
  domain: Partial<DomainSettings>
): Promise<DomainSettings> {
  const settings = await getProjectSettings(projectId);
  const updated = await updateProjectSettings(projectId, { domain });
  return updated.domain || getDefaultSettings().domain!;
}

// Update analytics settings
export async function updateAnalyticsSettings(
  projectId: string,
  analytics: Partial<AnalyticsSettings>
): Promise<AnalyticsSettings> {
  const settings = await getProjectSettings(projectId);
  const updated = await updateProjectSettings(projectId, { analytics });
  return updated.analytics || getDefaultSettings().analytics!;
}

// Update custom scripts
export async function updateCustomScripts(
  projectId: string,
  customScripts: Partial<CustomScripts>
): Promise<CustomScripts> {
  const settings = await getProjectSettings(projectId);
  const updated = await updateProjectSettings(projectId, { customScripts });
  return updated.customScripts || getDefaultSettings().customScripts!;
}

// Generate SEO meta tags for a page
export function generateSeoMetaTags(
  pageMeta: { title?: string; description?: string; ogImage?: string } | null,
  projectSettings: ProjectSettings
): string {
  const seo = projectSettings.seo;
  const title = pageMeta?.title || seo.title || '';
  const description = pageMeta?.description || seo.description || '';
  const ogImage = pageMeta?.ogImage || seo.ogImage || '';

  let metaTags = '';

  if (title) {
    metaTags += `  <title>${escapeHtml(title)}</title>\n`;
    metaTags += `  <meta property="og:title" content="${escapeHtml(title)}">\n`;
    metaTags += `  <meta name="twitter:title" content="${escapeHtml(title)}">\n`;
  }

  if (description) {
    metaTags += `  <meta name="description" content="${escapeHtml(description)}">\n`;
    metaTags += `  <meta property="og:description" content="${escapeHtml(description)}">\n`;
    metaTags += `  <meta name="twitter:description" content="${escapeHtml(description)}">\n`;
  }

  if (seo.keywords && seo.keywords.length > 0) {
    metaTags += `  <meta name="keywords" content="${escapeHtml(seo.keywords.join(', '))}">\n`;
  }

  if (ogImage) {
    metaTags += `  <meta property="og:image" content="${escapeHtml(ogImage)}">\n`;
    metaTags += `  <meta name="twitter:image" content="${escapeHtml(ogImage)}">\n`;
  }

  if (seo.twitterCard) {
    metaTags += `  <meta name="twitter:card" content="${escapeHtml(seo.twitterCard)}">\n`;
  }

  if (seo.canonicalUrl) {
    metaTags += `  <link rel="canonical" href="${escapeHtml(seo.canonicalUrl)}">\n`;
  }

  return metaTags;
}

// Generate analytics script tags
export function generateAnalyticsScripts(analytics: AnalyticsSettings): string {
  let scripts = '';

  // Google Analytics
  if (analytics.googleAnalyticsId) {
    scripts += `
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${analytics.googleAnalyticsId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${analytics.googleAnalyticsId}');
</script>
`;
  }

  // Plausible Analytics
  if (analytics.plausibleDomain) {
    scripts += `
<!-- Plausible Analytics -->
<script defer data-domain="${analytics.plausibleDomain}" src="https://plausible.io/js/script.js"></script>
`;
  }

  // Custom analytics script
  if (analytics.customScript) {
    scripts += `\n<!-- Custom Analytics -->\n${analytics.customScript}\n`;
  }

  return scripts;
}

// Generate custom script tags
export function generateCustomScripts(customScripts: CustomScripts): { head: string; body: string } {
  return {
    head: customScripts.head || '',
    body: customScripts.body || '',
  };
}

// Validate domain settings
export function validateDomainSettings(domain: DomainSettings): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (domain.customDomain) {
    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(domain.customDomain)) {
      errors.push('Invalid domain format');
    }

    // Check for common TLDs
    const validTlds = ['.com', '.org', '.net', '.io', '.co', '.app', '.dev', '.xyz'];
    const hasValidTld = validTlds.some(tld => domain.customDomain!.endsWith(tld));
    if (!hasValidTld) {
      errors.push('Domain must have a valid TLD');
    }
  }

  if (domain.subdomain) {
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
    if (!subdomainRegex.test(domain.subdomain)) {
      errors.push('Invalid subdomain format. Use lowercase letters, numbers, and hyphens only.');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Escape HTML for safe rendering
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Get deployment configuration
export async function getDeploymentConfig(projectId: string): Promise<any> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { deploymentConfig: true },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  return project.deploymentConfig || {
    autoDeploy: false,
    buildCommand: 'npm run build',
    outputDirectory: '.next',
    nodeVersion: '18.x',
    environmentVariables: {},
  };
}

// Update deployment configuration
export async function updateDeploymentConfig(
  projectId: string,
  config: any
): Promise<any> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const currentConfig = (project.deploymentConfig as any) || {};
  const updatedConfig = { ...currentConfig, ...config };

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: { deploymentConfig: updatedConfig },
  });

  return updated.deploymentConfig;
}
