from app.imports import *
from app import socketio

@socketio.on("connect")
def handle_connect():
    print("Client connected")

@socketio.on("disconnect")
def handle_disconnect():
    print("Client disconnected")

@socketio.on("event_assigned")
def handle_event_assigned(data):
    print("🔔 Backend received event_assigned:", data)
    socketio.emit("event_assigned", data, broadcast=True)

@socketio.on("event_update")
def handle_event_update(data):
    print("🔄 Backend received event_update:", data)
    socketio.emit("event_update", data, broadcast=True)

@socketio.on("event_reminder")
def handle_event_reminder(data):
    print("⏰ Backend received event_reminder:", data)
    socketio.emit("event_reminder", data, broadcast=True)