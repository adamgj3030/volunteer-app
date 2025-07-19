from flask import Blueprint, jsonify, request

volunteer_matching_bp = Blueprint(
    "volunteer_matching",
    __name__,
    url_prefix="/volunteer",
)

# ——— Dummy data ———
_VOLUNTEERS = [
    { "id": "v1", "fullName": "Alice Johnson", "skills": ["Cleaning"],  "availability": ["2025-07-10"] },
    { "id": "v2", "fullName": "Bob Smith",     "skills": ["Cooking"],   "availability": ["2025-07-11"] },
    { "id": "v3", "fullName": "Carol Lee",     "skills": ["Planting"],  "availability": ["2025-07-12"] },
]

_EVENTS = [
    {
      "id": "e1",
      "name": "Community Clean-Up",
      "requiredSkills": ["Cleaning"],
      "urgency": "High",
      "date": "2025-07-10",
    },
    {
      "id": "e2",
      "name": "Food Drive",
      "requiredSkills": ["Cooking"],
      "urgency": "Medium",
      "date": "2025-07-11",
    },
    {
      "id": "e3",
      "name": "Tree Planting",
      "requiredSkills": ["Planting"],
      "urgency": "Low",
      "date": "2025-07-12",
    },
]

@volunteer_matching_bp.route("", methods=["GET"])
def get_volunteer_matches():
    event_id = request.args.get("eventId")
    if not event_id:
        return jsonify([]), 400

    event = next((e for e in _EVENTS if e["id"] == event_id), None)
    if not event:
        return jsonify([])

    def score(vol):
        available   = event["date"] in vol["availability"]
        skill_count = sum(1 for s in event["requiredSkills"] if s in vol["skills"])
        return (available, skill_count)

    ranked = sorted(_VOLUNTEERS, key=score, reverse=True)
    return jsonify(ranked)