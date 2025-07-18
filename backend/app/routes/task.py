from flask import Blueprint, request, jsonify

task_list_bp = Blueprint('task_list', __name__)

_tasks = [
    {
        "id": 1,
        "title": "Task 1",
        "description": "Description for Task 1",
        "status": "In Progress",
        "assignee": "volunteer1@example.com"
    },
    {
        "id": 2,
        "title": "Task 2",
        "description": "Description for Task 2",
        "status": "Completed",
        "assignee": "volunteer2@example.com"
    }
]

@task_list_bp.route("", methods=["GET"])
def get_tasks():
    return jsonify(_tasks)
