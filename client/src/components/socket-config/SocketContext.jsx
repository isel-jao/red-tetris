import { createContext, useContext } from 'react';

// Create a context for the socket connection
export const SocketContext = createContext(null);

// Custom hook to access the socket context
export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
