# -------------------------------------------------------------------
# 1) Sanity checks on the app factory & config
# -------------------------------------------------------------------

def test_app_exists(app):
    """App fixture should yield a Flask app"""
    assert app

def test_testing_config(app):
    """App should be in testing mode with TESTING=True"""
    assert app.config["TESTING"]
    # Ensure DATABASE_URL was injected
    assert "postgresql://" in app.config["SQLALCHEMY_DATABASE_URI"]

# -------------------------------------------------------------------
# 2) Basic endpoint tests
# -------------------------------------------------------------------

def test_index(client):
    """
    If you have a root or health-check endpoint, test it.
    If none exists, this will just assert a 404 or redirect.
    """
    res = client.get("/")
    assert res.status_code in (200, 301, 302, 404)