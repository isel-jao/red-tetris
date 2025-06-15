import { useEffect } from "react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { useSocket } from "../../components/socket-config";
import { cn } from "../../utils/functions";

// 😵💀☠️🪦⚰️

function createEmptyBoard(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(null));
}

const initialGame = {
  status: "waiting",
  players: [],
};

export default function GamePage() {
  const { room, user } = useParams();
  const [state, setState] = useState("loading");
  const { socket, isConnected, error: SocketError } = useSocket();
  const [errorMessage, setErrorMessage] = useState(null);
  const [game, setGame] = useState(initialGame);

  const isLeader = user === game.players[0]?.id;

  const boards =
    game.players?.map((p) => ({
      board: BoardWighTetrimino({
        board: p.board || createEmptyBoard(20, 10),
        tetrimino: p.currentTetromino,
      }),
      userId: p.id,
    })) || [];

  const updateGame = (updatedGame) => {
    setGame((prevGame) => ({
      ...prevGame,
      ...updatedGame,
    }));
  };

  useEffect(() => {
    if (SocketError) {
      setState("error");
      return;
    }
    if (!isConnected) return;
    if (!socket) {
      setState("error");
      return;
    }
    console.log("Joining game room:", room, "as user:", user);
    socket.emit("game:join", { roomId: room, userId: user }, (response) => {
      const { success, message, game } = response;
      if (!success) {
        setErrorMessage(message || "Failed to join the room.");
        setState("error");
      } else {
        updateGame(game);
        setState("loaded");
      }
    });
    return () => {
      if (socket) {
        socket.emit("game:leave", { roomId: room, userId: user });
      }
    };
  }, [socket, isConnected, SocketError, room, user]);

  useEffect(() => {
    if (state !== "loaded" || !socket || !isConnected || SocketError) return;

    socket.on("game:updated", (updated) => {
      updateGame(updated);
    });
    return () => {
      socket.off("game:updated");
    };
  }, [SocketError, isConnected, socket, state]);

  useEffect(() => {
    if (!socket || !isConnected || game.status !== "playing") return;

    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        socket.emit("move:left");
      } else if (event.key === "ArrowRight") {
        socket.emit("move:right");
      } else if (event.key === "ArrowDown") {
        socket.emit("move:down");
      } else if (event.key === "ArrowUp") {
        socket.emit("rotate");
      } else if (event.key === " ") {
        event.preventDefault(); // Prevent default spacebar behavior
        socket.emit("drop");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [game, isConnected, socket]);

  function startGame() {
    if (!isLeader || game.status !== "waiting" || !socket || !isConnected)
      return;
    socket.emit("game:start");
  }
  function resetGame() {
    if (!isLeader || game.status !== "finished" || !socket || !isConnected)
      return;
    socket.emit("game:restart");
  }

  if (state === "error") {
    return (
      <main className=" p-6 grid place-content-center">
        <h1 className="text-3xl text-foreground/75 ">
          Error: {errorMessage || "An unexpected error occurred."}
        </h1>
        <Link to="/">
          <button className="link">Return to lobby</button>
        </Link>
      </main>
    );
  }
  if (state === "loading") {
    return (
      <main className=" p-6 grid place-content-center">
        <h1 className="text-6xl animate-pulse">Loading...</h1>
      </main>
    );
  }

  return (
    <main className="backdrop-blur-lg p-6 flex flex-col overflow-auto">
      {game.status === "finished" && (
        <main className="absolute z-10 inset-0 bg-background/50  p-6 grid place-content-center">
          <h1 className="text-3xl text-foreground/75">
            Game Over! Winner:{" "}
            {!game.winner
              ? "No winner"
              : game.winner === user
              ? "You"
              : game.winner}
          </h1>
          <div className="flex gap-4 mt-4">
            <Link to="/">
              <button className="link">Return to lobby</button>
            </Link>
            <button onClick={resetGame} className="filled">
              Reset game
            </button>
          </div>
        </main>
      )}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl">Game game: {room}</h1>
        {isLeader && game.status === "waiting" && (
          <button onClick={startGame} className="filled  mt-4 mx-auto">
            Start Game
          </button>
        )}
        {!isLeader && game.status === "waiting" && (
          <span className="px-4 py-2 mx-auto">
            Waiting for leader to start the game...
          </span>
        )}
      </div>
      <div className="flex justify-center mt-4   relative">
        <div className="flex flex-wrap gap-4 justify-center">
          {boards.map(({ board, userId }) => (
            <div key={userId} className="flex flex-col gap-2 items-center">
              <h2 className="text-lg">
                {userId === user ? "Your Board" : userId}
              </h2>
              <div className="flex flex-col w-[20rem] h-fit bg-card/75 rounded p-4">
                {board?.map((row, i) => (
                  <div className="grid grid-cols-10 " key={i}>
                    {row.map((cell, j) => (
                      <div
                        className={cn("cell", {
                          empty: cell === null,
                          filled: cell !== null && cell !== "X",
                          "text-emerald-500": cell === "I",
                          "text-cyan-500": cell === "J",
                          "text-fuchsia-500": cell === "L",
                          "text-orange-500": cell === "O",
                          "text-indigo-500": cell === "S",
                          "text-sky-500": cell === "T",
                          "text-rose-500": cell === "Z",
                          "text-gray-600": cell === "X",
                        })}
                        key={j}
                      >
                        <span className="grayscale-100 opacity-50">
                          {cell === "X" ? "☠️" : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function BoardWighTetrimino({ board, tetrimino }) {
  const newBoard = board.map((row) => [...row]);
  if (!tetrimino) return newBoard;

  const { matrix, position } = tetrimino;
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j]) {
        const row = position.y + i;
        const col = position.x + j;
        if (
          row >= 0 &&
          row < newBoard.length &&
          col >= 0 &&
          col < newBoard[row].length
        ) {
          newBoard[row][col] = matrix[i][j]; // Assuming tetrimino has a color property
        }
      }
    }
  }
  return newBoard;
}
