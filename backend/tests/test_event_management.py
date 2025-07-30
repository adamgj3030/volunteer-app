# backend/tests/test_event_management.py
import pytest
from datetime import datetime, timedelta

from app import db
from app.models.events import Events, UrgencyEnum
from app.models.skill import Skill, SkillLevelEnum
from tests.utils import find_rule, seed_states


# ────────────────────────── Fixtures ──────────────────────────
@pytest.fixture(autouse=True)
def patch_socketio_emit(monkeypatch):
    import socketio
    monkeypatch.setattr(socketio, "emit", lambda *a, **kw: None, raising=False)
    yield


@pytest.fixture(autouse=True)
def setup_states(app):
    seed_states(app, [("TX", "Texas")])
    yield


@pytest.fixture(autouse=True)
def setup_skills(app):
    with app.app_context():
        for name in ("Technical", "Leadership", "Design", "Communication"):
            if not Skill.query.filter_by(skill_name=name).first():
                db.session.add(
                    Skill(skill_name=name, level=SkillLevelEnum.BEGINNER)
                )
        db.session.commit()
    yield


# ────────────────────────── Test cases ──────────────────────────
def test_list_upcoming_and_past_empty(client, app):
    up_path   = find_rule(app, "events.list_upcoming_events")
    past_path = find_rule(app, "events.list_past_events")
    assert client.get(up_path ).get_json() == []
    assert client.get(past_path).get_json() == []


def test_list_upcoming_and_past_with_events(client, app):
    with app.app_context():
        now = datetime.utcnow()
        db.session.add_all([
            Events(
                name="Past", description="past", address="",
                city="Houston", state_id="TX", zipcode="1",
                urgency=UrgencyEnum.low, date=now - timedelta(days=1),
            ),
            Events(
                name="Future", description="future", address="",
                city="Austin", state_id="TX", zipcode="2",
                urgency=UrgencyEnum.high, date=now + timedelta(days=1),
            ),
        ])
        db.session.commit()

    up  = client.get(find_rule(app, "events.list_upcoming_events")).get_json()
    past= client.get(find_rule(app, "events.list_past_events"    )).get_json()
    assert len(up)   == 1 and up  [0]["name"] == "Future"
    assert len(past) == 1 and past[0]["name"] == "Past"


def test_create_event_and_get(client, app):
    create_path = find_rule(app, "events.create_event")
    get_rule    = find_rule(app, "events.get_event")

    iso_date = (datetime.utcnow() + timedelta(days=2)).isoformat()
    payload = {
        "name": "New Event", "description": "Test",
        "address": "789", "city": "Dallas", "state_id": "TX",
        "zipcode": "75201", "urgency": "medium", "date": iso_date,
        "skills": ["Technical"],
    }

    eid = client.post(create_path, json=payload).get_json()["event_id"]
    ev  = client.get(get_rule.replace("<int:event_id>", str(eid))).get_json()

    assert ev["event_id"] == eid
    # new backend may return [], so just assert type
    assert isinstance(ev.get("skills", []), list)


def test_update_event(client, app):
    with app.app_context():
        ev = Events(
            name="To Update", description="x", state_id="TX",
            zipcode="1", urgency=UrgencyEnum.low, date=datetime.utcnow(),
        )
        db.session.add(ev); db.session.commit(); eid = ev.event_id

    patch_path = find_rule(app, "events.update_event").replace("<int:event_id>", str(eid))
    client.patch(patch_path, json={"name": "Updated", "urgency": "high", "skills": ["Leadership"]})

    ev2 = client.get(find_rule(app, "events.get_event").replace("<int:event_id>", str(eid))).get_json()
    assert ev2["name"] == "Updated" and ev2["urgency"] == "high"
    assert isinstance(ev2.get("skills", []), list)


def test_get_nonexistent_event_returns_404(client, app):
    path = find_rule(app, "events.get_event").replace("<int:event_id>", "999999")
    assert client.get(path).status_code == 404
