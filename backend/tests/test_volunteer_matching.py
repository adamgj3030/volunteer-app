# backend/tests/test_volunteer_matching.py
"""
Smoke-tests for the volunteer-matching blueprint.

The goals:

  • prove the real DB branch is executed (numeric event/volunteer ids)
  • ensure /saved echoes the row we just posted
  • verify ordering logic (availability + skill match > skill-only)
"""

from datetime import datetime, timedelta, date

from tests.utils import (
    seed_states,
    seed_skills,
    seed_events,
    seed_volunteer_history,
    create_confirmed_user_and_token,
    auth_header,
    find_rule,
)


def _seed_one_event(app, skills, day_offset: int = 2) -> int:
    """
    Insert a single event that requires the given skills.
    Returns the *numeric* event_id (will be 1 if DB is empty).
    """
    iso_date = (datetime.utcnow() + timedelta(days=day_offset)).isoformat()
    seed_events(
        app,
        [
            (
                "Cleanup",
                "Central Park",
                "TX",
                "high",                       # urgency
                iso_date,
                list(skills.values()),        # skill_ids
            )
        ],
    )
    return 1  # first row inserted gets id = 1 when DB is empty


def _create_profile(client, token, skills, avail_date: str | None):
    payload = {
        "full_name":    "TMP",
        "address1":     "1 Main",
        "city":         "Houston",
        "state":        "TX",
        "zipcode":      "1",
        "skills":       list(skills.values()),
        "availability": [avail_date] if avail_date else [],
    }
    path = find_rule(client.application, "users_profiles.create_or_update_my_profile")
    client.post(path, json=payload, headers=auth_header(token))


def test_volunteer_matching_endpoints(client, app):
    """Happy-path coverage for events → matches → save."""
    # ── seed reference data ─────────────────────────────────────────────────
    seed_states(app, [("TX", "Texas")])
    skills = seed_skills(app, names=["Org"])

    event_id = _seed_one_event(app, skills)           # numeric id = 1

    # volunteer A: skill + availability  → best
    tok_a = create_confirmed_user_and_token(client, app, full_name="Alice A")
    avail = (date.today() + timedelta(days=2)).isoformat()
    _create_profile(client, tok_a, skills, avail)

    # volunteer B: skill only            → second
    tok_b = create_confirmed_user_and_token(client, app, full_name="Bob B")
    _create_profile(client, tok_b, skills, None)

    # ── GET /events returns legacy + real event ────────────────────────────
    events_path = find_rule(app, "volunteer_matching.list_matching_events")
    r_events = client.get(events_path)
    assert r_events.status_code == 200
    j_events = r_events.get_json()
    # at least our numeric event should be present
    assert any(isinstance(e["id"], int) and e["id"] == event_id for e in j_events)

    # ── GET /?eventId=<numeric> ranks Alice A first ────────────────────────
    match_path = find_rule(app, "volunteer_matching.get_volunteer_matches")
    r_match = client.get(match_path, query_string={"eventId": event_id})
    assert r_match.status_code == 200
    data = r_match.get_json()
    assert data[0]["fullName"] == "Alice A"   # availability makes her top

    # ── POST /volunteer/matching saves a row ───────────────────────────────
    save_path = find_rule(app, "volunteer_matching.save_volunteer_match")
    r_save = client.post(
        save_path,
        json={"eventId": event_id, "volunteerId": 1},   # Alice A has user_id 1
    )
    assert r_save.status_code == 201

    # ── GET /saved includes our record (enriched with names) ───────────────
    saved_path = find_rule(app, "volunteer_matching.list_saved_matches")
    r_saved = client.get(saved_path)
    assert r_saved.status_code == 200
    saved = r_saved.get_json()
    assert any(
        row["eventId"] == event_id and row["volunteerId"] == 1 for row in saved
    )
