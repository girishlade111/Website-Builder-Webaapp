// Builder Store - Zustand state management for component tree

import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type {
  BuilderState,
  ComponentNode,
  Page,
  Project,
  DeviceType,
  HistoryEntry,
  HistoryAction,
  ComponentProps,
  ResponsiveStyles,
} from '@/types/builder';

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_HISTORY = 100;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Deep clone a component node
 */
function cloneNode(node: ComponentNode): ComponentNode {
  return {
    ...node,
    props: JSON.parse(JSON.stringify(node.props)),
    styles: JSON.parse(JSON.stringify(node.styles)),
    children: node.children?.map(cloneNode),
    meta: node.meta ? { ...node.meta } : undefined,
  };
}

/**
 * Find a node by ID in the tree
 */
function findNode(root: ComponentNode, nodeId: string): ComponentNode | null {
  if (root.id === nodeId) return root;
  if (root.children) {
    for (const child of root.children) {
      const found = findNode(child, nodeId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Find parent node and index of a child
 */
function findParentAndIndex(
  root: ComponentNode,
  nodeId: string,
  parent: ComponentNode | null = null
): { parent: ComponentNode | null; index: number } | null {
  if (root.children) {
    const index = root.children.findIndex((child) => child.id === nodeId);
    if (index !== -1) {
      return { parent: root, index };
    }
    for (const child of root.children) {
      const result = findParentAndIndex(child, nodeId, root);
      if (result) return result;
    }
  }
  return null;
}

/**
 * Update a node in the tree
 */
function updateNodeInTree(
  root: ComponentNode,
  nodeId: string,
  updater: (node: ComponentNode) => ComponentNode
): ComponentNode {
  if (root.id === nodeId) {
    return updater(root);
  }
  if (root.children) {
    return {
      ...root,
      children: root.children.map((child) => updateNodeInTree(child, nodeId, updater)),
    };
  }
  return root;
}

/**
 * Remove a node from the tree
 */
function removeNodeFromTree(root: ComponentNode, nodeId: string): ComponentNode {
  if (root.children) {
    return {
      ...root,
      children: root.children
        .filter((child) => child.id !== nodeId)
        .map((child) => removeNodeFromTree(child, nodeId)),
    };
  }
  return root;
}

/**
 * Insert a node at a specific position
 */
function insertNodeAtPosition(
  root: ComponentNode,
  targetId: string,
  newNode: ComponentNode,
  position: 'before' | 'after' | 'inside'
): ComponentNode {
  if (root.children) {
    const index = root.children.findIndex((child) => child.id === targetId);
    if (index !== -1) {
      const newChildren = [...root.children];
      if (position === 'inside') {
        // Add as first child
        newChildren[index] = {
          ...newChildren[index],
          children: [...(newChildren[index].children || []), newNode],
        };
      } else if (position === 'after') {
        newChildren.splice(index + 1, 0, newNode);
      } else {
        newChildren.splice(index, 0, newNode);
      }
      return { ...root, children: newChildren };
    }
    return {
      ...root,
      children: root.children.map((child) =>
        insertNodeAtPosition(child, targetId, newNode, position)
      ),
    };
  }
  return root;
}

/**
 * Create a history entry
 */
function createHistoryEntry(
  projectId: string,
  pageId: string,
  action: HistoryAction,
  snapshot: unknown,
  description?: string
): HistoryEntry {
  return {
    id: nanoid(),
    projectId,
    pageId,
    action,
    timestamp: new Date(),
    snapshot,
    description,
  };
}

// ============================================================================
// DEFAULT PAGE
// ============================================================================

function createDefaultRootNode(): ComponentNode {
  return {
    id: 'root',
    type: 'section',
    name: 'Root',
    props: {},
    styles: {
      base: {
        width: '100%',
        minHeight: '100vh',
      },
    },
    children: [],
  };
}

function createDefaultPage(): Page {
  return {
    id: nanoid(),
    name: 'Home',
    slug: '/',
    root: createDefaultRootNode(),
    meta: {
      title: 'My Page',
      description: 'A beautiful page built with Website Builder',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ============================================================================
// STORE TYPE
// ============================================================================

interface BuilderStore extends BuilderState {
  // Project actions
  setProject: (project: Project) => void;
  
  // Page actions
  setPage: (page: Page) => void;
  createPage: (name: string, slug: string) => Page;
  deletePage: (pageId: string) => void;
  
  // Selection
  selectNode: (nodeId: string | null) => void;
  hoverNode: (nodeId: string | null) => void;
  
  // Component actions
  addNode: (parentNode: ComponentNode, newNode: ComponentNode, position?: 'inside' | 'after') => void;
  removeNode: (nodeId: string) => void;
  updateNodeProps: (nodeId: string, props: Partial<ComponentProps>) => void;
  updateNodeStyles: (nodeId: string, styles: Partial<ResponsiveStyles>) => void;
  moveNode: (nodeId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
  duplicateNode: (nodeId: string) => void;
  
  // History
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  
  // UI actions
  setDeviceType: (deviceType: DeviceType) => void;
  togglePreviewMode: (value?: boolean) => void;
  toggleCodeEditor: (value?: boolean) => void;
  setCodeEditorTab: (tab: 'jsx' | 'css' | 'json') => void;
  toggleLeftSidebar: (value?: boolean) => void;
  toggleRightSidebar: (value?: boolean) => void;
  setLeftSidebarTab: (tab: 'components' | 'assets' | 'pages') => void;
  setRightSidebarTab: (tab: 'properties' | 'styles' | 'advanced') => void;
  
  // Drag actions
  setDraggedNode: (node: ComponentNode | null) => void;
  setDragOver: (nodeId: string | null, position: 'before' | 'after' | 'inside' | null) => void;
  
  // Clipboard
  copyNode: (nodeId: string) => void;
  pasteNode: (targetId: string) => void;
  clearClipboard: () => void;
  
  // Settings
  toggleGrid: () => void;
  toggleGuides: () => void;
  toggleSnapToGrid: () => void;
  setGridSize: (size: number) => void;
  
  // Save/Publish
  savePage: () => Promise<void>;
  publishPage: () => Promise<void>;
  
  // Selectors
  getSelectedNode: () => ComponentNode | null;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useBuilderStore = create<BuilderStore>((set, get) => ({
  // Initial state
  project: null,
  currentPage: createDefaultPage(),
  selectedNodeId: null,
  hoveredNodeId: null,
  
  deviceType: 'desktop',
  isPreviewMode: false,
  isCodeEditorOpen: false,
  codeEditorTab: 'jsx',
  leftSidebarOpen: true,
  rightSidebarOpen: true,
  leftSidebarTab: 'components',
  rightSidebarTab: 'properties',
  
  history: [],
  historyIndex: -1,
  
  draggedNode: null,
  dragOverId: null,
  dragPosition: null,
  
  clipboard: null,
  
  showGrid: false,
  showGuides: true,
  snapToGrid: false,
  gridSize: 8,

  // Project actions
  setProject: (project) => {
    set({ project });
  },

  // Page actions
  setPage: (page) => {
    const { history, historyIndex, project } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(createHistoryEntry(
      project?.id || 'unknown',
      page.id,
      'update_page',
      { page },
      `Updated page: ${page.name}`
    ));
    
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }
    
    set({
      currentPage: page,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  createPage: (name, slug) => {
    const newPage = createDefaultPage();
    newPage.name = name;
    newPage.slug = slug;
    return newPage;
  },

  deletePage: (pageId) => {
    // Implementation for deleting pages
    console.log('Delete page:', pageId);
  },

  // Selection
  selectNode: (nodeId) => {
    set({ selectedNodeId: nodeId });
  },

  hoverNode: (nodeId) => {
    set({ hoveredNodeId: nodeId });
  },

  // Component actions
  addNode: (parentNode, newNode, position = 'inside') => {
    const { currentPage, project } = get();
    if (!currentPage) return;

    const targetId = position === 'inside' ? parentNode.id : parentNode.id;
    
    const newRoot = insertNodeAtPosition(
      currentPage.root,
      targetId,
      newNode,
      position
    );

    const updatedPage = {
      ...currentPage,
      root: newRoot,
      updatedAt: new Date(),
    };

    const newHistory = get().history.slice(0, get().historyIndex + 1);
    newHistory.push(createHistoryEntry(
      project?.id || 'unknown',
      currentPage.id,
      'add_component',
      { node: newNode, parentId: parentNode.id },
      `Added ${newNode.type} component`
    ));

    set({
      currentPage: updatedPage,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      selectedNodeId: newNode.id,
    });
  },

  removeNode: (nodeId) => {
    const { currentPage, project } = get();
    if (!currentPage || nodeId === 'root') return;

    const nodeToRemove = findNode(currentPage.root, nodeId);
    if (!nodeToRemove) return;

    const newRoot = removeNodeFromTree(currentPage.root, nodeId);

    const updatedPage = {
      ...currentPage,
      root: newRoot,
      updatedAt: new Date(),
    };

    const newHistory = get().history.slice(0, get().historyIndex + 1);
    newHistory.push(createHistoryEntry(
      project?.id || 'unknown',
      currentPage.id,
      'remove_component',
      { node: nodeToRemove },
      `Removed ${nodeToRemove.type} component`
    ));

    set({
      currentPage: updatedPage,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      selectedNodeId: null,
    });
  },

  updateNodeProps: (nodeId, props) => {
    const { currentPage, project } = get();
    if (!currentPage) return;

    const newRoot = updateNodeInTree(currentPage.root, nodeId, (node) => ({
      ...node,
      props: { ...node.props, ...props },
    }));

    const updatedPage = {
      ...currentPage,
      root: newRoot,
      updatedAt: new Date(),
    };

    set({ currentPage: updatedPage });
  },

  updateNodeStyles: (nodeId, styles) => {
    const { currentPage } = get();
    if (!currentPage) return;

    const newRoot = updateNodeInTree(currentPage.root, nodeId, (node) => ({
      ...node,
      styles: {
        base: { ...node.styles.base, ...styles.base },
        tablet: { ...node.styles.tablet, ...styles.tablet },
        mobile: { ...node.styles.mobile, ...styles.mobile },
      },
    }));

    const updatedPage = {
      ...currentPage,
      root: newRoot,
      updatedAt: new Date(),
    };

    set({ currentPage: updatedPage });
  },

  moveNode: (nodeId, targetId, position) => {
    const { currentPage } = get();
    if (!currentPage) return;

    const nodeToMove = findNode(currentPage.root, nodeId);
    if (!nodeToMove || nodeId === targetId) return;

    // Remove from current position
    let newRoot = removeNodeFromTree(currentPage.root, nodeId);
    
    // Insert at new position
    newRoot = insertNodeAtPosition(newRoot, targetId, nodeToMove, position);

    const updatedPage = {
      ...currentPage,
      root: newRoot,
      updatedAt: new Date(),
    };

    set({ currentPage: updatedPage });
  },

  duplicateNode: (nodeId) => {
    const { currentPage } = get();
    if (!currentPage) return;

    const nodeToDuplicate = findNode(currentPage.root, nodeId);
    if (!nodeToDuplicate) return;

    const duplicatedNode = cloneNode(nodeToDuplicate);
    duplicatedNode.id = nanoid();
    duplicatedNode.name = `${nodeToDuplicate.name} (Copy)`;

    const newRoot = insertNodeAtPosition(
      currentPage.root,
      nodeId,
      duplicatedNode,
      'after'
    );

    const updatedPage = {
      ...currentPage,
      root: newRoot,
      updatedAt: new Date(),
    };

    set({
      currentPage: updatedPage,
      selectedNodeId: duplicatedNode.id,
    });
  },

  // History
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;

    const newIndex = historyIndex - 1;
    const entry = history[newIndex];
    
    // Restore from snapshot
    if (entry.snapshot && typeof entry.snapshot === 'object' && 'page' in entry.snapshot) {
      set({
        currentPage: (entry.snapshot as { page: Page }).page,
        historyIndex: newIndex,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;

    const newIndex = historyIndex + 1;
    const entry = history[newIndex];

    if (entry.snapshot && typeof entry.snapshot === 'object' && 'page' in entry.snapshot) {
      set({
        currentPage: (entry.snapshot as { page: Page }).page,
        historyIndex: newIndex,
      });
    }
  },

  clearHistory: () => {
    set({ history: [], historyIndex: -1 });
  },

  // UI actions
  setDeviceType: (deviceType) => {
    set({ deviceType });
  },

  togglePreviewMode: (value) => {
    set({ isPreviewMode: value ?? !get().isPreviewMode });
  },

  toggleCodeEditor: (value) => {
    set({ isCodeEditorOpen: value ?? !get().isCodeEditorOpen });
  },

  setCodeEditorTab: (tab) => {
    set({ codeEditorTab: tab });
  },

  toggleLeftSidebar: (value) => {
    set({ leftSidebarOpen: value ?? !get().leftSidebarOpen });
  },

  toggleRightSidebar: (value) => {
    set({ rightSidebarOpen: value ?? !get().rightSidebarOpen });
  },

  setLeftSidebarTab: (tab) => {
    set({ leftSidebarTab: tab });
  },

  setRightSidebarTab: (tab) => {
    set({ rightSidebarTab: tab });
  },

  // Drag actions
  setDraggedNode: (node) => {
    set({ draggedNode: node });
  },

  setDragOver: (nodeId, position) => {
    set({ dragOverId: nodeId, dragPosition: position });
  },

  // Clipboard
  copyNode: (nodeId) => {
    const { currentPage } = get();
    if (!currentPage) return;

    const nodeToCopy = findNode(currentPage.root, nodeId);
    if (nodeToCopy) {
      set({ clipboard: cloneNode(nodeToCopy) });
    }
  },

  pasteNode: (targetId) => {
    const { currentPage, clipboard } = get();
    if (!currentPage || !clipboard) return;

    const newClipboard = cloneNode(clipboard);
    newClipboard.id = nanoid();
    newClipboard.name = `${clipboard.name} (Copy)`;

    const newRoot = insertNodeAtPosition(currentPage.root, targetId, newClipboard, 'inside');

    set({
      currentPage: {
        ...currentPage,
        root: newRoot,
        updatedAt: new Date(),
      },
      clipboard: null,
    });
  },

  clearClipboard: () => {
    set({ clipboard: null });
  },

  // Settings
  toggleGrid: () => {
    set({ showGrid: !get().showGrid });
  },

  toggleGuides: () => {
    set({ showGuides: !get().showGuides });
  },

  toggleSnapToGrid: () => {
    set({ snapToGrid: !get().snapToGrid });
  },

  setGridSize: (size) => {
    set({ gridSize: size });
  },

  // Save/Publish
  savePage: async () => {
    const { currentPage } = get();
    if (!currentPage) return;

    console.log('Saving page:', currentPage);
    // In production, this would call an API to persist the page
  },

  publishPage: async () => {
    const { currentPage } = get();
    if (!currentPage) return;

    console.log('Publishing page:', currentPage);
    // In production, this would trigger a build/deployment
  },

  // Selectors
  getSelectedNode: () => {
    const { currentPage, selectedNodeId } = get();
    if (!currentPage || !selectedNodeId) return null;
    return findNode(currentPage.root, selectedNodeId);
  },
}));
