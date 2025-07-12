from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from app.imports.routes_import import blueprint_with_prefixes

db = SQLAlchemy()

def create_app(config_object="app.config.DevConfig"):
    app = Flask(__name__)
    app.config.from_object(config_object)

    db.init_app(app)
    CORS(app)

    for blueprint, prefix in blueprint_with_prefixes.items():
        app.register_blueprint(blueprint, url_prefix=prefix)

    return app