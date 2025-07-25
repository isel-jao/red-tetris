import { describe, it, expect } from 'vitest';

// Simple utility function to test
const sum = (a, b) => a + b;

describe('Example client test', () => {
  it('should sum two numbers correctly', () => {
    expect(sum(1, 2)).toBe(3);
  });

  it('demonstrates test assertions', () => {
    // Basic assertions
    expect(true).toBe(true);
    expect({ name: 'tetris' }).toEqual({ name: 'tetris' });
    expect([1, 2, 3]).toContain(2);
  });
});
