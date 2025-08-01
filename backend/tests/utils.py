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
def seed_events(
    app: Flask,
    items: Iterable[
        tuple[
            str,  # name
            str,  # description
            str,  # address  (optional for 5-/6-tuples)
            str,  # city     (optional for 5-/6-tuples)
            str,  # state_id
            str,  # urgency  ("low" | "medium" | "high")
            str,  # ISO date "YYYY-MM-DD"
            list[int],  # optional extra skill_ids (6-tuple form)
        ]
    ] | Iterable[tuple],  # keep type checker happy
) -> Dict[str, int]:
    """
    Insert events and return a mapping {event_name: event_id}.

    Accepted tuple shapes:
      5-fields → (name, desc, state, urgency, iso)
      6-fields → (name, desc, state, urgency, iso, skill_ids)
      7-fields → (name, desc, addr, city, state, urgency, iso)
    """
    from datetime import datetime
    from app.models.events import Events, UrgencyEnum

    out: Dict[str, int] = {}
    with app.app_context():
        for tup in items:
            # ── tolerant tuple unpacking ──────────────────────────────
            if len(tup) == 5:
                name, desc, state_id, urgency, iso_date = tup
                addr, city, skill_ids = "", "", []
            elif len(tup) == 6:
                name, desc, state_id, urgency, iso_date, skill_ids = tup
                addr, city = "", ""
            elif len(tup) == 7:
                name, desc, addr, city, state_id, urgency, iso_date = tup
                skill_ids = []
            else:
                raise ValueError(
                    f"seed_events: expected 5, 6, or 7 items, got {len(tup)} → {tup}"
                )

            ev = Events(
                name=name,
                description=desc,
                address=addr,
                city=city,
                state_id=state_id,
                urgency=UrgencyEnum[urgency],
                date=datetime.fromisoformat(
                    iso_date if isinstance(iso_date, str) else iso_date.isoformat()
                ),
            )
            db.session.add(ev)
            db.session.flush()  # assign PK
            out[name] = ev.event_id

            # attach skills if provided (6-tuple form)
            if skill_ids:
                from app.models.eventToSkill import EventToSkill
                for sid in skill_ids:
                    db.session.add(EventToSkill(event_id=ev.event_id, skill_code=sid))

        db.session.commit()
    return out


def seed_volunteer_history(app: Flask, rows: Iterable[tuple[int, int, str]]) -> None:
    """rows: (user_id, event_id, status_name) where status_name ∈ ASSIGNED|REGISTERED|COMPLETED."""
    from app.models.volunteerHistory import VolunteerHistory, ParticipationStatusEnum

    with app.app_context():
        for uid, eid, status in rows:
            db.session.add(
                VolunteerHistory(
                    user_id=uid,
                    event_id=eid,
                    participation_status=ParticipationStatusEnum[status],
                )
            )
        db.session.commit()


# ───────────────────── helper: elevate a user to ADMIN ───────────────────────
def promote_to_admin(app: Flask, user_id: int) -> None:
    """Flip role → ADMIN directly in the DB (used by admin-side tests)."""
    from app.models.userCredentials import User_Roles

    with app.app_context():
        user = db.session.get(UserCredentials, user_id)
        if not user:
            raise RuntimeError(f"promote_to_admin: user_id {user_id} not found")
        user.role = User_Roles.ADMIN
        db.session.commit()