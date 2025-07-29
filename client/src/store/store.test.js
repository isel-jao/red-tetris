import { describe, it, expect, vi } from 'vitest';
import { store } from './index';
import * as reduxToolkit from '@reduxjs/toolkit';

// Spy on configureStore
vi.mock('@reduxjs/toolkit', async () => {
  const actual = await vi.importActual('@reduxjs/toolkit');
  return {
    ...actual,
    configureStore: vi.fn().mockImplementation(actual.configureStore),
  };
});

describe('Redux Store', () => {
  it('creates a valid Redux store', () => {
    expect(store).toBeDefined();
    expect(store.getState).toBeDefined();
    expect(store.dispatch).toBeDefined();
  });
  
  it('includes the game reducer', () => {
    const state = store.getState();
    expect(state).toHaveProperty('game');
  });
  
  it('configures the store with the correct reducers', () => {
    // Check that configureStore was called with the right parameters
    const configureStoreCall = reduxToolkit.configureStore.mock.calls[0][0];
    expect(configureStoreCall).toHaveProperty('reducer');
    expect(configureStoreCall.reducer).toHaveProperty('game');
  });
});
