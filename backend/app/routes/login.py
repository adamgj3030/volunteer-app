from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt

from app.imports import db
from app.models.userCredentials import UserCredentials, User_Roles

from datetime import datetime

login_user_bp = Blueprint("login_user", __name__)


# ------------------------------------------------------------------
# POST /auth/login
# Body: {"email": str, "password": str}
# ------------------------------------------------------------------
@login_user_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "missing_credentials", "message": "Email and password are required."}), 400

    user = UserCredentials.query.filter_by(email=email).first()
    if not user:
        # Deliberately vague to avoid user enumeration
        return jsonify({"error": "invalid_login", "message": "Invalid email or password."}), 401

    if not check_password_hash(user.password_hash, password):
        return jsonify({"error": "invalid_login", "message": "Invalid email or password."}), 401

    # Email confirmation gate -----------------------------------------
    if not user.is_email_confirmed:
        return (
            jsonify({
                "error": "email_unconfirmed",
                "message": "Please confirm your email before logging in. Check your inbox for the verification link.",
                "resend_available": True,
            }),
            403,
        )

    # Good login -> issue token --------------------------------------
    access_token = create_access_token(identity=user.user_id)

    payload = user_to_dict(user)

    # Suggested redirect path based on role --------------------------
    if user.role is User_Roles.VOLUNTEER:
        payload["redirect"] = "/volunteer"
    elif user.role is User_Roles.ADMIN:
        payload["redirect"] = "/admin"
    else:  # ADMIN_PENDING
        payload["redirect"] = "/admin/approval"  # change if you want different flow
        payload["admin_pending"] = True

    return jsonify({
        "access_token": access_token,
        "user": payload,
    }), 200


# ------------------------------------------------------------------
# POST /auth/resend-confirmation  (optional helper)
# Body: {"email": str}
# Returns 200 always (to avoid enumeration) but attempts to re-send.
# Reuses registration utils.
# ------------------------------------------------------------------
@login_user_bp.route("/resend-confirmation", methods=["POST"])
def resend_confirmation():
    from app.utils.tokens import generate_email_token
    from app.utils.mailer import send_email_confirmation
    from flask import url_for

    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    if not email:
        return jsonify({"error": "missing_email", "message": "Email is required."}), 400

    user = UserCredentials.query.filter_by(email=email).first()
    if user and not user.is_email_confirmed:
        token = generate_email_token(user.user_id, user.email, user.role.value.lower(), user.confirmation_token_version)
        confirm_link = url_for("register_user.confirm_email", token=token, _external=True)
        send_email_confirmation(to_email=user.email, confirm_url=confirm_link)

    # Always return 200 so attackers can't probe which emails exist
    return jsonify({"message": "If that email is registered and unconfirmed, a confirmation link has been sent."}), 200


# ------------------------------------------------------------------
# GET /auth/me  (restore session from token)
# Header: Authorization: Bearer <token>
# ------------------------------------------------------------------
@login_user_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    uid = get_jwt_identity()
    user = UserCredentials.query.get(uid)
    if not user:
        return jsonify({"error": "not_found"}), 404
    return jsonify({"user": user_to_dict(user)}), 200


# ------------------------------------------------------------------
# Utilities local to this module
# ------------------------------------------------------------------
def user_to_dict(user: UserCredentials) -> dict:
    return {
        "id": user.user_id,
        "email": user.email,
        "role": user.role.value,
        "email_confirmed": user.is_email_confirmed,
        "email_confirmed_at": user.email_confirmed_at.isoformat() if user.email_confirmed_at else None,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None,
    }