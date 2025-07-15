import { useEffect } from "react";
import { Notify } from "@/components/Notifications";
import { useSocket } from "@/context/SocketContext";

export default function NotificationsTesting() {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Emit test ping to backend
    socket.emit("ping_test", { msg: "Ping from frontend 🚀" });

    // Listen for pong response from backend
    socket.on("pong_test", (data) => {
      console.log("Received from server:", data);
      Notify({
        title: "Socket Test",
        description: data.msg,
        variant: "success",
      });
    });

    return () => {
      socket.off("pong_test");
    };
  }, [socket]);

  return (
    <div className="p-4 space-y-2">
<button
  onClick={() => {
    console.log("Clicked: Sending 'event_assigned'");
    socket?.emit("event_assigned", { name: "Test Volunteer Event" });
  }}
>
  Trigger Assignment
</button>

<button
  onClick={() => {
    console.log("Clicked: Sending 'frontend_test'");
    socket?.emit("frontend_test", {});
  }}
>
  Frontend Assignment
</button>
</div>
  );
}