// Advanced Components - HTML, Custom Code, API Data, Embed

import type { ComponentDefinition } from '@/types/builder';

// ============================================================================
// HTML COMPONENT
// ============================================================================

export const HtmlComponent: ComponentDefinition = {
  type: 'html',
  name: 'HTML Component',
  category: 'advanced',
  description: 'Custom HTML code',
  icon: 'code',
  defaultProps: {
    html: '<div>Your custom HTML here</div>',
  },
  defaultStyles: { width: '100%' },
  meta: { isDroppable: false, description: 'Raw HTML content' },
  render: ({ node, styles }) => {
    const html = (node.props.html as string) || '';
    return <div style={styles} dangerouslySetInnerHTML={{ __html: html }} />;
  },
};

// ============================================================================
// CUSTOM CODE
// ============================================================================

export const CustomCodeComponent: ComponentDefinition = {
  type: 'customCode',
  name: 'Custom Code',
  category: 'advanced',
  description: 'Custom JavaScript/React code',
  icon: 'file-code',
  defaultProps: {
    code: '// Your custom code here\nconsole.log("Hello World");',
    language: 'javascript',
  },
  defaultStyles: { width: '100%' },
  meta: { isDroppable: false, description: 'Custom code block' },
  render: ({ node, styles }) => {
    const code = (node.props.code as string) || '';
    const language = (node.props.language as string) || 'javascript';
    
    return (
      <pre style={{ ...styles, padding: '16px', backgroundColor: '#1a1a2e', color: '#a5b4fc', borderRadius: '8px', overflowX: 'auto', fontFamily: 'monospace', fontSize: '14px' }}>
        <code>{code}</code>
      </pre>
    );
  },
};

// ============================================================================
// API COMPONENT
// ============================================================================

export const ApiComponent: ComponentDefinition = {
  type: 'apiComponent',
  name: 'API Data Block',
  category: 'advanced',
  description: 'Fetch and display API data',
  icon: 'cloud',
  defaultProps: {
    endpoint: 'https://jsonplaceholder.typicode.com/posts/1',
    method: 'GET',
    displayField: 'title',
    headers: {},
  },
  defaultStyles: { width: '100%', padding: '24px', backgroundColor: '#f8fafc', borderRadius: '8px' },
  meta: { isDroppable: false, description: 'API data fetcher' },
  render: ({ node, styles }) => {
    const endpoint = (node.props.endpoint as string) || '';
    const displayField = (node.props.displayField as string) || 'data';
    
    return (
      <div style={styles}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', backgroundColor: '#3b82f6', color: '#fff', padding: '4px 8px', borderRadius: '4px' }}>GET</span>
          <code style={{ fontSize: '14px', color: '#6b7280' }}>{endpoint}</code>
        </div>
        <div style={{ padding: '16px', backgroundColor: '#1a1a2e', borderRadius: '6px', color: '#a5b4fc', fontFamily: 'monospace', fontSize: '12px' }}>
          {`{
  "${displayField}": "Sample data from API"
}`}
        </div>
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
          ⚠️ API data is fetched at runtime. This is a preview.
        </p>
      </div>
    );
  },
};

// ============================================================================
// EMBED
// ============================================================================

export const EmbedComponent: ComponentDefinition = {
  type: 'embed',
  name: 'Embed',
  category: 'advanced',
  description: 'Embed external content (maps, calendars, etc.)',
  icon: 'external-link',
  defaultProps: {
    embedCode: '<iframe src="https://www.openstreetmap.org/export/embed.html" width="100%" height="400"></iframe>',
    type: 'iframe',
  },
  defaultStyles: { width: '100%', minHeight: '400px' },
  meta: { isDroppable: false, description: 'Embedded content' },
  render: ({ node, styles }) => {
    const embedCode = (node.props.embedCode as string) || '';
    return <div style={styles} dangerouslySetInnerHTML={{ __html: embedCode }} />;
  },
};

// ============================================================================
// MAP
// ============================================================================

export const MapComponent: ComponentDefinition = {
  type: 'map',
  name: 'Map',
  category: 'advanced',
  description: 'Interactive map (OpenStreetMap)',
  icon: 'map',
  defaultProps: {
    latitude: 40.7128,
    longitude: -74.006,
    zoom: 13,
    height: 400,
  },
  defaultStyles: { width: '100%', borderRadius: '8px', overflow: 'hidden' },
  meta: { isDroppable: false, description: 'Interactive map' },
  render: ({ node, styles }) => {
    const lat = (node.props.latitude as number) || 40.7128;
    const lon = (node.props.longitude as number) || -74.006;
    const zoom = (node.props.zoom as number) || 13;
    const height = (node.props.height as number) || 400;
    
    return (
      <iframe
        width="100%"
        height={height}
        style={{ ...styles, border: 0 }}
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.01},${lat - 0.01},${lon + 0.01},${lat + 0.01}&layer=mapnik`}
        title="Map"
      />
    );
  },
};

// ============================================================================
// SOCIAL SHARE
// ============================================================================

export const SocialShareComponent: ComponentDefinition = {
  type: 'socialShare',
  name: 'Social Share',
  category: 'advanced',
  description: 'Social media share buttons',
  icon: 'share',
  defaultProps: {
    platforms: ['facebook', 'twitter', 'linkedin', 'email'],
    url: '',
    title: 'Check this out!',
    layout: 'horizontal',
  },
  defaultStyles: { display: 'flex', gap: '12px' },
  meta: { isDroppable: false, description: 'Social sharing buttons' },
  render: ({ node, styles }) => {
    const platforms = (node.props.platforms as string[]) || ['facebook', 'twitter'];
    const layout = (node.props.layout as string) || 'horizontal';
    
    const icons: Record<string, string> = {
      facebook: '📘',
      twitter: '🐦',
      linkedin: '💼',
      email: '📧',
      whatsapp: '💬',
    };
    
    return (
      <div style={{ ...styles, flexDirection: layout === 'vertical' ? 'column' : 'row' }}>
        {platforms.map((platform) => (
          <button
            key={platform}
            style={{
              padding: '10px 16px',
              backgroundColor: '#f1f5f9',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '20px',
            }}
            title={`Share on ${platform}`}
          >
            {icons[platform] || '🔗'}
          </button>
        ))}
      </div>
    );
  },
};

// ============================================================================
// ANALYTICS
// ============================================================================

export const AnalyticsComponent: ComponentDefinition = {
  type: 'analytics',
  name: 'Analytics Tracker',
  category: 'advanced',
  description: 'Analytics tracking code placeholder',
  icon: 'bar-chart',
  defaultProps: {
    provider: 'google',
    trackingId: 'G-XXXXXXXXXX',
  },
  defaultStyles: { padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b' },
  meta: { isDroppable: false, description: 'Analytics tracking' },
  render: ({ node }) => {
    const provider = (node.props.provider as string) || 'google';
    const trackingId = (node.props.trackingId as string) || '';
    
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontWeight: '600', marginBottom: '4px' }}>📊 Analytics Tracker</p>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>Provider: {provider} | ID: {trackingId}</p>
        <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>Tracking code is injected in production</p>
      </div>
    );
  },
};

export const advancedComponents: ComponentDefinition[] = [
  HtmlComponent,
  CustomCodeComponent,
  ApiComponent,
  EmbedComponent,
  MapComponent,
  SocialShareComponent,
  AnalyticsComponent,
];
