# app/routes/task_list.py

from flask import Blueprint, request, jsonify

task_list_bp = Blueprint("task_list", __name__)

# ――― Dummy in‐memory tasks store with description + assignee ―――
_tasks = [
    {
      "id": "t1",
      "title": "Community Clean-Up",
      "description": "Pick up litter and debris in the community park.",
      "date": "2025-07-10",
      "status": "assigned",         # admin has assigned this
      "assignee": "volunteer1@example.com"
    },
    {
      "id": "t2",
      "title": "Food Drive",
      "description": "Sort and package the incoming food donations.",
      "date": "2025-07-05",
      "status": "registered",       # volunteer already registered
      "assignee": "volunteer2@example.com"
    },
    {
      "id": "t3",
      "title": "Tree Planting Review",
      "description": "Inspect and report on last month’s plantings.",
      "date": "2025-06-20",
      "status": "completed",        # past event
      "assignee": "volunteer1@example.com"
    },
]

@task_list_bp.route("", methods=["GET"])
def get_tasks():
    """
    GET /tasks
    Returns the list of tasks with description & assignee.
    """
    return jsonify(_tasks)


@task_list_bp.route("/status", methods=["POST"])
def update_task_status():
    """
    POST /tasks/status
    Body JSON: { taskId: string, status: string }
    """
    data = request.get_json() or {}
    task_id = data.get("taskId")
    new_status = data.get("status")
    if not task_id or not new_status:
        return jsonify({"error": "taskId and status required"}), 400

    for task in _tasks:
        if task["id"] == task_id:
            task["status"] = new_status
            return jsonify({"taskId": task_id, "status": new_status}), 200

    return jsonify({"error": "Task not found"}), 404
