"""SQLAlchemy ORM models for unified Settings, Preferences, and Account Management."""

import enum
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    String, Text, Boolean, Integer, DateTime, ForeignKey,
    DECIMAL, ARRAY, Enum as SQLEnum
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class AccountType(str, enum.Enum):
    CREATIVE_TALENT = "CREATIVE_TALENT"
    PRODUCTION_HOUSE = "PRODUCTION_HOUSE"


class AvailabilityStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"          # Available for Hire
    BUSY = "BUSY"                    # On Production / Busy
    UNAVAILABLE = "UNAVAILABLE"      # Not Available


class StreamQuality(str, enum.Enum):
    AUTO = "AUTO"
    LOW = "LOW"                      # 720p / Data Saver
    MEDIUM = "MEDIUM"                # 1080p / High Definition
    HIGH = "HIGH"                    # 4K / Source Quality


class ThemeMode(str, enum.Enum):
    DARK = "DARK"
    LIGHT = "LIGHT"
    SYSTEM = "SYSTEM"


class UserSettings(Base):
    """Unified user account preferences, role parameters, and privacy configurations."""
    __tablename__ = "user_settings"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
        index=True,
    )

    # Role & Account Type
    account_type: Mapped[AccountType] = mapped_column(
        SQLEnum(AccountType, name="account_type_enum"),
        default=AccountType.CREATIVE_TALENT,
        nullable=False,
    )

    # Creative Talent fields
    availability_status: Mapped[AvailabilityStatus] = mapped_column(
        SQLEnum(AvailabilityStatus, name="availability_status_enum"),
        default=AvailabilityStatus.AVAILABLE,
        nullable=False,
    )
    rate_currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    day_rate: Mapped[Optional[float]] = mapped_column(DECIMAL(10, 2), nullable=True)
    primary_role: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    secondary_crafts: Mapped[Optional[list[str]]] = mapped_column(
        ARRAY(String(50)), nullable=True
    )
    union_affiliations: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    willing_to_travel: Mapped[bool] = mapped_column(Boolean, default=True)
    portfolio_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    resume_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)

    # Production House fields
    company_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    tax_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    registered_address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    verified_banner: Mapped[bool] = mapped_column(Boolean, default=False)
    default_nda_template: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Security & Verification
    is_two_factor_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    identity_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    # Notification & Alert Matrix
    notify_chat: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_application_status: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_casting_matches: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_email_digest: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_sms_urgent: Mapped[bool] = mapped_column(Boolean, default=True)
    dnd_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    dnd_start_time: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    dnd_end_time: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)

    # Media & Storage Preferences
    stream_quality: Mapped[StreamQuality] = mapped_column(
        SQLEnum(StreamQuality, name="stream_quality_enum"),
        default=StreamQuality.AUTO,
        nullable=False,
    )
    cached_media_bytes: Mapped[int] = mapped_column(Integer, default=124000000) # e.g. 124 MB demo cache

    # Governance & Theme
    theme_mode: Mapped[ThemeMode] = mapped_column(
        SQLEnum(ThemeMode, name="theme_mode_enum"),
        default=ThemeMode.DARK,
        nullable=False,
    )
    account_status: Mapped[str] = mapped_column(String(20), default="ACTIVE", nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationship
    user: Mapped["User"] = relationship(back_populates="settings")
