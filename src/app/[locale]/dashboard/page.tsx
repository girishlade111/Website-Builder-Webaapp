'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { projectsApi, templatesApi } from '@/lib/apiClient';
import type { Project, Template } from '@/lib/apiClient';
import { Plus, ExternalLink, Clock, Trash2, Edit, Settings, Globe, Users, Layers, Code, Image, Rocket, ChevronRight, Search, Filter } from 'lucide-react';

interface ProjectWithDetails extends Omit<Project, 'pages'> {
  pages?: any[];
  collaborations?: any[];
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [projectsRes, templatesRes] = await Promise.all([
        projectsApi.list({ pageSize: 50 }),
        templatesApi.list()
      ]);

      if (projectsRes.success && projectsRes.data) {
        setProjects(projectsRes.data.items);
      }

      if (templatesRes.success && templatesRes.data) {
        setTemplates(templatesRes.data.items);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    setIsCreating(true);
    setError(null);

    try {
      const result = await projectsApi.create({
        name: newProjectName,
        description: newProjectDescription,
        templateId: selectedTemplate || undefined
      });

      if (result.success && result.data) {
        // Navigate to builder
        window.location.href = `/${getLocale()}/builder?project=${result.data.id}`;
      } else {
        setError(result.error || 'Failed to create project');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await projectsApi.delete(projectId);
      if (result.success) {
        setProjects(projects.filter(p => p.id !== projectId));
      } else {
        setError(result.error || 'Failed to delete project');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete project');
    }
  };

  const getLocale = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const match = path.match(/^\/([a-z]{2})\//);
      return match ? match[1] : 'en';
    }
    return 'en';
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Website Builder</h1>
              <p className="mt-1 text-gray-500">Create and manage your websites</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowTemplates(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Browse Templates
              </button>
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="w-4 h-4" />
            <span>{filteredProjects.length} projects</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery ? 'Try a different search term' : 'Create your first website to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Create Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={() => {
                  window.location.href = `/${getLocale()}/builder?project=${project.id}`;
                }}
                onDelete={() => handleDeleteProject(project.id, project.name)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
                <button
                  onClick={() => {
                    setShowTemplates(false);
                    setSelectedTemplate(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="My Awesome Website"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    placeholder="Describe your project..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Choose a Template (optional)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedTemplate(null)}
                      className={`p-4 border-2 rounded-lg text-left transition-colors ${
                        !selectedTemplate
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">Blank Project</div>
                      <div className="text-sm text-gray-500">Start from scratch</div>
                    </button>
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`p-4 border-2 rounded-lg text-left transition-colors ${
                          selectedTemplate === template.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{template.name}</div>
                        <div className="text-sm text-gray-500 truncate">{template.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowTemplates(false);
                  setSelectedTemplate(null);
                  setNewProjectName('');
                  setNewProjectDescription('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={isCreating || !newProjectName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Project
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PUBLISHED': return 'bg-green-100 text-green-800';
    case 'ARCHIVED': return 'bg-gray-100 text-gray-800';
    default: return 'bg-yellow-100 text-yellow-800';
  }
};

function ProjectCard({
  project,
  onEdit,
  onDelete
}: {
  project: ProjectWithDetails;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const pageIcon = (type: string) => {
    switch (type) {
      case 'home': return '🏠';
      case 'about': return '📄';
      case 'contact': return '📧';
      default: return '📄';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 relative">
        {project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Globe className="w-16 h-16 text-white opacity-50" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {project.description || 'No description'}
        </p>

        {/* Pages count */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Layers className="w-4 h-4" />
            <span>{project.pages?.length || 0} pages</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{(project.collaborations?.length || 0) + 1} collaborators</span>
          </div>
        </div>

        {/* Last updated */}
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
          <Clock className="w-3 h-3" />
          <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          {project.deployedUrl && (
            <a
              href={project.deployedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Visit
            </a>
          )}
          <button
            onClick={onDelete}
            className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Quick pages preview */}
        {project.pages && project.pages.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {project.pages.slice(0, 4).map((page: any) => (
                <span
                  key={page.id}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                >
                  {pageIcon(page.isHome ? 'home' : page.name.toLowerCase())} {page.name}
                </span>
              ))}
              {project.pages.length > 4 && (
                <span className="px-2 py-1 text-xs text-gray-400">
                  +{project.pages.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
