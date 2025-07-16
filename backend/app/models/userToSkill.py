from app.imports import *

class UserToSkill(db.Model):
    __tablename__ = "user_to_skill"
    
    user_id = db.Column(db.Integer, db.ForeignKey("user_credentials.user_id"), primary_key=True)
    skill_id = db.Column(db.Integer, db.ForeignKey("skills.skill_id"), primary_key=True)

    def __repr__(self):
        return f"<UserToSkill user={self.user_id}, skill={self.skill_code}>"
