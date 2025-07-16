from app.imports import *
# from app.database import db  
migrate = Migrate()
def create_app(config_object="app.config.DevConfig"):
    app = Flask(__name__)
    app.config.from_object(config_object)
    
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "default-key")

    db.init_app(app)
    CORS(app)

    for blueprint, prefix in blueprint_with_prefixes.items():
        app.register_blueprint(blueprint, url_prefix=prefix)

    migrate.init_app(app, db)

    # with app.app_context():
    #     from app import models
    #     db.create_all()

    return app

__all__ = ["create_app", "db"]