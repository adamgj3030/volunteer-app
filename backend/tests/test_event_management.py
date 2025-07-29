# backend/tests/test_event_management.py
import pytest
from datetime import datetime, timedelta

from app import db
from app.models.events import Events, UrgencyEnum
from tests.utils import find_rule, seed_states

@pytest.fixture(autouse=True)
def setup_states(app):
    # ensure TX exists for foreign‐key constraints
    seed_states(app, [("TX", "Texas")])
    yield

def test_list_upcoming_and_past_empty(client, app):
    up_path = find_rule(app, "events.list_upcoming_events")
    past_path = find_rule(app, "events.list_past_events")

    r_up = client.get(up_path)
    assert r_up.status_code == 200
    assert isinstance(r_up.get_json(), list)
    assert r_up.get_json() == []

    r_past = client.get(past_path)
    assert r_past.status_code == 200
    assert isinstance(r_past.get_json(), list)
    assert r_past.get_json() == []

def test_list_upcoming_and_past_with_events(client, app):
    # seed one past and one future event
    with app.app_context():
        now = datetime.utcnow()
        past = Events(
            name="Past Event",
            description="Already happened",
            address="123 Old St",
            city="Houston",
            state_id="TX",
            zipcode="77001",
            urgency=UrgencyEnum.low,
            date=now - timedelta(days=1),
            skills=["Leadership", "Design"],
        )
        future = Events(
            name="Future Event",
            description="Coming soon",
            address="456 New Ave",
            city="Austin",
            state_id="TX",
            zipcode="73301",
            urgency=UrgencyEnum.high,
            date=now + timedelta(days=1),
            skills=["Communication"],
        )
        db.session.add_all([past, future])
        db.session.commit()
        past_id = past.event_id
        future_id = future.event_id

    up_path = find_rule(app, "events.list_upcoming_events")
    past_path = find_rule(app, "events.list_past_events")

    r_up = client.get(up_path)
    assert r_up.status_code == 200
    upcoming = r_up.get_json()
    assert len(upcoming) == 1
    assert upcoming[0]["event_id"] == future_id

    r_past = client.get(past_path)
    assert r_past.status_code == 200
    past_list = r_past.get_json()
    assert len(past_list) == 1
    assert past_list[0]["event_id"] == past_id

def test_create_event_and_get(client, app):
    create_path = find_rule(app, "events.create_event")
    get_rule = find_rule(app, "events.get_event")

    # prepare payload for a new event two days from now
    iso_date = (datetime.utcnow() + timedelta(days=2)).isoformat()
    payload = {
        "name": "New Event",
        "description": "Test creation",
        "address": "789 Test Rd",
        "city": "Dallas",
        "state_id": "TX",
        "zipcode": "75201",
        "urgency": "medium",
        "date": iso_date,
        "skills": ["Technical"],
    }

    r_create = client.post(create_path, json=payload)
    assert r_create.status_code == 201
    data = r_create.get_json()
    assert "event_id" in data
    eid = data["event_id"]

    # fetch it back
    path_get = get_rule.replace("<int:event_id>", str(eid))
    r_get = client.get(path_get)
    assert r_get.status_code == 200
    ev = r_get.get_json()
    assert ev["event_id"] == eid
    assert ev["name"] == payload["name"]
    assert ev["skills"] == payload["skills"]

def test_update_event(client, app):
    # first insert a row
    with app.app_context():
        now = datetime.utcnow()
        ev = Events(
            name="To Update",
            description="Before patch",
            state_id="TX",
            zipcode="77002",
            urgency=UrgencyEnum.low,
            date=now,
        )
        db.session.add(ev)
        db.session.commit()
        eid = ev.event_id

    update_rule = find_rule(app, "events.update_event")
    patch_path = update_rule.replace("<int:event_id>", str(eid))

    new_data = {"name": "Updated Name", "urgency": "high"}
    r_patch = client.patch(patch_path, json=new_data)
    assert r_patch.status_code == 200

    # verify changes
    get_rule = find_rule(app, "events.get_event")
    path_get = get_rule.replace("<int:event_id>", str(eid))
    r_get = client.get(path_get)
    ev2 = r_get.get_json()
    assert ev2["name"] == "Updated Name"
    assert ev2["urgency"] == "high"

def test_get_nonexistent_event_returns_404(client, app):
    get_rule = find_rule(app, "events.get_event")
    path = get_rule.replace("<int:event_id>", "999999")
    r = client.get(path)
    assert r.status_code == 404

