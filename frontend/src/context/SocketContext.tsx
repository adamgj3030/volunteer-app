import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const db_url = import.meta.env.VITE_DEVELOPMENT_DB_URL;

  // First: create and connect the socket
  useEffect(() => {
    const socketInstance = io(db_url, {
      withCredentials: true,
    });

    setSocket(socketInstance);
    (window as any).socket = socketInstance;

    return () => {
      socketInstance.disconnect();
      (window as any).socket = null;
    };
  }, [db_url]);

  // Second: register user with token once socket is connected
  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        socket.emit("register_user", { token });
        console.log("🔐 Registered socket with user token");
      }
    });

    return () => {
      socket.off("connect");
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
