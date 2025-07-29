import { describe, it, expect, vi, beforeEach } from "vitest";
import { Game } from "../game.mjs";
import { SHAPES } from "../constants.mjs";

describe("Game", () => {
  let game;
  let mockOnUpdate;

  beforeEach(() => {
    mockOnUpdate = vi.fn();
    game = new Game(mockOnUpdate);
    vi.spyOn(global, "setInterval").mockImplementation((fn) => {
      fn();
      return 123; // Mock interval ID
    });
    vi.spyOn(global, "clearInterval").mockImplementation(() => {});
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with correct default values", () => {
      expect(game.cols).toBe(10);
      expect(game.rows).toBe(20);
      expect(game.status).toBe("waiting");
      expect(game.winner).toBeNull();
      expect(game.players).toEqual([]);
      expect(game.onUpdate).toBe(mockOnUpdate);
      expect(game.intervalId).toBeNull();
      expect(game.duration).toBe(1000);
    });
  });

  describe("addPlayer", () => {
    it("should add a player successfully", () => {
      const result = game.addPlayer("player1");

      expect(result.success).toBe(true);
      expect(result.message).toBe("Player added successfully");
      expect(game.players.length).toBe(1);
      expect(game.players[0].id).toBe("player1");
      expect(game.players[0].board).toHaveLength(game.rows);
      expect(game.players[0].board[0]).toHaveLength(game.cols);
    });

    it("should not add a player if the room is full", () => {
      game.addPlayer("player1");
      game.addPlayer("player2");
      const result = game.addPlayer("player3");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Room is full");
      expect(game.players.length).toBe(2);
    });

    it("should not add the same player twice", () => {
      game.addPlayer("player1");
      const result = game.addPlayer("player1");

      expect(result.success).toBe(false);
      expect(result.message).toBe("User player1 is already in room");
      expect(game.players.length).toBe(1);
    });

    it("should call onUpdate when second player joins", () => {
      game.addPlayer("player1");
      game.addPlayer("player2");

      expect(mockOnUpdate).toHaveBeenCalledWith({
        players: game.players,
      });
    });
  });

  describe("havePlayer", () => {
    it("should return player if exists", () => {
      game.addPlayer("player1");

      const result = game.havePlayer("player1");

      expect(result).toBeTruthy();
      expect(result.id).toBe("player1");
    });

    it("should return undefined if player does not exist", () => {
      const result = game.havePlayer("nonexistent");

      expect(result).toBeUndefined();
    });
  });

  describe("removePlayer", () => {
    it("should remove a player successfully", () => {
      game.addPlayer("player1");
      game.removePlayer("player1");

      expect(game.players.length).toBe(0);
      expect(game.status).toBe("waiting");
    });

    it("should not do anything if player does not exist", () => {
      game.addPlayer("player1");
      game.removePlayer("nonexistent");

      expect(game.players.length).toBe(1);
    });

    it("should set winner and status to finished if one player leaves during game", () => {
      game.addPlayer("player1");
      game.addPlayer("player2");
      game.status = "playing";

      game.removePlayer("player2");

      expect(game.status).toBe("finished");
      expect(game.winner).toBe("player1");
      expect(mockOnUpdate).toHaveBeenCalledWith({
        status: "finished",
        players: game.players,
      });
    });
  });

  describe("getPlayer", () => {
    it("should return the player with the given id", () => {
      game.addPlayer("player1");
      const player = game.getPlayer("player1");

      expect(player).toBeDefined();
      expect(player.id).toBe("player1");
    });

    it("should return undefined if player not found", () => {
      const player = game.getPlayer("nonexistent");

      expect(player).toBeUndefined();
    });
  });

  describe("start", () => {
    it("should initialize game state and start game loop", () => {
      game.addPlayer("player1");
      game.addPlayer("player2");
      game.start();

      expect(game.status).toBe("playing");
      expect(game.players[0].currentTetromino).toBeDefined();
      expect(game.players[0].nextTetromino).toBeDefined();
      expect(game.players[0].linesCleared).toBe(0);
      expect(mockOnUpdate).toHaveBeenCalledWith({
        status: "playing",
        players: game.players,
      });
      expect(setInterval).toHaveBeenCalled();
    });
  });

  describe("reset", () => {
    it("should reset game state", () => {
      game.addPlayer("player1");
      game.start();
      game.reset();

      expect(game.status).toBe("waiting");
      expect(clearInterval).toHaveBeenCalled();
      expect(game.intervalId).toBeNull();
      expect(game.players[0].currentTetromino).toBeNull();
      expect(mockOnUpdate).toHaveBeenCalledWith({
        status: "waiting",
        players: game.players,
      });
    });
  });

  describe("creatEmptyBoard", () => {
    it("should create a board of correct dimensions filled with null", () => {
      const board = game.creatEmptyBoard();

      expect(board).toHaveLength(game.rows);
      expect(board[0]).toHaveLength(game.cols);
      expect(board[0][0]).toBeNull();

      // Check all cells are null
      const allNull = board.flat().every((cell) => cell === null);
      expect(allNull).toBe(true);
    });
  });

  describe("getRandomShape", () => {
    it("should return a valid shape key", () => {
      const shapeKey = game.getRandomShape();

      expect(Object.keys(SHAPES)).toContain(shapeKey);
    });
  });

  describe("getRandomTetromino", () => {
    it("should create a tetromino with valid properties", () => {
      const tetromino = game.getRandomTetromino();

      expect(tetromino).toHaveProperty("shapeKey");
      expect(tetromino).toHaveProperty("matrix");
      expect(tetromino).toHaveProperty("position");
      expect(tetromino.position).toHaveProperty("x");
      expect(tetromino.position).toHaveProperty("y");
      expect(Object.keys(SHAPES)).toContain(tetromino.shapeKey);
    });
  });

  describe("rotateShape", () => {
    it("should rotate a shape matrix correctly", () => {
      const shape = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];

      const rotated = game.rotateShape(shape);

      expect(rotated).toEqual([
        [7, 4, 1],
        [8, 5, 2],
        [9, 6, 3],
      ]);
    });
  });

  describe("isValidMove", () => {
    it("should return true for valid moves", () => {
      const board = game.creatEmptyBoard();
      const tetromino = {
        matrix: [
          [1, 1],
          [1, 1],
        ],
        position: { x: 4, y: 4 },
      };

      const result = game.isValidMove(board, tetromino);

      expect(result).toBe(true);
    });

    it("should return false when move is out of bounds", () => {
      const board = game.creatEmptyBoard();
      const tetromino = {
        matrix: [
          [1, 1],
          [1, 1],
        ],
        position: { x: -1, y: 0 },
      };

      const result = game.isValidMove(board, tetromino);

      expect(result).toBe(false);
    });

    it("should return false when position overlaps with existing pieces", () => {
      const board = game.creatEmptyBoard();
      board[4][4] = "I"; // Place a piece

      const tetromino = {
        matrix: [
          [1, 1],
          [1, 1],
        ],
        position: { x: 3, y: 3 },
      };

      const result = game.isValidMove(board, tetromino);

      expect(result).toBe(false);
    });
  });

  describe("isFull and isEmpty", () => {
    it("should report correct full/empty status", () => {
      expect(game.isEmpty()).toBe(true);
      expect(game.isFull()).toBe(false);

      game.addPlayer("player1");
      expect(game.isEmpty()).toBe(false);
      expect(game.isFull()).toBe(false);

      game.addPlayer("player2");
      expect(game.isEmpty()).toBe(false);
      expect(game.isFull()).toBe(true);
    });
  });
});
