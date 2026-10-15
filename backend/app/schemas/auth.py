"""Pydantic schemas for auth endpoints: register, login, tokens, OTP."""

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


# ---------- Register ----------
class RegisterEmailRequest(BaseModel):
    """Register with email and password."""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    name: str = Field(..., min_length=1, max_length=200)


class RegisterPhoneRequest(BaseModel):
    """Register with phone number (triggers OTP)."""
    phone: str = Field(..., pattern=r"^\+?[1-9]\d{6,14}$")


# ---------- Login ----------
class LoginEmailRequest(BaseModel):
    """Login with email and password."""
    email: EmailStr
    password: str


class LoginPhoneRequest(BaseModel):
    """Login with phone and OTP."""
    phone: str = Field(..., pattern=r"^\+?[1-9]\d{6,14}$")
    otp: str = Field(..., min_length=6, max_length=6)


class GoogleAuthRequest(BaseModel):
    """Login/register with Google ID token."""
    id_token: str


# ---------- OTP ----------
class OTPSendRequest(BaseModel):
    """Request to send an OTP."""
    phone: str = Field(..., pattern=r"^\+?[1-9]\d{6,14}$")


class OTPVerifyRequest(BaseModel):
    """Verify a phone OTP."""
    phone: str = Field(..., pattern=r"^\+?[1-9]\d{6,14}$")
    otp: str = Field(..., min_length=6, max_length=6)


# ---------- Password Reset ----------
class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=128)


# ---------- Token ----------
class RefreshTokenRequest(BaseModel):
    refresh_token: str


# ---------- Responses ----------
class UserBrief(BaseModel):
    """Minimal user info returned after auth."""
    id: UUID
    email: str | None = None
    phone: str | None = None
    name: str | None = None
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
