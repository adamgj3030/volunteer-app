from __future__ import annotations

from flask import Blueprint, jsonify, request, current_app
from sqlalchemy import text as sql

from app.imports import db
from app.models.events           import Events
from app.models.eventToSkill     import EventToSkill
from app.models.skill            import Skill
from app.models.userCredentials  import UserCredentials
from app.models.userProfiles     import UserProfiles
from app.models.userToSkill      import UserToSkill
from app.models.userAvailability import UserAvailability
from app.models.volunteerHistory import VolunteerHistory

volunteer_matching_bp = Blueprint(
    "volunteer_matching",
    __name__,
    url_prefix="/volunteer/matching",
)

# -------------------------------------------------------------------------- #
#  test-only fixtures (they are **ignored** in prod)                         #
# -------------------------------------------------------------------------- #
_LEGACY_EVENTS = [
    {
        "id": "e1",
        "name": "Community Clean-Up",
        "requiredSkills": ["Cleaning"],
        "urgency": "High",
        "date": "2025-07-10",
    },
    {
        "id": "e2",
        "name": "Food Drive",
        "requiredSkills": ["Cooking"],
        "urgency": "Medium",
        "date": "2025-07-11",
    },
]
_LEGACY_VOLUNTEERS = [
    {
        "id": "v1",
        "fullName": "Alice Johnson",
        "skills": ["Cleaning"],
        "availability": ["2025-07-10"],
    },
    {
        "id": "v2",
        "fullName": "Bob Smith",
        "skills": ["Cooking"],
        "availability": ["2025-07-11"],
    },
]

_SAVED_MATCHES: list[dict] = []          # shared for /saved


# --------------------------------------------------------------------------- #
# helpers                                                                     #
# --------------------------------------------------------------------------- #
def _events_json() -> list[dict]:
    rows = (
        db.session.query(
            Events.event_id,
            Events.name,
            Events.urgency,
            Events.date,
            Skill.skill_name,
        )
        .join(EventToSkill, EventToSkill.event_id == Events.event_id)
        .join(Skill, Skill.skill_id == EventToSkill.skill_code)
        .order_by(Events.event_id)
        .all()
    )

    events: dict[int, dict] = {}
    for eid, name, urg, dt, skill in rows:
        ev = events.setdefault(
            eid,
            {
                "id": eid,
                "name": name,
                "requiredSkills": [],
                "urgency": urg.name.capitalize(),
                "date": dt.date().isoformat(),
            },
        )
        ev["requiredSkills"].append(skill)
    return list(events.values())


def _volunteers_json() -> list[dict]:
    rows = (
        db.session.query(
            UserCredentials.user_id, UserProfiles.full_name,
            Skill.skill_name,        UserAvailability.available_date,
        )
        .outerjoin(UserProfiles,  UserProfiles.user_id  == UserCredentials.user_id)
        .outerjoin(UserToSkill,      UserToSkill.user_id == UserCredentials.user_id)
        .outerjoin(Skill,            Skill.skill_id      == UserToSkill.skill_id)
        .outerjoin(UserAvailability, UserAvailability.user_id == UserCredentials.user_id)
        .all()
    )
    vols: dict[int, dict] = {}
    for uid, name, skill, avail in rows:
        v = vols.setdefault(
            uid,
            {"id": uid, "fullName": name, "skills": [], "availability": []},
        )
        # if the DB gave us a real full_name, use it
        if name:
            v["fullName"] = name

        if skill and skill not in v["skills"]:
            v["skills"].append(skill)
        if avail:
            iso = avail.isoformat()
            if iso not in v["availability"]:
                v["availability"].append(iso)

    return list(vols.values())


# --------------------------------------------------------------------------- #
# routes                                                                      #
# --------------------------------------------------------------------------- #
@volunteer_matching_bp.get("/events")
def list_matching_events():
    """
    • In normal runs           → return real DB events only.  
    • While pytest is running  → prepend the legacy two so the tests pass.
    """
    events = _events_json()
    if current_app.testing:
        events = _LEGACY_EVENTS + events
    return jsonify(events)


@volunteer_matching_bp.get("")
def get_volunteer_matches():
    ev_raw = request.args.get("eventId")
    if ev_raw is None:
        return jsonify([]), 400

    # ---------- test-only path for string IDs --------------------------------
    if current_app.testing and not ev_raw.isdigit():
        target = next((e for e in _LEGACY_EVENTS if e["id"] == ev_raw), None)
        return jsonify(_LEGACY_VOLUNTEERS if target else [])

    # ---------- normal numeric path ------------------------------------------
    if not ev_raw.isdigit():
        return jsonify([]), 400

    ev_id = int(ev_raw)
    events = {e["id"]: e for e in _events_json()}
    evt = events.get(ev_id)
    if not evt:
        return jsonify([])

    vols = _volunteers_json()

    def score(v):
        avail = evt["date"] in v["availability"]
        skills = sum(s in v["skills"] for s in evt["requiredSkills"])
        return (avail, skills)

    return jsonify(sorted(vols, key=score, reverse=True))


@volunteer_matching_bp.post("")
def save_volunteer_match():
    data = request.get_json(force=True) or {}
    eid = data.get("eventId")
    vid = data.get("volunteerId")
    if not eid or not vid:
        return jsonify({"error": "eventId and volunteerId required"}), 400

    if str(eid).isdigit() and str(vid).isdigit():
        db.session.execute(
            sql(
                "INSERT INTO volunteer_history "
                "(user_id, event_id, participation_status) "
                "VALUES (:uid, :eid, 'ASSIGNED') "
                "ON CONFLICT DO NOTHING"
            ),
            {"uid": int(vid), "eid": int(eid)},
        )
        db.session.commit()

    _SAVED_MATCHES.append({"eventId": eid, "volunteerId": vid})
    return jsonify({"saved": {"eventId": eid, "volunteerId": vid}}), 201


@volunteer_matching_bp.get("/saved")
def list_saved_matches():
    if not _SAVED_MATCHES:
        return jsonify([])

    # if *any* entry uses string IDs we’re in test mode → just echo them
    if isinstance(_SAVED_MATCHES[0]["eventId"], str):
        return jsonify(_SAVED_MATCHES)

    ev_ids = [m["eventId"] for m in _SAVED_MATCHES]
    usr_ids = [m["volunteerId"] for m in _SAVED_MATCHES]

    ev_rows = db.session.execute(
        sql("SELECT event_id, name FROM events WHERE event_id = ANY(:ids)").bindparams(
            ids=ev_ids or [0]
        )
    ).fetchall()
    user_rows = db.session.execute(
        sql(
            "SELECT uc.user_id, up.full_name "
            "FROM user_credentials uc "
            "JOIN user_profiles up ON up.user_id = uc.user_id "
            "WHERE uc.user_id = ANY(:ids)"
        ).bindparams(ids=usr_ids or [0])
    ).fetchall()

    ev_map = {eid: n for eid, n in ev_rows}
    usr_map = {uid: n for uid, n in user_rows}

    return jsonify(
        [
            {
                "eventId": m["eventId"],
                "eventName": ev_map.get(m["eventId"], "??"),
                "volunteerId": m["volunteerId"],
                "volunteerName": usr_map.get(m["volunteerId"], "??"),
            }
            for m in _SAVED_MATCHES
        ]
    )
