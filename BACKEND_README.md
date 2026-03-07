# Website Builder Platform - Backend Documentation

A fully functional developer-focused website builder platform with visual builder, real-time collaboration, custom code components, API integrations, plugin architecture, template marketplace, asset management, version control, and one-click Vercel deployment.

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Database**: PostgreSQL (via Supabase or self-hosted)
- **ORM**: Prisma
- **Real-time**: Yjs CRDT for collaboration

### Storage
- **Page Schema**: JSON storage in PostgreSQL
- **Assets**: Local storage (with S3/Cloudinary support)

### Deployment
- **Platform**: Vercel API integration

## Features

### 1. Project System
- Create multiple projects
- Project structure with pages, components, assets, settings
- Each project represents one website

### 2. Page Builder Data Model
- Store page structure as JSON schema
- Components with styles, props, and children
- Real-time updates to schema on canvas edits

### 3. Real-time Collaboration
- Multi-user editing (Google Docs-style)
- Yjs CRDT-based collaboration
- Cursor presence indicators
- Real-time state synchronization

### 4. Code Component Execution
- Sandboxed execution using vm2
- Support for HTML, CSS, JavaScript, React components
- Security validation for unsafe code

### 5. API Integration Component
- Connect external APIs
- Configure endpoints, methods, headers
- Authentication support (API Key, OAuth2, Bearer, Basic)
- Response mapping to UI components

### 6. Asset Management
- Upload images, videos, documents, fonts
- Cloud storage integration (S3, Cloudinary)
- Asset library per project
- Direct insertion into components

### 7. Template System
- Predefined JSON schema templates
- Categories: Business, Portfolio, E-commerce, Blog
- One-click template application
- Custom template creation

### 8. Plugin & Extension Marketplace
- Component plugins
- Feature plugins (Analytics, SEO, Forms)
- Integration plugins (Stripe, PayPal)
- Install/uninstall per project

### 9. Export System
- Export as static site (HTML/CSS)
- Export as Next.js project
- Export for Vercel deployment

### 10. Vercel Deployment System
- One-click publish to Vercel
- Automatic Next.js code generation
- Custom domain support
- Environment variables management

### 11. Version History
- Track all project versions
- Rollback to any previous version
- Version messages/commit notes
- Automatic versioning on save

### 12. Project Settings
- SEO metadata (title, description, keywords, OG tags)
- Domain configuration
- Favicon upload
- Analytics scripts (Google Analytics, Plausible)
- Custom head/body scripts

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Vercel account (optional, for deployment)

### Installation

1. **Clone and install dependencies**
```bash
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/website_builder"
VERCEL_TOKEN="your-vercel-token"
VERCEL_TEAM_ID="your-team-id"
```

3. **Set up database**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed default templates and plugins
npm run db:seed
```

4. **Run development server**
```bash
npm run dev
```

## API Reference

### Projects

```
GET    /api/projects              - List projects
POST   /api/projects              - Create project
GET    /api/projects/:id          - Get project
PUT    /api/projects/:id          - Update project
DELETE /api/projects/:id          - Delete project
```

### Pages

```
GET    /api/projects/:id/pages           - List pages
POST   /api/projects/:id/pages           - Create page
GET    /api/projects/:id/pages/:pageId   - Get page
PUT    /api/projects/:id/pages/:pageId   - Update page
DELETE /api/projects/:id/pages/:pageId   - Delete page
```

### Versions

```
GET    /api/projects/:id/versions              - List versions
POST   /api/projects/:id/versions              - Create version
POST   /api/projects/:id/versions/:id/rollback - Rollback to version
```

### Assets

```
GET  /api/projects/:id/assets    - List assets
POST /api/projects/:id/assets    - Upload asset
```

### Collaborators

```
GET    /api/projects/:id/collaborators          - List collaborators
POST   /api/projects/:id/collaborators          - Invite collaborator
PUT    /api/projects/:id/collaborators/:userId  - Update role
DELETE /api/projects/:id/collaborators/:userId  - Remove collaborator
```

### Deployments

```
GET  /api/projects/:id/deployments  - List deployments
POST /api/projects/:id/deployments  - Create deployment
```

### Export

```
POST /api/projects/:id/export  - Export project
```

### Templates

```
GET  /api/templates   - List templates
POST /api/templates   - Create template
```

### Plugins

```
GET  /api/plugins   - List plugins
POST /api/plugins   - Create plugin
```

### Collaboration

```
GET  /api/collaboration/:projectId  - Get collaboration state
POST /api/collaboration/:projectId  - Update collaboration state
```

## Database Schema

### Core Models

- **User**: User accounts
- **Project**: Website projects
- **Page**: Pages within projects
- **ProjectVersion**: Version history for projects
- **PageVersion**: Version history for pages
- **Collaboration**: Project collaborators
- **CollaborationSession**: Real-time collaboration state
- **Asset**: Uploaded media files
- **Template**: Pre-built templates
- **Plugin**: Extendable plugins
- **InstalledPlugin**: Project plugin installations
- **ApiIntegration**: API connections
- **Deployment**: Deployment records
- **ProjectAnalytics**: Usage analytics

## Page Schema Format

```typescript
interface PageSchema {
  components: BuilderComponent[];
  styles?: PageStyles;
  settings?: PageSettings;
}

interface BuilderComponent {
  id: string;
  type: ComponentType;
  category: ComponentCategory;
  name: string;
  styles: StyleProperties;
  content: ContentProperties;
  children?: BuilderComponent[];
  locked?: boolean;
  hidden?: boolean;
}
```

## Component Types

### Basic
- section, container, divider, spacer

### Text
- heading, paragraph, subheading, list, quote

### Media
- image, video, gallery, backgroundVideo

### Layout
- hero, grid, columns, cards, tabs, accordion

### Forms
- input, textarea, select, checkbox, loginForm, signupForm, contactForm

### Ecommerce
- productCard, productGrid, shoppingCart, checkout, paymentBlock

### Navigation
- navbar, sidebarNav, breadcrumbs

### Advanced
- html, customCode, apiComponent

## Security Considerations

1. **Code Execution**: All custom code runs in sandboxed VM
2. **Input Validation**: All API inputs are validated
3. **Access Control**: Project access verified on all endpoints
4. **XSS Prevention**: HTML sanitization for custom code
5. **Rate Limiting**: Implement rate limiting in production

## Deployment

### Vercel Setup

1. Create Vercel account at https://vercel.com
2. Generate API token in Settings > API
3. Add token to `.env`:
```env
VERCEL_TOKEN="your-token"
```

### Production Database

For production, use a managed PostgreSQL service:
- [Supabase](https://supabase.com)
- [Neon](https://neon.tech)
- [Railway](https://railway.app)
- AWS RDS

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Run tests
5. Submit pull request

## License

MIT License - See LICENSE file for details
