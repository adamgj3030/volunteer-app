from backend.app.imports import *

class UrgencyEnum(enum.IntEnum):
    LOW = 0
    MEDIUM = 1
    HIGH = 2

class ParticipationStatusEnum(enum.IntEnum):
    ASSIGNED = 0
    REGISTERED = 1
    ATTENDED = 2
    CANCELLED = 3
    NO_SHOW = 4

class VolunteerHistory(db.Model):
    __tablename__ = "volunteer_history"

    vol_history_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user_credentials.user_id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('events.event_id'), nullable=False)
    participation_status = db.Column(db.Enum(ParticipationStatusEnum), nullable=False)
    hours_volunteered = db.Column(db.Numeric(4,2), nullable=True)

    
def __repr__(self):
    return f"<VolunteerHistory user={self.user_id}, event={self.event_id}, status={self.participation_status.name}>"