from backend.app.imports import *

db = SQLAlchemy()
def create_app():
    app = Flask(__name__)
    CORS(app)

    #app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL") # DATABASE_URL=postgresql://username:password@localhost:5432/yourdb
    #app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    #app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "default-key")

    # db.init_app(app)

    for blueprint, prefix in blueprint_with_prefixes.items():
        app.register_blueprint(blueprint, url_prefix=prefix)

    # with app.app_context():
    #     db.create_all()

    return app