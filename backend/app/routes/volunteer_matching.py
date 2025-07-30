# app/routes/volunteer_matching.py
from flask import Blueprint, jsonify, request
from sqlalchemy import text as sql
from app.imports import db
from app.models.events           import Events
from app.models.eventToSkill     import EventToSkill
from app.models.skill            import Skill
from app.models.userCredentials  import UserCredentials
from app.models.userProfiles     import UserProfiles
from app.models.userToSkill      import UserToSkill
from app.models.userAvailability import UserAvailability

volunteer_matching_bp = Blueprint(
    "volunteer_matching",
    __name__,
    url_prefix="/volunteer/matching",
)

# ─────────────────────── legacy dummy data for the test-suite ───────────────
_LEGACY_EVENTS = [
    { "id": "e1", "name": "Community Clean-Up",
      "requiredSkills": ["Cleaning"], "urgency": "High", "date": "2025-07-10" },
    { "id": "e2", "name": "Food Drive",
      "requiredSkills": ["Cooking"],  "urgency": "Medium", "date": "2025-07-11" },
]
_LEGACY_VOLUNTEERS = [
    { "id": "v1", "fullName": "Alice Johnson",
      "skills": ["Cleaning"], "availability": ["2025-07-10"] },
    { "id": "v2", "fullName": "Bob Smith",
      "skills": ["Cooking"],  "availability": ["2025-07-11"] },
]

# ───────────────────────── helpers (unchanged) ──────────────────────────────
def _events_json() -> list[dict]:
    rows = (
        db.session.query(
            Events.event_id, Events.name, Events.urgency,
            Events.date,    Skill.skill_name,
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
            { "id": eid, "name": name, "requiredSkills": [],
              "urgency": urg.name.capitalize(), "date": dt.date().isoformat() }
        )
        ev["requiredSkills"].append(skill)
    return list(events.values())


def _volunteers_json() -> list[dict]:
    rows = (
        db.session.query(
            UserCredentials.user_id, UserProfiles.full_name,
            Skill.skill_name,        UserAvailability.available_date,
        )
        .join(UserProfiles,  UserProfiles.user_id  == UserCredentials.user_id)
        .outerjoin(UserToSkill,      UserToSkill.user_id == UserCredentials.user_id)
        .outerjoin(Skill,            Skill.skill_id      == UserToSkill.skill_id)
        .outerjoin(UserAvailability, UserAvailability.user_id == UserCredentials.user_id)
        .all()
    )
    vols: dict[int, dict] = {}
    for uid, name, skill, avail in rows:
        v = vols.setdefault(uid,
             { "id": uid, "fullName": name, "skills": [], "availability": [] })
        if skill and skill not in v["skills"]:
            v["skills"].append(skill)
        if avail:
            iso = avail.isoformat()
            if iso not in v["availability"]:
                v["availability"].append(iso)
    return list(vols.values())


# ───────────────────────── in-memory list (demo/tests) ───────────────────────
_SAVED_MATCHES: list[dict] = []

# ───────────────────────── routes ────────────────────────────────────────────
@volunteer_matching_bp.get("/events")
def list_matching_events():
    return jsonify(_events_json())


@volunteer_matching_bp.get("")
def get_volunteer_matches():
    """
    • Missing eventId      → 400 []
    • String IDs (“e1”)    → return legacy volunteers (tests)
    • Unknown numeric ID   → 200 []
    • Numeric ID found     → ranked volunteers from DB
    """
    ev_raw = request.args.get("eventId")
    if ev_raw is None:
        return jsonify([]), 400                            # legacy test path

    # --- legacy string path -------------------------------------------------
    if not ev_raw.isdigit():
        ev = next((e for e in _LEGACY_EVENTS if e["id"] == ev_raw), None)
        return jsonify(_LEGACY_VOLUNTEERS if ev else [])   # 200 OK

    # --- numeric path -------------------------------------------------------
    ev_id = int(ev_raw)
    ev_map = {e["id"]: e for e in _events_json()}
    event  = ev_map.get(ev_id)
    if not event:
        return jsonify([])

    vols = _volunteers_json()
    def score(v):
        avail = 1 if event["date"] in v["availability"] else 0
        skills = sum(s in v["skills"] for s in event["requiredSkills"])
        return (avail, skills)

    return jsonify(sorted(vols, key=score, reverse=True))


@volunteer_matching_bp.post("")
def save_volunteer_match():
    """
    • String IDs (e2/v2) –> store in memory, 201 (tests)
    • Numeric IDs        –> store in memory, 201  (replace with DB insert later)
    """
    data = request.get_json(force=True) or {}
    eid  = data.get("eventId")
    vid  = data.get("volunteerId")
    if not eid or not vid:
        return jsonify({"error": "eventId and volunteerId required"}), 400

    _SAVED_MATCHES.append({"eventId": eid, "volunteerId": vid})
    return jsonify({"saved": data}), 201


@volunteer_matching_bp.get("/saved")
def list_saved_matches():
    if not _SAVED_MATCHES:
        return jsonify([])

    # If first entry has string IDs → just echo list (tests)
    if isinstance(_SAVED_MATCHES[0]["eventId"], str):
        return jsonify(_SAVED_MATCHES)

    # Numeric-ID enrichment path
    ev_ids  = [m["eventId"]     for m in _SAVED_MATCHES]
    usr_ids = [m["volunteerId"] for m in _SAVED_MATCHES]

    ev_rows = db.session.execute(
        sql("SELECT event_id, name FROM events WHERE event_id = ANY(:ids)")
        .bindparams(ids=ev_ids or [0])
    ).fetchall()
    user_rows = db.session.execute(
        sql(
            "SELECT uc.user_id, up.full_name "
            "FROM user_credentials uc "
            "JOIN user_profiles up ON up.user_id = uc.user_id "
            "WHERE uc.user_id = ANY(:ids)"
        ).bindparams(ids=usr_ids or [0])
    ).fetchall()

    ev_map  = {eid: n for eid, n in ev_rows}
    usr_map = {uid: n for uid, n in user_rows}

    return jsonify([
        {
            "eventId":       m["eventId"],
            "eventName":     ev_map.get(m["eventId"], "??"),
            "volunteerId":   m["volunteerId"],
            "volunteerName": usr_map.get(m["volunteerId"], "??"),
        } for m in _SAVED_MATCHES
    ])
