import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  BuilderState,
  BuilderAction,
  Page,
  BuilderComponent,
  PageSection,
  StyleProperties,
  ContentProperties,
  DeviceType,
} from '@/types';
import { getComponentDefinition } from '@/types/components';

// History management
const MAX_HISTORY = 50;

const createHistoryState = (page: Page | null, history: Page[], historyIndex: number) => {
  if (!page) return { history, historyIndex };
  
  const newHistory = history.slice(0, historyIndex + 1);
  newHistory.push(JSON.parse(JSON.stringify(page)));
  
  if (newHistory.length > MAX_HISTORY) {
    newHistory.shift();
    return { history: newHistory, historyIndex: newHistory.length - 1 };
  }
  
  return { history: newHistory, historyIndex: newHistory.length - 1 };
};

interface BuilderStore extends BuilderState {
  // Actions
  dispatch: (action: BuilderAction) => void;
  setPage: (page: Page) => void;
  selectComponent: (componentId: string | null) => void;
  selectSection: (sectionId: string | null) => void;
  setDeviceType: (deviceType: DeviceType) => void;
  togglePreviewMode: (value?: boolean) => void;
  toggleCodeEditor: (value?: boolean) => void;
  setCodeEditorTab: (tab: 'html' | 'css' | 'jsx') => void;
  toggleLeftSidebar: (value?: boolean) => void;
  toggleRightSidebar: (value?: boolean) => void;
  updateComponentStyles: (componentId: string, styles: Partial<StyleProperties>) => void;
  updateComponentContent: (componentId: string, content: Partial<ContentProperties>) => void;
  addComponent: (component: BuilderComponent, sectionId: string, index?: number) => void;
  removeComponent: (componentId: string) => void;
  moveComponent: (componentId: string, toSectionId: string, index: number) => void;
  duplicateComponent: (componentId: string) => void;
  undo: () => void;
  redo: () => void;
  setDraggedComponent: (component: BuilderComponent | null) => void;
  savePage: () => void;
  publishPage: () => void;
  
  // Selectors
  getSelectedComponent: () => BuilderComponent | null;
  getSelectedSection: () => PageSection | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

// Create a blank page
const createBlankPage = (): Page => ({
  id: uuidv4(),
  name: 'Home',
  slug: '/',
  sections: [
    {
      id: uuidv4(),
      name: 'Header',
      components: [],
    },
    {
      id: uuidv4(),
      name: 'Main Content',
      components: [],
    },
    {
      id: uuidv4(),
      name: 'Footer',
      components: [],
    },
  ],
  meta: {
    title: 'My Website',
    description: 'A website built with Website Builder',
  },
});

// Create default demo page
const createDefaultDemoPage = (): Page => {
  const pageId = uuidv4();
  
  // Header section with navbar
  const headerSection: PageSection = {
    id: uuidv4(),
    name: 'Header',
    components: [
      {
        id: uuidv4(),
        type: 'navbar',
        category: 'navigation',
        name: 'Navbar',
        styles: {
          width: '100%',
          padding: '16px 24px',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        content: {
          links: [
            { label: 'Home', href: '/' },
            { label: 'About', href: '/about' },
            { label: 'Services', href: '/services' },
            { label: 'Contact', href: '/contact' },
          ],
        },
      },
    ],
  };
  
  // Navigation bar section
  const navSection: PageSection = {
    id: uuidv4(),
    name: 'Navigation Bar',
    components: [
      {
        id: uuidv4(),
        type: 'container',
        category: 'basic',
        name: 'Container',
        styles: {
          width: '100%',
          maxWidth: '1200px',
          padding: '20px',
          margin: '0 auto',
        },
        content: {},
      },
    ],
  };
  
  // Body text section
  const bodySection: PageSection = {
    id: uuidv4(),
    name: 'Main Content',
    components: [
      {
        id: uuidv4(),
        type: 'heading',
        category: 'text',
        name: 'Heading',
        styles: {
          fontSize: '48px',
          fontWeight: 'bold',
          color: '#1a1a1a',
          marginBottom: '16px',
          textAlign: 'center',
        },
        content: {
          text: 'Welcome to Our Website',
          level: 1,
        },
      },
      {
        id: uuidv4(),
        type: 'paragraph',
        category: 'text',
        name: 'Paragraph',
        styles: {
          fontSize: '18px',
          lineHeight: '1.8',
          color: '#4a4a4a',
          marginBottom: '24px',
          textAlign: 'center',
          maxWidth: '800px',
          marginLeft: 'auto',
          marginRight: 'auto',
        },
        content: {
          text: 'Build beautiful websites with our powerful drag-and-drop website builder. No coding required.',
        },
      },
      {
        id: uuidv4(),
        type: 'spacer',
        category: 'basic',
        name: 'Spacer',
        styles: {
          width: '100%',
          height: '40px',
        },
        content: {},
      },
    ],
  };
  
  // Footer section
  const footerSection: PageSection = {
    id: uuidv4(),
    name: 'Footer',
    components: [
      {
        id: uuidv4(),
        type: 'section',
        category: 'basic',
        name: 'Footer Section',
        styles: {
          width: '100%',
          padding: '40px 20px',
          backgroundColor: '#1a1a2e',
          color: '#ffffff',
          textAlign: 'center',
        },
        content: {},
        children: [
          {
            id: uuidv4(),
            type: 'paragraph',
            category: 'text',
            name: 'Footer Text',
            styles: {
              fontSize: '14px',
              color: '#9ca3af',
              marginBottom: '8px',
            },
            content: {
              text: '© 2024 Your Company. All rights reserved.',
            },
          },
        ],
      },
    ],
  };
  
  return {
    id: pageId,
    name: 'Home',
    slug: '/',
    sections: [headerSection, navSection, bodySection, footerSection],
    meta: {
      title: 'My Website - Home',
      description: 'A beautiful website built with Website Builder',
    },
  };
};

export const useBuilderStore = create<BuilderStore>((set, get) => ({
  // Initial State
  currentPage: createDefaultDemoPage(),
  selectedComponentId: null,
  selectedSectionId: null,
  deviceType: 'desktop',
  isPreviewMode: false,
  isCodeEditorOpen: false,
  codeEditorTab: 'html',
  leftSidebarOpen: true,
  rightSidebarOpen: true,
  history: [createDefaultDemoPage()],
  historyIndex: 0,
  draggedComponent: null,
  
  // Actions
  dispatch: (action: BuilderAction) => {
    const state = get();
    
    switch (action.type) {
      case 'SET_PAGE':
        set({ currentPage: action.payload });
        break;
        
      case 'SELECT_COMPONENT':
        set({ selectedComponentId: action.payload });
        break;
        
      case 'SELECT_SECTION':
        set({ selectedSectionId: action.payload });
        break;
        
      case 'SET_DEVICE_TYPE':
        set({ deviceType: action.payload });
        break;
        
      case 'TOGGLE_PREVIEW_MODE':
        set({ isPreviewMode: action.payload ?? !state.isPreviewMode });
        break;
        
      case 'TOGGLE_CODE_EDITOR':
        set({ isCodeEditorOpen: action.payload ?? !state.isCodeEditorOpen });
        break;
        
      case 'SET_CODE_EDITOR_TAB':
        set({ codeEditorTab: action.payload });
        break;
        
      case 'TOGGLE_LEFT_SIDEBAR':
        set({ leftSidebarOpen: action.payload ?? !state.leftSidebarOpen });
        break;
        
      case 'TOGGLE_RIGHT_SIDEBAR':
        set({ rightSidebarOpen: action.payload ?? !state.rightSidebarOpen });
        break;
        
      case 'SET_DRAGGED_COMPONENT':
        set({ draggedComponent: action.payload });
        break;
        
      case 'SAVE_PAGE':
        console.log('Page saved:', state.currentPage);
        break;
        
      case 'PUBLISH_PAGE':
        console.log('Page published:', state.currentPage);
        break;
        
      case 'UNDO':
        state.undo();
        break;
        
      case 'REDO':
        state.redo();
        break;
        
      case 'UPDATE_COMPONENT_STYLES':
        state.updateComponentStyles(action.payload.componentId, action.payload.styles);
        break;
        
      case 'UPDATE_COMPONENT_CONTENT':
        state.updateComponentContent(action.payload.componentId, action.payload.content);
        break;
        
      case 'ADD_COMPONENT':
        state.addComponent(action.payload.component, action.payload.sectionId, action.payload.index);
        break;
        
      case 'REMOVE_COMPONENT':
        state.removeComponent(action.payload.componentId);
        break;
        
      case 'MOVE_COMPONENT':
        state.moveComponent(action.payload.componentId, action.payload.toSectionId, action.payload.index);
        break;
        
      case 'DUPLICATE_COMPONENT':
        state.duplicateComponent(action.payload.componentId);
        break;
    }
  },
  
  setPage: (page: Page) => {
    const { history, historyIndex } = createHistoryState(page, get().history, get().historyIndex);
    set({ currentPage: page, history, historyIndex });
  },
  
  selectComponent: (componentId: string | null) => {
    set({ selectedComponentId: componentId });
  },
  
  selectSection: (sectionId: string | null) => {
    set({ selectedSectionId: sectionId });
  },
  
  setDeviceType: (deviceType: DeviceType) => {
    set({ deviceType: deviceType });
  },
  
  togglePreviewMode: (value?: boolean) => {
    set({ isPreviewMode: value ?? !get().isPreviewMode });
  },
  
  toggleCodeEditor: (value?: boolean) => {
    set({ isCodeEditorOpen: value ?? !get().isCodeEditorOpen });
  },
  
  setCodeEditorTab: (tab: 'html' | 'css' | 'jsx') => {
    set({ codeEditorTab: tab });
  },
  
  toggleLeftSidebar: (value?: boolean) => {
    set({ leftSidebarOpen: value ?? !get().leftSidebarOpen });
  },
  
  toggleRightSidebar: (value?: boolean) => {
    set({ rightSidebarOpen: value ?? !get().rightSidebarOpen });
  },
  
  updateComponentStyles: (componentId: string, styles: Partial<StyleProperties>) => {
    const state = get();
    if (!state.currentPage) return;
    
    const updateComponentInList = (components: BuilderComponent[]): BuilderComponent[] => {
      return components.map((comp) => {
        if (comp.id === componentId) {
          return { ...comp, styles: { ...comp.styles, ...styles } };
        }
        if (comp.children) {
          return { ...comp, children: updateComponentInList(comp.children) };
        }
        return comp;
      });
    };
    
    const newPage = {
      ...state.currentPage,
      sections: state.currentPage.sections.map((section) => ({
        ...section,
        components: updateComponentInList(section.components),
      })),
    };
    
    const { history, historyIndex } = createHistoryState(newPage, state.history, state.historyIndex);
    set({ currentPage: newPage, history, historyIndex });
  },
  
  updateComponentContent: (componentId: string, content: Partial<ContentProperties>) => {
    const state = get();
    if (!state.currentPage) return;
    
    const updateComponentInList = (components: BuilderComponent[]): BuilderComponent[] => {
      return components.map((comp) => {
        if (comp.id === componentId) {
          return { ...comp, content: { ...comp.content, ...content } };
        }
        if (comp.children) {
          return { ...comp, children: updateComponentInList(comp.children) };
        }
        return comp;
      });
    };
    
    const newPage = {
      ...state.currentPage,
      sections: state.currentPage.sections.map((section) => ({
        ...section,
        components: updateComponentInList(section.components),
      })),
    };
    
    const { history, historyIndex } = createHistoryState(newPage, state.history, state.historyIndex);
    set({ currentPage: newPage, history, historyIndex });
  },
  
  addComponent: (component: BuilderComponent, sectionId: string, index?: number) => {
    const state = get();
    if (!state.currentPage) return;
    
    const newPage = {
      ...state.currentPage,
      sections: state.currentPage.sections.map((section) => {
        if (section.id === sectionId) {
          const newComponents = [...section.components];
          if (index !== undefined) {
            newComponents.splice(index, 0, component);
          } else {
            newComponents.push(component);
          }
          return { ...section, components: newComponents };
        }
        return section;
      }),
    };
    
    const { history, historyIndex } = createHistoryState(newPage, state.history, state.historyIndex);
    set({ currentPage: newPage, history, historyIndex, draggedComponent: null });
  },
  
  removeComponent: (componentId: string) => {
    const state = get();
    if (!state.currentPage) return;
    
    const removeComponentFromList = (components: BuilderComponent[]): BuilderComponent[] => {
      return components
        .filter((comp) => comp.id !== componentId)
        .map((comp) => {
          if (comp.children) {
            return { ...comp, children: removeComponentFromList(comp.children) };
          }
          return comp;
        });
    };
    
    const newPage = {
      ...state.currentPage,
      sections: state.currentPage.sections.map((section) => ({
        ...section,
        components: removeComponentFromList(section.components),
      })),
    };
    
    const { history, historyIndex } = createHistoryState(newPage, state.history, state.historyIndex);
    set({ currentPage: newPage, history, historyIndex, selectedComponentId: null });
  },
  
  moveComponent: (componentId: string, toSectionId: string, index: number) => {
    const state = get();
    if (!state.currentPage) return;
    
    let movedComponent: BuilderComponent | null = null;
    
    // First, find and remove the component
    const removeFromList = (components: BuilderComponent[]): BuilderComponent[] => {
      const comp = components.find((c) => c.id === componentId);
      if (comp) {
        movedComponent = comp;
      }
      return components
        .filter((c) => c.id !== componentId)
        .map((c) => {
          if (c.children) {
            return { ...c, children: removeFromList(c.children) };
          }
          return c;
        });
    };
    
    const newPage = {
      ...state.currentPage,
      sections: state.currentPage.sections.map((section) => {
        const newComponents = removeFromList(section.components);
        
        if (section.id === toSectionId && movedComponent) {
          const updatedComponents = [...newComponents];
          updatedComponents.splice(index, 0, movedComponent);
          return { ...section, components: updatedComponents };
        }
        
        return { ...section, components: newComponents };
      }),
    };
    
    const { history, historyIndex } = createHistoryState(newPage, state.history, state.historyIndex);
    set({ currentPage: newPage, history, historyIndex });
  },
  
  duplicateComponent: (componentId: string) => {
    const state = get();
    if (!state.currentPage) return;

    let componentToDuplicate: BuilderComponent | null = null;

    const findComponent = (components: BuilderComponent[]): void => {
      for (const comp of components) {
        if (comp.id === componentId) {
          componentToDuplicate = comp;
          return;
        }
        if (comp.children) {
          findComponent(comp.children);
        }
      }
    };

    state.currentPage.sections.forEach((section) => {
      findComponent(section.components);
    });

    if (!componentToDuplicate) return;

    // Create a duplicate with new ID
    const comp = componentToDuplicate as BuilderComponent;
    const duplicateComponent: BuilderComponent = {
      id: uuidv4(),
      type: comp.type,
      category: comp.category,
      name: `${comp.name} (Copy)`,
      styles: JSON.parse(JSON.stringify(comp.styles)),
      content: JSON.parse(JSON.stringify(comp.content)),
      children: comp.children ? JSON.parse(JSON.stringify(comp.children)) : undefined,
      locked: comp.locked,
      hidden: comp.hidden,
    };
    
    // Add the duplicate after the original
    const addAfterComponent = (components: BuilderComponent[]): BuilderComponent[] => {
      const result: BuilderComponent[] = [];
      for (const comp of components) {
        result.push(comp);
        if (comp.id === componentId) {
          result.push(duplicateComponent);
        }
        if (comp.children) {
          comp.children = addAfterComponent(comp.children);
        }
      }
      return result;
    };
    
    const newPage = {
      ...state.currentPage,
      sections: state.currentPage.sections.map((section) => ({
        ...section,
        components: addAfterComponent(section.components),
      })),
    };
    
    const { history, historyIndex } = createHistoryState(newPage, state.history, state.historyIndex);
    set({ currentPage: newPage, history, historyIndex, selectedComponentId: duplicateComponent.id });
  },
  
  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      set({
        currentPage: JSON.parse(JSON.stringify(state.history[newIndex])),
        historyIndex: newIndex,
      });
    }
  },
  
  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      set({
        currentPage: JSON.parse(JSON.stringify(state.history[newIndex])),
        historyIndex: newIndex,
      });
    }
  },
  
  setDraggedComponent: (component: BuilderComponent | null) => {
    set({ draggedComponent: component });
  },
  
  savePage: () => {
    console.log('Page saved:', get().currentPage);
  },
  
  publishPage: () => {
    console.log('Page published:', get().currentPage);
  },
  
  // Selectors
  getSelectedComponent: () => {
    const state = get();
    if (!state.currentPage || !state.selectedComponentId) return null;
    
    const findComponent = (components: BuilderComponent[]): BuilderComponent | null => {
      for (const comp of components) {
        if (comp.id === state.selectedComponentId) {
          return comp;
        }
        if (comp.children) {
          const found = findComponent(comp.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    for (const section of state.currentPage.sections) {
      const found = findComponent(section.components);
      if (found) return found;
    }
    
    return null;
  },
  
  getSelectedSection: () => {
    const state = get();
    if (!state.currentPage || !state.selectedSectionId) return null;
    return state.currentPage.sections.find((s) => s.id === state.selectedSectionId) || null;
  },
  
  canUndo: () => {
    return get().historyIndex > 0;
  },
  
  canRedo: () => {
    const state = get();
    return state.historyIndex < state.history.length - 1;
  },
}));

// Helper function to create a new component from definition
export const createComponentFromDefinition = (
  type: string,
  category: string
): BuilderComponent => {
  const definition = getComponentDefinition(type as any);
  
  if (!definition) {
    throw new Error(`Component type "${type}" not found`);
  }
  
  return {
    id: uuidv4(),
    type: definition.type,
    category: definition.category,
    name: definition.name,
    styles: { ...definition.defaultStyles },
    content: { ...definition.defaultContent },
  };
};
