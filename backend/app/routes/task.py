# backend/app/routes/task.py
from __future__ import annotations

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.imports import db
from app.models.volunteerHistory import VolunteerHistory, ParticipationStatusEnum
from app.models.events           import Events
from app.models.userCredentials  import UserCredentials

task_list_bp = Blueprint("task_list", __name__, url_prefix="/tasks")

# ───────────────────────────────────────── helpers ──────────────────────────
def _task_row(vh: VolunteerHistory, ev: Events, assignee_email: str) -> dict:
    """Return the JSON shape expected by the React TaskList."""
    # map our internal ATTENDED enum back to "completed" for the client
    status = vh.participation_status.name.lower()
    if status == "attended":
        status = "completed"

    return {
        "id":          str(vh.vol_history_id),
        "title":       ev.name,
        "description": ev.description,
        "date":        ev.date.date().isoformat(),
        "status":      status,
        "assignee":    assignee_email,
    }

# ───────────────────────────────────────── routes ───────────────────────────
@task_list_bp.get("")                 # GET /tasks
@jwt_required()
def list_my_tasks() -> tuple[list[dict], int]:
    """Return every task that belongs to the *current* volunteer."""
    uid = int(get_jwt_identity())     # ← cast JWT “sub” to int

    rows = (
        db.session.query(
            VolunteerHistory,
            Events,
            UserCredentials.email,
        )
        .join(Events,          Events.event_id        == VolunteerHistory.event_id)
        .join(UserCredentials, UserCredentials.user_id == VolunteerHistory.user_id)
        .filter(VolunteerHistory.user_id == uid)
        .order_by(VolunteerHistory.vol_history_id)
        .all()
    )

    tasks = [_task_row(vh, ev, email) for vh, ev, email in rows]
    return jsonify(tasks), 200


@task_list_bp.post("/status")         # POST /tasks/status
@jwt_required()
def update_task_status() -> tuple[dict, int]:
    """
    Body: { "taskId": <vol_history_id>, "status": "assigned" | "registered" }
    Only the owner can change their own task row.
    """
    uid = int(get_jwt_identity())     # ← same cast here
    data = request.get_json(force=True) or {}

    task_id    = data.get("taskId")
    new_status = data.get("status")

    if not task_id or new_status not in {"assigned", "registered"}:
        return jsonify({"error": "taskId and valid status required"}), 400

    vh: VolunteerHistory | None = db.session.get(VolunteerHistory, int(task_id))
    if not vh or vh.user_id != uid:
        return jsonify({"error": "Task not found"}), 404

    vh.participation_status = ParticipationStatusEnum[new_status.upper()]
    db.session.commit()

    return jsonify({"taskId": task_id, "status": new_status}), 200
