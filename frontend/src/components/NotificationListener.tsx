import { useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { toast } from "sonner";

const NotificationListener = () => {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) {
      console.log("⚠️ Socket not initialized.");
      return;
    }

    window.socket = socket;

    console.log("✅ Socket connected:", socket);

    socket.on("event_reminder", (data) => {
      console.log("🔔 Received 'event_reminder':", data);
      toast(data.message || "Reminder: Your event is starting soon!");
    });

    socket.on("event_update", (data) => {
      console.log("🔄 Received 'event_update':", data);
      toast(`📅 Event “${data.name?.trim() || "Unnamed"}” has been updated.`);
    });

    socket.on("event_assigned", (data) => {
      console.log("🎉 Received 'event_assigned':", data);
      toast(`🎉 You’ve been assigned to “${data.name?.trim() || "an event"}”!`);
    });

    socket.onAny((event, ...args) => {
      console.log(`🪝 Caught event: ${event}`, args);
    });

    return () => {
      socket.off("event_reminder");
      socket.off("event_update");
      socket.off("event_assigned");
    };
  }, [socket]); // <--- Runs when socket is no longer null

  return null;
};

export default NotificationListener;