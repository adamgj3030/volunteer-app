from app.imports import *
from datetime import datetime
from sqlalchemy.orm import relationship
from app.models.userToSkill import UserToSkill

class User_Roles(enum.Enum):
    VOLUNTEER = "VOLUNTEER"
    ADMIN_PENDING = "ADMIN_PENDING"
    ADMIN = "ADMIN"

class UserCredentials(db.Model):
    __tablename__ = "user_credentials"

    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.Enum(User_Roles, name="user_roles", native_enum=True), nullable=False, default=User_Roles.VOLUNTEER)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    password_hash = db.Column(db.String(255), nullable=False)
    email_confirmed_at = db.Column(db.DateTime, nullable=True)
    confirmation_token_version = db.Column(db.Integer, default=0, nullable=False)

    # One-to-one profile -------------------------------------------------
    profile = relationship(
        "UserProfiles",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    
    skills_assoc = relationship(
        "UserToSkill",
        backref="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
        lazy="selectin",
    )

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"<UserCredentials id={self.user_id} email={self.email} role={self.role.name}>"

    # Convenience helpers -------------------------------------------------
    @property
    def is_email_confirmed(self) -> bool:
        return self.email_confirmed_at is not None

    @property
    def is_admin(self) -> bool:
        return self.role is User_Roles.ADMIN

    @property
    def is_admin_pending(self) -> bool:
        return self.role is User_Roles.ADMIN_PENDING

    @property
    def is_volunteer(self) -> bool:
        return self.role is User_Roles.VOLUNTEER