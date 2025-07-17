from typing import Iterable, List

from sqlalchemy.orm import relationship
from sqlalchemy import select

from app.imports import db
from app.models.state import States
from app.models.userAvailability import UserAvailability
from app.models.userToSkill import UserToSkill
from app.models.skill import Skill


class UserProfiles(db.Model):
    __tablename__ = "user_profiles"

    # PK == FK to user_credentials.user_id (1:1)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("user_credentials.user_id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )

    # Profile fields ---------------------------------------------------------
    full_name = db.Column(db.String(50), nullable=False)
    address1 = db.Column(db.String(100), nullable=False)
    address2 = db.Column(db.String(100), nullable=True)
    city = db.Column(db.String(100), nullable=False)
    state_id = db.Column(
        db.String(2),
        db.ForeignKey("states.state_id", ondelete="RESTRICT"),
        nullable=False,
    )
    zipcode = db.Column(db.String(9), nullable=False)  # stored digits-only (5 or 9)
    preferences = db.Column(db.Text, nullable=True)

    # Relationships ----------------------------------------------------------
    user = relationship(
        "UserCredentials",
        back_populates="profile",
        uselist=False,
        lazy="joined",
    )

    state = relationship("States", lazy="joined")

    availability = relationship(
        "UserAvailability",
        back_populates="profile",
        cascade="all, delete-orphan",
        passive_deletes=True,
        lazy="selectin",
    )

    # ----------------------------------------------------------------------
    # Utilities
    # ----------------------------------------------------------------------
    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"<UserProfiles user_id={self.user_id} state={self.state_id}>"

    # Skills convenience ----------------------------------------------------
    def get_skill_ids(self) -> List[int]:
        """
        Return list of skill_ids for this user by querying user_to_skill.

        We query via the association table because its FK targets user_credentials,
        not user_profiles.
        """
        stmt = select(UserToSkill.skill_id).where(UserToSkill.user_id == self.user_id)
        rows = db.session.execute(stmt).scalars().all()
        return list(rows)

    def get_skills(self) -> List[Skill]:
        """
        Return full Skill objects for this user.
        """
        stmt = (
            select(Skill)
            .join(UserToSkill, UserToSkill.skill_id == Skill.skill_id)
            .where(UserToSkill.user_id == self.user_id)
            .order_by(Skill.skill_name)
        )
        rows = db.session.execute(stmt).scalars().all()
        return list(rows)

    # Serialization ---------------------------------------------------------
    def to_dict(
        self,
        include_skills: bool = False,
        include_availability: bool = False,
    ) -> dict:
        data = {
            "user_id": self.user_id,
            "full_name": self.full_name,
            "address1": self.address1,
            "address2": self.address2,
            "city": self.city,
            "state": self.state_id,
            "zipcode": self.zipcode,
            "preferences": self.preferences,
        }

        if include_skills:
            data["skills"] = self.get_skill_ids()

        if include_availability:
            data["availability"] = [
                ua.available_date.isoformat() for ua in self.availability
            ]

        return data