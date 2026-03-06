'use client';

import React, { useState } from 'react';
import { X, Code, Palette, Layout, Type, Image, ChevronDown, ChevronRight } from 'lucide-react';
import { useBuilderStore } from '@/stores/useBuilderStore';
import { StyleProperties, ContentProperties, BuilderComponent } from '@/types';

interface PropertySectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const PropertySection: React.FC<PropertySectionProps> = ({
  title,
  icon,
  children,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 p-3 hover:bg-gray-50 transition-colors"
      >
        {isExpanded ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
        {icon}
        <span className="font-semibold text-gray-700 text-sm">{title}</span>
      </button>
      {isExpanded && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
};

interface InputFieldProps {
  label: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}) => (
  <div className="mb-3">
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);

interface SelectFieldProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

const SelectField: React.FC<SelectFieldProps> = ({ label, value, onChange, options }) => (
  <div className="mb-3">
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

interface ColorPickerProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => (
  <div className="mb-3">
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
      />
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  </div>
);

interface SliderFieldProps {
  label: string;
  value: number | undefined;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const SliderField: React.FC<SliderFieldProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
}) => (
  <div className="mb-3">
    <div className="flex justify-between items-center mb-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <span className="text-xs text-gray-500">{value || 0}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value || 0}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full"
    />
  </div>
);

const RightSidebar: React.FC = () => {
  const store = useBuilderStore();
  const selectedComponent = store.getSelectedComponent();
  
  if (!store.rightSidebarOpen) {
    return null;
  }
  
  if (!selectedComponent) {
    return (
      <aside className="w-80 bg-white border-l border-gray-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-lg text-gray-800">Properties</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-8 text-center text-gray-500">
          <div>
            <Layout size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Select a component to edit its properties</p>
          </div>
        </div>
      </aside>
    );
  }
  
  const updateStyle = (key: keyof StyleProperties, value: string | number | undefined) => {
    store.updateComponentStyles(selectedComponent.id, { [key]: value });
  };
  
  const updateContent = (key: keyof ContentProperties, value: unknown) => {
    store.updateComponentContent(selectedComponent.id, { [key]: value });
  };
  
  return (
    <aside className="w-80 bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg text-gray-800">{selectedComponent.name}</h2>
          <p className="text-xs text-gray-500">{selectedComponent.type}</p>
        </div>
        <button
          onClick={() => store.selectComponent(null)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X size={18} className="text-gray-500" />
        </button>
      </div>
      
      {/* Properties */}
      <div className="flex-1 overflow-y-auto">
        {/* Content Properties */}
        <PropertySection title="Content" icon={<Type size={16} className="text-gray-500" />}>
          {/* Text Content */}
          {selectedComponent.content.text !== undefined && (
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Text</label>
              <textarea
                value={selectedComponent.content.text}
                onChange={(e) => updateContent('text', e.target.value)}
                rows={3}
                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          )}
          
          {/* Heading Level */}
          {selectedComponent.content.level !== undefined && (
            <SelectField
              label="Heading Level"
              value={`h${selectedComponent.content.level}`}
              onChange={(value) => updateContent('level', parseInt(value.replace('h', '')) as 1 | 2 | 3 | 4 | 5 | 6)}
              options={[
                { value: 'h1', label: 'H1' },
                { value: 'h2', label: 'H2' },
                { value: 'h3', label: 'H3' },
                { value: 'h4', label: 'H4' },
                { value: 'h5', label: 'H5' },
                { value: 'h6', label: 'H6' },
              ]}
            />
          )}
          
          {/* Image Source */}
          {selectedComponent.content.src !== undefined && (
            <InputField
              label="Source URL"
              value={selectedComponent.content.src}
              onChange={(value) => updateContent('src', value)}
              placeholder="https://..."
            />
          )}
          
          {/* Alt Text */}
          {selectedComponent.content.alt !== undefined && (
            <InputField
              label="Alt Text"
              value={selectedComponent.content.alt}
              onChange={(value) => updateContent('alt', value)}
              placeholder="Image description"
            />
          )}
          
          {/* Placeholder */}
          {selectedComponent.content.placeholder !== undefined && (
            <InputField
              label="Placeholder"
              value={selectedComponent.content.placeholder}
              onChange={(value) => updateContent('placeholder', value)}
            />
          )}
          
          {/* Label */}
          {selectedComponent.content.label !== undefined && (
            <InputField
              label="Label"
              value={selectedComponent.content.label}
              onChange={(value) => updateContent('label', value)}
            />
          )}
          
          {/* HTML Content */}
          {selectedComponent.content.html !== undefined && (
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">HTML</label>
              <textarea
                value={selectedComponent.content.html}
                onChange={(e) => updateContent('html', e.target.value)}
                rows={5}
                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          )}
        </PropertySection>
        
        {/* Layout Properties */}
        <PropertySection title="Layout" icon={<Layout size={16} className="text-gray-500" />}>
          <div className="grid grid-cols-2 gap-2">
            <InputField
              label="Width"
              value={selectedComponent.styles.width}
              onChange={(value) => updateStyle('width', value)}
              placeholder="auto"
            />
            <InputField
              label="Height"
              value={selectedComponent.styles.height}
              onChange={(value) => updateStyle('height', value)}
              placeholder="auto"
            />
            <InputField
              label="Min Width"
              value={selectedComponent.styles.minWidth}
              onChange={(value) => updateStyle('minWidth', value)}
              placeholder="0"
            />
            <InputField
              label="Min Height"
              value={selectedComponent.styles.minHeight}
              onChange={(value) => updateStyle('minHeight', value)}
              placeholder="0"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-2">
            <InputField
              label="Padding"
              value={selectedComponent.styles.padding}
              onChange={(value) => updateStyle('padding', value)}
              placeholder="0"
            />
            <InputField
              label="Margin"
              value={selectedComponent.styles.margin}
              onChange={(value) => updateStyle('margin', value)}
              placeholder="0"
            />
          </div>
          
          <SelectField
            label="Display"
            value={selectedComponent.styles.display}
            onChange={(value) => updateStyle('display', value as StyleProperties['display'])}
            options={[
              { value: '', label: 'Default' },
              { value: 'block', label: 'Block' },
              { value: 'inline', label: 'Inline' },
              { value: 'inline-block', label: 'Inline Block' },
              { value: 'flex', label: 'Flex' },
              { value: 'grid', label: 'Grid' },
              { value: 'none', label: 'None' },
            ]}
          />
          
          {selectedComponent.styles.display === 'flex' && (
            <>
              <SelectField
                label="Flex Direction"
                value={selectedComponent.styles.flexDirection}
                onChange={(value) => updateStyle('flexDirection', value as StyleProperties['flexDirection'])}
                options={[
                  { value: 'row', label: 'Row' },
                  { value: 'row-reverse', label: 'Row Reverse' },
                  { value: 'column', label: 'Column' },
                  { value: 'column-reverse', label: 'Column Reverse' },
                ]}
              />
              <SelectField
                label="Align Items"
                value={selectedComponent.styles.alignItems}
                onChange={(value) => updateStyle('alignItems', value as StyleProperties['alignItems'])}
                options={[
                  { value: '', label: 'Default' },
                  { value: 'stretch', label: 'Stretch' },
                  { value: 'flex-start', label: 'Flex Start' },
                  { value: 'flex-end', label: 'Flex End' },
                  { value: 'center', label: 'Center' },
                  { value: 'baseline', label: 'Baseline' },
                ]}
              />
              <SelectField
                label="Justify Content"
                value={selectedComponent.styles.justifyContent}
                onChange={(value) => updateStyle('justifyContent', value as StyleProperties['justifyContent'])}
                options={[
                  { value: '', label: 'Default' },
                  { value: 'flex-start', label: 'Flex Start' },
                  { value: 'flex-end', label: 'Flex End' },
                  { value: 'center', label: 'Center' },
                  { value: 'space-between', label: 'Space Between' },
                  { value: 'space-around', label: 'Space Around' },
                  { value: 'space-evenly', label: 'Space Evenly' },
                ]}
              />
            </>
          )}
        </PropertySection>
        
        {/* Style Properties */}
        <PropertySection title="Style" icon={<Palette size={16} className="text-gray-500" />}>
          <ColorPicker
            label="Background Color"
            value={selectedComponent.styles.backgroundColor}
            onChange={(value) => updateStyle('backgroundColor', value)}
          />
          <ColorPicker
            label="Text Color"
            value={selectedComponent.styles.color}
            onChange={(value) => updateStyle('color', value)}
          />
          
          <div className="grid grid-cols-2 gap-2">
            <InputField
              label="Font Size"
              value={selectedComponent.styles.fontSize}
              onChange={(value) => updateStyle('fontSize', value)}
              placeholder="16px"
            />
            <SelectField
              label="Font Weight"
              value={selectedComponent.styles.fontWeight}
              onChange={(value) => updateStyle('fontWeight', value as StyleProperties['fontWeight'])}
              options={[
                { value: '', label: 'Default' },
                { value: 'normal', label: 'Normal' },
                { value: 'bold', label: 'Bold' },
                { value: '100', label: 'Thin (100)' },
                { value: '200', label: 'Extra Light (200)' },
                { value: '300', label: 'Light (300)' },
                { value: '400', label: 'Regular (400)' },
                { value: '500', label: 'Medium (500)' },
                { value: '600', label: 'Semi Bold (600)' },
                { value: '700', label: 'Bold (700)' },
                { value: '800', label: 'Extra Bold (800)' },
                { value: '900', label: 'Black (900)' },
              ]}
            />
          </div>
          
          <SelectField
            label="Text Align"
            value={selectedComponent.styles.textAlign}
            onChange={(value) => updateStyle('textAlign', value as StyleProperties['textAlign'])}
            options={[
              { value: '', label: 'Default' },
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' },
              { value: 'justify', label: 'Justify' },
            ]}
          />
          
          <SliderField
            label="Opacity"
            value={selectedComponent.styles.opacity}
            onChange={(value) => updateStyle('opacity', value)}
            min={0}
            max={1}
            step={0.1}
          />
          
          <InputField
            label="Border Radius"
            value={selectedComponent.styles.borderRadius}
            onChange={(value) => updateStyle('borderRadius', value)}
            placeholder="0"
          />
          
          <InputField
            label="Box Shadow"
            value={selectedComponent.styles.boxShadow}
            onChange={(value) => updateStyle('boxShadow', value)}
            placeholder="0 2px 4px rgba(0,0,0,0.1)"
          />
        </PropertySection>
        
        {/* Border Properties */}
        <PropertySection title="Border" icon={<Layout size={16} className="text-gray-500" />}>
          <SelectField
            label="Border Style"
            value={selectedComponent.styles.borderStyle}
            onChange={(value) => updateStyle('borderStyle', value as StyleProperties['borderStyle'])}
            options={[
              { value: '', label: 'None' },
              { value: 'solid', label: 'Solid' },
              { value: 'dashed', label: 'Dashed' },
              { value: 'dotted', label: 'Dotted' },
              { value: 'double', label: 'Double' },
            ]}
          />
          <div className="grid grid-cols-2 gap-2">
            <InputField
              label="Border Width"
              value={selectedComponent.styles.borderWidth}
              onChange={(value) => updateStyle('borderWidth', value)}
              placeholder="1px"
            />
            <ColorPicker
              label="Border Color"
              value={selectedComponent.styles.borderColor}
              onChange={(value) => updateStyle('borderColor', value)}
            />
          </div>
        </PropertySection>
        
        {/* Advanced Properties */}
        <PropertySection title="Advanced" icon={<Code size={16} className="text-gray-500" />}>
          <InputField
            label="Custom Class"
            value={selectedComponent.styles.className}
            onChange={(value) => updateStyle('className', value)}
            placeholder="my-class"
          />
          <InputField
            label="Custom ID"
            value={selectedComponent.styles.id}
            onChange={(value) => updateStyle('id', value)}
            placeholder="my-id"
          />
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Custom CSS</label>
            <textarea
              value={selectedComponent.styles.customCSS || ''}
              onChange={(e) => updateStyle('customCSS', e.target.value)}
              rows={4}
              placeholder="/* Additional CSS */"
              className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
          
          <div className="pt-2 border-t border-gray-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedComponent.styles.hideOnDesktop || false}
                onChange={(e) => updateStyle('hideOnDesktop', e.target.checked as unknown as string)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Hide on Desktop</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={selectedComponent.styles.hideOnTablet || false}
                onChange={(e) => updateStyle('hideOnTablet', e.target.checked as unknown as string)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Hide on Tablet</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={selectedComponent.styles.hideOnMobile || false}
                onChange={(e) => updateStyle('hideOnMobile', e.target.checked as unknown as string)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Hide on Mobile</span>
            </label>
          </div>
        </PropertySection>
      </div>
      
      {/* Actions */}
      <div className="p-3 border-t border-gray-100 flex gap-2">
        <button
          onClick={() => store.duplicateComponent(selectedComponent.id)}
          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Duplicate
        </button>
        <button
          onClick={() => store.removeComponent(selectedComponent.id)}
          className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
        >
          Delete
        </button>
      </div>
    </aside>
  );
};

export default RightSidebar;
export { RightSidebar };
