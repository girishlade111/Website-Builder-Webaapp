'use client';

import React, { useRef, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useBuilderStore } from '@/stores/useBuilderStore';
import { ComponentRenderer } from './ComponentRenderer';
import { BuilderComponent, PageSection, DeviceType } from '@/types';
import { createComponentFromDefinition } from '@/stores/useBuilderStore';

interface CanvasProps {
  onDropComponent: (component: BuilderComponent, sectionId: string, index: number) => void;
}

const deviceWidths: Record<DeviceType, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

const SectionDropZone: React.FC<{
  section: PageSection;
  index: number;
  isPreviewMode: boolean;
}> = ({ section, index, isPreviewMode }) => {
  const store = useBuilderStore();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isOver, setIsOver] = React.useState(false);
  
  const handleDragOver = (e: React.DragEvent) => {
    if (isPreviewMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsOver(true);
  };
  
  const handleDragLeave = () => {
    setIsOver(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    if (isPreviewMode) return;
    e.preventDefault();
    setIsOver(false);
    
    const data = e.dataTransfer.getData('application/json');
    if (!data) return;
    
    try {
      const { type, category } = JSON.parse(data);
      const newComponent = createComponentFromDefinition(type, category);
      store.addComponent(newComponent, section.id, section.components.length);
    } catch (err) {
      console.error('Failed to drop component:', err);
    }
  };
  
  return (
    <div
      ref={sectionRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative min-h-[100px] transition-all
        ${isOver && !isPreviewMode ? 'ring-2 ring-blue-400 ring-dashed bg-blue-50' : ''}
      `}
    >
      {/* Section Header */}
      {!isPreviewMode && (
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {section.name}
          </span>
          <button
            onClick={() => store.selectSection(section.id)}
            className={`
              text-xs px-2 py-1 rounded transition-colors
              ${store.selectedSectionId === section.id ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-500'}
            `}
          >
            {store.selectedSectionId === section.id ? 'Selected' : 'Select'}
          </button>
        </div>
      )}
      
      {/* Components */}
      <div className="p-4 space-y-4">
        {section.components.map((component, compIndex) => (
          <div
            key={component.id}
            className="relative group"
            onDragOver={(e) => {
              if (isPreviewMode) return;
              e.preventDefault();
            }}
            onDrop={(e) => {
              if (isPreviewMode) return;
              e.preventDefault();
              
              const data = e.dataTransfer.getData('application/json');
              if (!data) return;
              
              try {
                const { type, category } = JSON.parse(data);
                const newComponent = createComponentFromDefinition(type, category);
                store.addComponent(newComponent, section.id, compIndex + 1);
              } catch (err) {
                console.error('Failed to drop component:', err);
              }
            }}
          >
            <ComponentRenderer
              component={component}
              isSelected={store.selectedComponentId === component.id}
              onSelect={(id) => !isPreviewMode && store.selectComponent(id)}
              isPreviewMode={isPreviewMode}
            />
            
            {/* Component Actions (only in edit mode) */}
            {!isPreviewMode && store.selectedComponentId === component.id && (
              <div className="absolute -right-12 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    store.selectComponent(component.id);
                  }}
                  className="p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                  title="Edit"
                >
                  <Plus size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    store.duplicateComponent(component.id);
                  }}
                  className="p-1.5 bg-gray-500 text-white rounded hover:bg-gray-600"
                  title="Duplicate"
                >
                  <Plus size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    store.removeComponent(component.id);
                  }}
                  className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
        
        {/* Empty State */}
        {!isPreviewMode && section.components.length === 0 && (
          <div
            className={`
              flex items-center justify-center py-12 border-2 border-dashed rounded-lg
              ${isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'}
            `}
          >
            <div className="text-center text-gray-500">
              <Plus size={32} className="mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Drag components here</p>
              <p className="text-xs mt-1">or click to add</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const Canvas: React.FC = () => {
  const store = useBuilderStore();
  
  if (!store.currentPage) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center text-gray-500">
          <p>No page loaded</p>
        </div>
      </div>
    );
  }
  
  const canvasWidth = deviceWidths[store.deviceType];
  
  return (
    <main className="flex-1 bg-gray-100 overflow-y-auto overflow-x-hidden p-8">
      <div
        className="mx-auto bg-white shadow-lg transition-all duration-300"
        style={{
          width: canvasWidth,
          minHeight: 'calc(100vh - 120px)',
        }}
      >
        {/* Page Content */}
        {store.currentPage.sections.map((section, index) => (
          <SectionDropZone
            key={section.id}
            section={section}
            index={index}
            isPreviewMode={store.isPreviewMode}
          />
        ))}
      </div>
    </main>
  );
};

export default Canvas;
