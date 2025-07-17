from app.imports import *

class User_Roles(enum.IntEnum):
    VOLUNTEER = 0
    ADMIN = 1
    PENDING_APPROVAL = 2

class UserCredentials(db.Model):
    __tablename__ = "user_credentials"

    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.Enum(User_Roles),
                         nullable=False,
                         default=User_Roles.VOLUNTEER)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    password_hash = db.Column(db.String(128), nullable=False)
    
    def __repr__(self):
        return f"<User {self.email}>"