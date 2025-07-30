# backend/tests/test_volunteer_matching.py
import pytest
from tests.utils import find_rule, auth_header

# Import the in-memory store to reset state between tests
to_clear = __import__('app.routes.volunteer_matching', fromlist=['_SAVED_MATCHES'])._SAVED_MATCHES

@pytest.fixture(autouse=True)
def clear_saved_matches():
    # Clear saved matches before each test
    to_clear.clear()
    yield
    to_clear.clear()


def test_get_without_event_id_returns_400_and_empty_list(client, app):
    path = find_rule(app, 'volunteer_matching.get_volunteer_matches')
    r = client.get(path)
    assert r.status_code == 400
    assert r.get_json() == []


def test_get_with_invalid_event_id_returns_200_and_empty_list(client, app):
    path = find_rule(app, 'volunteer_matching.get_volunteer_matches')
    r = client.get(f"{path}?eventId=does_not_exist")
    assert r.status_code == 200
    assert r.get_json() == []


def test_get_with_valid_event_id_returns_ranked_volunteers(client, app):
    path = find_rule(app, 'volunteer_matching.get_volunteer_matches')
    # Use dummy event e1 defined in the route
    r = client.get(f"{path}?eventId=e1")
    assert r.status_code == 200
    data = r.get_json()
    # Expect at least one volunteer and correct keys
    assert isinstance(data, list)
    assert data[0]['id'] == 'v1'
    assert all('id' in v and 'fullName' in v for v in data)


def test_post_without_body_returns_400(client, app):
    path = find_rule(app, 'volunteer_matching.save_volunteer_match')
    r = client.post(path, json={})
    assert r.status_code == 400
    assert 'error' in r.get_json()


def test_post_and_list_saved_matches(client, app):
    save_path = find_rule(app, 'volunteer_matching.save_volunteer_match')
    saved_path = find_rule(app, 'volunteer_matching.list_saved_matches')

    # Post a valid match
    payload = {'eventId': 'e2', 'volunteerId': 'v2'}
    r1 = client.post(save_path, json=payload)
    assert r1.status_code == 201
    j1 = r1.get_json()
    assert j1.get('saved') == payload

    # Check saved list
    r2 = client.get(saved_path)
    assert r2.status_code == 200
    saved = r2.get_json()
    assert isinstance(saved, list)
    assert payload in saved
