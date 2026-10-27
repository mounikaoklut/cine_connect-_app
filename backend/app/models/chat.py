"""SQLAlchemy ORM models for Real-Time Messages, Conversations, and Receipts in CineConnect."""

import uuid
from datetime import datetime
from typing import Optional, List

from sqlalchemy import (
    String, Text, Boolean, Integer, DateTime, ForeignKey, Index
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Conversation(Base):
    """Chat conversation room between talent and production house or peer talent."""
    __tablename__ = "conversations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    type: Mapped[str] = mapped_column(String(30), default="production")  # 'production' or 'direct'
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    project_tag: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    role_tag: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    associated_casting_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    participants: Mapped[List["ConversationParticipant"]] = relationship(
        back_populates="conversation", cascade="all, delete-orphan"
    )
    messages: Mapped[List["ChatMessageModel"]] = relationship(
        back_populates="conversation", cascade="all, delete-orphan", order_by="ChatMessageModel.created_at"
    )


class ConversationParticipant(Base):
    """Participants in a conversation with read pointers."""
    __tablename__ = "conversation_participants"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE")
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE")
    )
    role: Mapped[str] = mapped_column(String(50), default="member")  # 'talent', 'production_admin', 'casting_director'
    is_production_house: Mapped[bool] = mapped_column(Boolean, default=False)
    last_read_message_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    conversation: Mapped["Conversation"] = relationship(back_populates="participants")

    __table_args__ = (
        Index("idx_conv_user", "conversation_id", "user_id", unique=True),
    )


class ChatMessageModel(Base):
    """Real-time chat messages with rich media and delivery receipts."""
    __tablename__ = "chat_messages"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"), index=True
    )
    sender_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    sender_name: Mapped[str] = mapped_column(String(200))
    sender_avatar: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    is_from_talent: Mapped[bool] = mapped_column(Boolean, default=True)

    content: Mapped[str] = mapped_column(Text, default="")
    message_type: Mapped[str] = mapped_column(String(30), default="text")  # 'text', 'voice', 'media', 'audition_card', 'system_event'

    # S3 / CloudFront media delivery metadata
    media_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    media_thumbnail_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    media_duration_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    media_file_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    media_file_size: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Audition Callout embedded payload
    audition_details: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # Receipt status: 'sending', 'sent', 'delivered', 'read'
    delivery_status: Mapped[str] = mapped_column(String(20), default="sent")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    conversation: Mapped["Conversation"] = relationship(back_populates="messages")
