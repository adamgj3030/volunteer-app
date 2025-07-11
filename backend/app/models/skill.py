from backend.app.imports import *

class SkillLevelEnum(enum.Enum):
    BEGINNER = 0
    INTERMEDIATE = 1
    EXPERT = 1

class Skill(db.Model):
    __tablename__ = "skills"
    skill_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    skill_name = db.Column(db.String(50), nullable=False)
    level = db.Column(db.Enum(SkillLevelEnum), nullable=False)

    def __repr__(self):
        return f"<Skill {self.skill_name} ({self.level.value})>"
