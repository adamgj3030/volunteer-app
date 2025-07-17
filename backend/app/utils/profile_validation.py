import re
from datetime import datetime
from typing import Iterable, Tuple

from flask import current_app

from app.imports import db
from app.models.state import States
from app.models.skill import Skill

# Precompiled regex for numeric ZIP (5 or 9 digits, optionally with dash)
ZIP_RE = re.compile(r"^(\d{5})(?:-?\d{4})?$")


def normalize_zip(zip_str: str) -> str:
    """Return digits-only ZIP (5 or 9). Raises ValueError if invalid."""
    s = (zip_str or "").strip()
    m = ZIP_RE.match(s)
    if not m:
        raise ValueError("Invalid ZIP code. Use 5 or 9 digits.")
    digits = ''.join(ch for ch in s if ch.isdigit())
    return digits


def validate_state_code(code: str) -> str:
    if not code or len(code) != 2:
        raise ValueError("State code required (2 characters).")
    code = code.upper()
    if not db.session.get(States, code):
        raise ValueError("Unknown state code.")
    return code


def validate_skill_ids(ids: Iterable[int]) -> Tuple[int, ...]:
    ids = tuple(int(s) for s in ids if str(s).strip() != "")
    if not ids:
        raise ValueError("At least one skill required.")
    found = {s.skill_id for s in db.session.query(Skill.skill_id).filter(Skill.skill_id.in_(ids))}
    missing = [i for i in ids if i not in found]
    if missing:
        raise ValueError(f"Invalid skill id(s): {missing}.")
    return ids


def validate_availability(dates: Iterable[str]) -> Tuple[str, ...]:
    """Return tuple of YYYY-MM-DD strings (validated)."""
    out = []
    for d in dates:
        try:
            dt = datetime.fromisoformat(d).date()
        except Exception as exc:  # noqa: BLE001
            raise ValueError(f"Invalid date: {d}") from exc
        out.append(dt.isoformat())
    if not out:
        raise ValueError("At least one availability date required.")
    return tuple(out)


def validate_profile_payload(data: dict) -> dict:
    """Validate incoming JSON for profile create/update.

    Returns a normalized dict ready for persistence.
    Raises ValueError with message on invalid input.
    """
    errors = {}
    def need(field: str, maxlen: int | None = None):
        val = (data.get(field) or "").strip()
        if not val:
            errors[field] = "Required"
            return None
        if maxlen and len(val) > maxlen:
            errors[field] = f"Max {maxlen} characters"
            return None
        return val

    full_name = need("full_name", 50)
    address1 = need("address1", 100)
    city = need("city", 100)

    # Optional fields -----------------------------------------------------
    address2 = (data.get("address2") or "").strip() or None
    if address2 and len(address2) > 100:
        errors["address2"] = "Max 100 characters"

    preferences = (data.get("preferences") or "").strip() or None

    # State ---------------------------------------------------------------
    try:
        state = validate_state_code(data.get("state") or "")
    except ValueError as e:  # noqa: PERF203
        errors["state"] = str(e)
        state = None

    # ZIP -----------------------------------------------------------------
    try:
        zipcode = normalize_zip(data.get("zipcode") or "")
    except ValueError as e:  # noqa: PERF203
        errors["zipcode"] = str(e)
        zipcode = None

    # Skills --------------------------------------------------------------
    try:
        skills_in = data.get("skills") or []
        skills = validate_skill_ids(skills_in)
    except ValueError as e:  # noqa: PERF203
        errors["skills"] = str(e)
        skills = ()

    # Availability --------------------------------------------------------
    try:
        avail_in = data.get("availability") or []
        availability = validate_availability(avail_in)
    except ValueError as e:  # noqa: PERF203
        errors["availability"] = str(e)
        availability = ()

    # Final error gate ----------------------------------------------------
    if errors:
        raise ValueError(errors)  # send dict of field errors upward

    return {
        "full_name": full_name,
        "address1": address1,
        "address2": address2,
        "city": city,
        "state": state,
        "zipcode": zipcode,
        "preferences": preferences,
        "skills": skills,
        "availability": availability,
    }