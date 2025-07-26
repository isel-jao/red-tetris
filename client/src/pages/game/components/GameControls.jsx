import { Link } from "react-router";

export default function GameControls({ 
  game, 
  isLeader, 
  currentRoom, 
  onStartGame, 
  onResetGame 
}) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl">Game game: {currentRoom}</h1>
      {isLeader && game.status === "waiting" && (
        <button onClick={onStartGame} className="filled mt-4 mx-auto">
          Start Game
        </button>
      )}
      {!isLeader && game.status === "waiting" && (
        <span className="px-4 py-2 mx-auto">
          Waiting for leader to start the game...
        </span>
      )}
    </div>
  );
}

export function GameOverModal({ game, currentUser, isLeader, onResetGame }) {
  if (game.status !== "finished") return null;

  return (
    <main className="absolute z-10 inset-0 bg-background/50 p-6 grid place-content-center">
      <h1 className="text-3xl text-foreground/75">
        Game Over! Winner:{" "}
        {!game.winner
          ? "No winner"
          : game.winner === currentUser
          ? "You"
          : game.winner}
      </h1>
      <div className="flex gap-4 mt-4">
        <Link to="/">
          <button className="link">Return to lobby</button>
        </Link>
        {isLeader ? (
          <button onClick={onResetGame} className="filled">
            Reset game
          </button>
        ) : (
          <span className="px-4 py-2">Waiting for leader to reset...</span>
        )}
      </div>
    </main>
  );
}
