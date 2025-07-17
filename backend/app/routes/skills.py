from __future__ import annotations

from flask import Blueprint, jsonify

from app.imports import db
from app.models.skill import Skill

skills_bp = Blueprint("skills", __name__)

@skills_bp.get("/")
def list_skills():
    rows = db.session.query(Skill).order_by(Skill.skill_name).all()
    return jsonify({
        "skills": [
            {"id": r.skill_id, "name": r.skill_name, "level": r.level.name} for r in rows
        ]
    }), 200