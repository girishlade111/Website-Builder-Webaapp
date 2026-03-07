import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBuilderStore } from '../stores/useBuilderStore';

describe('useBuilderStore', () => {
  it('should have initial state', () => {
    const { result } = renderHook(() => useBuilderStore());
    
    expect(result.current.deviceType).toBe('desktop');
    expect(result.current.isPreviewMode).toBe(false);
    expect(result.current.isCodeEditorOpen).toBe(false);
    expect(result.current.leftSidebarOpen).toBe(true);
    expect(result.current.rightSidebarOpen).toBe(true);
  });

  it('should toggle preview mode', () => {
    const { result } = renderHook(() => useBuilderStore());
    
    act(() => {
      result.current.togglePreviewMode();
    });
    
    expect(result.current.isPreviewMode).toBe(true);
    
    act(() => {
      result.current.togglePreviewMode();
    });
    
    expect(result.current.isPreviewMode).toBe(false);
  });

  it('should toggle left sidebar', () => {
    const { result } = renderHook(() => useBuilderStore());
    
    act(() => {
      result.current.toggleLeftSidebar();
    });
    
    expect(result.current.leftSidebarOpen).toBe(false);
  });

  it('should toggle right sidebar', () => {
    const { result } = renderHook(() => useBuilderStore());
    
    act(() => {
      result.current.toggleRightSidebar();
    });
    
    expect(result.current.rightSidebarOpen).toBe(false);
  });

  it('should toggle code editor', () => {
    const { result } = renderHook(() => useBuilderStore());
    
    act(() => {
      result.current.toggleCodeEditor();
    });
    
    expect(result.current.isCodeEditorOpen).toBe(true);
  });

  it('should set device type', () => {
    const { result } = renderHook(() => useBuilderStore());
    
    act(() => {
      result.current.setDeviceType('tablet');
    });
    
    expect(result.current.deviceType).toBe('tablet');
    
    act(() => {
      result.current.setDeviceType('mobile');
    });
    
    expect(result.current.deviceType).toBe('mobile');
  });

  it('should select component', () => {
    const { result } = renderHook(() => useBuilderStore());
    const testComponentId = 'test-component-id';
    
    act(() => {
      result.current.selectComponent(testComponentId);
    });
    
    expect(result.current.selectedComponentId).toBe(testComponentId);
  });

  it('should select section', () => {
    const { result } = renderHook(() => useBuilderStore());
    const testSectionId = 'test-section-id';
    
    act(() => {
      result.current.selectSection(testSectionId);
    });
    
    expect(result.current.selectedSectionId).toBe(testSectionId);
  });

  it('should check undo/redo availability', () => {
    const { result } = renderHook(() => useBuilderStore());
    
    // Initial state: can't undo (historyIndex = 0), can't redo
    expect(result.current.canUndo()).toBe(false);
    expect(result.current.canRedo()).toBe(false);
  });
});
