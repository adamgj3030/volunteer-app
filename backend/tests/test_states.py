from tests.utils import seed_states, find_rule

def test_list_states_returns_seeded_states_sorted(client, app):
    seeded = seed_states(app)  # [("TX","Texas"), ...]
    path = find_rule(app, "states.list_states")

    r = client.get(path)
    assert r.status_code == 200
    j = r.get_json()
    assert "states" in j and isinstance(j["states"], list)
    returned = j["states"]

    # Names should be sorted ascending by name (as per route's order_by)
    expected_names_sorted = sorted([name for _, name in seeded])
    assert [s["name"] for s in returned] == expected_names_sorted

    # Ensure codes match the names one-to-one
    codes_by_name = {name: code for code, name in seeded}
    for row in returned:
        assert row["code"] == codes_by_name[row["name"]]
