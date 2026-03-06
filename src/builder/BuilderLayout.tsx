'use client';

import React, { useEffect } from 'react';
import { Toolbar } from '@/builder/toolbar/Toolbar';
import { LeftSidebar } from '@/builder/sidebar/LeftSidebar';
import { RightSidebar } from '@/builder/properties/RightSidebar';
import { Canvas } from '@/builder/canvas/Canvas';
import { CodeEditor } from '@/builder/code-editor/CodeEditor';
import { useBuilderStore } from '@/stores/useBuilderStore';
import { getTemplateById } from '@/templates';

export const BuilderLayout: React.FC = () => {
  const store = useBuilderStore();
  
  useEffect(() => {
    // Load template from localStorage if available
    const savedTemplate = localStorage.getItem('selectedTemplate');
    if (savedTemplate) {
      try {
        const template = JSON.parse(savedTemplate);
        const fullTemplate = getTemplateById(template.id);
        if (fullTemplate && fullTemplate.pages[0]) {
          store.setPage(fullTemplate.pages[0]);
        }
        localStorage.removeItem('selectedTemplate');
      } catch (err) {
        console.error('Failed to load template:', err);
      }
    }
  }, []);
  
  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Top Toolbar */}
      <Toolbar />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Component Library */}
        <LeftSidebar />
        
        {/* Center - Canvas */}
        <Canvas />
        
        {/* Right Sidebar - Properties */}
        <RightSidebar />
      </div>
      
      {/* Code Editor Modal */}
      <CodeEditor />
    </div>
  );
};

export default BuilderLayout;
