# 🚀 Website Builder Platform

A **full-stack, developer-focused website builder** with a visual drag-and-drop builder, real-time collaboration, custom code components, API integrations, plugin architecture, template marketplace, asset management, version control, and one-click Vercel deployment.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7.4.2-green?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue?logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Component System](#-component-system)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🏗️ Core Builder Features

| Feature | Description |
|---------|-------------|
| **Visual Page Builder** | Drag-and-drop interface with 40+ pre-built components |
| **Real-time Collaboration** | Multi-user editing with Yjs CRDT, cursor presence, live updates |
| **Code Components** | Sandboxed execution for custom HTML, CSS, and React components |
| **API Integration** | Connect external APIs with configurable authentication |
| **Asset Management** | Upload and manage images, videos, documents with cloud storage |
| **Template System** | 5+ pre-built templates for quick project setup |
| **Plugin Marketplace** | 8+ plugins for analytics, forms, payments, and more |
| **Version History** | Track changes and rollback to previous versions |
| **Export System** | Export as static site or Next.js project (ZIP download) |
| **Vercel Deployment** | One-click deployment with custom domain support |

### 🎨 Component Library

**40+ Components** across 8 categories:

- **Basic**: Section, Container, Divider, Spacer
- **Text**: Heading, Paragraph, Subheading, List, Quote
- **Media**: Image, Video, Gallery, Background Video
- **Layout**: Hero, Grid, Columns, Cards, Tabs, Accordion
- **Forms**: Input, Textarea, Select, Checkbox, Login, Signup, Contact Form
- **Navigation**: Navbar, Sidebar, Breadcrumbs
- **E-commerce**: Product Card, Product Grid, Shopping Cart, Checkout, Payment Block
- **Advanced**: HTML Component, Custom Code, API Component

### 👥 Collaboration Features

- **Multi-user editing** - Multiple users can edit the same project simultaneously
- **Real-time sync** - Changes sync instantly using Yjs CRDT and WebSockets
- **Cursor presence** - See where other users are working with colored cursors
- **Role-based access** - Owner, Admin, Editor, Viewer roles
- **Version history** - Automatic versioning with rollback capability

### 🔐 Security Features

- **Sandboxed code execution** - Custom code runs in isolated VM (vm2)
- **Input validation** - All API inputs are validated and sanitized
- **Access control** - Project access verified on all endpoints
- **XSS prevention** - HTML sanitization for custom code components
- **Secure authentication** - Session-based auth with HTTP-only cookies

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.6 | React framework with App Router |
| **React** | 19.2.3 | UI library |
| **TypeScript** | 5.0 | Type safety |
| **Tailwind CSS** | 4.0 | Styling |
| **Zustand** | 5.0.11 | State management |
| **@dnd-kit** | 6.3.1 | Drag-and-drop functionality |
| **@monaco-editor/react** | 4.7.0 | Code editor component |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **Next.js API Routes** | 16.1.6 | RESTful API endpoints |
| **Prisma** | 7.4.2 | Database ORM |
| **PostgreSQL** | 15+ | Primary database |
| **Yjs** | 13.6.29 | CRDT for real-time collaboration |
| **WebSocket** | 8.19.0 | Real-time communication |

### Storage & Deployment

| Service | Purpose |
|---------|---------|
| **Local Storage** | Default file storage (public/uploads) |
| **AWS S3** | Optional cloud storage |
| **Cloudinary** | Optional image/video optimization |
| **Vercel** | Deployment platform with API integration |

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Dashboard  │  │   Builder    │  │   Component Library  │   │
│  │              │  │              │  │                      │   │
│  │  • Projects  │  │  • Canvas    │  │  • 40+ Components    │   │
│  │  • Templates │  │  • Sidebar   │  │  • Drag & Drop       │   │
│  │  • Settings  │  │  • Toolbar   │  │  • Properties Panel  │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Routes (Next.js)                        │
│                                                                  │
│  ┌──────────┐ ┌────────┐ ┌──────────┐ ┌──────────────────┐     │
│  │ Projects │ │ Pages  │ │ Versions │ │  Deployments     │     │
│  └──────────┘ └────────┘ └──────────┘ └──────────────────┘     │
│  ┌──────────┐ ┌────────┐ ┌──────────┐ ┌──────────────────┐     │
│  │  Assets  │ │Plugins │ │Templates │ │  Collaborators   │     │
│  └──────────┘ └────────┘ └──────────┘ └──────────────────┘     │
│  ┌──────────┐ ┌────────┐ ┌──────────┐ ┌──────────────────┐     │
│  │ Settings │ │  Auth  │ │   API    │ │    Export        │     │
│  │          │ │        │ │Integration│ │                  │     │
│  └──────────┘ └────────┘ └──────────┘ └──────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Services Layer                             │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Deployment  │  │    Code      │  │   Asset Storage      │   │
│  │   Service    │  │  Generation  │  │      Service         │   │
│  │              │  │              │  │  • Local/S3/Cloudinary│  │
│  │  • Vercel    │  │  • Next.js   │  └──────────────────────┘   │
│  │  • Custom    │  │  • Static    │                              │
│  └──────────────┘  └──────────────┘  ┌──────────────────────┐   │
│  ┌──────────────┐  ┌──────────────┐  │   Code Execution     │   │
│  │    API       │  │   Project    │  │      Service         │   │
│  │ Integration  │  │   Settings   │  │  • Sandboxed VM      │   │
│  │              │  │              │  │  • Security checks   │   │
│  │  • REST APIs │  │  • SEO       │  └──────────────────────┘   │
│  │  • Auth      │  │  • Domain    │                              │
│  │  • Mapping   │  │  • Analytics │                              │
│  └──────────────┘  └──────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                                │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Prisma     │  │  PostgreSQL  │  │   Yjs (Real-time)    │   │
│  │     ORM      │  │   Database   │  │                      │   │
│  │              │  │              │  │  • CRDT Sync         │   │
│  │  • 15 Models │  │  • 15 Tables │  │  • State Persistence │   │
│  │  • Relations │  │  • JSON      │  │  • Cursor Tracking   │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Database Schema

**15 Models:**

1. **User** - User accounts and authentication
2. **Project** - Website projects with settings
3. **Page** - Individual pages with JSON schema
4. **ProjectVersion** - Project-level version history
5. **PageVersion** - Page-level version history
6. **Collaboration** - User-project access control
7. **CollaborationSession** - Real-time collaboration state
8. **Asset** - Uploaded files and media
9. **Template** - Pre-built templates
10. **Plugin** - Marketplace plugins
11. **InstalledPlugin** - Project plugin installations
12. **ApiIntegration** - External API connections
13. **Deployment** - Vercel deployment records
14. **ProjectAnalytics** - Usage metrics
15. **Session/Account/VerificationToken** - Auth support

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **PostgreSQL** database (local or cloud-hosted)
- **npm** or **yarn** package manager

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/your-org/website-builder.git
cd website-builder
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/website_builder?schema=public"

# Vercel Configuration (Optional)
VERCEL_TOKEN="your-vercel-token"
VERCEL_TEAM_ID="your-team-id"

# Storage Configuration (Optional)
# AWS S3
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="us-east-1"
AWS_S3_BUCKET=""

# Cloudinary
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_WS_HOST="localhost:3000"
SESSION_SECRET="your-secret-change-in-production"
```

#### 4. Initialize Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Seed default templates and plugins
npm run db:seed
```

#### 5. Run Development Server

```bash
# Standard development (Next.js only)
npm run dev

# Development with WebSocket server (for real-time collaboration)
npm run dev:ws
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

---

## 📁 Project Structure

```
website-builder/
├── prisma/
│   ├── schema.prisma          # Database schema (15 models)
│   ├── seed.ts                # Seed data for templates/plugins
│   └── migrations/            # Database migrations
│
├── src/
│   ├── app/
│   │   ├── api/               # API Routes
│   │   │   ├── projects/      # Project CRUD & sub-resources
│   │   │   │   ├── route.ts
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   ├── pages/
│   │   │   │   │   ├── versions/
│   │   │   │   │   ├── assets/
│   │   │   │   │   ├── collaborators/
│   │   │   │   │   ├── deployments/
│   │   │   │   │   ├── settings/
│   │   │   │   │   ├── plugins/
│   │   │   │   │   └── api-integrations/
│   │   │   ├── templates/     # Template marketplace
│   │   │   ├── plugins/       # Plugin marketplace
│   │   │   ├── auth/          # Authentication
│   │   │   ├── collaboration/ # Real-time collaboration
│   │   │   └── ws/            # WebSocket endpoint
│   │   │
│   │   ├── [locale]/          # Internationalized pages
│   │   │   ├── dashboard/     # Project dashboard
│   │   │   └── builder/       # Visual page builder
│   │   │
│   │   ├── globals.css        # Global styles
│   │   └── layout.tsx         # Root layout
│   │
│   ├── builder/               # Builder components
│   │   ├── canvas/            # Drag-and-drop canvas
│   │   ├── sidebar/           # Component library sidebar
│   │   ├── properties/        # Properties panel
│   │   ├── toolbar/           # Toolbar with actions
│   │   ├── assets/            # Asset library UI
│   │   ├── deployment/        # Deployment panel
│   │   └── collaboration/     # Collaboration UI
│   │
│   ├── components/            # Shared components
│   ├── lib/
│   │   ├── services/          # Business logic
│   │   │   ├── deployment.ts       # Vercel deployment
│   │   │   ├── codeGeneration.ts   # Next.js code generation
│   │   │   ├── codeExecution.ts    # Sandboxed code execution
│   │   │   ├── apiIntegration.ts   # API connections
│   │   │   ├── assetStorage.ts     # File storage
│   │   │   └── projectSettings.ts  # SEO, domain, analytics
│   │   │
│   │   ├── apiClient.ts       # Frontend API client
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── ws-server.ts       # WebSocket server (Yjs)
│   │   └── auth.ts            # Authentication utilities
│   │
│   ├── stores/
│   │   └── useBuilderStore.ts # Zustand state management
│   │
│   ├── types/
│   │   ├── components.ts      # Component type definitions
│   │   └── backend.ts         # API type definitions
│   │
│   ├── templates/             # Template definitions
│   ├── plugins/               # Plugin definitions
│   └── utils/                 # Utility functions
│
├── public/
│   └── uploads/               # Local file storage
│
├── .env.example               # Environment variables template
├── SETUP.md                   # Detailed setup guide
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── next.config.ts             # Next.js configuration
├── prisma.config.ts           # Prisma configuration
└── server.ts                  # Custom server with WebSocket
```

---

## 📡 API Reference

### Base URL

```
Development: http://localhost:3000/api
Production:  https://your-domain.com/api
```

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth?action=login` | Login user |
| `POST` | `/api/auth?action=register` | Register new user |
| `POST` | `/api/auth?action=logout` | Logout user |
| `GET` | `/api/auth/me` | Get current user |

**Example: Login**

```bash
curl -X POST "http://localhost:3000/api/auth?action=login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects` | List all projects |
| `POST` | `/api/projects` | Create new project |
| `GET` | `/api/projects/:id` | Get project by ID |
| `PUT` | `/api/projects/:id` | Update project |
| `DELETE` | `/api/projects/:id` | Delete project |

**Example: Create Project**

```bash
curl -X POST "http://localhost:3000/api/projects" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Website",
    "description": "A beautiful website",
    "templateId": "template-123"
  }'
```

### Pages

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects/:id/pages` | List all pages |
| `POST` | `/api/projects/:id/pages` | Create new page |
| `GET` | `/api/projects/:id/pages/:pageId` | Get page by ID |
| `PUT` | `/api/projects/:id/pages/:pageId` | Update page |
| `DELETE` | `/api/projects/:id/pages/:pageId` | Delete page |

**Page Schema Format**

```json
{
  "name": "Home",
  "path": "/",
  "schema": {
    "components": [
      {
        "id": "hero-1",
        "type": "hero",
        "category": "layout",
        "styles": {
          "className": "py-20 bg-gradient-to-r from-blue-500 to-purple-600",
          "textAlign": "center"
        },
        "content": {
          "title": "Welcome",
          "subtitle": "Build amazing websites",
          "ctaText": "Get Started"
        }
      }
    ],
    "styles": {},
    "settings": {}
  }
}
```

### Versions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects/:id/versions` | List all versions |
| `POST` | `/api/projects/:id/versions` | Create new version |
| `POST` | `/api/projects/:id/versions/:versionId/rollback` | Rollback to version |

### Assets

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects/:id/assets` | List all assets |
| `POST` | `/api/projects/:id/assets` | Upload new asset |
| `DELETE` | `/api/projects/:id/assets/:assetId` | Delete asset |

**Example: Upload Asset**

```bash
curl -X POST "http://localhost:3000/api/projects/:id/assets" \
  -F "file=@/path/to/image.jpg" \
  -F "name=My Image"
```

### Collaborators

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects/:id/collaborators` | List collaborators |
| `POST` | `/api/projects/:id/collaborators` | Invite collaborator |
| `PUT` | `/api/projects/:id/collaborators/:userId` | Update role |
| `DELETE` | `/api/projects/:id/collaborators/:userId` | Remove collaborator |

**Collaboration Roles**

- `OWNER` - Full access, can delete project
- `ADMIN` - Full access except delete
- `EDITOR` - Can edit content
- `VIEWER` - Read-only access

### Deployments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects/:id/deployments` | List deployments |
| `POST` | `/api/projects/:id/deployments` | Create deployment |

**Example: Deploy to Vercel**

```bash
curl -X POST "http://localhost:3000/api/projects/:id/deployments" \
  -H "Content-Type: application/json" \
  -d '{
    "environment": "production",
    "customDomain": "example.com"
  }'
```

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects/:id/settings` | Get all settings |
| `PUT` | `/api/projects/:id/settings` | Update settings |

**Settings Structure**

```json
{
  "seo": {
    "title": "My Website",
    "description": "A beautiful website",
    "keywords": ["website", "builder"],
    "ogImage": "/og-image.jpg"
  },
  "domain": {
    "customDomain": "example.com",
    "forceHttps": true
  },
  "analytics": {
    "googleAnalyticsId": "G-XXXXXXXXXX"
  },
  "scripts": {
    "headScripts": ["<script>console.log('head')</script>"],
    "bodyScripts": ["<script>console.log('body')</script>"]
  }
}
```

### Plugins

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/plugins` | List marketplace plugins |
| `GET` | `/api/projects/:id/plugins` | List installed plugins |
| `POST` | `/api/projects/:id/plugins` | Install plugin |
| `DELETE` | `/api/projects/:id/plugins/:pluginId` | Uninstall plugin |

### Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/templates` | List all templates |

**Query Parameters**

- `category` - Filter by category (Business, Portfolio, E-commerce, Blog)
- `tag` - Filter by tag
- `search` - Search by name/description
- `premium` - Filter premium templates

### API Integrations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects/:id/api-integrations` | List integrations |
| `POST` | `/api/projects/:id/api-integrations` | Create integration |
| `PUT` | `/api/projects/:id/api-integrations/:id` | Update integration |
| `DELETE` | `/api/projects/:id/api-integrations/:id` | Delete integration |
| `POST` | `/api/projects/:id/api-integrations/:id/test` | Test integration |

**Supported Auth Types**

- `NONE` - No authentication
- `API_KEY` - API key in header
- `BEARER` - Bearer token
- `BASIC` - Basic auth
- `OAUTH2` - OAuth 2.0 flow

### Export

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/projects/:id/export?format=nextjs\|static` | Export project |

**Export Formats**

- `nextjs` - Export as Next.js project
- `static` - Export as static HTML/CSS
- `vercel` - Export optimized for Vercel

### Collaboration

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/collaboration/:projectId` | Get collaboration session |
| `WS` | `ws://localhost:3000/ws/:projectId` | WebSocket connection |

**WebSocket Messages**

```json
// Sync message (Yjs update)
{
  "type": "sync",
  "update": [/* Uint8Array */],
  "isInitial": true
}

// Cursor update
{
  "type": "cursor",
  "userId": "user-123",
  "cursor": { "x": 100, "y": 200 }
}

// Awareness state
{
  "type": "awareness",
  "userId": "user-123",
  "states": { "selection": { "start": 0, "end": 10 } }
}
```

---

## 🎨 Component System

### Component Categories

| Category | Components | Count |
|----------|------------|-------|
| **Basic** | Section, Container, Divider, Spacer | 4 |
| **Text** | Heading, Paragraph, Subheading, List, Quote | 5 |
| **Media** | Image, Video, Gallery, Background Video | 4 |
| **Layout** | Hero, Grid, Columns, Cards, Tabs, Accordion | 6 |
| **Forms** | Input, Textarea, Select, Checkbox, Login, Signup, Contact | 7 |
| **Navigation** | Navbar, Sidebar, Breadcrumbs | 3 |
| **E-commerce** | Product Card, Product Grid, Cart, Checkout, Payment | 5 |
| **Advanced** | HTML, Custom Code, API Component | 3 |

### Component Schema

```typescript
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

### Example: Hero Component

```json
{
  "id": "hero-1",
  "type": "hero",
  "category": "layout",
  "name": "Hero Section",
  "styles": {
    "className": "py-20 bg-gradient-to-r from-blue-500 to-purple-600 text-white",
    "textAlign": "center",
    "minHeight": "500px"
  },
  "content": {
    "title": "Welcome to Our Website",
    "subtitle": "We build amazing products",
    "ctaText": "Get Started",
    "ctaLink": "/contact"
  }
}
```

---

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**

```bash
git add .
git commit -m "feat: update website"
git push origin main
```

2. **Import in Vercel**

- Go to [vercel.com/new](https://vercel.com/new)
- Import your GitHub repository
- Configure environment variables
- Deploy

3. **Configure Environment Variables**

```env
DATABASE_URL=your-production-db-url
VERCEL_TOKEN=your-vercel-token
SESSION_SECRET=secure-random-string
```

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
npm run test:coverage
```

### Export Options

**Export as Next.js Project**

```bash
curl -X POST "http://localhost:3000/api/projects/:id/export?format=nextjs" \
  --output my-website-nextjs.zip
```

**Export as Static Site**

```bash
curl -X POST "http://localhost:3000/api/projects/:id/export?format=static" \
  --output my-website-static.zip
```

---

## 🧪 Testing

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run with coverage
npm run test:coverage
```

---

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run dev:ws` | Start with WebSocket server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |

---

## 🔒 Security

1. **Code Execution** - Custom code runs in sandboxed VM (vm2)
2. **Input Validation** - All API inputs are validated
3. **Access Control** - Project access verified on all endpoints
4. **XSS Prevention** - HTML sanitization for custom code
5. **Rate Limiting** - Recommended for production (configure in middleware)
6. **Secure Cookies** - HTTP-only, Secure, SameSite flags

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style
- Write tests for new features
- Update documentation
- Use TypeScript for type safety
- Follow commit message conventions

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [Prisma](https://prisma.io) - Database ORM
- [Yjs](https://yjs.dev) - CRDT for collaboration
- [Vercel](https://vercel.com) - Deployment platform
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [@dnd-kit](https://dndkit.com) - Drag-and-drop

---

## 📞 Support

- **Documentation**: See `SETUP.md` and `BACKEND_README.md`
- **Issues**: Open an issue on GitHub
- **Email**: support@example.com

---

## 📊 Roadmap

- [ ] Multi-language support (i18n)
- [ ] Advanced analytics dashboard
- [ ] A/B testing integration
- [ ] Form submissions storage
- [ ] E-commerce checkout flow
- [ ] Custom domain management UI
- [ ] Plugin SDK for third-party developers
- [ ] Mobile app for iOS/Android

---

**Built with ❤️ using Next.js, React, TypeScript, and Prisma**
