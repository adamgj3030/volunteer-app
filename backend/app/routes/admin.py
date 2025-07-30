from app.imports import *
from flask import Blueprint, jsonify, request
from sqlalchemy.orm import joinedload
from app.models import UserProfiles, UserCredentials, User_Roles

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/pending', methods=['GET'])
def pending_users():
    pending = UserCredentials.query\
        .filter_by(role=User_Roles.ADMIN_PENDING)\
        .outerjoin(UserProfiles)\
        .options(joinedload(UserCredentials.profile))\
        .all()
    
    if not pending:
        return jsonify({"message": "No pending users"}), 404

    return jsonify([
        {
            "user_id": user.user_id,
            "email": user.email,
            "role": user.role.name,
            "full_name": user.profile.full_name
        }
        for user in pending
    ]), 200


@admin_bp.route('/approve/<int:user_id>', methods=['POST'])
def approve_user(user_id):
    user = UserCredentials.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.role == User_Roles.ADMIN_PENDING:
        user.role = User_Roles.ADMIN
        db.session.commit()
        return jsonify({"message": "User approved"}), 200
    elif user.role == User_Roles.VOLUNTEER:
        return jsonify({"error": "User is a volunteer"}), 400
    elif user.role == User_Roles.ADMIN:
        return jsonify({"error": "User is already an admin"}), 400


@admin_bp.route('/deny/<int:user_id>', methods=['POST'])
def deny_user(user_id):
    user = UserCredentials.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.role == User_Roles.ADMIN_PENDING:
        user.role = User_Roles.VOLUNTEER
        db.session.commit()
        return jsonify({"message": "User denied"}), 200
    elif user.role == User_Roles.VOLUNTEER:
        return jsonify({"error": "User is a volunteer"}), 400
    elif user.role == User_Roles.ADMIN:
        return jsonify({"error": "User is an admin"}), 400


@admin_bp.route("/list", methods=["GET"])
def list_users():
    filters_dict = request.args.to_dict()
    users = query_handler(UserCredentials, filters_dict, date_column="created_at")
    if not users:
        return jsonify({"message": "No users found"}), 404

    return jsonify([
        {
            "user_id": user.user_id,
            "full_name": user.profile.full_name if user.profile else None,
            "role": user.role.name,
            "state_id": user.profile.state_id if user.profile else None
        }
        for user in users
    ]), 200
