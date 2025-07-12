from app.imports import *

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column()
    password_hash = db.Column()
    role = db.Column()
    is_verified = db.Column()
    created_at = db.Column()

    # profile 

    location = db.Column()
    skills = db.Column()
    preferences = db.Column()
    availability = db.Column()
    first_name = db.Column(db.String(100))
    last_name = db.Column()

    def __repr__(self):
        return f"<User {self.email}>"