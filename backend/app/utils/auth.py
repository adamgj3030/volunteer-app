from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity

from app.imports import db
from app.models.userCredentials import UserCredentials, User_Roles


def roles_required(*roles: User_Roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            uid = get_jwt_identity()
            user = db.session.get(UserCredentials, uid)
            if not user:
                return jsonify({"error": "unauthorized"}), 401
            if user.role not in roles:
                return jsonify({"error": "forbidden", "message": "Insufficient permissions."}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator