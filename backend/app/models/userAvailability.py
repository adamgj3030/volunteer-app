from datetime import date
from app.imports import *
from sqlalchemy.orm import relationship

class UserAvailability(db.Model):
    __tablename__ = "user_availability"

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("user_profiles.user_id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )
    available_date = db.Column(db.Date, primary_key=True, nullable=False)

    profile = relationship("UserProfiles", back_populates="availability")

    def __repr__(self) -> str:
        return f"<UserAvailability user={self.user_id} date={self.available_date}>"