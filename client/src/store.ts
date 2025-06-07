import { create } from "zustand";
import { Board, GameState, Shape, Tetromino } from "./types";
import {
  clearFullLines,
  createEmptyBoard,
  getDisplayBoard,
  isValidMove,
  randomShape,
  spawnTetromino,
} from "./utils";
import { TETROMINOES } from "./constants";
type State = {
  board: Board;
  gameState: GameState;
  currentTetromino: Tetromino | null;
  nextShape: Shape | null;
  lineClearCount: number;
};

type Actions = {
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  spawnTetromino: () => void;
  moveTetromino: (offsetX: number, offsetY: number) => boolean;
  rotateTetromino: () => void;
};

export const useStore = create<State & Actions>((set, get) => ({
  board: createEmptyBoard(),
  gameState: "idle",
  currentTetromino: null,
  nextShape: null,
  nextTetromino: null,
  lineClearCount: 0,

  startGame: () =>
    set({
      gameState: "playing",
      currentTetromino: spawnTetromino(),
      nextShape: randomShape(),
    }),
  pauseGame: () => set({ gameState: "paused" }),
  resumeGame: () => set({ gameState: "playing" }),
  resetGame: () =>
    set({
      board: Array.from({ length: 20 }, () => Array(10).fill(null)),
      gameState: "idle",
      currentTetromino: null,
      nextShape: null,
      lineClearCount: 0,
    }),

  spawnTetromino: () =>
    set({
      board: getDisplayBoard(get().board, get().currentTetromino),
      currentTetromino: spawnTetromino(),
      nextShape: randomShape(),
    }),
  moveTetromino: (offsetX, offsetY) => {
    const { currentTetromino, board, gameState, lineClearCount } = get();
    if (!currentTetromino || gameState !== "playing") return false;
    const newTetromino: Tetromino = {
      ...currentTetromino,
      position: {
        x: currentTetromino.position.x + offsetX,
        y: currentTetromino.position.y + offsetY,
      },
    };
    const isValid = isValidMove(board, newTetromino);
    if (isValid) {
      set({ currentTetromino: newTetromino });
      return true;
    } else if (offsetY > 0) {
      // If the move is invalid and we moved down, we should spawn a new tetromino
      const { newBoard, linesCleared } = clearFullLines(
        getDisplayBoard(board, currentTetromino)
      );
      const newTetromino = spawnTetromino();
      const isValidNewTetromino = isValidMove(newBoard, newTetromino);
      if (!isValidNewTetromino) {
        set({ gameState: "gameOver" });
        return false; // Game over if the new tetromino cannot be placed
      }
      set({
        board: newBoard,
        lineClearCount: lineClearCount + linesCleared,
        currentTetromino: spawnTetromino(),
        nextShape: randomShape(),
      });
      return false;
    }
    return false;
  },
  rotateTetromino: () => {
    const { currentTetromino, board, gameState } = get();
    if (!currentTetromino || gameState !== "playing") return;
    const { shape, rotation } = currentTetromino;
    const rotationsCount = TETROMINOES[shape].rotations.length;
    const newRotation = (rotation + 1) % rotationsCount;
    const newTetromino: Tetromino = {
      ...currentTetromino,
      rotation: newRotation,
    };
    const isValid = isValidMove(board, newTetromino);
    if (isValid) {
      set({ currentTetromino: newTetromino });
    }
  },
}));
