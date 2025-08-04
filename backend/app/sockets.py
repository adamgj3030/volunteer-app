from app.imports import *
from app import socketio

@socketio.on("register_user")
def handle_register_user(data):
    token = data.get("token")
    if not token:
        print("❌ No token provided for socket registration.")
        return

    try:
        decoded = decode_token(token)
        user_id = str(decoded["sub"])
        join_room(user_id)
        print(f"✅ Socket joined room for user {user_id}")
    except Exception as e:
        print("❌ Failed to decode token for register_user:", str(e))

@socketio.on("connect")
def handle_connect():
    print("🟢 Client connected")

@socketio.on("disconnect")
def handle_disconnect():
    print("🔴 Client disconnected")

@socketio.on("event_assigned")
def handle_event_assigned(data):
    print("📬 Received 'event_assigned':", data)
    socketio.emit("event_assigned", data)  # or emit to specific room if needed

@socketio.on("event_update")
def handle_event_update(data):
    print("🔄 Received 'event_update':", data)
    socketio.emit("event_update", data)

@socketio.on("event_reminder")
def handle_event_reminder(data):
    print("⏰ Received 'event_reminder':", data)
    socketio.emit("event_reminder", data)

@socketio.on("event_assigned")
def handle_event_assigned(data):
    print("📬 Received 'event_assigned':", data)
    user_id = data.get("user_id")
    if user_id:
        socketio.emit("event_assigned", data, to=str(user_id))  # 🔒 private emit
    else:
        socketio.emit("event_assigned", data)  # fallback
