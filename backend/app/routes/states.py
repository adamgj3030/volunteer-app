from flask import Blueprint, jsonify

from app.imports import db
from app.models.state import States

states_bp = Blueprint("states", __name__)

@states_bp.get("/")
def list_states():
    rows = db.session.query(States).order_by(States.name).all()
    return jsonify({
        "states": [
            {"code": r.state_id, "name": r.name} for r in rows
        ]
    }), 200