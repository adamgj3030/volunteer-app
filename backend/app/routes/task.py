# app/routes/task_list.py
# app/routes/task.py
from flask import Blueprint, jsonify, request
from sqlalchemy import update
from app.imports import db
from app.models.volunteerHistory import (
    VolunteerHistory,
    ParticipationStatusEnum,
)
from app.models.events import Events
from app.models.userCredentials import UserCredentials

task_list_bp = Blueprint("task_list", __name__, url_prefix="/tasks")

# ── helpers ─────────────────────────────────────────────────────────────
_DB_TO_JSON = {
    ParticipationStatusEnum.ASSIGNED:   "assigned",
    ParticipationStatusEnum.REGISTERED: "registered",
    ParticipationStatusEnum.ATTENDED:   "completed",
    ParticipationStatusEnum.CANCELLED:  "cancelled",
    ParticipationStatusEnum.NO_SHOW:    "no_show",
}
_JSON_TO_DB = {v: k for k, v in _DB_TO_JSON.items()}

def _tasks_from_db(volunteer_id: int) -> list[dict]:
    rows = (
        db.session.query(
            VolunteerHistory.vol_history_id,
            VolunteerHistory.participation_status,
            Events.name,
            Events.description,
            Events.date,
            UserCredentials.email,
        )
        .join(Events, Events.event_id == VolunteerHistory.event_id)
        .join(UserCredentials, UserCredentials.user_id == VolunteerHistory.user_id)
        .filter(VolunteerHistory.user_id == volunteer_id)
        .all()
    )

    return [
        {
            "id":        str(tid),
            "title":     title,
            "description": desc,
            "date":      dt.date().isoformat(),
            "status":    _DB_TO_JSON.get(stat, "assigned"),
            "assignee":  email,
        }
        for tid, stat, title, desc, dt, email in rows
    ]

# ── routes ──────────────────────────────────────────────────────────────
@task_list_bp.get("")
def get_tasks():
    """
    GET /tasks?volunteerId=<int>
    Returns only tasks for that volunteer.
    """
    uid = request.args.get("volunteerId", type=int)
    if uid is None:
        return jsonify({"error": "volunteerId required"}), 400

    tasks = _tasks_from_db(uid)
    tasks.sort(key=lambda t: t["date"], reverse=True)
    return jsonify(tasks)


@task_list_bp.post("/status")
def update_task_status():
    """
    POST /tasks/status
    Body JSON: { taskId: string, status: string, volunteerId: int }
    Only the owner of the task may change its status.
    """
    data       = request.get_json() or {}
    task_id    = data.get("taskId")
    new_status = data.get("status")
    uid_raw    = data.get("volunteerId")
    uid        = int(uid_raw) if uid_raw is not None else None

    if not all([task_id, new_status, uid]):
        return jsonify({"error": "taskId, status, volunteerId required"}), 400
    if new_status not in _JSON_TO_DB:
        return jsonify({"error": "invalid status"}), 400
    if not task_id.isdigit():
        return jsonify({"error": "Task not found"}), 404

    vh_id = int(task_id)
    stmt  = (
        update(VolunteerHistory)
        .where(
            VolunteerHistory.vol_history_id == vh_id,
            VolunteerHistory.user_id == uid,               # ownership check
        )
        .values(participation_status=_JSON_TO_DB[new_status])
    )
    result = db.session.execute(stmt)
    if result.rowcount:
        db.session.commit()
        return jsonify({"taskId": task_id, "status": new_status}), 200
    return jsonify({"error": "Task not found or forbidden"}), 404
