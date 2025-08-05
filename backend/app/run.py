from app import create_app, socketio
# import app.sockets

app = create_app()

if __name__ == "__main__":
    socketio.run(app, debug=True, allow_unsafe_werkzeug=True)
