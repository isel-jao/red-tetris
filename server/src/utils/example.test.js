import { describe, it, expect } from 'vitest';

// Simple utility function to test
const validateGameId = (gameId) => {
  return typeof gameId === 'string' && gameId.length > 0 && gameId.length <= 20;
};

describe('Example server test', () => {
  it('should validate game ID correctly', () => {
    expect(validateGameId('game1')).toBe(true);
    expect(validateGameId('')).toBe(false);
    expect(validateGameId('a'.repeat(21))).toBe(false);
    expect(validateGameId(123)).toBe(false);
  });
  
  it('demonstrates async tests', async () => {
    // Example of testing asynchronous code
    const result = await Promise.resolve(42);
    expect(result).toBe(42);
  });
});
