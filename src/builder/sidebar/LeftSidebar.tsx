'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronRight, GripVertical, Search } from 'lucide-react';
import { useBuilderStore } from '@/stores/useBuilderStore';
import { ComponentLibraryItem, ComponentCategory } from '@/types';
import { componentDefinitions, categories } from '@/types/components';
import { createComponentFromDefinition } from '@/stores/useBuilderStore';

interface ComponentItemProps {
  component: ComponentLibraryItem;
}

const ComponentItem: React.FC<ComponentItemProps> = ({ component }) => {
  const store = useBuilderStore();
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    const newComponent = createComponentFromDefinition(component.type, component.category);
    store.setDraggedComponent(newComponent);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: component.type,
      category: component.category,
    }));
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
    store.setDraggedComponent(null);
  };
  
  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`
        flex items-center gap-2 p-2 rounded-lg cursor-grab active:cursor-grabbing
        transition-all border border-transparent
        ${isDragging ? 'opacity-50 border-blue-300 bg-blue-50' : 'hover:bg-gray-50 hover:border-gray-200'}
      `}
    >
      <GripVertical size={14} className="text-gray-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-700 truncate">{component.name}</div>
        <div className="text-xs text-gray-500 truncate">{component.description}</div>
      </div>
    </div>
  );
};

interface CategorySectionProps {
  category: { id: ComponentCategory; name: string; icon: string };
  components: ComponentLibraryItem[];
}

const CategorySection: React.FC<CategorySectionProps> = ({ category, components }) => {
  const t = useTranslations('Components');
  const [isExpanded, setIsExpanded] = useState(true);
  const categoryName = t(`categories.${category.id}`) || category.name;
  
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 p-3 hover:bg-gray-50 transition-colors"
      >
        {isExpanded ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
        <span className="font-semibold text-gray-700">{categoryName}</span>
        <span className="text-xs text-gray-400 ml-auto">({components.length})</span>
      </button>
      {isExpanded && (
        <div className="px-2 pb-2 space-y-1">
          {components.map((component) => (
            <ComponentItem key={component.type} component={component} />
          ))}
        </div>
      )}
    </div>
  );
};

export const LeftSidebar: React.FC = () => {
  const t = useTranslations();
  const store = useBuilderStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredComponents = searchQuery
    ? componentDefinitions.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;
  
  if (!store.leftSidebarOpen) {
    return null;
  }
  
  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shrink-0 transition-all shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-bold text-lg text-gray-800 mb-3">{t('Components.title')}</h2>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      {/* Component List */}
      <div className="flex-1 overflow-y-auto">
        {filteredComponents ? (
          <div className="p-2">
            {filteredComponents.length > 0 ? (
              <div className="space-y-1">
                {filteredComponents.map((component) => (
                  <ComponentItem key={component.type} component={component} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No components found
              </div>
            )}
          </div>
        ) : (
          categories.map((category) => {
            const categoryComponents = componentDefinitions.filter(
              (c) => c.category === category.id
            );
            return (
              <CategorySection
                key={category.id}
                category={category}
                components={categoryComponents}
              />
            );
          })
        )}
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-gray-100 text-xs text-gray-500 text-center">
        {t('Canvas.dropHere')}
      </div>
    </aside>
  );
};

export default LeftSidebar;
