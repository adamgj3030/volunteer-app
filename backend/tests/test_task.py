import pytest
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

def _insert_sample_history(app, uid: int):
    # create one ASSIGNED, one REGISTERED, one COMPLETED
    now = datetime.utcnow()
    rows = [
        (uid, 1, "ASSIGNED", None),
        (uid, 2, "REGISTERED", None),
        (uid, 3, "COMPLETED", None),
    ]
    seed_volunteer_history(app, rows)

def test_list_my_tasks_and_toggle_status(client, app):
    #─── seed reference data ────────────────────────────────────────────
    seed_states(app, [("TX", "Texas")])
    seed_skills(app)
    # three events 10/20/30 days out
    evs = [
        ("A", "D1", "TX", "medium", (datetime.utcnow() + timedelta(days=10)).isoformat()),
        ("B", "D2", "TX", "low",    (datetime.utcnow() + timedelta(days=20)).isoformat()),
        ("C", "D3", "TX", "high",   (datetime.utcnow() + timedelta(days=30)).isoformat()),
    ]
    seed_events(app, evs)

    token = create_confirmed_user_and_token(client, app)
    uid = int(token.split(".")[0]) if False else 1  # your helper always makes user_id=1 first
    _insert_sample_history(app, uid)

    #─── GET /tasks ───────────────────────────────────────────────────────
    list_path = find_rule(app, "task_list.list_my_tasks")
    r1 = client.get(list_path, headers=auth_header(token))
    assert r1.status_code == 200
    tasks = r1.get_json()
    assert len(tasks) == 3
    # statuses come back lower-case
    assert {t["status"] for t in tasks} == {"assigned", "registered", "completed"}

    #─── POST /tasks/status toggle the middle one back to “assigned” ──────
    second_id = tasks[1]["id"]
    status_path = find_rule(app, "task_list.update_task_status")
    r2 = client.post(status_path,
                     json={"taskId": second_id, "status": "assigned"},
                     headers=auth_header(token))
    assert r2.status_code == 200
    body = r2.get_json()
    assert body["taskId"] == second_id
    assert body["status"] == "assigned"
