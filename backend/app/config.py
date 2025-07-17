import os
from pathlib import Path
from dotenv import load_dotenv


load_dotenv()

class BaseConfig:
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get("SECRET_KEY", "change-me")
    # Mail (Flask-Mail style) ---------------------------------------------
    MAIL_SERVER = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.environ.get("MAIL_PORT", 587))
    MAIL_USE_TLS = os.environ.get("MAIL_USE_TLS", "true").lower() == "true"
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.environ.get("MAIL_DEFAULT_SENDER", "noreply@example.org")

    # Where to send users *after* confirming email
    FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")
    
    # JWT (Flask-JWT-Extended style) --------------------------------------
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "change-me-too")  # separate from Flask SECRET_KEY
    JWT_TOKEN_LOCATION = ["headers"]  # we’ll pass Authorization: Bearer <token>
    JWT_HEADER_NAME = "Authorization"
    JWT_HEADER_TYPE = "Bearer"
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # seconds (1 hour) – adjust as needed

class DevConfig(BaseConfig):
    DEBUG = True
    # Defaults to a local PostgreSQL database if not set
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "postgresql://dev_user:dev_pass@localhost:5432/dev_db",
    )

class TestConfig(BaseConfig):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "postgresql://test_user:test_pass@localhost:5432/test_db",
    )
