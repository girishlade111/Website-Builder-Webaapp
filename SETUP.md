# Website Builder Platform - Setup Guide

This guide will help you set up and run the complete website builder platform with all backend features.

## Prerequisites

- **Node.js** 18 or higher
- **PostgreSQL** database (local or cloud-hosted)
- **npm** or **yarn** package manager

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure your database:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/website_builder?schema=public"
```

**Optional:** Configure Vercel for deployment features:

```env
VERCEL_TOKEN="your-vercel-token"
VERCEL_TEAM_ID="your-team-id"
```

### 3. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Seed default templates and plugins
npm run db:seed
```

### 4. Run Development Server

```bash
# Standard development (Next.js only)
npm run dev

# Development with WebSocket server (for real-time collaboration)
npm run dev:ws
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

---

## Database Setup

### Option 1: Local PostgreSQL

1. Install PostgreSQL from https://www.postgresql.org/download/

2. Create database:

```bash
createdb website_builder
```

3. Update `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/website_builder?schema=public"
```

### Option 2: Supabase (Cloud PostgreSQL)

1. Create account at https://supabase.com

2. Create new project

3. Get connection string from Settings > Database

4. Update `.env`:

```env
DATABASE_URL="postgresql://postgres:[password]@[project-ref].supabase.co:5432/postgres"
```

### Option 3: Neon (Serverless PostgreSQL)

1. Create account at https://neon.tech

2. Create new project

3. Get connection string

4. Update `.env`:

```env
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/website_builder"
```

---

## Storage Configuration

### Local Storage (Default)

Files are stored in `public/uploads/` directory. No configuration needed.

### AWS S3

1. Create S3 bucket in AWS Console

2. Create IAM user with S3 permissions

3. Get access keys

4. Update `.env`:

```env
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"
```

### Cloudinary

1. Create account at https://cloudinary.com

2. Get credentials from Dashboard

3. Update `.env`:

```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

---

## Vercel Deployment Setup

### Get Vercel Token

1. Go to https://vercel.com/account/settings/tokens

2. Create new API token

3. Copy the token

### Configure Environment

```env
VERCEL_TOKEN="your-token-here"
VERCEL_TEAM_ID="your-team-id"  # Optional - for team deployments
```

### Deploy to Vercel

1. Push code to GitHub

2. Import project in Vercel

3. Add environment variables in Vercel dashboard

4. Deploy

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run dev:ws` | Start with WebSocket server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed database with templates/plugins |
| `npm run db:studio` | Open Prisma Studio |

---

## API Endpoints

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project |
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
| DELETE | `/api/projects/:id/assets/:assetId` | Delete asset |

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
| GET | `/api/projects/:id/settings` | Get settings |
| PUT | `/api/projects/:id/settings` | Update settings |

### Plugins

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/plugins` | List marketplace plugins |
| GET | `/api/projects/:id/plugins` | List installed plugins |
| POST | `/api/projects/:id/plugins` | Install plugin |
| DELETE | `/api/projects/:id/plugins/:pluginId` | Uninstall plugin |

### Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/templates` | List templates |

### API Integrations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:id/api-integrations` | List integrations |
| POST | `/api/projects/:id/api-integrations` | Create integration |
| PUT | `/api/projects/:id/api-integrations/:id` | Update integration |
| DELETE | `/api/projects/:id/api-integrations/:id` | Delete integration |
| POST | `/api/projects/:id/api-integrations/:id/test` | Test integration |

### Export

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects/:id/export?format=nextjs\|static` | Export project |

### Collaboration

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/collaboration/:projectId` | Get collaboration session |
| WS | `ws://localhost:3000/ws/:projectId` | WebSocket for real-time |

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth?action=login` | Login |
| POST | `/api/auth?action=register` | Register |
| POST | `/api/auth?action=logout` | Logout |
| GET | `/api/auth/me` | Get current user |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Builder   │  │  Dashboard  │  │   Component Lib     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Routes (Next.js)                       │
│  ┌─────────┐ ┌────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │Projects │ │ Pages  │ │ Versions │ │  Deployments     │   │
│  └─────────┘ └────────┘ └──────────┘ └──────────────────┘   │
│  ┌─────────┐ ┌────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │ Assets  │ │Plugins │ │Templates │ │  Collaborators   │   │
│  └─────────┘ └────────┘ └──────────┘ └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Services Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Deployment  │  │    Code     │  │   Asset Storage     │  │
│  │   Service   │  │ Generation  │  │      Service        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │    Code     │  │    API      │  │    Project          │  │
│  │  Execution  │  │ Integration │  │    Settings         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Prisma    │  │  PostgreSQL │  │   Yjs (Real-time)   │  │
│  │     ORM     │  │   Database  │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### Database Connection Error

```bash
# Check if PostgreSQL is running
pg_isready

# Restart PostgreSQL (macOS with Homebrew)
brew services restart postgresql@14
```

### Prisma Client Errors

```bash
# Regenerate Prisma client
npm run db:generate
```

### WebSocket Connection Issues

```bash
# Run with WebSocket server
npm run dev:ws
```

### Port Already in Use

```bash
# Kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

---

## Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run db:generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL=your-production-db-url
VERCEL_TOKEN=your-vercel-token
SESSION_SECRET=secure-random-string
```

---

## Support

For issues and questions:
- Check BACKEND_README.md for detailed documentation
- Review the API reference in this guide
- Check Prisma schema in `prisma/schema.prisma`
