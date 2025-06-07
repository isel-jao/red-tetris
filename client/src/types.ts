export type Shape = (typeof SHAPES)[number];

export type Tetromino = {
  shape: Shape;
  rotation: number;
  position: { x: number; y: number };
};

export type Board = (Shape | null)[][];

export type GameState = "idle" | "playing" | "paused" | "gameOver";
