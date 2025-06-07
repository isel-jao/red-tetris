import { twMerge } from "tailwind-merge";
import { useStore } from "../store";
import { cn, getDisplayBoard } from "../utils";
import { TETROMINOES } from "../constants";

interface BoardProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  ref?: React.RefObject<HTMLDivElement | null>;
}

export function Board({ className, ...props }: BoardProps) {
  const { board, currentTetromino } = useStore();
  const displayBoard = getDisplayBoard(board, currentTetromino);

  // Render the board with the current tetromino
  return (
    <div
      className={twMerge(
        "bg-card w-[20rem] flex flex-col gap-0.5 min-h-[16rem] p-4 rounded-lg",
        className
      )}
      {...props}
    >
      {displayBoard.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-0.5"
          style={{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }}
        >
          {row.map((cell, colIndex) => {
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={cn("cell", TETROMINOES[cell!]?.color, {
                  empty: !cell,
                  filled: cell,
                })}
              ></div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
