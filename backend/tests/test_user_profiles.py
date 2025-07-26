# backend/tests/test_user_profiles.py
from datetime import date, timedelta

import pytest

from tests.utils import (
    seed_states, seed_skills,
    find_rule,
    create_confirmed_user_and_token,
    auth_header,
)

def _valid_profile_payload(skill_ids, state_code="TX"):
    today = date.today()
    return {
        "full_name": "Alice Smith",
        "address1": "123 Main St",
        "address2": "",
        "city": "Houston",
        "state": state_code,
        "zipcode": "77002",
        "preferences": "Evenings preferred",
        "skills": [skill_ids["Leadership"], skill_ids["Technical"]],
        "availability": [
            (today + timedelta(days=1)).isoformat(),
            (today + timedelta(days=3)).isoformat(),
        ],
    }


def test_get_my_profile_returns_none_when_not_created_yet(client, app):
    seed_states(app, [("TX", "Texas")])
    seed_skills(app)
    token = create_confirmed_user_and_token(client, app)

    get_path = find_rule(app, "users_profiles.get_my_profile")
    r = client.get(get_path, headers=auth_header(token))
    assert r.status_code == 200
    assert r.get_json() == {"profile": None}


def test_create_profile_200_created_true_and_persists(client, app):
    seed_states(app, [("TX", "Texas")])
    skills = seed_skills(app)
    token = create_confirmed_user_and_token(client, app)

    post_path = find_rule(app, "users_profiles.create_or_update_my_profile")
    get_path = find_rule(app, "users_profiles.get_my_profile")

    payload = _valid_profile_payload(skills, state_code="TX")

    r = client.post(post_path, json=payload, headers=auth_header(token))
    assert r.status_code == 200
    j = r.get_json()
    assert j["created"] is True
    prof = j["profile"]
    assert prof["full_name"] == payload["full_name"]
    assert prof["state"] == "TX"
    assert set(prof["skills"]) == set(payload["skills"])
    assert set(prof["availability"]) == set(payload["availability"])

    # GET returns the same data
    r2 = client.get(get_path, headers=auth_header(token))
    assert r2.status_code == 200
    prof2 = r2.get_json()["profile"]
    assert prof2["full_name"] == payload["full_name"]
    assert set(prof2["skills"]) == set(payload["skills"])


def test_post_again_updates_profile_and_replaces_skills_and_availability(client, app):
    seed_states(app, [("TX", "Texas"), ("CA", "California")])
    skills = seed_skills(app, names=["Leadership", "Technical", "Design"])
    token = create_confirmed_user_and_token(client, app)

    post_path = find_rule(app, "users_profiles.create_or_update_my_profile")
    get_path = find_rule(app, "users_profiles.get_my_profile")

    # Create
    r1 = client.post(post_path, json=_valid_profile_payload(skills, "TX"), headers=auth_header(token))
    assert r1.status_code == 200
    assert r1.get_json()["created"] is True

    # Update (switch state, replace skills & availability)
    updated = _valid_profile_payload(skills, "CA")
    updated["skills"] = [skills["Design"]]  # replace with single skill
    updated["availability"] = [date.today().isoformat()]  # replace availability
    r2 = client.post(post_path, json=updated, headers=auth_header(token))
    assert r2.status_code == 200
    j2 = r2.get_json()
    assert j2["created"] is False
    prof = j2["profile"]
    assert prof["state"] == "CA"
    assert set(prof["skills"]) == {skills["Design"]}
    assert set(prof["availability"]) == set(updated["availability"])

    # Verify via GET
    r3 = client.get(get_path, headers=auth_header(token))
    assert r3.status_code == 200
    prof3 = r3.get_json()["profile"]
    assert prof3["state"] == "CA"
    assert set(prof3["skills"]) == {skills["Design"]}


def test_patch_profile_merges_partial_fields(client, app):
    seed_states(app, [("TX", "Texas")])
    skills = seed_skills(app, names=["Leadership", "Technical"])
    token = create_confirmed_user_and_token(client, app)

    post_path = find_rule(app, "users_profiles.create_or_update_my_profile")
    patch_path = find_rule(app, "users_profiles.patch_my_profile")
    get_path = find_rule(app, "users_profiles.get_my_profile")

    # Create base profile
    base = _valid_profile_payload(skills, "TX")
    r1 = client.post(post_path, json=base, headers=auth_header(token))
    assert r1.status_code == 200

    # Patch only city + preferences
    patch_payload = {"city": "Austin", "preferences": "Weekends"}
    r2 = client.patch(patch_path, json=patch_payload, headers=auth_header(token))
    assert r2.status_code == 200
    prof = r2.get_json()["profile"]
    assert prof["city"] == "Austin"
    # unchanged:
    assert prof["state"] == "TX"
    assert set(prof["skills"]) == set(base["skills"])

    # Verify via GET
    r3 = client.get(get_path, headers=auth_header(token))
    assert r3.status_code == 200
    prof2 = r3.get_json()["profile"]
    assert prof2["city"] == "Austin"
    assert prof2["preferences"] == "Weekends"


def test_profile_endpoints_require_auth(client, app):
    # Find paths without relying on url prefix
    get_path = find_rule(app, "users_profiles.get_my_profile")
    post_path = find_rule(app, "users_profiles.create_or_update_my_profile")
    patch_path = find_rule(app, "users_profiles.patch_my_profile")

    assert client.get(get_path).status_code in (401, 422)  # flask-jwt-extended may use 401/422 depending on config
    assert client.post(post_path, json={}).status_code in (401, 422)
    assert client.patch(patch_path, json={}).status_code in (401, 422)


def test_profile_validation_error_returns_400(client, app):
    seed_states(app, [("TX", "Texas")])
    seed_skills(app)
    token = create_confirmed_user_and_token(client, app)

    post_path = find_rule(app, "users_profiles.create_or_update_my_profile")

    bad_payload = {
        # "full_name": missing on purpose to trigger validate_profile_payload
        "address1": "1 Test",
        "city": "Houston",
        "state": "TX",
        "zipcode": "77002",
        "skills": [],
        "availability": [],
    }
    r = client.post(post_path, json=bad_payload, headers=auth_header(token))
    assert r.status_code == 400
    j = r.get_json()
    assert j.get("error") == "validation_error"
    assert isinstance(j.get("fields"), dict)
