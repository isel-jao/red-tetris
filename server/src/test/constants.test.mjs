import { describe, it, expect } from 'vitest';
import { SHAPES } from '../constants.mjs';

describe('Constants', () => {
  describe('SHAPES', () => {
    it('should export SHAPES constant', () => {
      expect(SHAPES).toBeDefined();
    });

    it('should contain all Tetris piece types', () => {
      const expectedShapes = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
      expect(Object.keys(SHAPES).sort()).toEqual(expectedShapes.sort());
    });

    it('should define I shape correctly', () => {
      expect(SHAPES.I).toEqual([
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ]);
    });

    it('should define J shape correctly', () => {
      expect(SHAPES.J).toEqual([
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
      ]);
    });

    it('should define L shape correctly', () => {
      expect(SHAPES.L).toEqual([
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
      ]);
    });

    it('should define O shape correctly', () => {
      expect(SHAPES.O).toEqual([
        [1, 1],
        [1, 1],
      ]);
    });

    it('should define S shape correctly', () => {
      expect(SHAPES.S).toEqual([
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
      ]);
    });

    it('should define T shape correctly', () => {
      expect(SHAPES.T).toEqual([
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
      ]);
    });

    it('should define Z shape correctly', () => {
      expect(SHAPES.Z).toEqual([
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
      ]);
    });
  });
});
