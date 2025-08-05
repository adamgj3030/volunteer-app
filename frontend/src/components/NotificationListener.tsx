import { useEffect } from "react";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";
import { Notify } from "@/components/Notifications";

const NotificationListener = () => {
  const socket = useSocket();
  const { user } = useAuth();

  // if (!socket) return null;

  useEffect(() => {
    if (!socket) return;

    // Debug: Log all socket events
    socket.onAny((event, ...args) => {
      console.log("📨 Socket event received:", event, args);
    });

    // Join personal room after connect or reconnect
    const joinRoom = () => {
      if (user?.id) {
        socket.emit("join", user.id);
        console.log(`📡 (Re)joined room for user ID ${user.id}`);
      }
    };

    socket.on("connect", joinRoom);

    // Initial join
    joinRoom();

    // Notification: Event Created
    const onEventCreated = (data: any) => {
      Notify({
        title: "New Event",
        description: data.message || `🆕 New event posted: ${data.name || "Unnamed"}`,
        variant: "info",
      });
    };

    // Notification: Event Reminder
    const onEventReminder = (data: any) => {
      Notify({
        title: "Event Reminder",
        description: data.message || "Reminder: Your event is starting soon!",
        variant: "default",
      });
    };

    // Notification: Event Update
    const onEventUpdate = (data: any) => {
      Notify({
        title: "Event Updated",
        description: `📅 Event “${data.name?.trim() || "Unnamed"}” has been updated.`,
        variant: "warning",
      });
    };

    // Notification: Event Assignment
    const onEventAssigned = (data: any) => {
      Notify({
        title: "Event Assignment",
        description: `🎉 You’ve been assigned to “${data.name?.trim() || "an event"}”!`,
        variant: "success",
      });
    };

    socket.on("event_created", onEventCreated);
    socket.on("event_reminder", onEventReminder);
    socket.on("event_update", onEventUpdate);
    socket.on("event_assigned", onEventAssigned);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("event_created", onEventCreated);
      socket.off("event_reminder", onEventReminder);
      socket.off("event_update", onEventUpdate);
      socket.off("event_assigned", onEventAssigned);
      socket.offAny(); // clean up debugger
    };
  }, [socket, user?.id]);

  return null;
};

export default NotificationListener;
