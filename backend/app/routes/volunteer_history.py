from flask import Blueprint, jsonify
from sqlalchemy import func

from app.imports import db
from app.models.userCredentials import UserCredentials
from app.models.userProfiles import UserProfiles
from app.models.volunteerHistory import VolunteerHistory
from app.models.events import Events
from app.models.eventToSkill import EventToSkill
from app.models.skill import Skill

volunteer_history_bp = Blueprint("volunteer_history", __name__)

# ---------------------------------------------------------------------------
# GET /volunteer/history  or  /volunteer/history/
# ---------------------------------------------------------------------------
@volunteer_history_bp.route("", methods=["GET"])
@volunteer_history_bp.route("/", methods=["GET"])
def get_volunteer_history():
    """
    Returns data in the exact structure your React component already expects,
    but built with one explicit SQL join instead of SQLAlchemy relationships.
    """

    # ---- 1) Pull a "flat" result set ------------------------------------------------
    rows = (
        db.session.query(
            UserCredentials.user_id,
            UserCredentials.email,
            UserProfiles.full_name,
            VolunteerHistory.vol_history_id,          # unique per user-event pairing
            VolunteerHistory.participation_status,
            Events.event_id,
            Events.name.label("event_name"),
            Events.description,
            Events.address,
            Events.city,
            Events.state_id,
            Events.urgency,
            Events.date,
            Skill.skill_name,                         # may be NULL if no skills linked
        )
        .join(UserProfiles, UserProfiles.user_id == UserCredentials.user_id)
        .join(VolunteerHistory, VolunteerHistory.user_id == UserCredentials.user_id)
        .join(Events, Events.event_id == VolunteerHistory.event_id)
        .outerjoin(EventToSkill, EventToSkill.event_id == Events.event_id)
        .outerjoin(Skill, Skill.skill_id == EventToSkill.skill_code)
        .order_by(UserCredentials.user_id, VolunteerHistory.vol_history_id)
        .all()
    )

    # ---- 2) Reshape flat rows → nested JSON ----------------------------------------
    users = {}  # user_id ➜ dict we’ll return

    for r in rows:
        # Create / fetch the user bucket
        u = users.setdefault(
            r.user_id,
            {
                "email": r.email,
                "name":  r.full_name,
                "events": {},          # temp dict keyed by vol_history_id
            },
        )

        # Create / fetch the event bucket inside that user
        evt = u["events"].setdefault(
            r.vol_history_id,
            {
                "eventName":     r.event_name,
                "description":   r.description,
                "location":      ", ".join(p for p in (r.address, r.city, r.state_id) if p),
                "requiredSkills": [],
                "urgency":       r.urgency.name.capitalize(),
                "eventDate":     r.date.date().isoformat(),
                "status":        r.participation_status.name.capitalize(),
            },
        )

        # Add a skill into requiredSkills (avoid duplicates, handle NULL)
        if r.skill_name and r.skill_name not in evt["requiredSkills"]:
            evt["requiredSkills"].append(r.skill_name)

    # ---- 3) Strip the temporary inner keys and build the final list ---------------
    payload = []
    for u in users.values():
        u["events"] = list(u["events"].values())
        payload.append(u)

    return jsonify(payload)