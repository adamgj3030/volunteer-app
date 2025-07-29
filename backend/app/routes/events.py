# backend/app/routes/events.py
from __future__ import annotations

from datetime import datetime
from typing import Any

from flask import Blueprint, jsonify, request
import socketio                                   # same Socket.IO instance you already use

from app.imports import db
from app.models.events import Events, UrgencyEnum

events_bp = Blueprint("events", __name__)

# ─────────────────────────────────────────────────────────────────────────────
# helpers
# ─────────────────────────────────────────────────────────────────────────────
def _serialize(event: Events) -> dict[str, Any]:
    """Convert an Events row → plain JSON‑safe dict."""
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
        "skills":      event.skills or [],        # NEW
    }


# ─────────────────────────────────────────────────────────────────────────────
# list endpoints
# ─────────────────────────────────────────────────────────────────────────────
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


# ─────────────────────────────────────────────────────────────────────────────
# single‑row CRUD
# ─────────────────────────────────────────────────────────────────────────────
@events_bp.get("/<int:event_id>")
def get_event(event_id: int):
    row = Events.query.get_or_404(event_id)
    return jsonify(_serialize(row)), 200


@events_bp.post("/create")
def create_event():
    data = request.get_json(force=True) or {}

    new_row = Events(
        name        = data["name"],
        description = data["description"],
        address     = data.get("address"),
        city        = data.get("city"),
        state_id    = data["state_id"],
        zipcode     = data.get("zipcode"),
        urgency     = UrgencyEnum[data["urgency"]],
        date        = datetime.fromisoformat(data["date"]),
        skills      = data.get("skills", []),       # NEW
    )

    db.session.add(new_row)
    db.session.commit()

    socketio.emit(
        "event_assigned",
        {
            **_serialize(new_row),
            "message": f"🆕 New event '{new_row.name}' has been created!",
        },
        broadcast=True,
    )

    return jsonify({"event_id": new_row.event_id}), 201


@events_bp.patch("/<int:event_id>")
def update_event(event_id: int):
    row  = Events.query.get_or_404(event_id)
    data = request.get_json(force=True) or {}

    # Only update fields we received
    if "name"        in data: row.name        = data["name"]
    if "description" in data: row.description = data["description"]
    if "address"     in data: row.address     = data["address"]
    if "city"        in data: row.city        = data["city"]
    if "state_id"    in data: row.state_id    = data["state_id"]
    if "zipcode"     in data: row.zipcode     = data["zipcode"]
    if "urgency"     in data: row.urgency     = UrgencyEnum[data["urgency"]]
    if "date"        in data: row.date        = datetime.fromisoformat(data["date"])
    if "skills"      in data: row.skills      = data["skills"]        # NEW

    db.session.commit()

    socketio.emit(
        "event_update",
        {
            **_serialize(row),
            "message": f"📅 Event '{row.name}' has been updated.",
        },
        broadcast=True,
    )

    return jsonify({"ok": True}), 200
