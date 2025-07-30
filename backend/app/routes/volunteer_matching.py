from flask import Blueprint, jsonify, request
from datetime import date

from sqlalchemy import select
from sqlalchemy import text as sql

from app.imports import db
from app.models.events           import Events
from app.models.eventToSkill     import EventToSkill
from app.models.skill            import Skill
from app.models.userCredentials  import UserCredentials
from app.models.userProfiles     import UserProfiles
from app.models.userToSkill      import UserToSkill
from app.models.userAvailability import UserAvailability
from app.models.volunteerHistory import VolunteerHistory, ParticipationStatusEnum

volunteer_matching_bp = Blueprint(
    "volunteer_matching",
    __name__,
    url_prefix="/volunteer/matching",
)

# ---------------------------------------------------------------------------
# helpers → group flat SQL rows into JSON shapes
# ---------------------------------------------------------------------------

def _events_json() -> list[dict]:
    """Return every event with its required skill names."""
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
    """Return every volunteer with skills & availability."""
    rows = (
        db.session.query(
            UserCredentials.user_id,
            UserProfiles.full_name,
            Skill.skill_name,
            UserAvailability.available_date,
        )
        .join(UserProfiles, UserProfiles.user_id == UserCredentials.user_id)
        .outerjoin(UserToSkill, UserToSkill.user_id == UserCredentials.user_id)
        .outerjoin(Skill, Skill.skill_id == UserToSkill.skill_id)
        .outerjoin(UserAvailability, UserAvailability.user_id == UserCredentials.user_id)
        .all()
    )

    vols: dict[int, dict] = {}
    for uid, name, skill, avail_date in rows:
        v = vols.setdefault(
            uid,
            {"id": uid, "fullName": name, "skills": [], "availability": []},
        )
        if skill and skill not in v["skills"]:
            v["skills"].append(skill)
        if avail_date:
            iso = avail_date.isoformat()
            if iso not in v["availability"]:
                v["availability"].append(iso)

    return list(vols.values())

# ---------------------------------------------------------------------------
# routes
# ---------------------------------------------------------------------------

@volunteer_matching_bp.get("/events")
def list_matching_events():
    """GET /volunteer/matching/events"""
    return jsonify(_events_json())


@volunteer_matching_bp.get("")
def get_volunteer_matches():
    """
    GET /volunteer/matching?eventId=<id>
    Score volunteers for that event (availability + skill matches).
    """
    try:
        event_id = int(request.args.get("eventId", ""))
    except ValueError:
        return jsonify({"error": "eventId must be int"}), 400

    events = {ev["id"]: ev for ev in _events_json()}
    event  = events.get(event_id)
    if not event:
        return jsonify([])

    vols = _volunteers_json()

    def score(vol):
        available  = 1 if event["date"] in vol["availability"] else 0
        skill_ct   = sum(1 for s in event["requiredSkills"] if s in vol["skills"])
        return (available, skill_ct)

    ranked = sorted(vols, key=score, reverse=True)
    return jsonify(ranked)


@volunteer_matching_bp.post("")
def save_volunteer_match():
    """
    POST /volunteer/matching
    Body: { "eventId": int, "volunteerId": int }
    → Inserts ASSIGNED row into volunteer_history.
    """
    data = request.get_json(force=True) or {}
    try:
        eid = int(data["eventId"])
        vid = int(data["volunteerId"])
    except (KeyError, ValueError):
        return jsonify({"error": "eventId and volunteerId must be int"}), 400

    # Insert; ignore duplicates via PK/unique on (user_id, event_id)
    db.session.execute(
        sql(
            "INSERT INTO volunteer_history "
            "(user_id, event_id, participation_status) "
            "VALUES (:uid, :eid, 'ASSIGNED') "
            "ON CONFLICT DO NOTHING"
        ),
        {"uid": vid, "eid": eid},
    )
    db.session.commit()

    return jsonify({"saved": {"eventId": eid, "volunteerId": vid}}), 201


@volunteer_matching_bp.get("/saved")
def list_saved_matches():
    """
    GET /volunteer/matching/saved
    Returns rows currently in ASSIGNED state, joined with names.
    """
    rows = db.session.execute(
        sql(
            "SELECT vh.event_id, e.name, vh.user_id, up.full_name "
            "FROM volunteer_history vh "
            "JOIN events e         ON e.event_id  = vh.event_id "
            "JOIN user_profiles up ON up.user_id  = vh.user_id "
            "WHERE vh.participation_status = 'ASSIGNED'"
        )
    ).fetchall()

    return jsonify(
        [
            {
                "eventId":        eid,
                "eventName":      ename,
                "volunteerId":    uid,
                "volunteerName":  vname,
            }
            for eid, ename, uid, vname in rows
        ]
    )
