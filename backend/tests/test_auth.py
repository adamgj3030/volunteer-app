import re
from datetime import datetime, timedelta, timezone

import pytest
from flask import current_app

from app import db
from app.models.userCredentials import UserCredentials, User_Roles
from app.utils.tokens import generate_email_token


# -------------------------------
# Helpers
# -------------------------------
def _register(client, email="alice@example.org", password="StrongPass!1", role="volunteer"):
    return client.post(
        "/auth/register",
        json={"email": email, "password": password, "role": role},
    )

def _login(client, email, password):
    return client.post("/auth/login", json={"email": email, "password": password})

def _confirm_user(client, app, email, role_requested="volunteer"):
    """Generate a valid email-confirmation token for the user and hit the confirm route."""
    with app.app_context():
        user = UserCredentials.query.filter_by(email=email).first()
        assert user, "User must exist before confirming"

        token = generate_email_token(
            user_id=user.user_id,
            email=user.email,
            role_requested=role_requested,            # 'volunteer' | 'admin' (not used by confirm handler)
            version=user.confirmation_token_version,  # must match current version
        )
    resp = client.get(f"/auth/confirm/{token}", follow_redirects=False)
    return resp

def _get_user(app, email):
    with app.app_context():
        return UserCredentials.query.filter_by(email=email).first()


# -------------------------------
# Registration
# -------------------------------
def test_register_success_creates_user_and_returns_201(client, app):
    email = "test_volunteer@example.org"
    r = _register(client, email=email, password="StrongPass!1", role="volunteer")
    assert r.status_code == 201
    data = r.get_json()
    assert data["role"] == "volunteer"
    assert "user_id" in data

    # user persisted, not confirmed yet
    user = _get_user(app, email)
    assert user is not None
    assert user.role is User_Roles.VOLUNTEER
    assert user.email_confirmed_at is None


def test_register_duplicate_email_returns_409(client, app):
    email = "dup@example.org"
    _ = _register(client, email=email, password="abcDEF123!")
    r2 = _register(client, email=email, password="abcDEF123!")
    assert r2.status_code == 409
    assert "Email already registered" in r2.get_data(as_text=True)


def test_register_invalid_role_returns_400(client):
    r = _register(client, email="badrole@example.org", password="x", role="superuser")
    assert r.status_code == 400
    assert "Invalid role" in r.get_data(as_text=True)


def test_register_missing_fields_returns_400(client):
    r = client.post("/auth/register", json={"email": ""})
    assert r.status_code == 400
    assert "Email and password are required" in r.get_data(as_text=True)


# -------------------------------
# Email confirmation
# -------------------------------
def test_confirm_email_marks_user_confirmed_and_redirects(client, app):
    email = "confirmme@example.org"
    _ = _register(client, email=email, password="StrongPass!1", role="volunteer")

    # Confirm
    resp = _confirm_user(client, app, email, role_requested="volunteer")
    assert resp.status_code in (301, 302)
    assert resp.headers["Location"].startswith(
        f'{app.config.get("FRONTEND_ORIGIN", "http://localhost:5173")}/login?verified=1'
    )

    # DB state updated
    user = _get_user(app, email)
    assert user.email_confirmed_at is not None
    # token version should increment after successful confirmation
    assert user.confirmation_token_version == 1


def test_confirm_email_with_stale_token_fails(client, app):
    """Use a token generated before version bump to simulate staleness."""
    email = "staleme@example.org"
    _ = _register(client, email=email, password="StrongPass!1", role="volunteer")

    # Generate token at version=0, then confirm once (increments to 1)
    with app.app_context():
        user = _get_user(app, email)
        stale_token = generate_email_token(user.user_id, user.email, "volunteer", user.confirmation_token_version)
    _ = _confirm_user(client, app, email, role_requested="volunteer")  # bumps to v=1

    # Hitting confirm again with stale token should redirect with error=stale
    resp = client.get(f"/auth/confirm/{stale_token}", follow_redirects=False)
    assert resp.status_code in (301, 302)
    assert "verified=0" in resp.headers["Location"] and "error=stale" in resp.headers["Location"]


# -------------------------------
# Login
# -------------------------------
def test_login_missing_credentials_400(client):
    r = client.post("/auth/login", json={})
    assert r.status_code == 400
    j = r.get_json()
    assert j["error"] == "missing_credentials"


def test_login_unknown_email_401(client):
    r = _login(client, email="nouser@example.org", password="pw")
    assert r.status_code == 401
    assert "Invalid email or password" in r.get_data(as_text=True)


def test_login_wrong_password_401(client, app):
    email = "wrongpw@example.org"
    _ = _register(client, email=email, password="Correct1!")
    r = _login(client, email=email, password="Wrong1!")
    assert r.status_code == 401
    assert "Invalid email or password" in r.get_data(as_text=True)


def test_login_unconfirmed_403(client, app):
    email = "needconfirm@example.org"
    _ = _register(client, email=email, password="StrongPass!1", role="volunteer")
    r = _login(client, email=email, password="StrongPass!1")
    assert r.status_code == 403
    j = r.get_json()
    assert j["error"] == "email_unconfirmed"
    assert j.get("resend_available") is True


def test_login_success_after_confirmation_and_me_endpoint(client, app):
    email = "volunteer.ok@example.org"
    pw = "StrongPass!1"
    _ = _register(client, email=email, password=pw, role="volunteer")
    _ = _confirm_user(client, app, email, role_requested="volunteer")

    # Login now succeeds
    r = _login(client, email=email, password=pw)
    assert r.status_code == 200
    j = r.get_json()
    assert "access_token" in j
    assert j["user"]["role"] == "VOLUNTEER"
    assert j["user"]["email_confirmed"] is True
    # recommended redirect for volunteers
    assert j["user"].get("redirect") == "/volunteer"

    # /auth/me with Bearer token
    token = j["access_token"]
    r2 = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r2.status_code == 200
    me = r2.get_json()
    assert me["user"]["email"] == email
    assert me["user"]["role"] == "VOLUNTEER"


def test_login_admin_pending_flow(client, app):
    email = "admin.pending@example.org"
    pw = "StrongPass!1"
    # Register with requested role "admin" -> stored as ADMIN_PENDING
    _ = _register(client, email=email, password=pw, role="admin")
    # Confirm email (still ADMIN_PENDING)
    _ = _confirm_user(client, app, email, role_requested="admin")

    r = _login(client, email=email, password=pw)
    assert r.status_code == 403
    j = r.get_json()
    assert j["error"] == "admin_pending"


# -------------------------------
# Resend confirmation
# -------------------------------
def test_resend_confirmation_always_200(client, app):
    email = "resendme@example.org"
    _ = _register(client, email=email, password="StrongPass!1", role="volunteer")

    r = client.post("/auth/resend-confirmation", json={"email": email})
    assert r.status_code == 200
    assert "a confirmation link has been sent" in r.get_data(as_text=True).lower()

    # also returns 200 for unknown email
    r2 = client.post("/auth/resend-confirmation", json={"email": "unknown@example.org"})
    assert r2.status_code == 200

def test_resend_confirmation_missing_email_400(client):
    r = client.post("/auth/resend-confirmation", json={})
    assert r.status_code == 400
    assert "Email is required" in r.get_data(as_text=True)
