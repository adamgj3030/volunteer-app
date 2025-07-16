import os
from pathlib import Path
from dotenv import load_dotenv


load_dotenv()

class BaseConfig:
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get("SECRET_KEY", "change-me")

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
