from app.imports import *
from werkzeug.security import generate_password_hash
from sqlalchemy.exc import IntegrityError
from flask import current_app, url_for, redirect, request, jsonify, Blueprint

from datetime import datetime

from app.models.userCredentials import UserCredentials, User_Roles
from app.utils.tokens import generate_email_token, verify_email_token
from app.utils.mailer import send_email_confirmation

register_user_bp = Blueprint("register_user", __name__)


@register_user_bp.route("/test", methods=["GET"])
def test_route():
    return jsonify({"message": "User credentials route is working!"}), 200


@register_user_bp.route("/register", methods=["POST"])
def register_user():
    """Register a new user.

    Expected JSON: {"email": str, "password": str, "role": "volunteer"|"admin"}

    Flow:
    - Create user row.
      * volunteer → role=VOLUNTEER
      * admin → role=ADMIN_PENDING (will require manual staff approval later)
    - Leave `email_confirmed_at` NULL until email link clicked.
    - Send confirmation email.
    """
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    role_requested = (data.get("role") or "volunteer").strip().lower()

    # Basic validation ----------------------------------------------------
    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400
    if role_requested not in ("volunteer", "admin"):
        return jsonify({"error": "Invalid role."}), 400

    # Map requested role -> DB enum value ---------------------------------
    if role_requested == "volunteer":
        db_role = User_Roles.VOLUNTEER
    else:  # admin requested
        db_role = User_Roles.ADMIN_PENDING

    user = UserCredentials(email=email, role=db_role, password_hash=generate_password_hash(password))

    db.session.add(user)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Email already registered."}), 409

    # create signed email confirmation token
    token = generate_email_token(user.user_id, user.email, role_requested, user.confirmation_token_version)
    confirm_link = url_for("register_user.confirm_email", token=token, _external=True)

    # send mail -----------------------------------------------------------
    send_email_confirmation(to_email=user.email, confirm_url=confirm_link)

    return (
        jsonify({
            "message": "Registration successful. Please check your email to confirm your account.",
            "user_id": user.user_id,
            "role": role_requested,
        }),
        201,
    )


@register_user_bp.route("/confirm/<token>", methods=["GET"])
def confirm_email(token: str):
    payload = verify_email_token(token)
    origin = current_app.config.get("FRONTEND_ORIGIN", "/")

    if not payload:
        return redirect(f"{origin}/login?verified=0&error=token")

    user = db.session.get(UserCredentials, payload.get("uid"))
    if not user or user.email != payload.get("em"):
        return redirect(f"{origin}/login?verified=0&error=user")

    # Version check (invalidate stale tokens) -----------------------------
    if user.confirmation_token_version != payload.get("v", 0):
        return redirect(f"{origin}/login?verified=0&error=stale")

    # Mark confirmed ------------------------------------------------------
    if not user.email_confirmed_at:  # idempotent
        user.email_confirmed_at = datetime.utcnow()
        user.confirmation_token_version += 1
        db.session.commit()

    return redirect(f"{origin}/login?verified=1")