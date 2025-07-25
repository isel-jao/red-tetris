import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
// Import jest-dom matchers
import '@testing-library/jest-dom';

// Automatically clean up after each test
afterEach(() => {
  cleanup();
});

// Add global test utils and mock extensions, if needed
window.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock any browser APIs that jsdom doesn't support
// but your components might use
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock console.error to suppress React warnings during tests
const originalError = console.error;
console.error = (...args) => {
  // Filter out react-test-renderer deprecation warning and act() warnings
  if (
    args[0].includes('react-test-renderer is deprecated') ||
    args[0].includes('was not wrapped in act')
  ) {
    return;
  }
  originalError(...args);
};
