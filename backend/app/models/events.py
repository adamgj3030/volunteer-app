# backend/app/models/events.py
from __future__ import annotations

import enum
from datetime import datetime

from sqlalchemy.dialects.postgresql import ARRAY

from app.imports import db


class UrgencyEnum(enum.IntEnum):
    low = 0
    medium = 1
    high = 2


class Events(db.Model):
    __tablename__ = "events"

    event_id   = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name       = db.Column(db.String(100),  nullable=False)
    description= db.Column(db.String(512),  nullable=False)
    address    = db.Column(db.String(100))
    city       = db.Column(db.String(100))
    state_id   = db.Column(db.String(2),    db.ForeignKey("states.state_id"), nullable=False)
    zipcode    = db.Column(db.String(9))
    urgency    = db.Column(db.Enum(UrgencyEnum), nullable=False)
    date       = db.Column(db.DateTime,     nullable=False, default=datetime.utcnow)

    # NEW — comma‑separated list of required skills
    skills     = db.Column(ARRAY(db.String), nullable=True)   # e.g. {"Leadership","Design"}

    def __repr__(self) -> str:
        return f"<Event {self.event_id} {self.name!r}>"
