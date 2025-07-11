from backend.app.imports import *

class EventToSkill(db.Model):
    __tablename__ = "event_to_skill"
    
    event_id = db.Column(db.Integer, db.ForeignKey("events.event_id"), primary_key=True)
    skill_code = db.Column(db.Integer, db.ForeignKey("skills.skill_id"), primary_key=True)

    def __repr__(self):
        return f"<EventToSkill event={self.event_id}, skill={self.skill_code}>"