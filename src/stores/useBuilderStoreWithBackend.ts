// Enhanced Builder Store with Backend Integration

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  Page,
  BuilderComponent,
  PageSection,
  StyleProperties,
  ContentProperties,
  DeviceType,
  ComponentType,
} from '@/types';
import { Project, PageSchema } from '@/types/backend';
import { getComponentDefinition } from '@/types/components';
import { pagesApi, projectsApi, versionsApi, deploymentsApi } from '@/lib/apiClient';

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

// Convert PageSchema to Page format
const schemaToPage = (schema: PageSchema, pageData: any): Page => {
  return {
    id: pageData.id,
    name: pageData.name,
    slug: pageData.slug || pageData.path.replace(/^\//, '') || 'home',
    sections: convertSchemaToSections(schema),
    meta: {
      title: pageData.metaTitle,
      description: pageData.metaDescription,
    },
  };
};

// Convert flat components to sections
const convertSchemaToSections = (schema: PageSchema): PageSection[] => {
  const components = schema.components || [];
  
  // Group components into logical sections
  const sections: PageSection[] = [];
  let currentSection: PageSection | null = null;

  for (const comp of components) {
    // Start new section for layout components
    if (comp.type === 'section' || comp.type === 'hero') {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        id: comp.id,
        name: comp.name,
        components: [comp],
      };
    } else if (currentSection) {
      currentSection.components.push(comp);
    } else {
      // Create default section
      currentSection = {
        id: uuidv4(),
        name: 'Main Content',
        components: [comp],
      };
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return sections.length > 0 ? sections : [{
    id: uuidv4(),
    name: 'Main Content',
    components: [],
  }];
};

// Convert Page to PageSchema format
const pageToSchema = (page: Page): PageSchema => {
  const components: BuilderComponent[] = [];

  for (const section of page.sections) {
    for (const comp of section.components) {
      components.push(comp);
    }
  }

  return {
    components,
    styles: {},
    settings: {},
  };
};

interface BuilderStore {
  // Current state
  projectId: string | null;
  currentPage: Page | null;
  currentPageId: string | null;
  selectedComponentId: string | null;
  selectedSectionId: string | null;
  deviceType: DeviceType;
  isPreviewMode: boolean;
  isCodeEditorOpen: boolean;
  codeEditorTab: 'html' | 'css' | 'jsx';
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  history: Page[];
  historyIndex: number;
  draggedComponent: BuilderComponent | null;
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  isDeploying: boolean;
  error: string | null;

  // Project data
  project: Project | null;
  pages: Page[];

  // Actions - Navigation
  loadProject: (projectId: string) => Promise<void>;
  loadPage: (pageId: string) => Promise<void>;
  createPage: (name: string, path: string) => Promise<Page | null>;
  deletePage: (pageId: string) => Promise<void>;
  saveCurrentPage: () => Promise<boolean>;
  publishCurrentPage: () => Promise<boolean>;

  // Actions - UI
  dispatch: (action: any) => void;
  setPage: (page: Page) => void;
  selectComponent: (componentId: string | null) => void;
  selectSection: (sectionId: string | null) => void;
  setDeviceType: (deviceType: DeviceType) => void;
  togglePreviewMode: (value?: boolean) => void;
  toggleCodeEditor: (value?: boolean) => void;
  setCodeEditorTab: (tab: 'html' | 'css' | 'jsx') => void;
  toggleLeftSidebar: (value?: boolean) => void;
  toggleRightSidebar: (value?: boolean) => void;
  setDraggedComponent: (component: BuilderComponent | null) => void;

  // Actions - Component manipulation
  updateComponentStyles: (componentId: string, styles: Partial<StyleProperties>) => void;
  updateComponentContent: (componentId: string, content: Partial<ContentProperties>) => void;
  addComponent: (component: BuilderComponent, sectionId: string, index?: number) => void;
  removeComponent: (componentId: string) => void;
  moveComponent: (componentId: string, toSectionId: string, index: number) => void;
  duplicateComponent: (componentId: string) => void;
  undo: () => void;
  redo: () => void;

  // Actions - Version & Deployment
  createVersion: (message?: string) => Promise<boolean>;
  rollbackToVersion: (versionId: string) => Promise<boolean>;
  deployProject: (environment?: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION') => Promise<boolean>;

  // Selectors
  getSelectedComponent: () => BuilderComponent | null;
  getSelectedSection: () => PageSection | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Clear state
  clearState: () => void;
}

// Create empty page
const createEmptyPage = (name: string = 'New Page', path: string = '/new'): Page => ({
  id: uuidv4(),
  name,
  slug: path.replace(/^\//, '').replace(/\//g, '-') || 'new',
  sections: [{
    id: uuidv4(),
    name: 'Main Content',
    components: [],
  }],
  meta: {
    title: name,
    description: '',
  },
});

export const useBuilderStore = create<BuilderStore>((set, get) => ({
  // Initial State
  projectId: null,
  currentPage: null,
  currentPageId: null,
  selectedComponentId: null,
  selectedSectionId: null,
  deviceType: 'desktop',
  isPreviewMode: false,
  isCodeEditorOpen: false,
  codeEditorTab: 'html',
  leftSidebarOpen: true,
  rightSidebarOpen: true,
  history: [],
  historyIndex: -1,
  draggedComponent: null,
  
  // Loading states
  isLoading: false,
  isSaving: false,
  isDeploying: false,
  error: null,

  // Project data
  project: null,
  pages: [],

  // Load project
  loadProject: async (projectId: string) => {
    set({ isLoading: true, error: null });

    try {
      // Load project
      const projectResponse = await projectsApi.get(projectId);
      if (!projectResponse.success || !projectResponse.data) {
        throw new Error(projectResponse.error || 'Failed to load project');
      }

      const project = projectResponse.data;
      
      // Load pages
      const pagesResponse = await pagesApi.list(projectId);
      const apiPages = pagesResponse.data || [];
      
      // Convert API pages to frontend Page format
      const pages: Page[] = apiPages.map((p: any) => {
        const schema = p.schema as PageSchema;
        return schemaToPage(schema, p);
      });

      // Set initial page (home or first page)
      const homePage = pages.find(p => p.slug === 'home' || p.slug === '/') || pages[0];
      let currentPage: Page | null = null;

      if (homePage) {
        currentPage = homePage;
      }

      set({
        projectId,
        project,
        pages,
        currentPage,
        currentPageId: currentPage?.id || null,
        history: currentPage ? [currentPage] : [],
        historyIndex: currentPage ? 0 : -1,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to load project',
      });
    }
  },

  // Load page
  loadPage: async (pageId: string) => {
    if (!get().projectId) return;

    set({ isLoading: true, error: null });

    try {
      const response = await pagesApi.get(get().projectId!, pageId);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load page');
      }

      const pageData = response.data;
      const schema = (pageData as any).schema as PageSchema;
      const page = schemaToPage(schema, pageData);

      const { history, historyIndex } = createHistoryState(page, get().history, get().historyIndex);
      
      set({
        currentPage: page,
        currentPageId: pageId,
        history,
        historyIndex,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to load page',
      });
    }
  },

  // Create page
  createPage: async (name: string, path: string) => {
    if (!get().projectId) return null;

    try {
      const schema = pageToSchema(createEmptyPage(name, path));
      
      const response = await pagesApi.create(get().projectId!, {
        name,
        path,
        schema,
        metaTitle: name,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create page');
      }

      const newPage = schemaToPage(schema, response.data);
      
      set((state) => ({
        pages: [...state.pages, newPage],
        currentPage: newPage,
        currentPageId: newPage.id,
        history: [newPage],
        historyIndex: 0,
      }));

      return newPage;
    } catch (error: any) {
      set({ error: error.message || 'Failed to create page' });
      return null;
    }
  },

  // Delete page
  deletePage: async (pageId: string) => {
    if (!get().projectId) return;

    try {
      const response = await pagesApi.delete(get().projectId!, pageId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete page');
      }

      set((state) => ({
        pages: state.pages.filter(p => p.id !== pageId),
        currentPage: state.currentPage?.id === pageId ? null : state.currentPage,
        currentPageId: state.currentPage?.id === pageId ? null : state.currentPageId,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete page' });
    }
  },

  // Save current page
  saveCurrentPage: async () => {
    const state = get();
    if (!state.projectId || !state.currentPageId || !state.currentPage) return false;

    set({ isSaving: true, error: null });

    try {
      const schema = pageToSchema(state.currentPage);
      
      const response = await pagesApi.update(get().projectId!, state.currentPageId, {
        name: state.currentPage.name,
        schema,
        metaTitle: state.currentPage.meta?.title,
        metaDescription: state.currentPage.meta?.description,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to save page');
      }

      set({ isSaving: false });
      return true;
    } catch (error: any) {
      set({
        isSaving: false,
        error: error.message || 'Failed to save page',
      });
      return false;
    }
  },

  // Publish current page
  publishCurrentPage: async () => {
    const state = get();
    if (!state.projectId || !state.currentPageId) return false;

    try {
      const response = await pagesApi.update(get().projectId!, state.currentPageId, {
        isPublished: true,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to publish page');
      }

      set((state) => ({
        pages: state.pages.map(p => 
          p.id === state.currentPageId ? { ...p, isPublished: true } : p
        ),
      }));

      return true;
    } catch (error: any) {
      set({ error: error.message || 'Failed to publish page' });
      return false;
    }
  },

  // Actions - UI
  dispatch: (action: any) => {
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
    set({ deviceType });
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

  setDraggedComponent: (component: BuilderComponent | null) => {
    set({ draggedComponent: component });
  },

  // Component manipulation
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

  // Version management
  createVersion: async (message?: string) => {
    const state = get();
    if (!state.projectId) return false;

    try {
      const response = await versionsApi.create(state.projectId, { message });
      return response.success || false;
    } catch (error: any) {
      set({ error: error.message || 'Failed to create version' });
      return false;
    }
  },

  rollbackToVersion: async (versionId: string) => {
    const state = get();
    if (!state.projectId) return false;

    try {
      const response = await versionsApi.rollback(state.projectId, versionId);
      if (response.success) {
        // Reload project after rollback
        await state.loadProject(state.projectId);
      }
      return response.success || false;
    } catch (error: any) {
      set({ error: error.message || 'Failed to rollback version' });
      return false;
    }
  },

  // Deployment
  deployProject: async (environment?: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION') => {
    const state = get();
    if (!state.projectId) return false;

    set({ isDeploying: true, error: null });

    try {
      // First save current page
      await state.saveCurrentPage();

      const response = await deploymentsApi.create(state.projectId, environment);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to deploy');
      }

      set({ isDeploying: false });
      return true;
    } catch (error: any) {
      set({
        isDeploying: false,
        error: error.message || 'Failed to deploy',
      });
      return false;
    }
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

  // Clear state
  clearState: () => {
    set({
      projectId: null,
      currentPage: null,
      currentPageId: null,
      selectedComponentId: null,
      selectedSectionId: null,
      project: null,
      pages: [],
      history: [],
      historyIndex: -1,
      error: null,
    });
  },
}));

// Helper function to create a new component from definition
export const createComponentFromDefinition = (
  type: string,
  category: string
): BuilderComponent => {
  const definition = getComponentDefinition(type as ComponentType);

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
