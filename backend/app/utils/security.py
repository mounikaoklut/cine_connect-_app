"""Security utilities: password hashing, JWT tokens, and phone normalization."""

import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import UUID

from jose import JWTError, jwt
from passlib.context import CryptContext

import re
import bcrypt
from app.config import get_settings

settings = get_settings()

# Password hashing context — bcrypt fallback
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def normalize_phone(phone: str) -> str:
    """Normalize phone number by stripping whitespace, dashes, dots, and parentheses.
    Preserves leading '+' if present.
    Example: '+1 (555) 234-5678' -> '+15552345678'
    """
    if not phone:
        return ""
    phone = phone.strip()
    has_plus = phone.startswith("+")
    digits = re.sub(r"\D", "", phone)
    return f"+{digits}" if has_plus else digits



def hash_password(password: str) -> str:
    """Hash a plain-text password safely using bcrypt."""
    try:
        pw_bytes = password.encode("utf-8")[:72]
        return bcrypt.hashpw(pw_bytes, bcrypt.gensalt()).decode("utf-8")
    except Exception:
        return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash safely supporting direct bcrypt and passlib."""
    try:
        pw_bytes = plain_password.encode("utf-8")[:72]
        h_bytes = hashed_password.encode("utf-8")
        if bcrypt.checkpw(pw_bytes, h_bytes):
            return True
    except Exception:
        pass
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False


def create_access_token(user_id: UUID, extra_claims: dict[str, Any] | None = None) -> str:
    """Create a short-lived JWT access token."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "exp": expire,
        "type": "access",
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(user_id: UUID) -> str:
    """Create a long-lived JWT refresh token."""
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": str(user_id),
        "exp": expire,
        "type": "refresh",
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict[str, Any] | None:
    """Decode and validate a JWT token. Returns payload dict or None if invalid."""
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError:
        return None


def create_password_reset_token(user_id: UUID) -> str:
    """Create a short-lived token for password reset (30 min)."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=30)
    payload = {
        "sub": str(user_id),
        "exp": expire,
        "type": "password_reset",
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_email_verification_token(user_id: UUID) -> str:
    """Create a token for email verification (24 hours)."""
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    payload = {
        "sub": str(user_id),
        "exp": expire,
        "type": "email_verification",
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

