import { Link, useParams } from "react-router";
import { useSocket } from "../../components/socket-config";
import { useAppSelector } from "../../store/hooks";
import {
  selectConnectionState,
  selectErrorMessage,
  selectGame,
  selectIsLeader,
  selectCurrentUser,
  selectBoards,
} from "../../store/slices/gameSlice";
import { useGameLogic, useGameControls } from "./hooks/use-game-logic.index";
import { GameBoard } from "./components/game-board";
import { GameControls } from "./components/game-controls";
import { GameOverModal } from "./components/game-controls";

export default function GamePage() {
  const { room, user } = useParams();
  const { socket, isConnected, error: socketError } = useSocket();

  // Redux selectors
  const connectionState = useAppSelector(selectConnectionState);
  const errorMessage = useAppSelector(selectErrorMessage);
  const game = useAppSelector(selectGame);
  const isLeader = useAppSelector(selectIsLeader);
  const currentUser = useAppSelector(selectCurrentUser);
  const boards = useAppSelector(selectBoards);

  // Custom hooks for game logic
  useGameLogic(socket, isConnected, socketError, room, user);
  const { startGame, resetGame } = useGameControls(socket, isConnected, game);

  // Handle different connection states
  if (connectionState === "error") {
    return (
      <main className="p-6 grid place-content-center">
        <h1 className="text-3xl text-foreground/75">
          Error: {errorMessage || "An unexpected error occurred."}
        </h1>
        <Link to="/">
          <button className="link">Return to lobby</button>
        </Link>
      </main>
    );
  }

  if (connectionState === "loading") {
    return (
      <main className="p-6 grid place-content-center">
        <h1 className="text-6xl animate-pulse">Loading...</h1>
      </main>
    );
  }

  const handleStartGame = () => {
    if (!isLeader || game.status !== "waiting") return;
    startGame();
  };

  const handleResetGame = () => {
    if (!isLeader || game.status !== "finished") return;
    resetGame();
  };

  return (
    <main className="backdrop-blur-lg p-6 flex flex-col overflow-auto">
      <GameOverModal
        onResetGame={handleResetGame}
      />

      <GameControls
        onStartGame={handleStartGame}
      />

      <div className="flex justify-center mt-4 relative">
        <div className="flex flex-wrap gap-4 justify-center">
          {boards.map(({ board, userId }) => (
            <GameBoard
              key={userId}
              board={board}
              userId={userId}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
