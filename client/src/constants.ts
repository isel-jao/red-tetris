import { Shape } from "./types";

export const SHAPES = ["I", "O", "T", "S", "Z", "J", "L"] as const;
export const ROWS = 20; // Number of rows in the Tetris board
export const COLS = 10; // Number of columns in the Tetris board

export const INITIAL_SPEED = 1000; // Initial speed in milliseconds
export const LEVEL_UP_SPEED_DECREASE = 100; // Speed decrease per level

export const TETROMINOES: Record<
  Shape,
  {
    shape: Shape;
    rotations: number[][][];
    color: string;
  }
> = {
  I: {
    shape: "I",
    rotations: [
      [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
      ],
    ],
    color: "text-rose-500",
  },
  O: {
    shape: "O",
    rotations: [
      [
        [1, 1],
        [1, 1],
      ],
    ],
    color: "text-yellow-500",
  },
  T: {
    shape: "T",
    rotations: [
      [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 1, 0],
        [0, 1, 1],
        [0, 1, 0],
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
      ],
      [
        [0, 1, 0],
        [1, 1, 0],
        [0, 1, 0],
      ],
    ],
    color: "text-purple-500",
  },
  S: {
    shape: "S",
    rotations: [
      [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
      ],
      [
        [0, 1, 0],
        [0, 1, 1],
        [0, 0, 1],
      ],
    ],
    color: "text-green-500",
  },
  Z: {
    shape: "Z",
    rotations: [
      [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 0, 1],
        [0, 1, 1],
        [0, 1, 0],
      ],
    ],
    color: "text-red-500",
  },
  J: {
    shape: "J",
    rotations: [
      [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 1, 1],
        [0, 1, 0],
        [0, 1, 0],
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 1],
      ],
      [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0],
      ],
    ],
    color: "text-blue-500",
  },
  L: {
    shape: "L",
    rotations: [
      [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1],
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [1, 0, 0],
      ],
      [
        [1, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
      ],
    ],
    color: "text-cyan-500",
  },
};
