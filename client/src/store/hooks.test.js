import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAppDispatch, useAppSelector } from './hooks';

// Mock react-redux
vi.mock('react-redux', () => ({
  useDispatch: vi.fn().mockReturnValue(vi.fn()),
  useSelector: vi.fn().mockImplementation(selector => {
    return selector({ testState: 'test' });
  })
}));

describe('Redux Hooks', () => {
  it('useAppDispatch returns a function from useDispatch', () => {
    const { result } = renderHook(() => useAppDispatch());
    expect(result.current).toBeInstanceOf(Function);
  });
  
  it('useAppSelector correctly forwards selector', () => {
    const mockSelector = state => state.testState;
    const { result } = renderHook(() => useAppSelector(mockSelector));
    expect(result.current).toBe('test');
  });
});
