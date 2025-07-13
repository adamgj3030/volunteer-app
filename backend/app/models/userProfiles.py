from app.imports import *

class User_Roles(enum.IntEnum):
    VOLUNTEER = 0
    ADMIN = 1
    PENDING_APPROVAL = 2

    

class UserProfiles(db.Model):
    __tablename__ = "user_profiles";  

    user_id = db.Column(db.Integer, 
                        db.ForeignKey('user_credentials.user_id'), 
                        primary_key=True, 
                        autoincrement=True, 
                        nullable=False)
    state_id = db.Column(db.String(2), 
                         db.ForeignKey('states.state_id'), 
                         nullable=False)

    role_id = db.Column(db.enum(User_Roles),
                         nullable=False,
                         default=User_Roles.VOLUNTEER) # 0 for volunteer, 1 for admin, etc.

    full_name = db.Column(db.String(120), 
                          nullable=False)
    address1 = db.Column(db.String(100), 
                         nullable=False)
    address2 = db.Column(db.String(100), 
                         nullable=True)
    city = db.Column(db.String(100), 
                     nullable=False)
    zipcode = db.Column(db.String(9), 
                        nullable=False)
    preferences = db.Column(db.String(512), 
                            nullable=True)
    def __repr__(self):
        return f"<UserProfile user_id={self.user_id}>"