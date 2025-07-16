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