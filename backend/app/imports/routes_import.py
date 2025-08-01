#blueprints from routes
from app.routes.user_profiles import users_profiles_bp
from app.routes.registration import register_user_bp
from app.routes.login import login_user_bp
from app.routes.events import events_bp
from app.routes.skills import skills_bp
from app.routes.volunteer_history import volunteer_history_bp
from app.routes.admin import admin_bp
from app.routes.task import task_list_bp
from app.routes.volunteer_matching import volunteer_matching_bp
from app.routes.states import states_bp

# questionable imports
# from app.routes.converters import converters_bp

blueprint_with_prefixes = {
    states_bp: '/states',
    users_profiles_bp: '/volunteer/profile',
    register_user_bp: '/auth',
    login_user_bp: '/auth',
    events_bp: '/events',
    skills_bp: '/skills',
    volunteer_history_bp: '/volunteer/history',
    admin_bp: '/admin',
    task_list_bp: '/tasks',
    volunteer_matching_bp: '/volunteer/matching',
    
    # converters_bp: '/converters'  # Uncomment if converters are needed
}
