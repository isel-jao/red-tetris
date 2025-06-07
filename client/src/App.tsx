import { useCallback, useEffect } from "react";
import { Board } from "./component/board";
import { Button } from "./component/button";
import { useStore } from "./store";

export default function App() {
  const {
    gameState,
    moveTetromino,
    rotateTetromino,
    pauseGame,
    startGame,
    resumeGame,
    resetGame,
  } = useStore();

  function handleButtonClick() {
    if (gameState === "idle") {
      startGame();
    } else if (gameState === "playing") {
      pauseGame();
    } else if (gameState === "paused") {
      resumeGame();
    } else if (gameState === "gameOver") {
      resetGame();
    }
  }

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (gameState !== "playing") return;

      switch (event.key) {
        case "ArrowLeft":
          moveTetromino(-1, 0);
          break;
        case "ArrowRight":
          moveTetromino(1, 0);
          break;
        case "ArrowDown":
          moveTetromino(0, 1);
          break;
        case "ArrowUp":
          rotateTetromino();
          break;
        case "Escape":
          pauseGame();
          break;
        default:
          break;
      }
    },
    [gameState, moveTetromino, pauseGame, rotateTetromino]
  );

  useEffect(() => {
    if (gameState !== "playing") return;
    window.addEventListener("keydown", handleKeyDown);
    const intervale = setInterval(() => {
      console.log("Game Loop Tick");
      moveTetromino(0, 1);
    }, 1000); // Placeholder for game loop logic
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearInterval(intervale);
    };
  }, [gameState, handleKeyDown, moveTetromino]);
  return (
    <main className=" p-6 flex justify-center gap-6 ">
      <Instructions className=" w-[20rem]" />
      <div className="flex flex-col items-center gap-4   ">
        <div className="flex justify-center items-center gap-4">
          <h1 className="text-3xl font-bold">Tetris Game</h1>
          <span className="text-xl">by isel-jao</span>
        </div>
        <div className="flex justify-center  items-center  gap-4">
          <Button className="w-40" onClick={handleButtonClick}>
            {gameState === "idle" && "Start Game"}
            {gameState === "playing" && "Pause Game"}
            {gameState === "paused" && "Resume Game"}
            {gameState === "gameOver" && "Restart Game"}
          </Button>
        </div>
        <Board />
      </div>
      <div className="w-[20rem]"></div>
    </main>
  );
}

import React from "react";
import { twMerge } from "tailwind-merge";

interface InstructionsProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  ref?: React.RefObject<HTMLDivElement | null>;
}

export function Instructions({ className, ...props }: InstructionsProps) {
  return (
    <div className={twMerge("", className)} {...props}>
      <h2 className="text-2xl font-bold mb-4">Instructions</h2>
      <p className="mb-2">Use the arrow keys to control the tetromino:</p>
      <ul className="list-disc pl-5">
        <li>Left Arrow: Move left</li>
        <li>Right Arrow: Move right</li>
        <li>Down Arrow: Move down</li>
        <li>Up Arrow: Rotate</li>
        <li>Escape: Pause/Resume game</li>
      </ul>
      <p className="mt-4">Press "Start Game" to begin!</p>
      <p className="mt-2">Good luck!</p>
    </div>
  );
}
