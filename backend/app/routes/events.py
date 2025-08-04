# app/routes/events.py
from __future__ import annotations

from datetime import datetime

from flask import Blueprint, jsonify, request


from app.imports import db, socketio 
from app.models.events import Events, UrgencyEnum

events_bp = Blueprint("events", __name__)

# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------
def _serialize(event: Events) -> dict:
    """Convert SQLAlchemy row → plain dict."""
    return {
        "event_id":    event.event_id,
        "name":        event.name,
        "description": event.description,
        "address":     event.address,
        "city":        event.city,
        "state_id":    event.state_id,
        "zipcode":     event.zipcode,
        "urgency":     event.urgency.name,
        "date":        event.date.isoformat(),
    }


# ---------------------------------------------------------------------------
# list endpoints – new
# ---------------------------------------------------------------------------
@events_bp.get("/upcoming")
def list_upcoming_events():
    now = datetime.utcnow()
    rows = (
        Events.query
        .filter(Events.date >= now)
        .order_by(Events.date)
        .all()
    )
    return jsonify([_serialize(r) for r in rows]), 200


@events_bp.get("/past")
def list_past_events():
    now = datetime.utcnow()
    rows = (
        Events.query
        .filter(Events.date < now)
        .order_by(Events.date.desc())
        .all()
    )
    return jsonify([_serialize(r) for r in rows]), 200


# ---------------------------------------------------------------------------
# single‑row CRUD (mostly unchanged – small tweaks)
# ---------------------------------------------------------------------------
@events_bp.get("/<int:event_id>")
def get_event(event_id: int):
    row = Events.query.get_or_404(event_id)
    return jsonify(_serialize(row)), 200


@events_bp.post("/create")
def create_event():
    data = request.get_json(force=True)
    new_row = Events(
        name        = data["name"],
        description = data["description"],
        address     = data.get("address"),
        city        = data.get("city"),
        state_id    = data["state_id"],
        zipcode     = data.get("zipcode"),
        urgency     = UrgencyEnum[data["urgency"]],
        date        = datetime.fromisoformat(data["date"]),
    )
    db.session.add(new_row)
    db.session.commit()
    
    assigned_user_id = data.get("assigned_user_id")  # make sure frontend sends this

    if not assigned_user_id:
        return jsonify({"error": "Missing assigned_user_id"}), 400


    socketio.emit(
        "event_assigned",
        {
            **_serialize(new_row),
            "message": f"🆕 New event '{new_row.name}' has been created!",
        },
        to=str(assigned_user_id)  # 🎯 emit to specific user’s socket room
    )


    return jsonify({"event_id": new_row.event_id}), 201


@events_bp.patch("/<int:event_id>")
def update_event(event_id: int):
    row  = Events.query.get_or_404(event_id)
    data = request.get_json(force=True)

    # only update what we’re sent
    row.name        = data.get("name", row.name)
    row.description = data.get("description", row.description)
    row.address     = data.get("address", row.address)
    row.city        = data.get("city", row.city)
    row.state_id    = data.get("state_id", row.state_id)
    row.zipcode     = data.get("zipcode", row.zipcode)
    row.urgency     = UrgencyEnum[data.get("urgency", row.urgency.name)]
    if "date" in data:
        row.date = datetime.fromisoformat(data["date"])

    db.session.commit()

    socketio.emit(
        "event_update",
        {**_serialize(row),
        "message": f"📅 Event '{row.name}' has been updated."},
        # broadcast=True
    )

    return jsonify({"ok": True}), 200
