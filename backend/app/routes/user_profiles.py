from __future__ import annotations

from typing import Any, Dict

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from sqlalchemy import select

from app.imports import db
from app.models.userProfiles import UserProfiles
from app.models.userToSkill import UserToSkill
from app.models.userAvailability import UserAvailability
from app.models.skill import Skill

from app.utils.profile_validation import validate_profile_payload

users_profiles_bp = Blueprint("users_profiles", __name__)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _load(uid: int) -> UserProfiles | None:
    return db.session.get(UserProfiles, uid)


def _serialize_profile(profile: UserProfiles) -> dict:
    # Pull both skills + availability
    return profile.to_dict(include_skills=True, include_availability=True)


def _apply_profile_changes(uid: int, payload: dict) -> tuple[UserProfiles, bool]:
    """
    Create or update profile + related skills + availability.

    Returns (profile, created_bool).
    """
    prof = db.session.get(UserProfiles, uid)
    created = False

    if prof is None:
        created = True
        prof = UserProfiles(
            user_id=uid,
            state_id=payload["state"],
            full_name=payload["full_name"],
            address1=payload["address1"],
            address2=payload.get("address2"),
            city=payload["city"],
            zipcode=payload["zipcode"],
            preferences=payload.get("preferences"),
        )
        db.session.add(prof)
    else:
        prof.state_id = payload["state"]
        prof.full_name = payload["full_name"]
        prof.address1 = payload["address1"]
        prof.address2 = payload.get("address2")
        prof.city = payload["city"]
        prof.zipcode = payload["zipcode"]
        prof.preferences = payload.get("preferences")

    # Replace skills ------------------------------------------------------
    db.session.query(UserToSkill).filter_by(user_id=uid).delete(synchronize_session=False)
    for sid in payload["skills"]:
        db.session.add(UserToSkill(user_id=uid, skill_id=sid))

    # Replace availability ------------------------------------------------
    db.session.query(UserAvailability).filter_by(user_id=uid).delete(synchronize_session=False)
    for ds in payload["availability"]:  # iso yyyy-mm-dd
        db.session.add(UserAvailability(user_id=uid, available_date=ds))

    return prof, created

# ---------------------------------------------------------------------------
# Routes (all require auth)
# ---------------------------------------------------------------------------

@users_profiles_bp.get("/me")
@jwt_required()
def get_my_profile():
    uid  = get_jwt_identity()
    prof = _load(uid)
    if not prof:
        # Return empty shell so UI can render form
        return jsonify({"profile": None}), 200
    return jsonify({"profile": _serialize_profile(prof)}), 200


@users_profiles_bp.post("/me")
@jwt_required()
def create_or_update_my_profile():
    uid = get_jwt_identity()
    data = request.get_json(silent=True) or {}

    try:
        norm = validate_profile_payload(data)
    except ValueError as exc:
        errs = exc.args[0] if exc.args and isinstance(exc.args[0], dict) else {"_": str(exc)}
        return jsonify({"error": "validation_error", "fields": errs}), 400

    prof, created = _apply_profile_changes(uid, norm)
    db.session.commit()
    return jsonify({"profile": _serialize_profile(prof), "created": created}), 200


@users_profiles_bp.patch("/me")
@jwt_required()
def patch_my_profile():
    # Same as POST but we merge incoming subset of fields with existing values
    uid = get_jwt_identity()
    prof = _load(uid)
    if not prof:
        return jsonify({"error": "not_found", "message": "Profile does not exist."}), 404

    data = request.get_json(silent=True) or {}
    # Build full dataset from current profile + patch
    full = prof.to_dict(include_skills=True, include_availability=True)
    full.update(data)

    try:
        norm = validate_profile_payload(full)
    except ValueError as exc:
        errs = exc.args[0] if exc.args and isinstance(exc.args[0], dict) else {"_": str(exc)}
        return jsonify({"error": "validation_error", "fields": errs}), 400

    _apply_profile_changes(uid, norm)
    db.session.commit()
    return jsonify({"profile": _serialize_profile(prof)}), 200