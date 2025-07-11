from backend.app.imports import *

class UrgencyEnum(enum.IntEnum):
    low = 0
    medium = 1
    high = 2

class Events(db.Model):
    __tablename__ = "events"

    event_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(512), nullable=False)
    address = db.Column(db.String(100))
    city = db.Column(db.String(100))
    state_id = db.Column(db.String(2), db.ForeignKey('states.state_id'), nullable=False)
    zipcode = db.Column(db.String(9))
    urgency = db.Column(db.Enum(UrgencyEnum), nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    
    def __repr__(self):
        return f"<Event {self.event_id}>"