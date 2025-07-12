from app.imports import *

class UserToAvailability(db.Model):
    __tablename__ = "user_to_availability"
    
    user_id = db.Column(db.Integer, db.ForeignKey("user_credentials.user_id"), primary_key=True)
    availability_date = db.Column(db.Date, primary_key=True)

    def __repr__(self):
        return f"<UserToAvailability user={self.user_id}, date={self.availability_date}>"