import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  setConnectionState,
  setErrorMessage,
  setGameData,
  updateGame,
  setUserAndRoom,
  updateLeaderStatus,
} from "../../../store/slices/gameSlice";

export function useGameLogic(socket, isConnected, socketError, room, user) {
  const dispatch = useAppDispatch();
  const connectionState = useAppSelector((state) => state.game.connectionState);

  // Handle initial connection and room joining
  useEffect(() => {
    if (socketError) {
      dispatch(setConnectionState("error"));
      return;
    }
    if (!isConnected) return;
    if (!socket) {
      dispatch(setConnectionState("error"));
      return;
    }

    console.log("Joining game room:", room, "as user:", user);
    dispatch(setUserAndRoom({ room, user }));

    socket.emit("game:join", { roomId: room, userId: user }, (response) => {
      const { success, message, game } = response;
      if (!success) {
        dispatch(setErrorMessage(message || "Failed to join the room."));
        dispatch(setConnectionState("error"));
      } else {
        dispatch(setGameData(game));
        dispatch(setConnectionState("loaded"));
        dispatch(updateLeaderStatus());
      }
    });

    return () => {
      if (socket) {
        socket.emit("game:leave", { roomId: room, userId: user });
      }
    };
  }, [socket, isConnected, socketError, room, user, dispatch]);

  // Handle game updates
  useEffect(() => {
    if (connectionState !== "loaded" || !socket || !isConnected || socketError)
      return;

    socket.on("game:updated", (updated) => {
      dispatch(updateGame(updated));
      dispatch(updateLeaderStatus());
    });

    return () => {
      socket.off("game:updated");
    };
  }, [socketError, isConnected, socket, connectionState, dispatch]);

  return { connectionState };
}

export function useGameControls(socket, isConnected, game) {
  // Handle keyboard controls
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

  const startGame = () => {
    if (!socket || !isConnected) return;
    socket.emit("game:start");
  };

  const resetGame = () => {
    if (!socket || !isConnected) return;
    socket.emit("game:reset");
  };

  return { startGame, resetGame };
}
