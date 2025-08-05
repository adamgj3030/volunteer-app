from app.imports import *
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
from app.models.events import Events
from app.models.userProfiles import UserProfiles
from app.models.volunteerHistory import VolunteerHistory
from sqlalchemy import and_
from app.utils.mailer import init_mail
from flask_jwt_extended import JWTManager
from flask_cors import CORS

migrate = Migrate()
socketio = SocketIO(cors_allowed_origins="*")  # No config yet
jwt = JWTManager()

def create_app(config_object="app.config.DevConfig"):
    app = Flask(__name__)
    app.config.from_object(config_object)
    
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "default-key")

    db.init_app(app)
    migrate.init_app(app, db)
    socketio.init_app(app, cors_allowed_origins="*")  # ✅ CORS properly applied here
    from app import sockets  # ✅ Import after socketio.init_app
    CORS(
      app,
      origins= app.config["FRONTEND_ORIGIN"],
      supports_credentials=True,
      methods=["GET","POST","OPTIONS","PUT","PATCH","DELETE"],
      allow_headers=["Content-Type","Authorization"]
    )
    
    init_mail(app)
    
    jwt.init_app(app)
    
    from app.models.userCredentials import UserCredentials, User_Roles  # local import to avoid circular

    @jwt.user_identity_loader
    def user_identity_lookup(user: "UserCredentials | int | str"):
        """
        Always return a *string* to satisfy PyJWT's requirement that `sub` be a string.
        We accept:
        - a UserCredentials instance
        - an int id
        - a string id
        """
        if isinstance(user, UserCredentials):
            return str(user.user_id)
        return str(user)   # covers int or str

    @jwt.additional_claims_loader
    def add_claims_to_access_token(identity: str):
        """
        identity arrives as the string we returned above.
        Cast to int for DB lookups.
        """
        try:
            uid = int(identity)
        except (TypeError, ValueError):
            return {}
        user = db.session.get(UserCredentials, uid)
        if not user:
            return {}
        return {
            "email": user.email,
            "role": user.role.value,
            "email_confirmed": user.is_email_confirmed,
        }
    for blueprint, prefix in blueprint_with_prefixes.items():
        app.register_blueprint(blueprint, url_prefix=prefix)

    from app import sockets  # ✅ Keep this AFTER socketio.init_app, let me know if you need to change this

    # Background task to check upcoming events and send reminders
    def check_upcoming_events():
        with app.app_context():
            now = datetime.utcnow()
            one_hour_later = now + timedelta(hours=1)
            upcoming_events = db.session.query(Events).filter(
                and_(Events.date >= now, Events.date <= one_hour_later)
            ).all()

            for event in upcoming_events:
                assignments = db.session.query(VolunteerHistory).filter_by(event_id=event.event_id, participation_status='ASSIGNED').all()
                for assignment in assignments:
                    socketio.emit(
                        "event_reminder",
                        {
                            "user_id": assignment.user_id,
                            "event_id": event.event_id,
                            "name": event.name,
                            "message": f"⏰ Reminder: Your event '{event.name}' starts in less than 1 hour!"
                        },
                        to=str(assignment.user_id)  # 🔥 Send only to the specific user room
                    )

    scheduler = BackgroundScheduler()
    scheduler.add_job(func=check_upcoming_events, trigger="interval", minutes=1)
    scheduler.start()

    return app

__all__ = ["create_app", "db"]