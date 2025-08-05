// SocketContext.tsx
import React, { createContext, useContext, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const db_url = import.meta.env.VITE_DEVELOPMENT_DB_URL;

  if (!socketRef.current) {
    socketRef.current = io(db_url);
    (window as any).socket = socketRef.current; // ✅ Dev testing
  }

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      (window as any).socket = null;
    };
  }, []);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
