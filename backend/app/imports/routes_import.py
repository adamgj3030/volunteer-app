#blueprints from routes
from app.routes.user_profiles import users_profiles_bp
from app.routes.user_credentials import users_credentials_bp
from app.routes.events import events_bp
from app.routes.skills import skills_bp
from app.routes.volunteer_history import volunteer_history_bp

# questionable imports
# from app.routes.converters import converters_bp

blueprint_with_prefixes = {
    users_profiles_bp: '/users/profiles',
    users_credentials_bp: '/users/credentials',
    events_bp: '/events',
    skills_bp: '/skills',
    volunteer_history_bp: '/volunteer/history',
    # converters_bp: '/converters'  # Uncomment if converters are needed
}