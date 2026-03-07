'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  Undo2,
  Redo2,
  Eye,
  Monitor,
  Tablet,
  Smartphone,
  Save,
  Rocket,
  Code2,
  PanelLeft,
  PanelRight,
} from 'lucide-react';
import { useBuilderStore } from '@/stores/useBuilderStore';
import { DeviceType } from '@/types';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface ToolbarButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  icon,
  label,
  active,
  disabled,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
      ${active ? 'bg-blue-500 text-white shadow-md' : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `}
    title={label}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </button>
);

export const Toolbar: React.FC = () => {
  const t = useTranslations('Navigation');
  const store = useBuilderStore();
  
  const devicePresets: { type: DeviceType; icon: React.ReactNode; label: string }[] = [
    { type: 'desktop', icon: <Monitor size={18} />, label: t('desktop') || 'Desktop' },
    { type: 'tablet', icon: <Tablet size={18} />, label: t('tablet') || 'Tablet' },
    { type: 'mobile', icon: <Smartphone size={18} />, label: t('mobile') || 'Mobile' },
  ];
  
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 shadow-sm">
      <div className="flex items-center gap-2">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <Code2 size={20} className="text-white" />
          </div>
          <span className="font-bold text-lg text-gray-800">WebBuilder</span>
        </div>
        
        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-2" />
        
        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => store.undo()}
          icon={<Undo2 size={18} />}
          label={t('undo')}
          disabled={!store.canUndo()}
        />
        <ToolbarButton
          onClick={() => store.redo()}
          icon={<Redo2 size={18} />}
          label={t('redo')}
          disabled={!store.canRedo()}
        />
        
        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-2" />
        
        {/* Device Switcher */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {devicePresets.map((device) => (
            <button
              key={device.type}
              onClick={() => store.setDeviceType(device.type)}
              className={`
                flex items-center gap-1 px-3 py-1.5 rounded-md transition-all duration-200
                ${store.deviceType === device.type ? 'bg-white shadow text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}
              `}
              title={device.label}
            >
              {device.icon}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Panel Toggles */}
        <ToolbarButton
          onClick={() => store.toggleLeftSidebar()}
          icon={<PanelLeft size={18} />}
          label={t('components')}
          active={store.leftSidebarOpen}
        />
        <ToolbarButton
          onClick={() => store.toggleCodeEditor()}
          icon={<Code2 size={18} />}
          label={t('code')}
          active={store.isCodeEditorOpen}
        />
        <ToolbarButton
          onClick={() => store.toggleRightSidebar()}
          icon={<PanelRight size={18} />}
          label={t('properties')}
          active={store.rightSidebarOpen}
        />
        
        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-2" />
        
        {/* Preview Mode */}
        <ToolbarButton
          onClick={() => store.togglePreviewMode()}
          icon={<Eye size={18} />}
          label={store.isPreviewMode ? t('edit') : t('preview')}
          active={store.isPreviewMode}
        />
        
        {/* Save */}
        <ToolbarButton
          onClick={() => store.savePage()}
          icon={<Save size={18} />}
          label={t('save')}
        />
        
        {/* Publish */}
        <button
          onClick={() => store.publishPage()}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md hover:shadow-lg"
        >
          <Rocket size={18} />
          {t('publish')}
        </button>
        
        {/* Language Switcher */}
        <div className="ml-2">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};

export default Toolbar;
