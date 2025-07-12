from flask import Flask
from flask_cors import CORS
from app.db import db 
from app.imports.routes_import import blueprint_with_prefixes


def create_app(config_object="app.config.DevConfig"):
    app = Flask(__name__)
    app.config.from_object(config_object)

    db.init_app(app)
    CORS(app)

    for blueprint, prefix in blueprint_with_prefixes.items():
        app.register_blueprint(blueprint, url_prefix=prefix)

    return app

__all__ = ["create_app", "db"]