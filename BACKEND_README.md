# Website Builder Platform - Complete Documentation

A fully functional developer-focused website builder platform with visual builder, real-time collaboration, custom code components, API integrations, plugin architecture, template marketplace, asset management, version control, and one-click Vercel deployment.

## 🚀 Features

### Core Features

| Feature | Description |
|---------|-------------|
| **Project System** | Create and manage multiple website projects with pages, components, assets, and settings |
| **Visual Page Builder** | Drag-and-drop interface for building pages with customizable components |
| **Real-time Collaboration** | Multi-user editing with Yjs CRDT, cursor presence, and live updates |
| **Code Components** | Sandboxed execution for custom HTML, CSS, and React components |
| **API Integration** | Connect external APIs with configurable authentication and response mapping |
| **Asset Management** | Upload and manage images, videos, documents with cloud storage support |
| **Template System** | Pre-built templates for quick project setup |
| **Plugin Marketplace** | Extend functionality with plugins for analytics, forms, payments |
| **Version History** | Track changes and rollback to previous versions |
| **Vercel Deployment** | One-click deployment to Vercel with custom domain support |
| **Export System** | Export as static site or Next.js project |

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Next.js 14+ with App Router
- **Database**: PostgreSQL (via Supabase or self-hosted)
- **ORM**: Prisma
- **Real-time**: Yjs CRDT + WebSockets

### Frontend
- **Framework**: React 19 with Next.js
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Drag & Drop**: @dnd-kit

### Storage
- **Page Schema**: JSON in PostgreSQL
- **Assets**: Local storage, AWS S3, or Cloudinary

### Deployment
- **Platform**: Vercel API integration

## 📦 Installation

### Prerequisites
- Node.js 18 or higher
- PostgreSQL database
- (Optional) Vercel account for deployment features

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/website_builder?schema=public"

# Vercel Configuration (Optional)
VERCEL_TOKEN="your-vercel-token"
VERCEL_TEAM_ID="your-team-id"

# Storage Configuration (Optional - local storage used by default)
# AWS S3
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="us-east-1"
AWS_S3_BUCKET=""

# Cloudinary (alternative to S3)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
SESSION_SECRET="your-secret-change-in-production"
```

### 3. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed default templates and plugins
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the dashboard.

## 📁 Project Structure

```
website-builder/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data for templates/plugins
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── projects/  # Project CRUD endpoints
│   │   │   ├── templates/ # Template endpoints
│   │   │   ├── plugins/   # Plugin endpoints
│   │   │   └── collaboration/ # Real-time collab
│   │   └── [locale]/
│   │       ├── dashboard/ # Project dashboard
│   │       └── builder/   # Visual builder
│   ├── builder/
│   │   ├── canvas/        # Canvas component
│   │   ├── sidebar/       # Component library
│   │   ├── properties/    # Properties panel
│   │   ├── toolbar/       # Toolbar
│   │   ├── assets/        # Asset library
│   │   ├── deployment/    # Deployment panel
│   │   └── collaboration/ # Collaboration UI
│   ├── lib/
│   │   ├── services/      # Business logic
│   │   │   ├── deployment.ts
│   │   │   ├── codeGeneration.ts
│   │   │   ├── codeExecution.ts
│   │   │   ├── apiIntegration.ts
│   │   │   └── assetStorage.ts
│   │   ├── apiClient.ts   # Frontend API client
│   │   └── prisma.ts      # Prisma client
│   ├── stores/
│   │   └── useBuilderStore.ts  # Zustand store
│   └── types/
│       ├── components.ts  # Component definitions
│       └── backend.ts     # TypeScript types
└── server.ts              # Custom server with WebSocket
```

## 📖 API Reference

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create new project |
| GET | `/api/projects/:id` | Get project by ID |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |

### Pages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:id/pages` | List pages |
| POST | `/api/projects/:id/pages` | Create page |
| GET | `/api/projects/:id/pages/:pageId` | Get page |
| PUT | `/api/projects/:id/pages/:pageId` | Update page |
| DELETE | `/api/projects/:id/pages/:pageId` | Delete page |

### Versions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:id/versions` | List versions |
| POST | `/api/projects/:id/versions` | Create version |
| POST | `/api/projects/:id/versions/:id/rollback` | Rollback |

### Assets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:id/assets` | List assets |
| POST | `/api/projects/:id/assets` | Upload asset |

### Collaborators

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:id/collaborators` | List collaborators |
| POST | `/api/projects/:id/collaborators` | Invite collaborator |
| PUT | `/api/projects/:id/collaborators/:userId` | Update role |
| DELETE | `/api/projects/:id/collaborators/:userId` | Remove |

### Deployments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:id/deployments` | List deployments |
| POST | `/api/projects/:id/deployments` | Create deployment |

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:id/settings` | Get all settings |
| PUT | `/api/projects/:id/settings` | Update settings |
| PUT | `/api/projects/:id/settings/seo` | Update SEO |
| PUT | `/api/projects/:id/settings/domain` | Update domain |
| PUT | `/api/projects/:id/settings/analytics` | Update analytics |

### Plugins & Integrations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/templates` | List templates |
| GET | `/api/plugins` | List plugins |
| GET | `/api/projects/:id/plugins` | List installed plugins |
| POST | `/api/projects/:id/plugins` | Install plugin |
| GET | `/api/projects/:id/api-integrations` | List API integrations |
| POST | `/api/projects/:id/api-integrations` | Create integration |
| POST | `/api/projects/:id/api-integrations/:id/test` | Test integration |

### Export

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects/:id/export?format=nextjs\|static` | Export project |

## 🎨 Component System

### Component Categories

| Category | Components |
|----------|------------|
| **Basic** | section, container, divider, spacer |
| **Text** | heading, paragraph, subheading, list, quote |
| **Media** | image, video, gallery, backgroundVideo |
| **Layout** | hero, grid, columns, cards, tabs, accordion |
| **Forms** | input, textarea, select, checkbox, contactForm |
| **Navigation** | navbar, sidebarNav, breadcrumbs |
| **Ecommerce** | productCard, productGrid, shoppingCart |
| **Advanced** | html, customCode, apiComponent |

### Page Schema Format

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

## 🔐 Security

1. **Code Execution**: Custom code runs in sandboxed VM (vm2)
2. **Input Validation**: All API inputs are validated
3. **Access Control**: Project access verified on all endpoints
4. **XSS Prevention**: HTML sanitization for custom code
5. **Rate Limiting**: Recommended for production

## 🚀 Deployment

### Vercel Setup

1. Create Vercel account at https://vercel.com
2. Generate API token in Settings > API
3. Add token to `.env`:

```env
VERCEL_TOKEN="your-token"
VERCEL_TEAM_ID="your-team-id"
```

### Production Database

For production, use a managed PostgreSQL service:
- [Supabase](https://supabase.com)
- [Neon](https://neon.tech)
- [Railway](https://railway.app)
- AWS RDS

### Build Commands

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Database commands
npm run db:generate
npm run db:push
npm run db:migrate
npm run db:seed

# Testing
npm run test
npm run test:run
```

## 🧪 Testing

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run with coverage
npm run test:coverage
```

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run dev:ws` | Start with WebSocket server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org)
- [Prisma](https://prisma.io)
- [Yjs](https://yjs.dev)
- [Vercel](https://vercel.com)
- [Tailwind CSS](https://tailwindcss.com)
