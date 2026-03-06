'use client';

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { X, FileCode, FileJson, FileType } from 'lucide-react';
import { useBuilderStore } from '@/stores/useBuilderStore';

export const CodeEditor: React.FC = () => {
  const store = useBuilderStore();
  const selectedComponent = store.getSelectedComponent();
  const [editorValue, setEditorValue] = useState('');
  
  if (!store.isCodeEditorOpen) {
    return null;
  }
  
  if (!selectedComponent) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-lg">Code Editor</h3>
            <button
              onClick={() => store.toggleCodeEditor(false)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Select a component to edit its code</p>
          </div>
        </div>
      </div>
    );
  }
  
  const getInitialValue = () => {
    switch (store.codeEditorTab) {
      case 'html':
        return selectedComponent.content.html || 
               `<div class="${selectedComponent.styles.className || ''}">
  ${selectedComponent.content.text || 'Content'}
</div>`;
      case 'css':
        return selectedComponent.styles.customCSS || 
               `.${selectedComponent.styles.className || 'component'} {
  /* Add your custom CSS here */
}`;
      case 'jsx':
        return selectedComponent.content.code || 
               `import React from 'react';

export default function Component() {
  return (
    <div className="${selectedComponent.styles.className || ''}">
      ${selectedComponent.content.text || 'Content'}
    </div>
  );
}`;
      default:
        return '';
    }
  };
  
  const handleEditorChange = (value: string | undefined) => {
    setEditorValue(value || '');
  };
  
  const handleApply = () => {
    if (store.codeEditorTab === 'html') {
      store.updateComponentContent(selectedComponent.id, { html: editorValue });
    } else if (store.codeEditorTab === 'css') {
      store.updateComponentStyles(selectedComponent.id, { customCSS: editorValue });
    } else if (store.codeEditorTab === 'jsx') {
      store.updateComponentContent(selectedComponent.id, { code: editorValue });
    }
    store.toggleCodeEditor(false);
  };
  
  const getLanguage = () => {
    switch (store.codeEditorTab) {
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'jsx':
        return 'javascript';
      default:
        return 'html';
    }
  };
  
  const tabs = [
    { id: 'html' as const, label: 'HTML', icon: <FileCode size={16} /> },
    { id: 'css' as const, label: 'CSS', icon: <FileType size={16} /> },
    { id: 'jsx' as const, label: 'React JSX', icon: <FileJson size={16} /> },
  ];
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-lg">Code Editor</h3>
            <span className="text-sm text-gray-500">
              Editing: {selectedComponent.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
            >
              Apply Changes
            </button>
            <button
              onClick={() => store.toggleCodeEditor(false)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                store.setCodeEditorTab(tab.id);
                setEditorValue(getInitialValue());
              }}
              className={`
                flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors
                ${store.codeEditorTab === tab.id
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            language={getLanguage()}
            value={getInitialValue()}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              formatOnPaste: true,
              formatOnType: true,
            }}
          />
        </div>
        
        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span>Changes will be applied to the component instantly</span>
          <span>{selectedComponent.type}</span>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
