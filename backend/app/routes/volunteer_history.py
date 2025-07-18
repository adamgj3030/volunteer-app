from flask import Blueprint, request, jsonify

volunteer_history_bp = Blueprint('volunteer_history', __name__)

# Full data model, lifted from your TypeScript `volunteers` constant
_volunteers = [
    {
        "email": "volunteer1@example.com",
        "name": "John Doe",
        "events": [
            {
                "eventName": "Community Cleanup",
                "description": "Cleaning up the local park.",
                "location": "Central Park",
                "requiredSkills": ["Gardening"],
                "urgency": "Medium",
                "eventDate": "2024-08-15",
                "status": "Confirmed",
            },
            {
                "eventName": "Food Drive",
                "description": "Sorting and distributing food donations.",
                "location": "Community Center",
                "requiredSkills": ["Organization"],
                "urgency": "High",
                "eventDate": "2024-07-20",
                "status": "Attended",
            },
        ],
    },
    {
        "email": "volunteer2@example.com",
        "name": "Jane Smith",
        "events": [
            {
                "eventName": "Animal Shelter Assistance",
                "description": "Walking dogs and cleaning cages.",
                "location": "City Animal Shelter",
                "requiredSkills": ["Animal Care"],
                "urgency": "High",
                "eventDate": "2024-09-01",
                "status": "Confirmed",
            },
        ],
    },
]

@volunteer_history_bp.route("", methods=["GET"])
def get_volunteer_history():
    """
    Returns the full list of volunteers with all their events.
    Front-end will handle any filtering, sorting, or searching.
    """
    return jsonify(_volunteers)

