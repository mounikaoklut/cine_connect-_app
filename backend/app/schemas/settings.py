"""Pydantic schemas for User Settings, Preferences, Security, and Sessions."""

from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field, HttpUrl

from app.models.settings import AccountType, AvailabilityStatus, StreamQuality, ThemeMode


class UserSettingsBase(BaseModel):
    account_type: AccountType = AccountType.CREATIVE_TALENT
    availability_status: AvailabilityStatus = AvailabilityStatus.AVAILABLE
    rate_currency: str = Field(default="USD", max_length=3)
    day_rate: Optional[Decimal] = None
    primary_role: Optional[str] = None
    secondary_crafts: Optional[List[str]] = None
    union_affiliations: Optional[str] = None
    willing_to_travel: bool = True
    portfolio_url: Optional[str] = None
    resume_url: Optional[str] = None

    # Production House
    company_name: Optional[str] = None
    tax_id: Optional[str] = None
    registered_address: Optional[str] = None
    verified_banner: bool = False
    default_nda_template: Optional[str] = None

    # Security & Verification
    is_two_factor_enabled: bool = False
    identity_verified: bool = False

    # Notification & Alert Matrix
    notify_chat: bool = True
    notify_application_status: bool = True
    notify_casting_matches: bool = True
    notify_email_digest: bool = True
    notify_sms_urgent: bool = True
    dnd_enabled: bool = False
    dnd_start_time: Optional[str] = None
    dnd_end_time: Optional[str] = None

    # Media & Storage
    stream_quality: StreamQuality = StreamQuality.AUTO
    cached_media_bytes: int = 124000000

    # Theme & Account
    theme_mode: ThemeMode = ThemeMode.DARK
    account_status: str = "ACTIVE"


class UserSettingsResponse(UserSettingsBase):
    user_id: UUID
    updated_at: datetime

    class Config:
        from_attributes = True


class UserSettingsUpdate(BaseModel):
    account_type: Optional[AccountType] = None
    availability_status: Optional[AvailabilityStatus] = None
    rate_currency: Optional[str] = Field(None, max_length=3)
    day_rate: Optional[Decimal] = None
    primary_role: Optional[str] = None
    secondary_crafts: Optional[List[str]] = None
    union_affiliations: Optional[str] = None
    willing_to_travel: Optional[bool] = None
    portfolio_url: Optional[str] = None
    resume_url: Optional[str] = None

    # Production House
    company_name: Optional[str] = None
    tax_id: Optional[str] = None
    registered_address: Optional[str] = None
    default_nda_template: Optional[str] = None

    # Notifications Matrix
    notify_chat: Optional[bool] = None
    notify_application_status: Optional[bool] = None
    notify_casting_matches: Optional[bool] = None
    notify_email_digest: Optional[bool] = None
    notify_sms_urgent: Optional[bool] = None
    dnd_enabled: Optional[bool] = None
    dnd_start_time: Optional[str] = None
    dnd_end_time: Optional[str] = None

    # Media & Storage
    stream_quality: Optional[StreamQuality] = None

    # Theme
    theme_mode: Optional[ThemeMode] = None


class ActiveSession(BaseModel):
    session_id: str
    device_name: str
    device_type: str # "Mobile (Android)", "Desktop (Windows Chrome)", etc.
    ip_address: str
    location: str
    last_active: str
    is_current: bool = False


class ActiveSessionsListResponse(BaseModel):
    sessions: List[ActiveSession]
    total_count: int


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=8)
    confirm_password: str = Field(..., min_length=8)


class Toggle2FARequest(BaseModel):
    enabled: bool


class Toggle2FAResponse(BaseModel):
    enabled: bool
    message: str
    qr_code_url: Optional[str] = None
    backup_codes: Optional[List[str]] = None


class AccountActionRequest(BaseModel):
    action: str = Field(..., description="'DEACTIVATE' or 'DELETE'")
    reason: Optional[str] = None
    confirmation_text: str = Field(..., description="Must type 'DELETE MY ACCOUNT' to confirm deletion")


class DataExportResponse(BaseModel):
    status: str
    download_url: str
    file_name: str
    size_bytes: int
    expires_at: str
    message: str
