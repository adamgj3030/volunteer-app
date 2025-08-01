"""
Tiny smoke-tests for /tasks.

We don’t check DB side-effects here – that is covered indirectly in the
volunteer-matching tests when a match is saved – we only prove that:

  • GET /tasks returns the current user’s rows
  • POST /tasks/status flips ASSIGNED ↔ REGISTERED
  • both endpoints refuse unauthenticated requests
"""
from datetime import datetime, timedelta

from tests.utils import (
    seed_states,
    seed_skills,
    seed_events,
    seed_volunteer_history,
    create_confirmed_user_and_token,
    auth_header,
    find_rule,
)


def _insert_sample_history(app, user_id: int):
    """
    Insert three rows for one user:

        ASSIGNED  – event 1
        REGISTERED – event 2
        COMPLETED – event 3   (should not change via status endpoint)
    """
    with app.app_context():
        seed_volunteer_history(
            app,
            [
                (user_id, 1, "ASSIGNED", None),
                (user_id, 2, "REGISTERED", 3),
                (user_id, 3, "COMPLETED",  4),
            ],
        )


def test_task_list_and_status_toggle(client, app):
    # --- seed DB -----------------------------------------------------------
    seed_states(app, [("TX", "Texas")])
    seed_skills(app)
    events = [
        ("Community Cleanup", "Park", "TX", "medium", datetime.utcnow() + timedelta(days=10)),
        ("Food Drive", "Center", "TX", "low", datetime.utcnow() + timedelta(days=20)),
        ("Shelter", "Shelter", "TX", "high", datetime.utcnow() + timedelta(days=30)),
    ]
    seed_events(app, events)

    token = create_confirmed_user_and_token(client, app)
    uid = 1  # helper above always makes the first user id = 1
    _insert_sample_history(app, uid)

    list_path = find_rule(app, "task_list.list_my_tasks")
    status_path = find_rule(app, "task_list.update_task_status")

    # --- GET /tasks --------------------------------------------------------
    r = client.get(list_path, headers=auth_header(token))
    assert r.status_code == 200
    data = r.get_json()
    assert len(data) == 3
    first = next(t for t in data if t["status"] == "assigned")

    # --- POST /tasks/status  (ASSIGNED → REGISTERED) -----------------------
    payload = {"taskId": first["id"], "status": "registered"}
    r2 = client.post(status_path, json=payload, headers=auth_header(token))
    assert r2.status_code == 200
    assert r2.get_json()["status"] == "registered"

    # confirm list view shows the flip
    r3 = client.get(list_path, headers=auth_header(token))
    assert any(t["id"] == first["id"] and t["status"] == "registered" for t in r3.get_json())


def test_task_endpoints_require_auth(client, app):
    list_path = find_rule(app, "task_list.list_my_tasks")
    status_path = find_rule(app, "task_list.update_task_status")

    assert client.get(list_path).status_code in (401, 422)
    assert client.post(status_path, json={}).status_code in (401, 422)
