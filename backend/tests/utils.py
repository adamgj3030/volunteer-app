from __future__ import annotations

from typing import Iterable, List, Tuple, Dict
from flask import Flask

from app import db
from app.models.state import States
from app.models.skill import Skill, SkillLevelEnum
from app.models.userCredentials import UserCredentials
from app.utils.tokens import generate_email_token


# ---------------------------------------------------------------------------
# URL helpers
# ---------------------------------------------------------------------------
def find_rule(app: Flask, endpoint: str) -> str:
    """
    Return the URL rule (path) registered for a given endpoint, e.g.
    'states.list_states' or 'users_profiles.get_my_profile'.
    This avoids guessing blueprints' url_prefix in tests.
    """
    for rule in app.url_map.iter_rules():
        if rule.endpoint == endpoint:
            return rule.rule
    raise AssertionError(f"Could not find URL rule for endpoint '{endpoint}'")


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------
def register(client, email: str, password: str, role: str = "volunteer"):
    return client.post(
        "/auth/register",
        json={"email": email, "password": password, "role": role},
    )


def confirm_email_via_token(
    client,
    app: Flask,
    email: str,
    role_requested: str = "volunteer",
):
    with app.app_context():
        user = UserCredentials.query.filter_by(email=email).first()
        assert user, "User must exist before confirming"
        token = generate_email_token(
            user_id=user.user_id,
            email=user.email,
            role_requested=role_requested,
            version=user.confirmation_token_version,
        )
    return client.get(f"/auth/confirm/{token}", follow_redirects=False)


def login_get_token(client, email: str, password: str) -> str:
    r = client.post("/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, r.get_data(as_text=True)
    return r.get_json()["access_token"]


def create_confirmed_user_and_token(
    client,
    app: Flask,
    email: str = "alice@example.org",
    password: str = "StrongPass!1",
    role: str = "volunteer",
    skip_login: bool = False,
) -> str | None:
    _ = register(client, email=email, password=password, role=role)
    _ = confirm_email_via_token(client, app, email=email, role_requested=role)

    if skip_login:
        return None

    return login_get_token(client, email=email, password=password)


def auth_header(token: str) -> Dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------------------
# Seeding helpers – existing
# ---------------------------------------------------------------------------
def seed_states(
    app: Flask,
    items: Iterable[Tuple[str, str]] | None = None,
) -> List[Tuple[str, str]]:
    """
    Seed a small set of states. Returns the list actually present.
    """
    if items is None:
        items = [
            ("TX", "Texas"),
            ("CA", "California"),
            ("NY", "New York"),
            ("AZ", "Arizona"),
        ]

    with app.app_context():
        for code, name in items:
            if not db.session.get(States, code):
                db.session.add(States(state_id=code, name=name))
        db.session.commit()
    return list(items)


def seed_skills(app: Flask, names: Iterable[str] | None = None) -> Dict[str, int]:
    """
    Seed skills (BEGINNER by default). Returns {name: id}.
    """
    if names is None:
        names = ["Leadership", "Communication", "Technical", "Design"]

    out: Dict[str, int] = {}
    with app.app_context():
        for nm in names:
            existing = db.session.query(Skill).filter_by(skill_name=nm).first()
            if not existing:
                s = Skill(skill_name=nm, level=SkillLevelEnum.BEGINNER)
                db.session.add(s)
                db.session.flush()
                out[nm] = s.skill_id
            else:
                out[nm] = existing.skill_id
        db.session.commit()
    return out


# ---------------------------------------------------------------------------
# NEW seeding helpers required by the volunteer-matching / task tests
# ---------------------------------------------------------------------------
def seed_volunteer_history(app: Flask, rows: Iterable[tuple]) -> None:
    """
    Accepts
      • (uid, eid, status)
      • (uid, eid, status, hours)  – extra value ignored

    The test-suite may pass status "COMPLETED"; map it to the project’s
    enum name "ATTENDED" so the insert succeeds.
    """
    from app.models.volunteerHistory import VolunteerHistory, ParticipationStatusEnum

    STATUS_MAP = {"COMPLETED": "ATTENDED"}  # test → model translation

    with app.app_context():
        for row in rows:
            if len(row) == 3:
                uid, eid, status = row
            elif len(row) == 4:              # hours_volunteered ignored
                uid, eid, status, _ = row
            else:
                raise ValueError(f"seed_volunteer_history: bad tuple {row}")

            status = STATUS_MAP.get(status, status)  # translate if needed
            db.session.add(
                VolunteerHistory(
                    user_id=uid,
                    event_id=eid,
                    participation_status=ParticipationStatusEnum[status],
                )
            )
        db.session.commit()


# ─────────────────── create_confirmed_user_and_token (updated) ────────────────
def create_confirmed_user_and_token(             # noqa: C901  (keep helper in utils)
    client,
    app: Flask,
    *,
    email: str | None = None,
    password="StrongPass!1",
    role="volunteer",
    skip_login=False,
    full_name: str | None = None,                # may be supplied by newer tests
    **__,
) -> str | None:
    """
    • If *email* is omitted we derive one from full_name or generate a
      unique placeholder so successive calls don’t clash.
    • Ignores *full_name* – profile tests set names separately.
    """
    import uuid

    if email is None:
        base = (full_name or "user").lower().replace(" ", ".")
        email = f"{base}-{uuid.uuid4().hex[:6]}@example.org"

    def _safe_register():
        r = register(client, email=email, password=password, role=role)
        # If the user already exists the route returns 400; ignore & continue.
        if r.status_code not in (200, 201, 400):
            raise AssertionError(f"register failed: {r.get_data(as_text=True)}")

    _safe_register()
    confirm_email_via_token(client, app, email=email, role_requested=role)

    if skip_login:
        return None
    return login_get_token(client, email=email, password=password)