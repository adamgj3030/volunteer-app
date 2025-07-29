from flask import Blueprint, jsonify, request

volunteer_matching_bp = Blueprint(
    "volunteer_matching",
    __name__,
    url_prefix="/volunteer/matching",
)

# ――― Dummy data ―――
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

_SAVED_MATCHES: list[dict] = []

@volunteer_matching_bp.route("/events", methods=["GET"])
def list_matching_events():
    """GET  /volunteer/matching/events"""
    return jsonify(_EVENTS)

@volunteer_matching_bp.route("", methods=["GET"])
def get_volunteer_matches():
    """
    GET  /volunteer/matching?eventId=<id>
    Score & return volunteers for that event.
    """
    event_id = request.args.get("eventId")
    if not event_id:
        return jsonify([]), 400

    event = next((e for e in _EVENTS if e["id"] == event_id), None)
    if not event:
        return jsonify([])

    def score(vol):
        avail    = event["date"] in vol["availability"]
        skill_ct = sum(1 for s in event["requiredSkills"] if s in vol["skills"])
        return (avail, skill_ct)

    ranked = sorted(_VOLUNTEERS, key=lambda v: score(v), reverse=True)
    return jsonify(ranked)

@volunteer_matching_bp.route("", methods=["POST"])
def save_volunteer_match():
    """
    POST  /volunteer/matching
    Body: { eventId, volunteerId }
    """
    data = request.get_json() or {}
    eid = data.get("eventId")
    vid = data.get("volunteerId")
    if not eid or not vid:
        return jsonify({"error": "eventId and volunteerId required"}), 400

    _SAVED_MATCHES.append({"eventId": eid, "volunteerId": vid})
    return jsonify({"saved": {"eventId": eid, "volunteerId": vid}}), 201

@volunteer_matching_bp.route("/saved", methods=["GET"])
def list_saved_matches():
    """GET  /volunteer/matching/saved"""
    return jsonify(_SAVED_MATCHES)
