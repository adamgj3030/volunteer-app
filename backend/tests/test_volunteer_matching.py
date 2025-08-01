from datetime import datetime, timedelta

import pytest

from app.imports import db
from app.routes import volunteer_matching as vm
from app.models.events import Events, UrgencyEnum
from app.models.eventToSkill import EventToSkill
from app.models.userCredentials import UserCredentials
from app.models.userProfiles import UserProfiles
from app.models.userToSkill import UserToSkill
from app.models.userAvailability import UserAvailability
from app.models.volunteerHistory import VolunteerHistory, ParticipationStatusEnum
from tests.utils import (
    seed_states,
    seed_skills,
    create_confirmed_user_and_token,
    find_rule,
)


# ----------------------------------------------------------------- helpers
def _create_event(app, state_code: str, date, skill_ids) -> int:
    with app.app_context():
        ev = Events(
            name="Food Bank Sort",
            description="Box sorting",
            address="300 Depot",
            city="Dallas",
            state_id=state_code,
            zipcode="75201",
            urgency=UrgencyEnum.high,
            date=date,
        )
        db.session.add(ev)
        db.session.flush()
        for sid in skill_ids:
            db.session.add(EventToSkill(event_id=ev.event_id, skill_code=sid))
        db.session.commit()
        return ev.event_id


def _create_volunteer(client, app, email: str, full_name: str,
                      skills: list[int], avail_dates: list[str]) -> int:
    token = create_confirmed_user_and_token(client, app, email=email, skip_login=True)
    with app.app_context():
        uid = db.session.query(UserCredentials).filter_by(email=email).one().user_id
        db.session.add(
            UserProfiles(
                user_id=uid,
                full_name=full_name,
                address1="10 Any",
                city="Austin",
                state_id="TX",
                zipcode="77002",
            )
        )
        for sid in skills:
            db.session.add(UserToSkill(user_id=uid, skill_id=sid))
        for ds in avail_dates:
            db.session.add(UserAvailability(user_id=uid, available_date=ds))
        db.session.commit()
        return uid


def _clear_globals():
    """Ensure global lists are clean between tests."""
    vm._LEGACY_EVENTS.clear()
    vm._SAVED_MATCHES.clear()


# ----------------------------------------------------------------- tests
def test_list_matching_events_returns_event_with_skills(client, app):
    _clear_globals()
    seed_states(app, [("TX", "Texas")])
    skills = seed_skills(app, ["Leadership", "Technical"])

    event_date = datetime.utcnow() + timedelta(days=3)
    _create_event(app, "TX", event_date, [skills["Leadership"]])

    path = find_rule(app, "volunteer_matching.list_matching_events")
    r = client.get(path)
    evts = r.get_json()

    # First element could be legacy (empty list) – find our numeric id entry
    ev = next(e for e in evts if isinstance(e["id"], int))
    assert ev["name"] == "Food Bank Sort"
    assert ev["requiredSkills"] == ["Leadership"]
    assert ev["urgency"] == "High"


def test_get_volunteer_matches_sorted_by_availability_and_skills(client, app):
    _clear_globals()
    seed_states(app, [("TX", "Texas")])
    skills = seed_skills(app, ["Leadership", "Technical"])

    event_date = datetime.utcnow() + timedelta(days=5)
    ev_id = _create_event(app, "TX", event_date, [skills["Leadership"], skills["Technical"]])
    iso_date = event_date.date().isoformat()

    # v1: both skills + availability  → best
    _create_volunteer(client, app, "v1@example.org", "V One",
                      [skills["Leadership"], skills["Technical"]],
                      [iso_date])

    # v2: skills but NOT available   → worst
    _create_volunteer(client, app, "v2@example.org", "V Two",
                      [skills["Leadership"], skills["Technical"]],
                      [])

    # v3: available but no skills    → middle
    _create_volunteer(client, app, "v3@example.org", "V Three",
                      [],
                      [iso_date])

    path = find_rule(app, "volunteer_matching.get_volunteer_matches")
    r = client.get(path, query_string={"eventId": ev_id})
    assert r.status_code == 200
    matches = r.get_json()
    emails = [m["id"] if isinstance(m["id"], str) else None for m in matches]  # ids absent; order matters
    names = [m["fullName"] for m in matches]

    assert names[0] == "V One"      # best match
    assert names[1] == "V Three"    # availability trumps skills
    assert names[2] == "V Two"      # neither availability nor better skills


def test_save_match_persists_and_saved_endpoint_returns_names(client, app):
    _clear_globals()
    seed_states(app, [("TX", "Texas")])
    skills = seed_skills(app, ["Leadership"])

    event_date = datetime.utcnow() + timedelta(days=2)
    ev_id = _create_event(app, "TX", event_date, [skills["Leadership"]])

    vol_id = _create_volunteer(app, "vol@example.org", "Val Volunteer",
                               [skills["Leadership"]], [event_date.date().isoformat()])

    # POST save
    post_path = find_rule(app, "volunteer_matching.save_volunteer_match")
    r = client.post(post_path, json={"eventId": ev_id, "volunteerId": vol_id})
    assert r.status_code == 201
    assert r.get_json()["saved"] == {"eventId": ev_id, "volunteerId": vol_id}

    # Row exists in DB with ASSIGNED status
    with app.app_context():
        vh = db.session.query(VolunteerHistory).filter_by(user_id=vol_id, event_id=ev_id).one()
        assert vh.participation_status is ParticipationStatusEnum.ASSIGNED

    # GET /saved includes resolved names
    saved_path = find_rule(app, "volunteer_matching.list_saved_matches")
    r2 = client.get(saved_path)
    saved = r2.get_json()
    assert saved == [{
        "eventId": ev_id,
        "eventName": "Food Bank Sort",
        "volunteerId": vol_id,
        "volunteerName": "Val Volunteer",
    }]
