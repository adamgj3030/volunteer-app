# backend/tests/utils.py
from __future__ import annotations

from datetime import datetime
from typing import Dict, Iterable, List, Tuple
import uuid

from flask import Flask

from app import db
from app.models.skill import Skill, SkillLevelEnum
from app.models.state import States
from app.models.userCredentials import UserCredentials, User_Roles
from app.utils.tokens import generate_email_token


# ───────────────────────────── URL helper ──────────────────────────────
def find_rule(app: Flask, endpoint: str) -> str:
    """Return the registered URL rule for a given endpoint string."""
    for rule in app.url_map.iter_rules():
        if rule.endpoint == endpoint:
            return rule.rule
    raise AssertionError(f"URL rule for endpoint “{endpoint}” not found")


# ───────────────────────────── Auth helpers ────────────────────────────
def register(client, *, email: str, password: str, role: str = "volunteer"):
    return client.post(
        "/auth/register",
        json={"email": email, "password": password, "role": role},
    )


def confirm_email_via_token(
    client,
    app: Flask,
    *,
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


def login_get_token(client, *, email: str, password: str) -> str:
    r = client.post("/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, r.get_data(as_text=True)
    return r.get_json()["access_token"]


def create_confirmed_user_and_token(
    client,
    app: Flask,
    *,
    email: str | None = None,
    password: str = "StrongPass!1",
    role: str = "volunteer",
    skip_login: bool = False,
    full_name: str | None = None,
) -> str | None:
    """
    • Creates & confirms a user, then logs in and returns the JWT-token.
    • If *email* omitted we derive one from full_name or ensure uniqueness.
    """
    if email is None:
        base = (full_name or "user").lower().replace(" ", ".")
        email = f"{base}-{uuid.uuid4().hex[:6]}@example.org"

    register(client, email=email, password=password, role=role)
    confirm_email_via_token(client, app, email=email, role_requested=role)

    if skip_login:
        return None
    return login_get_token(client, email=email, password=password)


def auth_header(token: str) -> Dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


# ─────────────────────────── Seeding helpers ───────────────────────────
def seed_states(
    app: Flask,
    items: Iterable[Tuple[str, str]] | None = None,
) -> List[Tuple[str, str]]:
    if items is None:
        items = [("TX", "Texas"), ("CA", "California"), ("NY", "New York")]
    with app.app_context():
        for code, name in items:
            if not db.session.get(States, code):
                db.session.add(States(state_id=code, name=name))
        db.session.commit()
    return list(items)


def seed_skills(app: Flask, *, names: Iterable[str] | None = None) -> Dict[str, int]:
    if names is None:
        names = ["Leadership", "Communication", "Technical", "Design"]
    out: Dict[str, int] = {}
    with app.app_context():
        for nm in names:
            row = db.session.query(Skill).filter_by(skill_name=nm).first()
            if not row:
                row = Skill(skill_name=nm, level=SkillLevelEnum.BEGINNER)
                db.session.add(row)
                db.session.flush()
            out[nm] = row.skill_id
        db.session.commit()
    return out


# -------- NEW: seed_events ----------------------------------------------------
def seed_events(
    app: Flask,
    items: Iterable[
        tuple[
            str,                 # name
            str,                 # description
            str,                 # state_id        (tests omit address / city)
            str,                 # urgency: low | medium | high
            datetime | str,      # date (datetime or iso str)
            List[int] | None,    # optional list of skill_ids
        ]
        | tuple          # legacy 5-item tuples from some tests
    ],
) -> Dict[str, int]:
    """
    Accepts 5-, 6- or 7-column tuples coming from different tests and
    normalises them before inserting.
    Returns {event_name: event_id}.
    """
    from app.models.events import Events, UrgencyEnum
    from app.models.eventToSkill import EventToSkill

    out: Dict[str, int] = {}
    with app.app_context():
        for tup in items:
            # ---- normalise to (name, desc, state, urgency, date, skills)
            if len(tup) == 5:               # (name, desc, state, urgency, dt)
                name, desc, state, urg, dt = tup
                skills = []
            elif len(tup) == 6:             # + skills list
                name, desc, state, urg, dt, skills = tup
            else:
                raise ValueError(f"seed_events: bad tuple {tup}")

            if isinstance(dt, str):
                dt = datetime.fromisoformat(dt)

            ev = Events(
                name=name,
                description=desc,
                address="N/A",
                city="N/A",
                state_id=state,
                urgency=UrgencyEnum[urg],
                date=dt,
            )
            db.session.add(ev)
            db.session.flush()
            out[name] = ev.event_id

            for sid in skills or []:
                db.session.add(EventToSkill(event_id=ev.event_id, skill_code=sid))

        db.session.commit()
    return out


# -------- NEW: seed_volunteer_history ----------------------------------------
def seed_volunteer_history(
    app: Flask,
    rows: Iterable[tuple[int, int, str, int | None] | tuple[int, int, str]],
) -> None:
    """
    Accepts rows like:
        (uid, eid, "ASSIGNED")
        (uid, eid, "COMPLETED", 4)   # hours ignored by tests
    Translates “COMPLETED” → “ATTENDED” to match model enum.
    """
    from app.models.volunteerHistory import (
        VolunteerHistory,
        ParticipationStatusEnum,
    )

    xlat = {"COMPLETED": "ATTENDED"}

    with app.app_context():
        for row in rows:
            uid, eid, status = row[:3]
            status = xlat.get(status, status)
            db.session.add(
                VolunteerHistory(
                    user_id=uid,
                    event_id=eid,
                    participation_status=ParticipationStatusEnum[status],
                )
            )
        db.session.commit()


# -------- NEW: promote_to_admin ---------------------------------------------
def promote_to_admin(app: Flask, *, user_id: int):
    """Directly set an existing user’s role to ADMIN (used by admin-route tests)."""
    with app.app_context():
        user = db.session.get(UserCredentials, user_id)
        assert user, f"user_id {user_id} not found"
        user.role = User_Roles.ADMIN
        db.session.commit()
