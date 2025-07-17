from app import create_app, db
from app.models.state import States, us_states

app = create_app()
with app.app_context():
    for code, name in us_states:
        if not db.session.get(States, code):
            db.session.add(States(state_id=code, name=name))
    db.session.commit()
    print("Seeded states.")