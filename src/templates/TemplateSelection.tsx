'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Code2, Layout, FileText, ShoppingCart, PenTool, ArrowRight, Sparkles } from 'lucide-react';
import { templates, getTemplatesByCategory, getAllCategories } from '@/templates';
import { Template } from '@/types';

const categoryIcons: Record<string, React.ReactNode> = {
  General: <Layout size={20} />,
  Marketing: <Sparkles size={20} />,
  Business: <FileText size={20} />,
  Content: <PenTool size={20} />,
  Ecommerce: <ShoppingCart size={20} />,
};

export const TemplateSelection: React.FC = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  const categories = ['All', ...getAllCategories()];
  
  const filteredTemplates = selectedCategory === 'All'
    ? templates
    : getTemplatesByCategory(selectedCategory);
  
  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };
  
  const handleStartBuilding = () => {
    if (selectedTemplate) {
      // Store the selected template in localStorage for the builder to use
      localStorage.setItem('selectedTemplate', JSON.stringify(selectedTemplate));
      router.push('/builder');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Code2 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">WebBuilder</h1>
              <p className="text-xs text-gray-400">Professional Website Builder</p>
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Starting Point
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Select a template to begin building your website, or start from scratch
          </p>
        </div>
      </section>
      
      {/* Category Filter */}
      <section className="px-6 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${selectedCategory === category
                    ? 'bg-white text-gray-900 shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20'
                  }
                `}
              >
                {categoryIcons[category] || <Layout size={16} />}
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>
      
      {/* Templates Grid */}
      <section className="px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className={`
                  group relative bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden
                  border-2 transition-all cursor-pointer
                  ${selectedTemplate?.id === template.id
                    ? 'border-blue-500 shadow-xl shadow-blue-500/20'
                    : 'border-white/10 hover:border-white/30 hover:bg-white/10'
                  }
                `}
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      {categoryIcons[template.category] || <Layout size={32} className="text-white" />}
                    </div>
                    <p className="text-gray-400 text-sm">Preview</p>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                      <p className="text-sm text-gray-400">{template.category}</p>
                    </div>
                    {selectedTemplate?.id === template.id && (
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{template.description}</p>
                </div>
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
                  <button className="w-full py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                    Select Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Start Building Button */}
      {selectedTemplate && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-sm border-t border-white/10 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                {categoryIcons[selectedTemplate.category] || <Layout size={24} className="text-white" />}
              </div>
              <div>
                <p className="text-white font-medium">{selectedTemplate.name}</p>
                <p className="text-sm text-gray-400">{selectedTemplate.description}</p>
              </div>
            </div>
            <button
              onClick={handleStartBuilding}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25"
            >
              Start Building
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSelection;
