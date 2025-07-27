# backend/tests/test_skills.py
from tests.utils import seed_skills, find_rule

def test_list_skills_returns_seeded_skills_sorted(client, app):
    ids = seed_skills(app, names=["Leadership", "Technical", "Communication"])
    path = find_rule(app, "skills.list_skills")

    r = client.get(path)
    assert r.status_code == 200
    j = r.get_json()
    assert "skills" in j and isinstance(j["skills"], list)
    rows = j["skills"]

    # Sorted by skill_name ascending
    expected_names = sorted(ids.keys())
    assert [row["name"] for row in rows] == expected_names

    # Level string should be present, id must match seeded mapping
    for row in rows:
        assert isinstance(row["id"], int)
        assert row["name"] in ids
        assert row["level"] in ("BEGINNER", "INTERMEDIATE", "EXPERT")
