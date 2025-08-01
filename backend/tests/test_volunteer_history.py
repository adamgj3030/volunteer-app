from datetime import datetime, timedelta

from app.imports import db
from app.models.events import Events, UrgencyEnum
from app.models.userCredentials import UserCredentials 
from app.models.eventToSkill import EventToSkill
from app.models.volunteerHistory import VolunteerHistory, ParticipationStatusEnum
from app.models.userProfiles import UserProfiles

from tests.utils import (
    seed_states,
    seed_skills,
    create_confirmed_user_and_token,
    auth_header,
    find_rule,
)


# -------------------------------------------------------- helpers
def _create_event(app, state_code: str, skill_ids: list[int]) -> int:
    with app.app_context():
        ev = Events(
            name="Park Cleanup",
            description="Trash pick-up along trails",
            address="200 Greenway",
            city="Austin",
            state_id=state_code,
            zipcode="78701",
            urgency=UrgencyEnum.medium,
            date=datetime.utcnow() + timedelta(days=14),
        )
        db.session.add(ev)
        db.session.flush()
        for sid in skill_ids:
            db.session.add(EventToSkill(event_id=ev.event_id, skill_code=sid))
        db.session.commit()
        return ev.event_id


def _create_profile(app, user_id: int, state_code: str = "TX"):
    with app.app_context():
        prof = UserProfiles(
            user_id=user_id,
            full_name="Alice Smith",
            address1="1 Main",
            city="Houston",
            state_id=state_code,
            zipcode="77002",
        )
        db.session.add(prof)
        db.session.commit()


# -------------------------------------------------------- tests
def test_volunteer_history_empty_returns_empty_list(client, app):
    seed_states(app)
    path = find_rule(app, "volunteer_history.get_volunteer_history")
    assert client.get(path).get_json() == []


def test_volunteer_history_returns_expected_structure(client, app):
    seed_states(app, [("TX", "Texas")])
    skills = seed_skills(app, ["Leadership", "Technical"])
    token = create_confirmed_user_and_token(client, app)  # creates user_id 1

    uid = 1
    _create_profile(app, uid)

    ev_id = _create_event(app, "TX", [skills["Leadership"], skills["Technical"]])

    with app.app_context():
        db.session.add(
            VolunteerHistory(
                user_id=uid,
                event_id=ev_id,
                participation_status=ParticipationStatusEnum.ASSIGNED,
            )
        )
        db.session.commit()

    path = find_rule(app, "volunteer_history.get_volunteer_history")
    r = client.get(path)
    assert r.status_code == 200
    payload = r.get_json()

    assert len(payload) == 1
    u = payload[0]
    assert u["email"] == "alice@example.org"
    assert u["name"] == "Alice Smith"
    assert len(u["events"]) == 1
    evt = u["events"][0]
    assert evt["eventName"] == "Park Cleanup"
    assert set(evt["requiredSkills"]) == {"Leadership", "Technical"}
    assert evt["status"] == "Assigned"
