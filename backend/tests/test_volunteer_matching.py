import pytest
from datetime import datetime, timedelta, date

from tests.utils import (
    seed_states,
    seed_skills,
    seed_events,
    create_confirmed_user_and_token,
    auth_header,
    find_rule,
)

def _seed_one_event(app, skills):
    evs = [
        ("Cleanup", "Park", "TX", "high", (datetime.utcnow() + timedelta(days=2)).isoformat())
    ]
    mapping = seed_events(app, evs)
    return mapping["Cleanup"]

def _create_profile(client, token, avail_iso):
    path = find_rule(client.application, "users_profiles.create_or_update_my_profile")
    payload = {
        "full_name": "Tester Name",
        "address1": "1 Test Lane",
        "address2": "",
        "city": "City",
        "state": "TX",
        "zipcode": "12345",
        "preferences": "",
        "skills": [],            # we'll skip skill filtering here
        "availability": [avail_iso] if avail_iso else [],
    }
    client.post(path, json=payload, headers=auth_header(token))

def test_volunteer_matching_flow(client, app):
    #─── seed reference data ────────────────────────────────────────────
    seed_states(app, [("TX", "Texas")])
    skills = seed_skills(app, names=["Org"])  # only one skill, tests ignore it

    event_id = _seed_one_event(app, skills)

    # A has availability => should come first
    tok_a = create_confirmed_user_and_token(client, app)
    avail = (date.today() + timedelta(days=2)).isoformat()
    _create_profile(client, tok_a, avail)

    # B has no availability => second
    tok_b = create_confirmed_user_and_token(client, app)
    _create_profile(client, tok_b, None)

    # GET /volunteer/matching/events
    ev_path = find_rule(app, "volunteer_matching.list_matching_events")
    r_ev = client.get(ev_path)
    assert r_ev.status_code == 200
    events = r_ev.get_json()
    # must include our numeric event
    assert any(isinstance(e["id"], int) and e["id"] == event_id for e in events)

    # GET /volunteer/matching?eventId=<id>
    match_path = find_rule(app, "volunteer_matching.get_volunteer_matches")
    r_match = client.get(match_path, query_string={"eventId": event_id})
    assert r_match.status_code == 200
    matches = r_match.get_json()
    assert isinstance(matches, list)
    # top match is “Tester Name” (A)
    assert matches[0]["fullName"] == "Tester Name"

    # save & list-saved
    save_path = find_rule(app, "volunteer_matching.save_volunteer_match")
    r_save = client.post(save_path,
                         json={"eventId": event_id, "volunteerId": 1})
    assert r_save.status_code == 201

    saved_path = find_rule(app, "volunteer_matching.list_saved_matches")
    r_saved = client.get(saved_path)
    assert r_saved.status_code == 200
    saved = r_saved.get_json()
    assert any(m["eventId"] == event_id and m["volunteerId"] == 1 for m in saved)
