# Demo Mode - No Backend Required

This website builder now works **without a backend database**! Perfect for testing and development.

## What's Included

### Demo Projects
When you visit the dashboard, you'll see **2 demo projects** pre-loaded:
- **My First Website** - A sample website with Home and About pages
- **Business Site** - A professional landing page template

### Features That Work
✅ View demo projects  
✅ Create new projects (saved in memory)  
✅ Delete projects  
✅ Open builder editor  
✅ Drag-and-drop components  
✅ Edit component styles  
✅ Edit component content  
✅ Undo/Redo  
✅ Preview mode  
✅ Device preview (desktop/tablet/mobile)  

### How It Works

The app automatically detects that no backend is available and falls back to **mock data**. All API calls are intercepted and handled by in-memory storage.

**Files Added/Modified:**
- `src/lib/mockData.ts` - Mock data and API implementations
- `src/lib/apiClient.ts` - Updated to use mock data as fallback
- `src/app/[locale]/builder/page.tsx` - Updated to load projects from API

## Limitations

⚠️ **Data resets on page reload** - Projects created in demo mode are stored in memory only  
⚠️ **No persistence** - To save projects permanently, you'll need to set up a database  
⚠️ **No deployment** - Deployment features require backend infrastructure  

## Try It Out

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000

3. You should see the dashboard with demo projects

4. Click "Edit" on any project to open the builder

5. Or click "New Project" to create a new one

## Setting Up a Database (Optional)

When you're ready to add a real backend, follow the setup guide in `QUICK_SETUP.md`.

## Technical Details

### Mock API Implementation

The `mockData.ts` file provides:
- `demoProjects` - Pre-configured demo projects with pages
- `demoTemplates` - Template definitions
- `mockProjectsApi` - In-memory CRUD operations
- `mockTemplatesApi` - Template listing

### Backend Detection

The `apiClient.ts` checks for backend availability:
```typescript
async function checkBackendAvailability(): Promise<boolean> {
  try {
    const response = await fetch('/api/health', { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
```

If the backend is not available, all API calls automatically use mock data.

### Data Structure

Demo projects use the same TypeScript types as the real backend:
- `Project` - Project metadata and settings
- `ProjectPage` - Page with component schema
- `Template` - Template definitions

This ensures type safety and easy migration to a real backend later.
