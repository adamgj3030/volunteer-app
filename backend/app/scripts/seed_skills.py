from app import create_app, db
from app.models.skill import Skill, SkillLevelEnum

SEED = [
    ("Leadership", SkillLevelEnum.BEGINNER),
    ("Communication", SkillLevelEnum.BEGINNER),
    ("Organization", SkillLevelEnum.BEGINNER),
    ("Technical", SkillLevelEnum.BEGINNER),
    ("Fundraising", SkillLevelEnum.BEGINNER),
    ("Design", SkillLevelEnum.BEGINNER),
]

app = create_app()
with app.app_context():
    for name, lvl in SEED:
        exists = db.session.query(Skill).filter_by(skill_name=name).first()
        if not exists:
            db.session.add(Skill(skill_name=name, level=lvl))
    db.session.commit()
    print("Seeded skills.")