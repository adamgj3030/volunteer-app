from datetime import datetime, timedelta

from app.imports import db
from app.models.events import Events, UrgencyEnum
from app.models.volunteerHistory import VolunteerHistory, ParticipationStatusEnum
from app.models.userCredentials import UserCredentials

from tests.utils import (
    seed_states,
    create_confirmed_user_and_token,
    auth_header,
    find_rule,
)


# ------------------------------------------------------------------ helpers
def _create_event(app, state_code="TX", **overrides) -> int:
    """Insert one event and return its id."""
    defaults = {
        "name": "Food Drive",
        "description": "Help pack boxes",
        "address": "1 Test St",
        "city": "Houston",
        "state_id": state_code,
        "zipcode": "77002",
        "urgency": UrgencyEnum.low,
        "date": datetime.utcnow() + timedelta(days=7),
    }
    defaults.update(overrides)

    with app.app_context():
        ev = Events(**defaults)
        db.session.add(ev)
        db.session.commit()
        return ev.event_id


def _add_task(app, user_id: int, event_id: int,
              status: ParticipationStatusEnum = ParticipationStatusEnum.ASSIGNED) -> int:
    with app.app_context():
        vh = VolunteerHistory(user_id=user_id,
                              event_id=event_id,
                              participation_status=status)
        db.session.add(vh)
        db.session.commit()
        return vh.vol_history_id


def _uid(app, email: str) -> int:
    with app.app_context():
        return db.session.query(UserCredentials)\
                         .filter_by(email=email)\
                         .one().user_id


# ------------------------------------------------------------------ tests
def test_list_my_tasks_returns_only_current_user_tasks(client, app):
    seed_states(app)

    token_a = create_confirmed_user_and_token(client, app, email="a@example.org")
    token_b = create_confirmed_user_and_token(client, app, email="b@example.org")

    uid_a = _uid(app, "a@example.org")
    uid_b = _uid(app, "b@example.org")

    ev_id = _create_event(app)

    task_id_a = _add_task(app, uid_a, ev_id)
    _add_task(app, uid_b, ev_id)            # noise row for-other user

    get_path = find_rule(app, "task_list.list_my_tasks")
    r = client.get(get_path, headers=auth_header(token_a))

    assert r.status_code == 200
    tasks = r.get_json()
    assert len(tasks) == 1
    t = tasks[0]
    assert t["id"] == str(task_id_a)
    assert t["title"] == "Food Drive"
    assert t["status"] == "assigned"


def test_update_task_status_success(client, app):
    seed_states(app)
    token = create_confirmed_user_and_token(client, app)

    uid = _uid(app, "alice@example.org")
    ev_id = _create_event(app)
    task_id = _add_task(app, uid, ev_id)

    post_path = find_rule(app, "task_list.update_task_status")
    payload = {"taskId": task_id, "status": "registered"}
    r = client.post(post_path, json=payload, headers=auth_header(token))

    assert r.status_code == 200
    assert r.get_json() == payload

    with app.app_context():
        vh = db.session.get(VolunteerHistory, task_id)
        assert vh.participation_status is ParticipationStatusEnum.REGISTERED


def test_update_task_status_404_when_not_owner(client, app):
    seed_states(app)

    token_owner = create_confirmed_user_and_token(client, app, email="owner@example.org")
    token_other = create_confirmed_user_and_token(client, app, email="other@example.org")

    uid_owner = _uid(app, "owner@example.org")
    ev_id = _create_event(app)
    task_id = _add_task(app, uid_owner, ev_id)

    post_path = find_rule(app, "task_list.update_task_status")
    r = client.post(post_path,
                    json={"taskId": task_id, "status": "registered"},
                    headers=auth_header(token_other))
    assert r.status_code == 404


def test_tasks_endpoints_require_auth(client, app):
    get_path = find_rule(app, "task_list.list_my_tasks")
    post_path = find_rule(app, "task_list.update_task_status")

    assert client.get(get_path).status_code in (401, 422)
    assert client.post(post_path, json={}).status_code in (401, 422)
