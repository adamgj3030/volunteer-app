from tests.utils import (
    seed_states,
    create_confirmed_user_and_token,
    auth_header,
    find_rule
)
from app.models.userCredentials import UserCredentials, User_Roles
from app.models.userProfiles import UserProfiles
from app import db

def test_pending_users_empty_returns_404(client, app):
    path = find_rule(app, "admin.pending_users")
    r = client.get(path)
    assert r.status_code == 404
    assert r.get_json()["message"] == "No pending users"

def test_pending_users_returns_expected(client, app):
    seed_states(app)
    # create a confirmed ADMIN_PENDING user without login
    create_confirmed_user_and_token(
        client, app, email="admin1@example.org", role="admin", skip_login=True
    )

    with app.app_context():
        user = UserCredentials.query.filter_by(email="admin1@example.org").first()
        user.role = User_Roles.ADMIN_PENDING

        if not user.profile:
            from app.models.userProfiles import UserProfiles
            user.profile = UserProfiles(
            user_id=user.user_id,
            full_name="Alice Admin",
            address1="123 Test St",
            address2="Apt 1",
            city="Houston",
            state_id="TX",
            zipcode="77001",
            preferences=""
        )
        else:
            user.profile.full_name = "Alice Admin"

        db.session.commit()


    path = find_rule(app, "admin.pending_users")
    r = client.get(path)
    assert r.status_code == 200
    j = r.get_json()
    assert isinstance(j, list)
    assert any(u["email"] == "admin1@example.org" for u in j)

def test_approve_user_sets_role_to_admin(client, app):
    create_confirmed_user_and_token(
        client, app, email="pending@example.org", role="admin", skip_login=True
    )

    with app.app_context():
        user = UserCredentials.query.filter_by(email="pending@example.org").first()
        user.role = User_Roles.ADMIN_PENDING
        db.session.commit()
        user_id = user.user_id

    r = client.post(f"/admin/approve/{user_id}")
    assert r.status_code == 200
    assert r.get_json()["message"] == "User approved"

    with app.app_context():
        user = db.session.get(UserCredentials, user_id)
        assert user.role == User_Roles.ADMIN

def test_deny_user_sets_role_to_volunteer(client, app):
    create_confirmed_user_and_token(
        client, app, email="denyme@example.org", role="admin", skip_login=True
    )

    with app.app_context():
        user = UserCredentials.query.filter_by(email="denyme@example.org").first()
        user.role = User_Roles.ADMIN_PENDING
        db.session.commit()
        user_id = user.user_id

    r = client.post(f"/admin/deny/{user_id}")
    assert r.status_code == 200
    assert r.get_json()["message"] == "User denied"

    with app.app_context():
        user = db.session.get(UserCredentials, user_id)
        assert user.role == User_Roles.VOLUNTEER

def test_approve_or_deny_nonexistent_user_returns_404(client):
    r = client.post("/admin/approve/9999")
    assert r.status_code == 404
    r = client.post("/admin/deny/9999")
    assert r.status_code == 404

def test_invalid_transitions_return_400(client, app):
    create_confirmed_user_and_token(
        client, app, email="alreadyadmin@example.org", role="admin", skip_login=True
    )

    with app.app_context():
        user = UserCredentials.query.filter_by(email="alreadyadmin@example.org").first()
        user.role = User_Roles.ADMIN
        db.session.commit()
        user_id = user.user_id

    r = client.post(f"/admin/approve/{user_id}")
    assert r.status_code == 400
    assert "already an admin" in r.get_data(as_text=True)

    r2 = client.post(f"/admin/deny/{user_id}")
    assert r2.status_code == 400
    assert "is an admin" in r2.get_data(as_text=True)
