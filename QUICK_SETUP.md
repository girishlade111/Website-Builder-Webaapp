# Quick Setup Guide - Database Configuration

## ⚠️ IMPORTANT: Database Required

This application requires a **PostgreSQL database**. The errors you're seeing ("Failed to fetch projects", "Failed to create project") are because the database is not configured.

## Quick Fix Options

### Option 1: Use Supabase (Recommended - Free & Easy)

This is the **easiest and fastest** option - no local installation needed!

1. **Go to https://supabase.com** and create a free account

2. **Create a new project:**
   - Click "New Project"
   - Choose a project name (e.g., "website-builder")
   - Set a strong database password (save this!)
   - Choose a region close to you
   - Click "Create new project" (takes ~2 minutes)

3. **Get your connection string:**
   - Go to **Settings** (gear icon in sidebar)
   - Click **Database**
   - Under "Connection string", click **Copy** (URI mode)
   - The string looks like: `postgresql://postgres:[password]@[project-ref].supabase.co:5432/postgres`

4. **Update your `.env` file:**
   - Open `.env` in the project root
   - Replace the `DATABASE_URL` value with your Supabase connection string
   - Replace `[YOUR-PASSWORD]` with your actual database password

   ```env
   DATABASE_URL="postgresql://postgres:your-actual-password@abc123xyz.supabase.co:5432/postgres"
   ```

5. **Run database setup:**
   ```bash
   npm run db:push
   npm run db:seed
   ```

6. **Start the app:**
   ```bash
   npm run dev
   ```

### Option 2: Use Neon (Free Serverless PostgreSQL)

1. **Go to https://neon.tech** and create a free account

2. **Create a new project:**
   - Click "Create a project"
   - Enter project name
   - Click "Create project"

3. **Get your connection string:**
   - Copy the connection string shown on the dashboard
   - It looks like: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname`

4. **Update your `.env` file** and run setup commands (same as Step 4-6 above)

### Option 3: Local PostgreSQL

If you prefer to run PostgreSQL locally:

1. **Install PostgreSQL:**
   - Download from https://www.postgresql.org/download/
   - Or use Docker: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15`

2. **Create database:**
   ```bash
   # Using psql
   createdb website_builder
   
   # Or using pgAdmin/other tool
   CREATE DATABASE website_builder;
   ```

3. **Update `.env`:**
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/website_builder?schema=public"
   ```
   
   Replace `postgres:postgres` with your actual username:password if different.

4. **Run database setup:**
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Start the app:**
   ```bash
   npm run dev
   ```

## Verification

After setup, verify everything works:

1. Open http://localhost:3000
2. You should see the dashboard with no errors
3. Click "New Project" and create a project
4. The project should be created successfully

## Troubleshooting

### Error: "Can't reach database server"

- **Supabase/Neon:** Check your internet connection
- **Local:** Make sure PostgreSQL is running
  - Windows: Check Services for "postgresql" service
  - macOS: `brew services list | grep postgres`
  - Docker: `docker ps | grep postgres`

### Error: "authentication failed"

- Double-check your username and password in `DATABASE_URL`
- For Supabase: Make sure you're using the database password (not your account password)
- For local: Default is often `postgres:postgres`

### Error: "database does not exist"

- Create the database first:
  ```bash
  # For local PostgreSQL
  createdb website_builder
  ```
- For Supabase/Neon: The database is created automatically

### Still having issues?

1. Check that your `.env` file is in the project root
2. Make sure there are no spaces around the `=` in `.env`
3. Restart the dev server after changing `.env`
4. Check the console for more detailed error messages

## What These Commands Do

- `npm run db:push` - Creates all database tables based on the schema
- `npm run db:seed` - Adds demo user and sample templates/plugins
- `npm run dev` - Starts the development server

## After Successful Setup

Once the database is set up, you can:

1. ✅ Create new projects
2. ✅ View existing projects  
3. ✅ Use the visual builder
4. ✅ Access all features

The demo user (`demo@example.com`) is created automatically - no login required for local development.
