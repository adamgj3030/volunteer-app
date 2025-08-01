"""
Quick coverage for /volunteer/history – admin-only list.

We only check:
  • 200 + non-empty JSON for an admin
  • 403 (or 401/422 depending on config) for a non-admin
"""
from datetime import datetime, timedelta

from tests.utils import (
    seed_states,
    seed_skills,
    seed_events,
    seed_volunteer_history,
    create_confirmed_user_and_token,
    promote_to_admin,
    auth_header,
    find_rule,
)


def _seed_some_history(app, uid):
    with app.app_context():
        seed_volunteer_history(
            app,
            [
                (uid, 1, "ASSIGNED", None),
            ],
        )


def test_history_admin_ok_user_forbidden(client, app):
    seed_states(app, [("TX", "Texas")])
    seed_skills(app)
    seed_events(
        app,
        [("Cleanup", "Park", "TX", "low", datetime.utcnow() + timedelta(days=5))],
    )

    # volunteer user
    vol_token = create_confirmed_user_and_token(client, app)
    _seed_some_history(app, uid=1)

    # admin user
    admin_token = promote_to_admin(client, app)  # helper returns token for fresh admin

    path = find_rule(app, "volunteer_history.list_volunteer_history")

    # volunteer ➜ forbidden
    assert client.get(path, headers=auth_header(vol_token)).status_code in (401, 403, 422)

    # admin ➜ 200 and list
    r = client.get(path, headers=auth_header(admin_token))
    assert r.status_code == 200
    assert len(r.get_json()) >= 1
