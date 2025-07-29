import { useRef, useState } from "react";
import { io } from "socket.io-client";
import { useOnMount } from "../../hooks/use-on-mount";
import { SocketContext, useSocket } from "./SocketContext";

// Re-export the context and hook for convenience
export { SocketContext, useSocket };


export function SocketConfig({
  children,
  url,
  options,

  onConnect = () => console.log("✅ Connected to the server"),
  onConnectError = (error) => console.error("❌ Connection error:", error),
  onDisconnect = (reason) => console.log("⚠️ Disconnected:", reason),
  onError = (error) => console.error("Socket error:", error),
  onReconnect = (attempt) =>
    console.log("🔁 Reconnected after attempt:", attempt),
  onReconnectAttempt = (attempt) =>
    console.log("Attempting to reconnect (#" + attempt + ")"),
  onReconnectError = (error) => console.error("Reconnection error:", error),
  onReconnectFailed = () => console.error("Reconnection failed"),
  onPing = () => console.debug("Ping sent"),
  onPong = (latency) =>
    console.debug("Pong received (latency: " + latency + "ms)"),
}) {
  const socketRef = useRef(
    io(url, {
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 3,
      ...options,
    })
  );

  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useOnMount(() => {
    const socket = socketRef.current;

    try {
      socket.connect();

      socket.on("connect", () => {
        setIsConnected(true);
        setError(null);
        onConnect();
      });

      socket.on("connect_error", (err) => {
        setError(err);
        onConnectError(err);
      });

      socket.on("disconnect", (reason) => {
        setIsConnected(false);
        onDisconnect(reason);
      });

      socket.on("error", (err) => {
        setError(err);
        onError(err);
      });

      socket.on("reconnect", onReconnect);
      socket.on("reconnect_attempt", onReconnectAttempt);
      socket.on("reconnect_error", onReconnectError);
      socket.on("reconnect_failed", onReconnectFailed);
      socket.on("ping", onPing);
      socket.on("pong", onPong);

      return () => {
        socket.off("connect");
        socket.off("connect_error");
        socket.off("disconnect");
        socket.off("error");
        socket.off("reconnect");
        socket.off("reconnect_attempt");
        socket.off("reconnect_error");
        socket.off("reconnect_failed");
        socket.off("ping");
        socket.off("pong");

        if (socket.connected) {
          socket.disconnect();
        }
        socket.close();
      };
    } catch (err) {
      setError(err);
      onError(err);
    }
  });

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        error,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
