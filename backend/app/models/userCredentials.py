from app.imports import *

class UserCredentials(db.Model):
    __tablename__ = "user_credentials"

    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    password_hash = db.Column(db.String(128), nullable=False)
    
    def __repr__(self):
        return f"<User {self.email}>"