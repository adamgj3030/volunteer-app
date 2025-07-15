from app.imports import *
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
from app.models.events import Events
from app.models.userProfiles import UserProfiles
from app.models.volunteerHistory import VolunteerHistory
from sqlalchemy import and_

migrate = Migrate()
socketio = SocketIO()  # No config yet

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST', 'localhost')}:{os.getenv('DB_PORT', '5432')}/{os.getenv('DB_NAME')}"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "default-key")

    db.init_app(app)
    migrate.init_app(app, db)
    socketio.init_app(app, cors_allowed_origins="*")  # ✅ CORS properly applied here

    for blueprint, prefix in blueprint_with_prefixes.items():
        app.register_blueprint(blueprint, url_prefix=prefix)

    from app import sockets  # ✅ Keep this AFTER socketio.init_app

    # Background task to check upcoming events and send reminders
    def check_upcoming_events():
        with app.app_context():
            now = datetime.utcnow()
            one_hour_later = now + timedelta(hours=1)
            upcoming_events = db.session.query(Events).filter(
                and_(Events.date >= now, Events.date <= one_hour_later)
            ).all()

            for event in upcoming_events:
                assignments = db.session.query(VolunteerHistory).filter_by(event_id=event.event_id).all()
                for assignment in assignments:
                    socketio.emit(
                        "event_reminder",
                        {
                            "user_id": assignment.user_id,
                            "event_id": event.event_id,
                            "name": event.name,
                            "message": f"⏰ Reminder: Your event '{event.name}' starts in less than 1 hour!"
                        }
                    )

    scheduler = BackgroundScheduler()
    scheduler.add_job(func=check_upcoming_events, trigger="interval", minutes=1)
    scheduler.start()

    return app