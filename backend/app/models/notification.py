"""SQLAlchemy ORM models for Notifications, User Devices, and Preferences in CineConnect."""

import enum
import uuid
from datetime import datetime
from typing import Optional, Dict, Any

from sqlalchemy import (
    String, Text, Boolean, DateTime, ForeignKey, Index, Enum as SQLEnum
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class NotificationType(str, enum.Enum):
    APPLICATION_STATUS = "APPLICATION_STATUS"
    INTERVIEW_SCHEDULE = "INTERVIEW_SCHEDULE"
    DIRECT_MESSAGE = "DIRECT_MESSAGE"
    CASTING_ALERT = "CASTING_ALERT"
    SYSTEM = "SYSTEM"


class Notification(Base):
    """Notification log stored in PostgreSQL."""
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    sender_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    notification_type: Mapped[NotificationType] = mapped_column(
        SQLEnum(NotificationType, name="notification_type_enum", create_type=False),
        nullable=False,
        default=NotificationType.SYSTEM,
    )
    deep_link_route: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    metadata_json: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True
    )

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    sender = relationship("User", foreign_keys=[sender_id])

    __table_args__ = (
        Index("ix_notifications_user_is_read", "user_id", "is_read"),
    )


class UserDevice(Base):
    """Registered user device push tokens (FCM/SNS)."""
    __tablename__ = "user_devices"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    fcm_token: Mapped[str] = mapped_column(String(512), nullable=False, index=True)
    device_type: Mapped[str] = mapped_column(String(20), default="android")  # android, ios, web
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    user = relationship("User")


class NotificationPreference(Base):
    """User notification settings and channel toggles."""
    __tablename__ = "notification_preferences"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    application_status: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    interview_schedule: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    direct_message: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    casting_alert: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    system: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    email_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    push_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    user = relationship("User")
