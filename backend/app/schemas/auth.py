"""Pydantic schemas for auth endpoints: Talent & Production register, login, tokens, password reset."""

import re
from datetime import datetime
from uuid import UUID
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator


def _sanitize_phone(v: str | None) -> str | None:
    if isinstance(v, str):
        cleaned = re.sub(r"[\s\-\(\)\.]+", "", v.strip())
        return cleaned if cleaned else None
    return v


# ---------- Register Schemas ----------

class RegisterTalentRequest(BaseModel):
    """Talent registration form schema (email, password, mobile number, talent name)."""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128, description="Account password (min 8 characters)")
    phone: str = Field(..., min_length=7, max_length=20, description="Mobile number (collected, no OTP verification)")
    name: str = Field(..., min_length=1, max_length=200, description="Talent full name")
    craft: Optional[str] = Field(None, max_length=100, description="Primary craft or role (e.g. Actor, Cinematographer)")
    location: Optional[str] = Field(None, max_length=255, description="City / Region")

    @field_validator("phone", mode="before")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        cleaned = _sanitize_phone(v)
        if not cleaned:
            raise ValueError("Mobile number is required")
        return cleaned


class RegisterProductionRequest(BaseModel):
    """Production registration form schema (production house name, email, mobile number, password)."""
    company_name: str = Field(..., min_length=1, max_length=255, description="Production house name")
    email: EmailStr
    phone: str = Field(..., min_length=7, max_length=20, description="Mobile number (collected, no OTP verification)")
    password: str = Field(..., min_length=8, max_length=128, description="Account password (min 8 characters)")
    location: Optional[str] = Field(None, max_length=255, description="Headquarters / City")
    description: Optional[str] = Field(None, description="Overview of production house and focus")

    @field_validator("phone", mode="before")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        cleaned = _sanitize_phone(v)
        if not cleaned:
            raise ValueError("Mobile number is required")
        return cleaned


class RegisterEmailRequest(BaseModel):
    """Unified / legacy email registration supporting talent and production accounts."""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    name: str = Field(..., min_length=1, max_length=200)
    phone: Optional[str] = Field(None, description="Mobile number (optional in legacy calls)")
    account_type: Optional[str] = Field("talent", description="Account type: 'talent' or 'production'")

    @field_validator("phone", mode="before")
    @classmethod
    def sanitize_phone(cls, v: Optional[str]) -> Optional[str]:
        return _sanitize_phone(v)


# ---------- Login Schemas ----------

class LoginEmailRequest(BaseModel):
    """Login with email and password for both Talent and Production."""
    email: EmailStr
    password: str = Field(..., min_length=1, description="Account password")


class GoogleAuthRequest(BaseModel):
    """Login/register with Google ID token."""
    id_token: str


# ---------- Password Reset ----------

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=128)


# ---------- Token & Session ----------

class RefreshTokenRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: Optional[str] = None


# ---------- Email Verification ----------

class VerifyEmailRequest(BaseModel):
    token: str


class ResendVerificationRequest(BaseModel):
    email: Optional[EmailStr] = None


# ---------- Account Management ----------

class AccountDeleteRequest(BaseModel):
    password: str = Field(..., min_length=1, description="Password confirmation to authorize account deletion")


# ---------- Responses ----------

class UserBrief(BaseModel):
    """User info returned after auth and profile operations."""
    id: UUID
    email: Optional[str] = None
    phone: Optional[str] = None
    name: Optional[str] = None
    account_type: Optional[str] = None
    role: Optional[str] = None
    production_house_id: Optional[UUID] = None
    production_house_name: Optional[str] = None
    email_verified: bool = False
    phone_verified: bool = False
    identity_verified: bool = False

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """JWT token pair response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserBrief


class MessageResponse(BaseModel):
    """Generic message response."""
    message: str
