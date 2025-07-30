# app/routes/volunteer_matching.py
from flask import Blueprint, jsonify, request
from datetime import date

from app.imports import db
from app.models.events          import Events
from app.models.eventToSkill    import EventToSkill
from app.models.skill           import Skill
from app.models.userCredentials import UserCredentials
from app.models.userProfiles    import UserProfiles
from app.models.userToSkill     import UserToSkill
from app.models.userAvailability import UserAvailability

volunteer_matching_bp = Blueprint(
    "volunteer_matching",
    __name__,
    url_prefix="/volunteer/matching",
)

# ---------------------------------------------------------------------------
# helpers → group flat SQL rows into JSON shapes
# ---------------------------------------------------------------------------
def _events_json() -> list[dict]:
    """
    Return every event with its required skill names, shaped like:
      { id, name, requiredSkills, urgency, date }
    """
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
    """
    Return every volunteer with skills & availability:
      { id, fullName, skills, availability }
    """
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


# keep simple in-memory list for saved matches
_SAVED_MATCHES: list[dict] = []

# ---------------------------------------------------------------------------
# routes
# ---------------------------------------------------------------------------
@volunteer_matching_bp.get("/events")
def list_matching_events():
    """GET /volunteer/matching/events  → list all events"""
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

    # fetch event (and its required skills) once
    events = {ev["id"]: ev for ev in _events_json()}
    event = events.get(event_id)
    if not event:
        return jsonify([])  # unknown event id

    vols = _volunteers_json()

    def score(vol: dict) -> tuple[int, int]:
        """(available_today, skill_match_count)"""
        available = 1 if event["date"] in vol["availability"] else 0
        skill_ct  = sum(1 for s in event["requiredSkills"] if s in vol["skills"])
        return (available, skill_ct)

    ranked = sorted(vols, key=score, reverse=True)
    return jsonify(ranked)


@volunteer_matching_bp.post("")
def save_volunteer_match():
    """
    POST /volunteer/matching   Body: { "eventId": <int>, "volunteerId": <int> }
    Stores match in memory (demo); in production you’d insert a row.
    """
    data = request.get_json(force=True) or {}
    try:
        eid = int(data.get("eventId"))
        vid = int(data.get("volunteerId"))
    except (TypeError, ValueError):
        return jsonify({"error": "eventId and volunteerId must be int"}), 400

    _SAVED_MATCHES.append({"eventId": eid, "volunteerId": vid})
    return jsonify({"saved": {"eventId": eid, "volunteerId": vid}}), 201


@volunteer_matching_bp.get("/saved")
def list_saved_matches():
    """GET /volunteer/matching/saved  →  include names as well as IDs."""
    if not _SAVED_MATCHES:
        return jsonify([])

    event_ids      = {m["eventId"]      for m in _SAVED_MATCHES}
    volunteer_ids  = {m["volunteerId"]  for m in _SAVED_MATCHES}

    # Pull names in one round-trip each
    ev_rows = db.session.execute(
        db.text("SELECT event_id, name FROM events WHERE event_id = ANY(:ids)")
          .bindparams(ids=list(event_ids))
    ).fetchall()
    user_rows = db.session.execute(
        db.text(
            "SELECT uc.user_id, up.full_name "
            "FROM user_credentials uc "
            "JOIN user_profiles up ON up.user_id = uc.user_id "
            "WHERE uc.user_id = ANY(:ids)"
        ).bindparams(ids=list(volunteer_ids))
    ).fetchall()

    event_map = {eid: n for eid, n in ev_rows}
    user_map  = {uid: n for uid, n in user_rows}

    enriched = [
        {
            "eventId":      m["eventId"],
            "eventName":    event_map.get(m["eventId"], "??"),
            "volunteerId":  m["volunteerId"],
            "volunteerName":user_map.get(m["volunteerId"], "??"),
        }
        for m in _SAVED_MATCHES
    ]
    return jsonify(enriched)