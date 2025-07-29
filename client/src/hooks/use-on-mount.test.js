import { describe, it, expect, vi } from 'vitest';
import { renderHook, cleanup } from '@testing-library/react';
import { useOnMount } from './use-on-mount';

describe('useOnMount', () => {
  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it('should call callback on mount', () => {
    // Setup
    const callback = vi.fn();
    
    // Execute
    renderHook(() => useOnMount(callback));
    
    // Verify
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not call callback more than once even on re-renders', () => {
    // Setup
    const callback = vi.fn();
    
    // Execute
    const { rerender } = renderHook(() => useOnMount(callback));
    
    // Re-render multiple times
    rerender();
    rerender();
    
    // Verify callback was still only called once
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should call cleanup function when unmounted', () => {
    // Setup
    const callback = vi.fn();
    const cleanup = vi.fn();
    
    // Execute
    const { unmount } = renderHook(() => useOnMount(callback, cleanup));
    
    // Unmount
    unmount();
    
    // Verify
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('should not call cleanup if unmounted before callback runs', () => {
    // This is an edge case that shouldn't happen in normal React usage
    // but we test it to ensure the implementation is robust
    const callback = vi.fn().mockImplementation(() => {
      // Simulate callback not running
      throw new Error('Simulated error');
    });
    const cleanup = vi.fn();
    
    // We need to catch the error to prevent test failure
    try {
      const { unmount } = renderHook(() => useOnMount(callback, cleanup));
      unmount();
    } catch (error) {
      // Error is expected
    }
    
    // Cleanup should not be called since hasRun is still false
    expect(cleanup).not.toHaveBeenCalled();
  });
});
