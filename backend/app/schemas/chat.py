"""Pydantic schemas for chat: conversations, messages, and notifications."""

from datetime import datetime
from uuid import UUID
from typing import Optional
from pydantic import BaseModel


# ===================== CONVERSATIONS =====================

class ConversationCreate(BaseModel):
    """Start a new conversation with another user."""
    participant_id: UUID
    project_id: UUID | None = None
    initial_message: str | None = None


class ConversationResponse(BaseModel):
    id: UUID
    participant_ids: list[UUID]
    project_id: UUID | None = None
    last_message_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}


# ===================== MESSAGES =====================

class MessageCreate(BaseModel):
    body: str | None = None
    attachment_urls: list[str] | None = None


class MessageResponse(BaseModel):
    id: UUID
    conversation_id: UUID
    sender_id: UUID
    body: str | None = None
    attachment_urls: list[str] | None = None
    status: str = "sent"
    created_at: datetime

    model_config = {"from_attributes": True}


class MessageHistoryResponse(BaseModel):
    messages: list[MessageResponse]
    total: int
    page: int
    page_size: int


# ===================== WEBSOCKET =====================

class WSMessageIn(BaseModel):
    """Incoming WebSocket message payload."""
    body: str | None = None
    attachment_urls: list[str] | None = None


class WSMessageOut(BaseModel):
    """Outgoing WebSocket broadcast payload."""
    id: str
    conversation_id: str
    sender_id: str
    body: str | None = None
    attachment_urls: list[str] | None = None
    created_at: str


# ===================== NOTIFICATIONS =====================

class NotificationResponse(BaseModel):
    id: UUID
    user_id: UUID
    type: str
    title: str | None = None
    body: str | None = None
    data: dict | None = None
    is_read: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}
