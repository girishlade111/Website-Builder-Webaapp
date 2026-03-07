// Project Settings Service - SEO, domain, analytics, and more

import prisma from '@/lib/prisma';

export interface ProjectSettings {
  seo: SeoSettings;
  domain: DomainSettings;
  analytics: AnalyticsSettings;
  scripts: ScriptSettings;
  social: SocialSettings;
}

export interface SeoSettings {
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
}

export interface DomainSettings {
  customDomain?: string;
  redirectWww?: boolean;
  forceHttps?: boolean;
}

export interface AnalyticsSettings {
  googleAnalyticsId?: string;
  plausibleDomain?: string;
  umamiWebsiteId?: string;
  customScript?: string;
}

export interface ScriptSettings {
  headScripts?: string[];
  bodyScripts?: string[];
}

export interface SocialSettings {
  twitterHandle?: string;
  facebookAppId?: string;
  linkedInInsightId?: string;
}

// Get project settings
export async function getProjectSettings(
  projectId: string
): Promise<ProjectSettings | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { settings: true }
  });

  if (!project) {
    return null;
  }

  const settings = (project.settings as any) || {};

  return {
    seo: settings.seo || getDefaultSeoSettings(),
    domain: settings.domain || getDefaultDomainSettings(),
    analytics: settings.analytics || getDefaultAnalyticsSettings(),
    scripts: settings.scripts || getDefaultScriptSettings(),
    social: settings.social || getDefaultSocialSettings()
  };
}

// Update project settings
export async function updateProjectSettings(
  projectId: string,
  updates: Partial<ProjectSettings>
): Promise<ProjectSettings> {
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const currentSettings = (project.settings as any) || {};

  const newSettings = {
    seo: {
      ...getDefaultSeoSettings(),
      ...currentSettings.seo,
      ...updates.seo
    },
    domain: {
      ...getDefaultDomainSettings(),
      ...currentSettings.domain,
      ...updates.domain
    },
    analytics: {
      ...getDefaultAnalyticsSettings(),
      ...currentSettings.analytics,
      ...updates.analytics
    },
    scripts: {
      ...getDefaultScriptSettings(),
      ...currentSettings.scripts,
      ...updates.scripts
    },
    social: {
      ...getDefaultSocialSettings(),
      ...currentSettings.social,
      ...updates.social
    }
  };

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: { settings: newSettings }
  });

  return newSettings;
}

// Update SEO settings
export async function updateSeoSettings(
  projectId: string,
  seo: Partial<SeoSettings>
): Promise<SeoSettings> {
  const settings = await getProjectSettings(projectId);

  if (!settings) {
    throw new Error('Project not found');
  }

  const newSeo = {
    ...settings.seo,
    ...seo
  };

  await updateProjectSettings(projectId, { seo: newSeo });

  return newSeo;
}

// Update domain settings
export async function updateDomainSettings(
  projectId: string,
  domain: Partial<DomainSettings>
): Promise<DomainSettings> {
  const settings = await getProjectSettings(projectId);

  if (!settings) {
    throw new Error('Project not found');
  }

  const newDomain = {
    ...settings.domain,
    ...domain
  };

  await updateProjectSettings(projectId, { domain: newDomain });

  return newDomain;
}

// Update analytics settings
export async function updateAnalyticsSettings(
  projectId: string,
  analytics: Partial<AnalyticsSettings>
): Promise<AnalyticsSettings> {
  const settings = await getProjectSettings(projectId);

  if (!settings) {
    throw new Error('Project not found');
  }

  const newAnalytics = {
    ...settings.analytics,
    ...analytics
  };

  await updateProjectSettings(projectId, { analytics: newAnalytics });

  return newAnalytics;
}

// Update script settings
export async function updateScriptSettings(
  projectId: string,
  scripts: Partial<ScriptSettings>
): Promise<ScriptSettings> {
  const settings = await getProjectSettings(projectId);

  if (!settings) {
    throw new Error('Project not found');
  }

  const newScripts = {
    ...settings.scripts,
    ...scripts
  };

  await updateProjectSettings(projectId, { scripts: newScripts });

  return newScripts;
}

// Add head script
export async function addHeadScript(
  projectId: string,
  script: string
): Promise<ScriptSettings> {
  const settings = await getProjectSettings(projectId);

  if (!settings) {
    throw new Error('Project not found');
  }

  const headScripts = settings.scripts.headScripts || [];
  if (!headScripts.includes(script)) {
    headScripts.push(script);
  }

  return updateScriptSettings(projectId, { headScripts });
}

// Remove head script
export async function removeHeadScript(
  projectId: string,
  script: string
): Promise<ScriptSettings> {
  const settings = await getProjectSettings(projectId);

  if (!settings) {
    throw new Error('Project not found');
  }

  const headScripts = (settings.scripts.headScripts || []).filter(
    s => s !== script
  );

  return updateScriptSettings(projectId, { headScripts });
}

// Add body script
export async function addBodyScript(
  projectId: string,
  script: string
): Promise<ScriptSettings> {
  const settings = await getProjectSettings(projectId);

  if (!settings) {
    throw new Error('Project not found');
  }

  const bodyScripts = settings.scripts.bodyScripts || [];
  if (!bodyScripts.includes(script)) {
    bodyScripts.push(script);
  }

  return updateScriptSettings(projectId, { bodyScripts });
}

// Remove body script
export async function removeBodyScript(
  projectId: string,
  script: string
): Promise<ScriptSettings> {
  const settings = await getProjectSettings(projectId);

  if (!settings) {
    throw new Error('Project not found');
  }

  const bodyScripts = (settings.scripts.bodyScripts || []).filter(
    s => s !== script
  );

  return updateScriptSettings(projectId, { bodyScripts });
}

// Generate analytics script tag
export function generateAnalyticsScript(
  analytics: AnalyticsSettings
): string | null {
  if (analytics.googleAnalyticsId) {
    return `
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${analytics.googleAnalyticsId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${analytics.googleAnalyticsId}');
</script>`;
  }

  if (analytics.plausibleDomain) {
    return `
<!-- Plausible Analytics -->
<script defer data-domain="${analytics.plausibleDomain}" src="https://plausible.io/js/script.js"></script>`;
  }

  if (analytics.umamiWebsiteId) {
    return `
<!-- Umami Analytics -->
<script async defer data-website-id="${analytics.umamiWebsiteId}" src="https://analytics.umami.is/script.js"></script>`;
  }

  if (analytics.customScript) {
    return analytics.customScript;
  }

  return null;
}

// Generate social meta tags
export function generateSocialMetaTags(
  seo: SeoSettings,
  social: SocialSettings
): string {
  const tags: string[] = [];

  // Open Graph
  if (seo.ogTitle || seo.title) {
    tags.push(`<meta property="og:title" content="${seo.ogTitle || seo.title}">`);
  }

  if (seo.ogDescription || seo.description) {
    tags.push(`<meta property="og:description" content="${seo.ogDescription || seo.description}">`);
  }

  if (seo.ogImage) {
    tags.push(`<meta property="og:image" content="${seo.ogImage}">`);
  }

  // Twitter Card
  if (social.twitterHandle) {
    tags.push(`<meta name="twitter:creator" content="@${social.twitterHandle}">`);
  }

  if (seo.twitterCard) {
    tags.push(`<meta name="twitter:card" content="${seo.twitterCard}">`);
  }

  // Facebook App ID
  if (social.facebookAppId) {
    tags.push(`<meta property="fb:app_id" content="${social.facebookAppId}">`);
  }

  // LinkedIn Insight
  if (social.linkedInInsightId) {
    tags.push(`
<!-- LinkedIn Insight Tag -->
<script type="text/javascript">
  _linkedin_partner_id = "${social.linkedInInsightId}";
  window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
  window._linkedin_data_partner_ids.push(_linkedin_partner_id);
</script>
<script type="text/javascript">
  (function(l) {
    if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
    window.lintrk.q=[]}
    var s = document.getElementsByTagName("script")[0];
    var b = document.createElement("script");
    b.type = "text/javascript";b.async = true;
    b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
    s.parentNode.insertBefore(b, s);
  })(window.lintrk);
</script>
<noscript><img height="1" width="1" style="display:none;" alt="" src="https://px.ads.linkedin.com/collect/?pid=${social.linkedInInsightId}&fmt=gif" /></noscript>`);
  }

  return tags.join('\n');
}

// Validate domain configuration
export async function validateDomainConfiguration(
  projectId: string
): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
  const settings = await getProjectSettings(projectId);

  if (!settings) {
    return { valid: false, errors: ['Project not found'], warnings: [] };
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate SEO
  if (!settings.seo.title) {
    warnings.push('SEO title is not set');
  }

  if (!settings.seo.description) {
    warnings.push('SEO description is not set');
  }

  if (settings.seo.title && settings.seo.title.length > 60) {
    warnings.push('SEO title is longer than 60 characters');
  }

  if (settings.seo.description && settings.seo.description.length > 160) {
    warnings.push('SEO description is longer than 160 characters');
  }

  // Validate domain
  if (settings.domain.customDomain) {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(settings.domain.customDomain)) {
      errors.push('Invalid custom domain format');
    }
  }

  // Validate analytics
  if (settings.analytics.googleAnalyticsId) {
    const gaRegex = /^G-[A-Z0-9]{10}$/;
    if (!gaRegex.test(settings.analytics.googleAnalyticsId)) {
      warnings.push('Google Analytics ID format may be invalid');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// Default settings
function getDefaultSeoSettings(): SeoSettings {
  return {
    title: '',
    description: '',
    keywords: [],
    ogTitle: '',
    ogDescription: '',
    twitterCard: 'summary_large_image',
    robots: 'index, follow',
    canonical: ''
  };
}

function getDefaultDomainSettings(): DomainSettings {
  return {
    redirectWww: true,
    forceHttps: true
  };
}

function getDefaultAnalyticsSettings(): AnalyticsSettings {
  return {};
}

function getDefaultScriptSettings(): ScriptSettings {
  return {
    headScripts: [],
    bodyScripts: []
  };
}

function getDefaultSocialSettings(): SocialSettings {
  return {};
}

// Export settings for code generation
export function exportSettingsForGeneration(
  settings: ProjectSettings
): Record<string, any> {
  return {
    seo: {
      ...settings.seo,
      metaTags: generateSocialMetaTags(settings.seo, settings.social),
      analyticsScript: generateAnalyticsScript(settings.analytics)
    },
    domain: settings.domain,
    scripts: settings.scripts
  };
}
