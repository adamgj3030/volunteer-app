from app import socketio

@socketio.on('connect')
def handle_connect():
    print("🟢 Client connected via socket!")

@socketio.on("event_assigned")
def handle_event_assigned(data):
    print("📦 Received event_assigned:", data)
    socketio.emit("event_assigned", {
        "name": data.get("name", "Unnamed Event")
    })

@socketio.on("frontend_test")
def handle_frontend_test():
    print("🚀 Frontend test received!")
    socketio.emit("event_assigned", {
        "name": "Triggered from frontend test"
    })

@socketio.on("ping_test")
def handle_ping_test(data):
    print("📡 Received ping from frontend:", data)
    socketio.emit("pong_test", {
        "msg": "✅ Pong from backend!"
    })

@socketio.on("event_update")
def handle_event_update(data):
    print("🔄 Received event_update:", data)
    socketio.emit("event_update", {
        "name": data.get("name", "Unnamed Event Update")
    })

@socketio.on("event_reminder")
def handle_event_reminder(data):
    print("⏰ Received event_reminder:", data)
    socketio.emit("event_reminder", {
        "message": data.get("message", "Reminder: Your event is starting soon!")
    })