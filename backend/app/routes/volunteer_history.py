from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.imports import db
from app.models.userCredentials import UserCredentials, User_Roles
from app.models.userProfiles    import UserProfiles
from app.models.volunteerHistory import VolunteerHistory
from app.models.events          import Events
from app.models.eventToSkill    import EventToSkill
from app.models.skill           import Skill

volunteer_history_bp = Blueprint(
    "volunteer_history",
    __name__,
    url_prefix="/volunteer/history",
)

@volunteer_history_bp.get("")
@volunteer_history_bp.get("/")
@jwt_required()
def list_volunteer_history():
    # Only ADMIN can call
    uid = int(get_jwt_identity())
    user = db.session.query(UserCredentials).get(uid)
    if not user or user.role != User_Roles.ADMIN:
        return jsonify({"error": "Forbidden"}), 403

    rows = (
        db.session.query(
            UserCredentials.user_id,
            UserCredentials.email,
            UserProfiles.full_name,
            VolunteerHistory.vol_history_id,
            VolunteerHistory.participation_status,
            Events.event_id,
            Events.name.label("event_name"),
            Events.description,
            Events.address,
            Events.city,
            Events.state_id,
            Events.urgency,
            Events.date,
            Skill.skill_name,
        )
        .outerjoin(UserProfiles, UserProfiles.user_id == UserCredentials.user_id)
        .join(VolunteerHistory, VolunteerHistory.user_id == UserCredentials.user_id)
        .join(Events, Events.event_id == VolunteerHistory.event_id)
        .outerjoin(EventToSkill, EventToSkill.event_id == Events.event_id)
        .outerjoin(Skill, Skill.skill_id == EventToSkill.skill_code)
        .order_by(UserCredentials.user_id, VolunteerHistory.vol_history_id)
        .all()
    )

    users: dict[int, dict] = {}
    for r in rows:
        u = users.setdefault(
            r.user_id,
            {"email": r.email, "name": r.full_name, "events": {}},
        )
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
        if r.skill_name and r.skill_name not in evt["requiredSkills"]:
            evt["requiredSkills"].append(r.skill_name)

    payload = []
    for u in users.values():
        u["events"] = list(u["events"].values())
        payload.append(u)

    return jsonify(payload)
