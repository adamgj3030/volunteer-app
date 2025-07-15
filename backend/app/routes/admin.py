from app.imports import *
from app.models import UserProfiles, User_Roles

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/pending', methods=['GET'])
def pending_users():
    # Logic to retrieve pending users
    pending = UserProfiles.query.filter_by(role_id=User_Roles.PENDING_APPROVAL).all()
    if not pending:
        return jsonify({"message": "No pending users"}), 404
    
    return jsonify([{"user_id": user.user_id, 
                     "email": user.email,
                     "role": user.role_id,  # Will return 'PENDING_APPROVAL',
                     "full_name": user.full_name
                     }] 
                     for user in pending), 200
    
@admin_bp.route('/approve/<int:user_id>', methods=['POST'])
def approve_user(user_id):
    user = UserProfiles.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404
    
    if user.role_id == User_Roles.PENDING_APPROVAL:
        user.role_id = User_Roles.ADMIN
        db.session.commit()
        return jsonify({"message": "User approved"}), 200
    elif user.role_id == User_Roles.VOLUNTEER:
        return jsonify({"error": "User is a volunteer"}), 400
    elif user.role_id == User_Roles.ADMIN:
        return jsonify({"error": "User is already an admin"}), 400
    

@admin_bp.route('/deny/<int:user_id>', methods=['POST'])
def deny_user(user_id):
    user = UserProfiles.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404
    
    if user.role_id == User_Roles.PENDING_APPROVAL:
        user.role_id = User_Roles.VOLUNTEER
        db.session.commit()
        return jsonify({"message": "User approved"}), 200
    elif user.role_id == User_Roles.VOLUNTEER:
        return jsonify({"error": "User is a volunteer"}), 400
    elif user.role_id == User_Roles.ADMIN:
        return jsonify({"error": "User is an admin"}), 400
    
@admin_bp.route("/list", methods=["GET"])
def list_users():

    filters_dict = request.args.to_dict()

    users = query_handler(UserProfiles, filters_dict, date_column="created_at")

    if not users:
        return jsonify({"message": "No users found"}), 404
    
    return jsonify([
        {
            "user_id": user.user_id,
            "full_name": user.full_name,
            "role": user.role_id.name,  # Will return 'ADMIN', 'VOLUNTEER', etc.
            "state_id": user.state_id
        }
        for user in users
    ]), 200
