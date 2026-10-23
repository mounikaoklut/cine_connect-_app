"""Pydantic schemas for social networking, feed, interactions, collaborations, and messages."""

from datetime import datetime
from uuid import UUID
from typing import Optional
from pydantic import BaseModel, Field


# ---------- Connections ----------
class ConnectionResponse(BaseModel):
    id: UUID
    follower_id: Optional[UUID] = None
    following_id: Optional[UUID] = None
    status: Optional[str] = "pending"
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ConnectionUpdate(BaseModel):
    status: str = Field(..., pattern=r"^(accepted|declined|blocked)$")


# ---------- Feed Posts ----------
class PostCreate(BaseModel):
    caption: Optional[str] = None
    media_url: Optional[str] = None


class PostResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    caption: Optional[str] = None
    media_url: Optional[str] = None
    created_at: Optional[datetime] = None
    author_name: Optional[str] = None
    likes_count: int = 0
    comments_count: int = 0

    model_config = {"from_attributes": True}


# ---------- Interactions (Likes & Comments) ----------
class InteractionCreate(BaseModel):
    type: str = Field("like", pattern=r"^(like|comment)$")
    comment: Optional[str] = None


class InteractionResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    post_id: Optional[UUID] = None
    type: Optional[str] = "like"
    comment: Optional[str] = None
    user_name: Optional[str] = None

    model_config = {"from_attributes": True}


# ---------- Collaborations ----------
class CollaborationCreate(BaseModel):
    talent_id: UUID


class CollaborationUpdate(BaseModel):
    status: str = Field(..., pattern=r"^(accepted|declined)$")


class CollaborationResponse(BaseModel):
    id: UUID
    project_id: Optional[UUID] = None
    talent_id: Optional[UUID] = None
    status: Optional[str] = "invited"
    invited_at: Optional[datetime] = None
    project_title: Optional[str] = None
    talent_name: Optional[str] = None

    model_config = {"from_attributes": True}


# ---------- Messages ----------
class MessageCreate(BaseModel):
    recipient_id: UUID
    body: str = Field(..., min_length=1)
    collaboration_id: Optional[UUID] = None


class MessageResponse(BaseModel):
    id: UUID
    sender_id: Optional[UUID] = None
    recipient_id: Optional[UUID] = None
    collaboration_id: Optional[UUID] = None
    body: Optional[str] = None
    sent_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ConversationSummary(BaseModel):
    other_user_id: UUID
    other_user_name: Optional[str] = None
    last_message: Optional[str] = None
    last_message_at: Optional[datetime] = None
