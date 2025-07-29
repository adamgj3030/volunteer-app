from ast import stmt
from flask import Blueprint, request, jsonify
from sqlalchemy import select
from app.models import UserCredentials, VolunteerHistory, UserProfiles
from app.imports import *
volunteer_history_bp = Blueprint('volunteer_history', __name__)

# # Full data model, lifted from your TypeScript `volunteers` constant
# _volunteers = [
#     {
#         "email": "volunteer1@example.com",
#         "name": "John Doe",
#         "events": [
#             {
#                 "eventName": "Community Cleanup",
#                 "description": "Cleaning up the local park.",
#                 "location": "Central Park",
#                 "requiredSkills": ["Gardening", "Cooking"],
#                 "urgency": "Medium",
#                 "eventDate": "2024-08-15",
#                 "status": "Registered", 
#             },
#             {
#                 "eventName": "Food Drive",
#                 "description": "Sorting and distributing food donations.",
#                 "location": "Community Center",
#                 "requiredSkills": ["Organization"],
#                 "urgency": "High",
#                 "eventDate": "2024-07-20",
#                 "status": "Completed",
#             },
#         ],
#     },
#     {
#         "email": "volunteer2@example.com",
#         "name": "Jane Smith",
#         "events": [
#             {
#                 "eventName": "Animal Shelter Assistance",
#                 "description": "Walking dogs and cleaning cages.",
#                 "location": "City Animal Shelter",
#                 "requiredSkills": ["Animal Care"],
#                 "urgency": "High",
#                 "eventDate": "2024-09-01",
#                 "status": "No Show",
#             },
#         ],
#     },
# ]

@volunteer_history_bp.route("", methods=["GET"])
def get_all_user_credentials():
    """
    GET /volunteer/history
    Returns all users (select * from user_credentials)
    """
    # Query all columns from user_credentials
    users = UserCredentials.query.all()

    # Serialize to JSON
    results = []
    for u in users:
        results.append({
            'user_id': u.user_id,
            'email': u.email,
            'role': u.role.name,
            'created_at': u.created_at.isoformat(),
            'updated_at': u.updated_at.isoformat(),
            'email_confirmed_at': u.email_confirmed_at.isoformat() if u.email_confirmed_at else None,
            'confirmation_token_version': u.confirmation_token_version
        })

    return jsonify(results)
