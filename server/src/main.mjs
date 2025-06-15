import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { join } from "node:path";
import { Game } from "./game.mjs";

const port = process.env.PORT || 3000;

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(join(process.cwd(), "dist")));

// API routes (if you have any)
app.get("/", (req, res) => {
  res.text("Welcome to the Tetris Game Server!");
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    // methods: ["GET", "POST"],
  },
  allowUpgrades: true,
});

const games = {};

const socketToGame = {};

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("game:join", ({ roomId, userId }, callback) => {
    const game =
      games[roomId] ||
      new Game((updatedGame) => {
        io.to(roomId).emit("game:updated", updatedGame);
      });

    const result = game.addPlayer(userId);
    if (result.success) {
      socket.join(roomId);
      console.info(`User ${userId} joined room ${roomId}`);
      if (!games[roomId]) {
        games[roomId] = game;
      }
      socketToGame[socket.id] = {
        game,
        userId,
      };
    }

    callback(result);
  });

  socket.on("move:right", () => {
    const { game, userId } = socketToGame[socket.id] || {};
    if (!game || game.status !== "playing") {
      console.warn("Game not found or not in playing state for user:", userId);
      return;
    }
    game.moveTetromino(userId, "right");
  });
  socket.on("move:left", () => {
    const { game, userId } = socketToGame[socket.id] || {};
    if (!game || game.status !== "playing") {
      console.warn("Game not found or not in playing state for user:", userId);
      return;
    }
    game.moveTetromino(userId, "left");
  });
  socket.on("move:down", () => {
    const { game, userId } = socketToGame[socket.id] || {};
    if (!game || game.status !== "playing") {
      console.warn("Game not found or not in playing state for user:", userId);
      return;
    }
    game.moveTetromino(userId, "down");
  });
  socket.on("drop", () => {
    const { game, userId } = socketToGame[socket.id] || {};
    if (!game || game.status !== "playing") {
      console.warn("Game not found or not in playing state for user:", userId);
      return;
    }
    game.dropTetromino(userId);
  });

  socket.on("rotate", () => {
    const { game, userId } = socketToGame[socket.id] || {};
    if (!game || game.status !== "playing") {
      console.warn("Game not found or not in playing state for user:", userId);
      return;
    }
    game.rotateTetromino(userId);
  });

  socket.on("game:leave", () => {
    const { game, userId } = socketToGame[socket.id] || {};
    if (game) {
      game.removePlayer(userId);
      delete socketToGame[socket.id];
      console.info(`User ${socket.id} left room ${game.roomId}`);
      if (game.isEmpty()) {
        delete games[game.roomId];
      }
    }
  });

  socket.on("game:start", () => {
    const { game } = socketToGame[socket.id] || {};
    if (game && game.status === "waiting") {
      game.start();
    }
  });
  socket.on("game:restart", () => {
    const { game } = socketToGame[socket.id] || {};
    if (game && game.status === "finished") {
      game.restart();
    }
  });

  socket.on("disconnect", () => {
    const { game, userId } = socketToGame[socket.id] || {};
    if (game) {
      game.removePlayer(userId);
      delete socketToGame[socket.id];
      console.info(`User ${socket.id} left room ${game.roomId}`);
      if (game.isEmpty()) {
        delete games[game.roomId];
      }
    }
    console.info("user disconnected");
  });
});

server.listen(port, () => {
  console.info(`Server is running on http://localhost:${port}`);
});
