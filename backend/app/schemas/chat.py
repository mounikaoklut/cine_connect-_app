"""Pydantic schemas for chat messages, conversations, and WebSocket events."""

import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class AuditionCalloutSchema(BaseModel):
    casting_id: str
    project_title: str
    role_title: str
    production_house: str
    audition_date: str
    location: str
    pay_range: str
    banner_url: Optional[str] = None


class ChatMessageCreate(BaseModel):
    conversation_id: uuid.UUID
    content: str
    type: str = "text"  # 'text', 'voice', 'media', 'audition_card', 'system_event'
    media_url: Optional[str] = None
    media_thumbnail_url: Optional[str] = None
    media_duration_seconds: Optional[int] = None
    media_file_name: Optional[str] = None
    media_file_size: Optional[str] = None
    audition_callout: Optional[AuditionCalloutSchema] = None


class ChatMessageResponse(BaseModel):
    id: uuid.UUID
    conversation_id: uuid.UUID
    sender_id: uuid.UUID
    sender_name: str
    sender_avatar: Optional[str] = None
    is_from_talent: bool
    content: str
    type: str
    media_url: Optional[str] = None
    media_thumbnail_url: Optional[str] = None
    media_duration_seconds: Optional[int] = None
    media_file_name: Optional[str] = None
    media_file_size: Optional[str] = None
    audition_details: Optional[Dict[str, Any]] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ParticipantResponse(BaseModel):
    id: uuid.UUID
    name: str
    avatar_url: Optional[str] = None
    is_production_house: bool
    is_verified: bool
    is_online: bool
    last_seen_text: str


class ConversationResponse(BaseModel):
    id: uuid.UUID
    type: str  # 'production' or 'direct'
    title: Optional[str] = None
    project_tag: Optional[str] = None
    role_tag: Optional[str] = None
    associated_casting_id: Optional[str] = None
    participant: ParticipantResponse
    last_message: Optional[ChatMessageResponse] = None
    unread_count: int = 0
    updated_at: datetime


class WSEventPayload(BaseModel):
    action: Optional[str] = None
    event: Optional[str] = None
    conversation_id: Optional[str] = None
    content: Optional[str] = None
    type: Optional[str] = "text"
    media_url: Optional[str] = None
    is_typing: Optional[bool] = None
    message_id: Optional[str] = None
