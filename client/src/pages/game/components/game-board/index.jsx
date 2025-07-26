import { cn } from "../../../../utils/functions";
import { useAppSelector } from "../../../../store/hooks";
import { selectCurrentUser } from "../../../../store/slices/gameSlice";

export function GameBoard({ board, userId }) {
  const currentUser = useAppSelector(selectCurrentUser);

  return (
    <div className="flex flex-col gap-2 items-center">
      <h2 className="text-lg">
        {userId === currentUser ? "Your Board" : userId}
      </h2>
      <div className="flex flex-col w-[20rem] h-fit bg-card/75 rounded p-4">
        {board?.map((row, i) => (
          <div className="grid grid-cols-10" key={i}>
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
  );
}
