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

# ――― In‐memory store for saved matches ―――
_SAVED_MATCHES: list[dict] = []

@volunteer_matching_bp.route("", methods=["GET"])
def get_volunteer_matches():
    """
    GET /volunteer/matching?eventId=<id>
    Returns volunteers scored by availability & skill-match count.
    """
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


@volunteer_matching_bp.route("", methods=["POST"])
def save_volunteer_match():
    """
    POST /volunteer/matching
    Body JSON: { eventId: string, volunteerId: string }
    Stores the match in memory.
    """
    data = request.get_json() or {}
    event_id     = data.get("eventId")
    volunteer_id = data.get("volunteerId")

    if not event_id or not volunteer_id:
        return jsonify({"error": "eventId and volunteerId are required"}), 400

    _SAVED_MATCHES.append({
        "eventId":     event_id,
        "volunteerId": volunteer_id,
    })
    return jsonify({"saved": {"eventId": event_id, "volunteerId": volunteer_id}}), 201


@volunteer_matching_bp.route("/saved", methods=["GET"])
def list_saved_matches():
    """
    GET /volunteer/matching/saved
    Returns all the matches saved so far.
    """
    return jsonify(_SAVED_MATCHES)