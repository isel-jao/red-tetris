import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { COLS, ROWS, SHAPES, TETROMINOES } from "./constants";
import { Board, Shape, Tetromino } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function createEmptyBoard(
  cols: number = COLS,
  rows: number = ROWS
): Board {
  return Array.from({ length: rows }, () => Array(cols).fill(null));
}

export function getDisplayBoard(
  board: Board,
  currentTetromino: Tetromino | null
): Board {
  const displayBoard = board.map((row) => row.slice());
  if (currentTetromino) {
    const { shape, rotation, position } = currentTetromino;
    const tetrominoShape = TETROMINOES[shape].rotations[rotation];
    for (let y = 0; y < tetrominoShape.length; y++) {
      for (let x = 0; x < tetrominoShape[y].length; x++) {
        if (tetrominoShape[y][x]) {
          displayBoard[position.y + y][position.x + x] = shape;
        }
      }
    }
  }
  return displayBoard;
}

export function randomShape(): Shape {
  const randomIndex = Math.floor(Math.random() * SHAPES.length);
  return SHAPES[randomIndex];
}

export function spawnTetromino(): Tetromino {
  const shape = randomShape();
  return {
    shape,
    rotation: 0,
    position: { x: 4, y: 0 }, // Start in the middle of the top row
  };
}

export function isValidMove(
  board: Board,
  tetromino: Tetromino | null
): boolean {
  if (!tetromino) return false;
  const { shape, rotation, position } = tetromino;
  const tetrominoMatrix = TETROMINOES[shape].rotations[rotation];
  for (let y = 0; y < tetrominoMatrix.length; y++) {
    for (let x = 0; x < tetrominoMatrix[y].length; x++) {
      const cell = tetrominoMatrix[y][x];
      if (!cell) continue; // Skip empty cells
      // check if the tetromino is out of bounds
      const boardWidth = board[0].length;
      const boardHeight = board.length;
      if (
        position.x + x < 0 ||
        position.x + x >= boardWidth ||
        position.y + y < 0 ||
        position.y + y >= boardHeight
      )
        return false;
      // check if the cell is already occupied
      const boardCell = board[position.y + y]?.[position.x + x];
      if (boardCell !== null) return false;
    }
  }
  return true;
}

export function clearFullLines(board: Board): {
  newBoard: Board;
  linesCleared: number;
} {
  const newBoard = board.filter((row) => row.some((cell) => cell === null));
  const linesCleared = ROWS - newBoard.length;
  for (let i = 0; i < linesCleared; i++) {
    newBoard.unshift(Array(COLS).fill(null)); // Add empty rows at the top
  }
  return { newBoard, linesCleared };
}
