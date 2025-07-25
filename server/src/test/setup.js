import { afterEach, beforeEach, vi } from 'vitest';

// Setup any server-specific mocks or test utilities
beforeEach(() => {
  // Reset any mocks before each test
  vi.resetAllMocks();
});

afterEach(() => {
  // Clean up after each test
  vi.restoreAllMocks();
});

// Mock any server dependencies that are not needed in tests
vi.mock('socket.io', () => ({
  default: vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn(),
  })),
}));

// Add any global server-side mocks or utilities
global.console = {
  ...console,
  // You can customize console methods for tests if needed
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};
