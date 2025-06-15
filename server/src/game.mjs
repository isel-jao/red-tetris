import { SHAPES } from "./constants.mjs";

export class Game {
  constructor(onUpdate) {
    (this.cols = 10), (this.rows = 20);
    this.status = "waiting";
    this.winner = null;
    this.players = [];
    this.onUpdate = onUpdate;
    this.intervalId = null;
    this.duration = 2000;
  }
  addPlayer(playerId) {
    if (this.players.length >= 2) {
      return { success: false, message: "Room is full" };
    }
    if (this.havePlayer(playerId)) {
      return { success: false, message: `User ${playerId} is already in room` };
    }
    this.players.push({
      id: playerId,
      board: this.creatEmptyBoard(),
      currentTetromino: null,
      nextTetromino: null,
      linesCleared: 0,
    });
    if (this.players.length === 2) {
      this.onUpdate({
        players: this.players,
      });
    }
    return {
      success: true,
      message: "Player added successfully",
      game: {
        status: this.status,
        players: this.players,
      },
    };
  }

  havePlayer(playerId) {
    return this.players.find((player) => player.id === playerId);
  }
  removePlayer(playerId) {
    if (!this.havePlayer(playerId)) {
      return;
    }
    this.players = this.players.filter((player) => player.id !== playerId);
    if (this.players.length === 0) {
      this.status = "waiting";
      this.winner = null;
    } else if (this.players.length === 1 && this.status === "playing") {
      this.status = "finished";
      this.winner = this.players[0].id;
    }
    this.onUpdate({
      status: this.status,
      players: this.players,
    });
  }

  getPlayer(playerId) {
    return this.players.find((player) => player.id === playerId);
  }

  start() {
    this.status = "playing";
    for (const player of this.players) {
      if (!player) continue;
      player.board = this.creatEmptyBoard();
      player.currentTetromino = this.getRandomTetromino();
      player.nextTetromino = this.getRandomTetromino();
      player.linesCleared = 0;
    }
    this.onUpdate({
      status: this.status,
      players: this.players,
    });
    this.gameLoop();
  }

  restart() {
    this.status = "waiting";
    for (const player of this.players) {
      if (!player) continue;
      player.board = this.creatEmptyBoard();
      player.currentTetromino = this.getRandomTetromino();
      player.nextTetromino = this.getRandomTetromino();
      player.linesCleared = 0;
    }
    this.onUpdate({
      status: this.status,
      players: this.players,
    });
    this.gameLoop();
  }
  gameLoop() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      for (const player of this.players) {
        if (!player.currentTetromino) {
          this.spawnTetromino(player.id);
        } else {
          this.moveTetromino(player.id, "down");
        }
      }
    }, this.duration);
  }

  placeTetromino(playerId) {
    const player = this.getPlayer(playerId);
    if (!player || !player.currentTetromino) return;
    const { matrix, position } = player.currentTetromino;
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (!matrix[row][col]) continue;
        const boardRow = position.y + row;
        const boardCol = position.x + col;
        if (
          boardRow >= 0 &&
          boardRow < this.rows &&
          boardCol >= 0 &&
          boardCol < this.cols
        ) {
          player.board[boardRow][boardCol] = player.currentTetromino.shapeKey;
        }
      }
    }
  }
  clearLines(playerId) {
    const player = this.getPlayer(playerId);
    if (!player) return;
    let linesCleared = 0;
    for (let row = this.rows - 1; row >= 0; row--) {
      if (player.board[row].every((cell) => cell !== null && cell !== "X")) {
        player.board.splice(row, 1);
        linesCleared++;
      }
    }
    for (let i = 0; i < linesCleared; i++) {
      player.board.unshift(Array(this.cols).fill(null));
    }
    // for every lined cleard decrease the rows count for the other player
    for (const otherPlayer of this.players) {
      if (otherPlayer.id !== playerId) {
        for (let i = 0; i < linesCleared; i++) {
          otherPlayer.board.push(Array(this.cols).fill("X"));
          otherPlayer.board.shift();
          otherPlayer.currentTetromino.position.y -= 1;
        }
      }
    }
    player.linesCleared += linesCleared;
  }

  spawnTetromino(playerId) {
    const player = this.getPlayer(playerId);
    if (!player || !player.currentTetromino) return false;

    const newTetromino = this.nextTetromino || this.getRandomTetromino();

    if (!this.isValidMove(player.board, newTetromino)) {
      clearInterval(this.intervalId);
      this.status = "finished";
      this.winner = this.players.find((p) => p.id !== playerId)?.id;
      this.onUpdate({
        winner: this.winner || null,
        status: this.status,
        players: this.players,
      });
      return;
    }

    player.currentTetromino = newTetromino;
    player.nextTetromino = this.getRandomTetromino();
  }

  rotateTetromino(playerId) {
    const player = this.getPlayer(playerId);
    if (!player || !player.currentTetromino) return;

    const { matrix, position } = player.currentTetromino;
    const rotatedMatrix = this.rotateShape(matrix);

    const newTetromino = {
      shapeKey: player.currentTetromino.shapeKey,
      matrix: rotatedMatrix,
      position,
    };

    if (this.isValidMove(player.board, newTetromino)) {
      player.currentTetromino.matrix = rotatedMatrix;
      this.onUpdate({
        players: this.players,
      });
    }
  }

  moveTetromino(playerId, direction) {
    const player = this.getPlayer(playerId);
    if (!player || !player.currentTetromino) {
      console.warn("No current tetromino for player:", playerId);
    }

    const { matrix, position } = player.currentTetromino;
    let newPosition = { ...position };

    if (direction === "left") {
      newPosition.x -= 1;
    } else if (direction === "right") {
      newPosition.x += 1;
    } else if (direction === "down") {
      newPosition.y += 1;
    }

    const newTetromino = {
      shapeKey: player.currentTetromino.shapeKey,
      matrix,
      position: newPosition,
    };
    const isValid = this.isValidMove(player.board, newTetromino);

    if (isValid) {
      player.currentTetromino.position = newPosition;
      this.onUpdate({
        players: this.players,
      });
      return;
    }
    if (direction === "down") {
      this.placeTetromino(playerId);
      this.clearLines(playerId);
      this.spawnTetromino(playerId);
      this.onUpdate({
        players: this.players,
      });
    }
  }

  dropTetromino(playerId) {
    const player = this.getPlayer(playerId);
    if (!player || !player.currentTetromino) return false;
    const { matrix, position } = player.currentTetromino;
    let newPosition = { ...position };
    while (
      this.isValidMove(player.board, {
        shapeKey: player.currentTetromino.shapeKey,
        matrix,
        position: newPosition,
      })
    ) {
      newPosition.y += 1;
    }
    newPosition.y -= 1;
    player.currentTetromino.position = newPosition;
    this.placeTetromino(playerId);
    this.clearLines(playerId);
    this.spawnTetromino(playerId);
    this.onUpdate({
      players: this.players,
    });
  }

  getRandomShape() {
    const keys = Object.keys(SHAPES);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return randomKey;
  }

  getRandomTetromino() {
    const shapeKey = this.getRandomShape();
    const matrix = SHAPES[shapeKey].map((row) =>
      row.map((cell) => (cell ? shapeKey : 0))
    ); // Convert to binary matrix
    const position = {
      x: Math.floor(this.cols / 2) - Math.floor(matrix[0].length / 2),
      y: 0,
    };
    return {
      shapeKey,
      matrix,
      position,
    };
  }

  rotateShape(shape) {
    return shape[0].map((_, index) => shape.map((row) => row[index]).reverse());
  }

  isValidMove(board, tetromino) {
    const { matrix, position } = tetromino;
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (!matrix[row][col]) continue; // Skip empty cells in the tetromino matrix
        const boardRow = position.y + row;
        const boardCol = position.x + col;

        if (
          boardRow < 0 ||
          boardRow >= this.rows ||
          boardCol < 0 ||
          boardCol >= this.cols
        )
          return false; // Out of bounds check

        if (board[boardRow][boardCol] !== null) return false; // Cell is occupied by another tetromino
      }
    }
    return true;
  }

  creatEmptyBoard() {
    return Array.from({ length: this.rows }, () => Array(this.cols).fill(null));
  }

  isFull() {
    return Object.keys(this.players).length >= 2;
  }
  isEmpty() {
    return Object.keys(this.players).length === 0;
  }
}
