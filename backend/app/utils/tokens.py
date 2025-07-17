from flask import current_app
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

TOKEN_SALT = "email-confirmation-salt"

def _serializer():
    secret = current_app.config["SECRET_KEY"]
    return URLSafeTimedSerializer(secret_key=secret, salt=TOKEN_SALT)


def generate_email_token(user_id: int, email: str, role_requested: str, version: int = 0) -> str:
    s = _serializer()
    payload = {
        "uid": user_id,
        "em": email,
        "r": role_requested,  # 'volunteer' or 'admin'
        "v": version,
    }
    return s.dumps(payload)


def verify_email_token(token: str, max_age: int = 60 * 60 * 24) -> dict | None:
    """Return payload dict if valid; else None.
    max_age = 1 day by default.
    """
    s = _serializer()
    try:
        data = s.loads(token, max_age=max_age)
    except SignatureExpired:  # valid but too old
        return None
    except BadSignature:
        return None
    return data