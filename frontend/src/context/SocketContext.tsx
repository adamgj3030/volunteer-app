import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const db_url = import.meta.env.VITE_DEVELOPMENT_DB_URL;

useEffect(() => {
  const socketInstance = io(db_url);
  setSocket(socketInstance);

  // 🔧 Expose to window for dev testing
  (window as any).socket = socketInstance;

  return () => {
    socketInstance.disconnect();
    (window as any).socket = null;
  };
}, [db_url]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);