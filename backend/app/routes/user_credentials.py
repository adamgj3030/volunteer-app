from app.imports import *

users_credentials_bp = Blueprint('users_credentials', __name__)

@users_credentials_bp.route('/test', methods=['GET'])
def test_route():
    return jsonify({"message": "User credentials route is working!"}), 200