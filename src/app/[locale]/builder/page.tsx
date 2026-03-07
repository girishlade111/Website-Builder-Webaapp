'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import BuilderLayout from '@/builder/BuilderLayout';
import { projectsApi } from '@/lib/apiClient';
import { useBuilderStore } from '@/stores/useBuilderStore';

export default function BuilderPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const store = useBuilderStore();

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    if (!projectId) {
      // No project specified, use demo data from store
      setIsLoading(false);
      return;
    }

    try {
      const result = await projectsApi.getById(projectId);
      
      if (result.success && result.data) {
        const project = result.data;
        
        // Load the first page (home page) into the builder
        if (project.pages && project.pages.length > 0) {
          const homePage = project.pages.find((p: any) => p.isHome) || project.pages[0];
          
          if (homePage && homePage.schema) {
            // Convert ProjectPage schema to builder Page format
            // Group components into sections for the builder
            const sections = [
              {
                id: generateId(),
                name: 'Page Content',
                components: homePage.schema.components || [],
              },
            ];
            
            store.setPage({
              id: homePage.id,
              name: homePage.name,
              slug: homePage.slug,
              sections,
              meta: {
                title: homePage.metaTitle,
                description: homePage.metaDescription,
              },
            });
          }
        }
      } else {
        setError(result.error || 'Failed to load project');
      }
    } catch (err: any) {
      console.error('Failed to load project:', err);
      setError(err.message || 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  const generateId = () => Math.random().toString(36).substring(2, 11);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ {error}</div>
          <p className="text-gray-600 mb-4">Loading demo project instead...</p>
          <button
            onClick={() => (window.location.href = '/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <BuilderLayout />;
}
